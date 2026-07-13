import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import sidepanelCss from "../extension-assets/sidepanel.css?raw";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pré-configuração — UEDA EX" },
      {
        name: "description",
        content:
          "Configure a extensão UEDA EX visualmente com preview 1:1 do painel lateral real.",
      },
      { property: "og:title", content: "Pré-configuração UEDA EX" },
      {
        property: "og:description",
        content: "Ajustes de marca, cor e tema com preview idêntico à extensão.",
      },
    ],
  }),
  component: ConfigPreview,
});

type Theme = "dark" | "light";

interface Config {
  brandName: string;
  primaryColor: string;
  theme: Theme;
  badgeText: string;
  footerText: string;
  status: "pro" | "trial";
  greeting: string;
}

export const DEFAULTS: Config = {
  brandName: "Ueda EX",
  primaryColor: "#009FE3",
  theme: "light",
  badgeText: "PRO",
  footerText: "Desenvolvido por Painel Lovable",
  status: "pro",
  greeting: "Magda",
};

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full || "000000", 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function adjust(hex: string, delta: number) {
  const { r, g, b } = hexToRgb(hex);
  const f = delta / 100;
  const adj = (v: number) =>
    f < 0 ? Math.round(v * (1 + f)) : Math.round(v + (255 - v) * f);
  const to = (v: number) =>
    Math.max(0, Math.min(255, adj(v))).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

// --- Real extension markup, mirrored from sidepanel.html + sidepanel-templates.js ---
const SP_SVG = {
  mic: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
  shield:
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  msgSq:
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  paperclip:
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
  eye: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  download:
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  zap: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  sparkles:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/><path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z"/><path d="M5 14l.9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14z"/></svg>',
};

const SHORTCUTS = [
  { icon: "🛠️", label: "Corrigir Bug" },
  { icon: "♻️", label: "Refatorar" },
  { icon: "🎨", label: "Melhorar UI" },
  { icon: "📖", label: "Explicar Código" },
  { icon: "⚡", label: "Otimizar" },
  { icon: "🛡️", label: "Segurança" },
  { icon: "🧪", label: "Criar Teste" },
  { icon: "🧮", label: "Responsividade" },
];

export function buildSrcDoc(cfg: Config) {
  const rgb = hexToRgb(cfg.primaryColor);
  const hover = adjust(cfg.primaryColor, -12);
  const rgbStr = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

  const statusBadge =
    cfg.status === "trial"
      ? '<span class="sp-status-badge sp-badge-test">TEST</span>'
      : `<span class="sp-status-badge sp-badge-pro">${cfg.badgeText || "PRO"}</span>`;

  const override = `
    :root {
      --ts-brand-primary: ${cfg.primaryColor};
      --ts-brand-primary-rgb: ${rgbStr};
      --ts-brand-primary-hover: ${hover};
      --ts-brand-primary-soft: rgba(${rgbStr}, 0.12);
      --ts-brand-primary-border: rgba(${rgbStr}, 0.35);
      --ts-brand-primary-glow: rgba(${rgbStr}, 0.35);
      --ts-brand-gradient: linear-gradient(135deg, ${cfg.primaryColor}, ${hover});
    }
    html, body { height: 100%; }
    body { overflow: hidden; animation: none; }
    body.sp-light {
      --ql-accent: var(--ts-brand-primary);
      --ql-accent-hover: var(--ts-brand-primary-hover);
      --ql-accent-soft: rgba(${rgbStr}, 0.10);
      --ql-accent-glow: rgba(${rgbStr}, 0.24);
      --ql-accent-subtle: rgba(${rgbStr}, 0.10);
    }
    body.sp-light .sp-header { background:#000; border-bottom:1px solid rgba(0,0,0,0.04); }
    body.sp-light .sp-brand-text { color:#fff !important; text-transform:none; }
    body.sp-light .sp-badge { background:var(--ts-brand-primary) !important; color:#00131f !important; border-radius:8px; }
    body.sp-light .sp-body { background:#fff; }
    body.sp-light .sp-profile-card { background:#f5f5f6; border-color:rgba(0,0,0,0.10); border-radius:12px; }
    body.sp-light .sp-sync-ok { color:#10c978; }
    body.sp-light .sp-trial-countdown { background:rgba(255,255,255,0.70); border-color:rgba(0,0,0,0.08); }
    body.sp-light .sp-tabs { background:#f4f4f5; border-color:rgba(0,0,0,0.08); border-radius:10px; }
    body.sp-light .sp-tab.sp-tab-active { background:rgba(${rgbStr},0.10); color:var(--ts-brand-primary); }
    body.sp-light .sp-tab-badge { background:var(--ts-brand-primary); color:#fff; }
    body.sp-light .sp-chip-modern { background:#fff; border-color:rgba(200,76,255,0.16); color:#15151d; }
    body.sp-light .sp-chip-modern:hover { background:#fff; border-color:rgba(${rgbStr},0.28); }
    body.sp-light .sp-chip-icon { background:rgba(200,76,255,0.12); border-color:rgba(200,76,255,0.16); }
    body.sp-light .sp-compose-card { background:radial-gradient(circle at top left, rgba(200,76,255,0.16), transparent 34%), #fff; border-color:rgba(200,76,255,0.10); box-shadow:none; }
    body.sp-light .sp-textarea-modern::placeholder { color:#b8a9c8; }
    body.sp-light .sp-compose-toolbar { border-top:1px solid rgba(200,76,255,0.10); }
    body.sp-light .sp-icon-tool { background:#fff; border-color:transparent; color:#4b5563; }
    body.sp-light .sp-send-modern { background:var(--ts-brand-primary); box-shadow:0 12px 34px rgba(${rgbStr},0.30); }
    body.sp-light .sp-mini-action { background:transparent; border-color:transparent; color:#111827; }
    body.sp-light .sp-footer { border-top:1px solid rgba(200,76,255,.10); background:#fff; }
    body.sp-light .sp-footer-badge { background:#fff; border-color:rgba(0,0,0,.18); color:#0a0a0a !important; }
  `;

  const shortcutsHtml = SHORTCUTS.map(
    (s) =>
      `<button class="sp-chip sp-chip-modern"><span class="sp-chip-icon">${s.icon}</span><span>${s.label}</span></button>`,
  ).join("");

  const header = `
    <div class="sp-header">
      <div class="sp-brand">
        <span class="sp-brand-text" data-ts-brand="name">${escapeHtml(cfg.brandName)}</span>
        <span class="sp-badge">${escapeHtml(cfg.badgeText || "PRO")}</span>
      </div>
      <div class="sp-header-actions">
        <button class="sp-icon-btn" title="Tema">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
      </div>
    </div>
  `;

  const tabs = `
    <div class="sp-tabs">
      <button class="sp-tab sp-tab-active" data-tab="prompt"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Prompt</button>
      <button class="sp-tab" data-tab="skills"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z"/></svg> Skills</button>
      <button class="sp-tab" data-tab="history"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Histórico <span class="sp-tab-badge">3</span></button>
    </div>
  `;

  const mainUI = `
    <div class="sp-profile-card">
      <div class="sp-profile-top">
        <div class="sp-profile-left">
          <span class="sp-profile-name">${escapeHtml(cfg.greeting)}</span>
          ${statusBadge}
        </div>
        <div class="sp-profile-actions">
          <button class="sp-profile-action" title="Ajuda">
            <svg class="sp-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </button>
          <button class="sp-profile-action" title="Notificações">
            <svg class="sp-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span class="sp-profile-badge">1</span>
          </button>
          <button class="sp-profile-action" title="Sair">
            <svg class="sp-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>
      <div class="sp-sync-status sp-sync-ok">✅ Sincronizado! Projeto: f4f7e3...</div>
      <div class="sp-trial-countdown" style="display:flex">
        <div class="sp-countdown-row"><span>⏳</span><span class="sp-countdown-label">Plano expira em</span><span class="sp-countdown-time">29d 23h 7m</span></div>
        <div class="sp-trial-bar"><div class="sp-trial-bar-fill" style="width:88%"></div></div>
      </div>
    </div>

    ${tabs}

    <div id="sp-tab-content">
      <div class="sp-composer-shell">
        <div class="sp-shortcuts-grid sp-shortcuts-modern" id="sp-chips">${shortcutsHtml}</div>
        <div class="sp-compose-card">
          <textarea class="sp-textarea sp-textarea-modern" rows="5" placeholder="O que vamos criar hoje?" spellcheck="false"></textarea>
          <div class="sp-attach-preview" style="display:flex">
            <div class="sp-attach-item">
              <div class="sp-attach-icon">📄</div>
              <div class="sp-attach-info"><span class="sp-attach-name">UEDA EX.zip</span><span class="sp-attach-size">238.1 KB</span></div>
            </div>
          </div>
          <div class="sp-compose-toolbar">
            <div class="sp-compose-tools">
              <button class="sp-icon-tool" title="Anexar imagem/arquivo">${SP_SVG.paperclip}</button>
              <button class="sp-icon-tool" title="Ditar por voz">${SP_SVG.mic}</button>
              <button class="sp-icon-tool" title="Ativar Escudo">${SP_SVG.shield}</button>
              <button class="sp-icon-tool" title="Remover Marca de Água">${SP_SVG.eye}</button>
              <button class="sp-icon-tool" title="Baixar todos os arquivos">${SP_SVG.download}</button>
              <button class="sp-icon-tool" title="Inserir Skill">${SP_SVG.zap}</button>
              <button class="sp-icon-tool" title="Criar Projeto no Lovable"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg></button>
            </div>
            <button class="sp-send-modern" title="Enviar">➜</button>
          </div>
          <div class="sp-log"></div>
        </div>
        <div class="sp-mode-row"><button class="sp-mini-action" title="Otimizar com IA">${SP_SVG.sparkles} Otimizar</button></div>
      </div>
    </div>
  `;

  const footer = `
    <div class="sp-footer">
      <div class="sp-footer-badge">${escapeHtml(cfg.footerText)}</div>
    </div>
  `;

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<style>${sidepanelCss}</style>
<style>${override}</style>
</head>
<body class="${cfg.theme === "light" ? "sp-light" : ""}">
${header}
<div class="sp-body">${mainUI}</div>
${footer}
</body></html>`;
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ConfigPreview() {
  const [cfg, setCfg] = useState<Config>(DEFAULTS);
  const update = <K extends keyof Config>(k: K, v: Config[K]) =>
    setCfg((c) => ({ ...c, [k]: v }));
  const srcDoc = useMemo(() => buildSrcDoc(cfg), [cfg]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/40 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Pré-configuração — UEDA EX
            </h1>
            <p className="text-xs text-muted-foreground">
              Preview 1:1 do painel lateral real. Ajustes atualizam em tempo real.
            </p>
          </div>
          <button
            onClick={() => setCfg(DEFAULTS)}
            className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            Restaurar padrão
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <SettingsPanel cfg={cfg} update={update} />
        <div className="flex flex-col items-center gap-3 lg:sticky lg:top-6 lg:self-start">
          <div className="text-xs font-medium text-muted-foreground">
            Preview do painel lateral (380×951)
          </div>
          <div
            className="overflow-hidden rounded-md border border-border shadow-2xl"
            style={{ width: 380, height: 951 }}
          >
            <iframe
              title="Preview da extensão"
              srcDoc={srcDoc}
              style={{ width: "100%", height: "100%", border: 0, display: "block" }}
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({
  cfg,
  update,
}: {
  cfg: Config;
  update: <K extends keyof Config>(k: K, v: Config[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <style>{`
        .cfg-input { width:100%; padding:8px 12px; border-radius:8px; border:1px solid var(--color-border); background:var(--color-secondary); color:var(--color-foreground); font-size:13px; outline:none; }
        .cfg-input:focus { border-color:var(--color-primary); }
      `}</style>

      <Section title="Identidade da marca">
        <Field label="Nome da marca">
          <input
            className="cfg-input"
            value={cfg.brandName}
            onChange={(e) => update("brandName", e.target.value)}
          />
        </Field>
        <Field label="Saudação / e-mail exibido">
          <input
            className="cfg-input"
            value={cfg.greeting}
            onChange={(e) => update("greeting", e.target.value)}
          />
        </Field>
        <Field label="Rodapé">
          <input
            className="cfg-input"
            value={cfg.footerText}
            onChange={(e) => update("footerText", e.target.value)}
          />
        </Field>
      </Section>

      <Section title="Aparência">
        <Field label="Cor primária">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={cfg.primaryColor}
              onChange={(e) => update("primaryColor", e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-md border border-border bg-transparent"
            />
            <input
              className="cfg-input flex-1 font-mono uppercase"
              value={cfg.primaryColor}
              onChange={(e) => update("primaryColor", e.target.value)}
            />
          </div>
        </Field>
        <Field label="Tema">
          <div className="flex gap-2">
            {(["dark", "light"] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => update("theme", t)}
                className={`flex-1 rounded-md border px-3 py-2 text-xs font-medium capitalize transition ${
                  cfg.theme === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {t === "dark" ? "Escuro" : "Claro"}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      <Section title="Selo de licença">
        <Field label="Texto do selo (header)">
          <input
            className="cfg-input"
            maxLength={8}
            value={cfg.badgeText}
            onChange={(e) => update("badgeText", e.target.value.toUpperCase())}
          />
        </Field>
        <Field label="Status">
          <div className="flex gap-2">
            {(["pro", "trial"] as const).map((s) => (
              <button
                key={s}
                onClick={() => update("status", s)}
                className={`flex-1 rounded-md border px-3 py-2 text-xs font-medium uppercase transition ${
                  cfg.status === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
