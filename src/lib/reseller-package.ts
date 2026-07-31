/**
 * Builds a white-label (obfuscated) UEDA EX package for one reseller.
 *
 * Strategy: fetch the already-obfuscated `/ueda-ex.zip`, then patch only the
 * plain-text/branding surfaces inside it:
 *   1. inject `ts-reseller-branding.js` (loaded BEFORE `branding.config.js`,
 *      which reads `window.TS_BRANDING_CONFIG`);
 *   2. drop `remote-branding.js` so the central panel cannot overwrite the
 *      reseller identity at runtime;
 *   3. replace every `icons/icon*.png` with the reseller logo (that's the image
 *      the login/mode screens render);
 *   4. rewrite `manifest.json` name/description.
 *
 * No source file of the extension is de-obfuscated in the process.
 */
import JSZip from "jszip";
import {
  type Reseller,
  slugify,
  supportUrl,
  whatsappLink,
} from "./reseller";

const RESELLER_SCRIPT = "ts-reseller-branding.js";
const ICON_SIZES = [16, 32, 48, 128] as const;

function jsonEscape(value: unknown): string {
  return JSON.stringify(value ?? "");
}

/** Runtime script injected into the package (plain, self-contained, MV3-safe). */
function buildBrandingScript(r: Reseller): string {
  const wa = whatsappLink(r.phone);
  const support = supportUrl(r);
  const cfg = {
    extensionName: r.name,
    brandName: r.name,
    primaryColor: r.color,
    supportLabel: r.supportLabel || "Obter suporte",
    supportUrl: support,
    whatsappLinks: {
      support: /^https:\/\/wa\.me\//.test(wa) ? wa : undefined,
      sales: /^https:\/\/wa\.me\//.test(wa) ? wa : undefined,
    },
    reseller: {
      phone: r.phone,
      email: r.email,
      site: r.site,
      renewUrl: r.renewUrl,
    },
  };

  return `/* UEDA EX — white-label build (${r.name}) */
(function(){
  var CFG = ${JSON.stringify(cfg, null, 2)};
  var WELCOME = ${jsonEscape(r.welcome)};
  var FOOTER = ${jsonEscape(r.footer)};
  var LOGO = "icons/icon128.png";

  try {
    window.TS_BRANDING_CONFIG = Object.assign({}, window.TS_BRANDING_CONFIG || {}, CFG);
    window.TS_RESELLER = CFG.reseller;
  } catch (e) {}

  // Neutralise remote branding pushes (this build is locked to the reseller).
  try { window.__tsRemoteBrandingDisabled = true; } catch (e) {}

  function logoUrl() {
    try {
      if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL) {
        return chrome.runtime.getURL(LOGO);
      }
    } catch (e) {}
    return "/" + LOGO;
  }

  function apply() {
    try {
      if (window.applyBrandingConfig) window.applyBrandingConfig(window.TS_BRANDING_CONFIG);
    } catch (e) {}
    try {
      var url = logoUrl();
      document.querySelectorAll("img.sp-login-logo, img.sp-mode-logo, img[data-ts-logo]").forEach(function (img) {
        if (img.getAttribute("src") !== url) img.setAttribute("src", url);
      });
    } catch (e) {}
    if (WELCOME) {
      try {
        document.querySelectorAll(".sp-gate-desc").forEach(function (el) { el.textContent = WELCOME; });
      } catch (e) {}
    }
    if (FOOTER) {
      try {
        document.querySelectorAll('.sp-footer-badge, [data-ts-brand="footer"]').forEach(function (el) {
          el.textContent = FOOTER;
        });
      } catch (e) {}
    }
  }

  function boot() {
    apply();
    try {
      var pending = false;
      var obs = new MutationObserver(function () {
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () { pending = false; apply(); });
      });
      if (document.body) obs.observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
`;
}

/** Draw the reseller logo (data URL) into a square PNG of `size` px. */
async function renderIcon(dataUrl: string, size: number): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Não foi possível ler a logo enviada."));
    el.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível neste navegador.");

  // contain + center, preserving aspect ratio (never stretch)
  const ratio = Math.min(size / (img.width || size), size / (img.height || size));
  const w = Math.max(1, Math.round((img.width || size) * ratio));
  const h = Math.max(1, Math.round((img.height || size) * ratio));
  ctx.drawImage(img, Math.round((size - w) / 2), Math.round((size - h) / 2), w, h);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar ícone."))),
      "image/png",
    );
  });
}

export interface PackageResult {
  blob: Blob;
  filename: string;
}

export async function buildResellerPackage(
  reseller: Reseller,
  opts: { sourceUrl?: string; version?: string } = {},
): Promise<PackageResult> {
  const sourceUrl = opts.sourceUrl ?? "/ueda-ex.zip";
  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error(`Pacote base indisponível (${res.status}).`);
  const zip = await JSZip.loadAsync(await res.arrayBuffer());

  // ---- 1. manifest -------------------------------------------------------
  const manifestFile = zip.file("manifest.json");
  if (!manifestFile) throw new Error("manifest.json não encontrado no pacote base.");
  const manifest = JSON.parse(await manifestFile.async("string")) as {
    name?: string;
    version?: string;
    description?: string;
    content_scripts?: Array<{ js?: string[] }>;
    web_accessible_resources?: Array<{ resources?: string[] }>;
  };

  const version = opts.version || manifest.version || "";
  if (reseller.name) manifest.name = reseller.name;

  for (const entry of manifest.content_scripts ?? []) {
    if (!Array.isArray(entry.js)) continue;
    entry.js = entry.js.filter((f) => f !== "remote-branding.js" && f !== RESELLER_SCRIPT);
    entry.js.unshift(RESELLER_SCRIPT);
  }
  for (const entry of manifest.web_accessible_resources ?? []) {
    if (!Array.isArray(entry.resources)) continue;
    if (entry.resources.includes("branding.config.js") && !entry.resources.includes(RESELLER_SCRIPT)) {
      entry.resources.push(RESELLER_SCRIPT);
    }
  }
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  // ---- 2. injected branding script ---------------------------------------
  zip.file(RESELLER_SCRIPT, buildBrandingScript(reseller));

  // ---- 3. HTML pages: load our script first, drop remote branding ---------
  for (const path of Object.keys(zip.files)) {
    if (!path.toLowerCase().endsWith(".html")) continue;
    const file = zip.file(path);
    if (!file) continue;
    let html = await file.async("string");
    html = html.replace(
      /\s*<script[^>]*src="[^"]*remote-branding\.js"[^>]*><\/script>/gi,
      "",
    );
    if (!html.includes(RESELLER_SCRIPT)) {
      html = html.replace(
        /(<script[^>]*src="[^"]*branding\.config\.js"[^>]*><\/script>)/i,
        `<script src="${RESELLER_SCRIPT}"></script>\n  $1`,
      );
    }
    zip.file(path, html);
  }

  // ---- 4. icons ----------------------------------------------------------
  if (reseller.logo) {
    for (const size of ICON_SIZES) {
      const blob = await renderIcon(reseller.logo, size);
      zip.file(`icons/icon${size}.png`, blob);
    }
  }

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  const label = reseller.name ? reseller.name : "revendedor";
  const filename = `${slugify(label)}${version ? `-${version}` : ""}.zip`;
  return { blob, filename };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
