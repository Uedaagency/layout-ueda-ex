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

const DEFAULTS: Config = {
  brandName: "Painel Lovable",
  primaryColor: "#FF6A00",
  theme: "dark",
  badgeText: "PRO",
  footerText: "Desenvolvido por Painel Lovable",
  status: "pro",
  greeting: "usuario@lovable.dev",
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
};

const SHORTCUTS = [
  { icon: "🛠️", label: "Corrigir Bug" },
  { icon: "♻️", label: "Refatorar" },
  { icon: "🎨", label: "Melhorar UI" },
  { icon: "📖", label: "Explicar" },
  { icon: "⚡", label: "Otimizar" },
  { icon: "🧪", label: "Testes" },
];

function buildSrcDoc(cfg: Config) {
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
    body { overflow: hidden; }
  `;

  const shortcutsHtml = SHORTCUTS.map(
    (s) =>
      `<button class="sp-shortcut-chip"><span class="sp-chip-icon">${s.icon}</span><span class="sp-chip-label">${s.label}</span></button>`,
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
      <div class="sp-sync-status sp-sync-ok">✅ Sincronizado com Lovable</div>
    </div>

    <textarea class="sp-textarea" rows="3" placeholder="Digite seu comando..." spellcheck="false"></textarea>
    <div class="sp-action-bar">
      <div class="sp-action-left">
        <label class="sp-toggle"><input type="checkbox"><span class="sp-toggle-slider"></span></label>
        <span class="sp-toggle-label">Plano</span>
      </div>
      <div class="sp-action-center">
        <button class="sp-tool-btn" title="Anexar imagem">📎</button>
        <button class="sp-tool-btn" title="Ditar comando">${SP_SVG.mic}</button>
        <button class="sp-tool-btn" title="Ativar escudo">${SP_SVG.shield}</button>
        <button class="sp-tool-btn" title="Chat padrão">${SP_SVG.msgSq}</button>
        <button class="sp-tool-btn" title="Remove Watermark">👁️</button>
        <button class="sp-tool-btn" title="Baixar arquivos">📥</button>
      </div>
      <button class="sp-send-btn">Enviar</button>
    </div>

    <span class="sp-shortcuts-title">ATALHOS RÁPIDOS</span>
    <div class="sp-shortcuts-grid">${shortcutsHtml}</div>

    <button class="sp-watermark-btn">🚫 Remover Marca de Água</button>
    <button class="sp-watermark-btn" style="background:linear-gradient(135deg,rgba(245,158,11,0.14),rgba(217,119,6,0.08));border-color:rgba(245,158,11,0.35);color:#fbbf24;margin-top:6px">🌐 Publicar Projeto</button>
  `;

  const footer = `
    <div class="sp-footer">
      <div class="sp-footer-badge">${escapeHtml(cfg.footerText)}</div>
    </div>
  `;

  const extraCss = `
    .sp-shortcut-chip { display:flex; flex-direction:column; align-items:center; gap:4px; padding:10px 6px; border-radius:8px; border:1px solid var(--ql-border); background:var(--ql-bg-surface); color:var(--ql-text-secondary); cursor:pointer; transition:all .2s; font-family:inherit; }
    .sp-shortcut-chip:hover { border-color: rgba(var(--ts-brand-primary-rgb),0.35); color: var(--ql-accent); background: var(--ql-accent-subtle); }
    .sp-chip-icon { font-size:16px; }
    .sp-chip-label { font-size:10px; font-weight:600; }
    .sp-footer { padding:10px 14px; border-top:1px solid var(--ql-border); background:var(--ql-bg-elevated); text-align:center; }
    .sp-footer-badge { font-size:10px; color:var(--ql-text-muted); font-weight:600; letter-spacing:.04em; }
  `;

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<style>${sidepanelCss}</style>
<style>${override}</style>
<style>${extraCss}</style>
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
            Preview do painel lateral (380×720)
          </div>
          <div
            className="overflow-hidden rounded-2xl border border-border shadow-2xl"
            style={{ width: 380, height: 720, background: "#000" }}
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
