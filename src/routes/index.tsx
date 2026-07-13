import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import sidepanelCss from "../extension-assets/sidepanel.css?raw";

export type ViewMode = "entry" | "choice" | "fixed" | "floating";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Preview — UEDA EX" },
      {
        name: "description",
        content:
          "Simulação da extensão UEDA EX em uma tela de computador, exatamente como aparece no navegador.",
      },
      { property: "og:title", content: "Preview UEDA EX" },
      {
        property: "og:description",
        content: "Visualização 1:1 do painel lateral da extensão.",
      },
    ],
  }),
  component: ExtensionPreview,
});

type Theme = "dark" | "light";

export interface Config {
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

const SP_SVG = {
  mic: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
  shield:
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
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

export function buildSrcDoc(cfg: Config, mode: ViewMode = "fixed") {
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

  const licenseGate = `
    <div class="sp-license-gate" style="display:flex">
      <div class="sp-login-logo" style="width:64px;height:64px;border-radius:16px;background:var(--ts-brand-gradient);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:26px;margin-bottom:14px">U</div>
      <p class="sp-gate-title">Bem vindo a <span>${escapeHtml(cfg.brandName)}</span></p>
      <p class="sp-gate-desc">Insira sua chave de licença para desbloquear.</p>
      <input class="sp-input" placeholder="UEDAEX-XXXXXXXXXXXXXX" spellcheck="false">
      <button class="sp-btn-primary">Validar Licença</button>
      <div class="sp-gate-actions">
        <a class="sp-glass-card" href="#" onclick="return false">
          <div class="sp-glass-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
          </div>
          <div class="sp-glass-content">
            <span class="sp-glass-title">Obter suporte</span>
            <span class="sp-glass-sub">Fale com nossa equipe e tire suas dúvidas.</span>
          </div>
          <div class="sp-glass-arrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </a>
      </div>
    </div>
  `;

  const choiceScreen = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 20px;gap:18px;min-height:520px;text-align:center">
      <div style="width:64px;height:64px;border-radius:16px;background:var(--ts-brand-gradient);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:26px">U</div>
      <div>
        <h2 style="margin:0 0 6px;font-size:18px;font-weight:700">Escolha o modo de exibição</h2>
        <p style="margin:0;font-size:13px;color:var(--ql-text-muted, #6b7280)">Como você prefere usar a extensão?</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;width:100%;max-width:300px;margin-top:8px">
        <button style="display:flex;align-items:center;gap:12px;padding:16px;border-radius:12px;border:2px solid var(--ts-brand-primary);background:var(--ts-brand-primary-soft);cursor:pointer;text-align:left;color:inherit">
          <div style="width:40px;height:40px;border-radius:10px;background:var(--ts-brand-primary);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="10" rx="1"/></svg>
          </div>
          <div>
            <div style="font-weight:600;font-size:14px">Painel Fixo</div>
            <div style="font-size:12px;opacity:.75">Ancorado ao lado do navegador</div>
          </div>
        </button>
        <button style="display:flex;align-items:center;gap:12px;padding:16px;border-radius:12px;border:2px solid rgba(0,0,0,.08);background:transparent;cursor:pointer;text-align:left;color:inherit">
          <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#c84cff,#7c3aed);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>
          </div>
          <div>
            <div style="font-weight:600;font-size:14px">Widget Flutuante</div>
            <div style="font-size:12px;opacity:.75">Botão sobre a página, arrastável</div>
          </div>
        </button>
      </div>
      <button style="margin-top:10px;padding:10px 24px;border-radius:8px;background:var(--ts-brand-primary);color:#fff;border:0;font-weight:600;cursor:pointer">Continuar</button>
    </div>
  `;

  const footer = `<div class="sp-footer"><div class="sp-footer-badge">${escapeHtml(cfg.footerText)}</div></div>`;

  let body = "";

  if (mode === "entry") body = `${header}<div class="sp-body">${licenseGate}</div>${footer}`;
  else if (mode === "choice") body = `${header}<div class="sp-body">${choiceScreen}</div>${footer}`;
  else body = `${header}<div class="sp-body">${mainUI}</div>${footer}`;

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<style>${sidepanelCss}</style>
<style>${override}</style>
</head>
<body class="${cfg.theme === "light" ? "sp-light" : ""}">
${body}
</body></html>`;
}


function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const VIEW_MODES: { id: ViewMode; label: string; desc: string }[] = [
  { id: "entry", label: "Tela de entrada", desc: "Chave de licença" },
  { id: "choice", label: "Escolha de modo", desc: "Fixo ou flutuante" },
  { id: "fixed", label: "Painel fixo", desc: "Sidepanel ancorado" },
  { id: "floating", label: "Widget flutuante", desc: "Botão sobre a página" },
];

function ExtensionPreview() {
  const [mode, setMode] = useState<ViewMode>("fixed");
  const srcDoc = useMemo(() => buildSrcDoc(DEFAULTS, mode), [mode]);
  const fixedSrcDoc = useMemo(() => buildSrcDoc(DEFAULTS, "fixed"), []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center">
        {/* View mode toggle */}
        <div className="mb-4 flex flex-wrap justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 p-2 backdrop-blur">
          {VIEW_MODES.map((v) => {
            const active = mode === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setMode(v.id)}
                title={v.desc}
                className={
                  "flex flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition " +
                  (active
                    ? "bg-[#009FE3] text-white shadow-lg shadow-[#009FE3]/30"
                    : "text-slate-300 hover:bg-slate-800")
                }
              >
                <span className="text-[13px]">{v.label}</span>
                <span className={"text-[10px] " + (active ? "text-white/80" : "text-slate-500")}>{v.desc}</span>
              </button>
            );
          })}
        </div>

        <div className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 shadow-2xl">
          <div className="flex items-center gap-2 rounded-t-lg bg-slate-800 px-4 py-2.5">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div className="ml-4 flex-1 truncate rounded-md bg-slate-700/60 px-3 py-1 text-xs text-slate-300">
              chrome-extension://ueda-ex/sidepanel.html
            </div>
          </div>

          <div className="relative flex h-[820px] overflow-hidden rounded-b-lg bg-white">
            {mode === "floating" ? (
              <FloatingPreview srcDoc={fixedSrcDoc} />
            ) : mode === "entry" || mode === "choice" ? (
              <CenteredPopupPreview srcDoc={srcDoc} />
            ) : (
              <>
                <FakeSiteContent />
                <div
                  className="border-l border-slate-200 shadow-[-8px_0_24px_rgba(0,0,0,0.08)]"
                  style={{ width: 380, height: "100%" }}
                >
                  <iframe
                    title="UEDA EX Sidepanel"
                    srcDoc={srcDoc}
                    style={{ width: "100%", height: "100%", border: 0, display: "block" }}
                    sandbox="allow-same-origin"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Visualização: {VIEW_MODES.find((v) => v.id === mode)?.label}
        </p>


        <button
          type="button"
          onClick={() => {
            fetch("/ueda-ex.zip")
              .then((res) => {
                if (!res.ok) throw new Error(`Download falhou: ${res.status}`);
                return res.blob();
              })
              .then((blob) => {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "ueda-ex.zip";
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(a.href);
              })
              .catch((err) => alert(err.message));
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#009FE3] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#009FE3]/30 transition hover:bg-[#0088c2]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Baixar extensão (.zip)
        </button>
        <p className="mt-2 text-[11px] text-slate-500">
          Inclui os ajustes aplicados na pré-visualização.
        </p>
      </div>
    </div>
  );
}

function FakeSiteContent() {
  return (
    <div className="flex-1 space-y-4 p-8">
      <div className="h-8 w-2/3 rounded bg-slate-200" />
      <div className="h-4 w-1/2 rounded bg-slate-100" />
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="h-32 rounded-lg bg-slate-100" />
        <div className="h-32 rounded-lg bg-slate-100" />
        <div className="h-32 rounded-lg bg-slate-100" />
      </div>
      <div className="mt-6 h-4 w-3/4 rounded bg-slate-100" />
      <div className="h-4 w-2/3 rounded bg-slate-100" />
      <div className="h-4 w-1/2 rounded bg-slate-100" />
    </div>
  );
}

function CenteredPopupPreview({ srcDoc }: { srcDoc: string }) {
  return (
    <div className="relative flex flex-1 items-center justify-center bg-slate-100">
      <FakeSiteContent />
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
      <div
        className="relative overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl"
        style={{ width: 380, height: 620 }}
      >
        <iframe
          title="UEDA EX Popup"
          srcDoc={srcDoc}
          style={{ width: "100%", height: "100%", border: 0, display: "block" }}
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}

function FloatingPreview({ srcDoc }: { srcDoc: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="relative flex-1">
      <FakeSiteContent />
      {open ? (
        <div
          className="absolute overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl"
          style={{ width: 360, height: 560, right: 24, bottom: 96 }}
        >
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-500">
            <span>Widget flutuante</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded px-2 py-0.5 hover:bg-slate-200"
            >
              ✕
            </button>
          </div>
          <iframe
            title="UEDA EX Floating"
            srcDoc={srcDoc}
            style={{ width: "100%", height: "calc(100% - 28px)", border: 0, display: "block" }}
            sandbox="allow-same-origin"
          />
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-[#009FE3] text-white shadow-2xl shadow-[#009FE3]/40 transition hover:scale-105"
        style={{ right: 24, bottom: 24 }}
        title="Abrir/fechar widget"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </button>
    </div>
  );
}
