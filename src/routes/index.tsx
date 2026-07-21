import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Zap,
  Sparkles,
  FilePlus2,
  Download,
  Eraser,
  User,
  MessageSquare,
  Wrench,
  CloudUpload,
  Lock,
  X,
  type LucideIcon,
} from "lucide-react";
import sidepanelCss from "../extension-assets/sidepanel.css?raw";
import uedaLogo from "../assets/ueda-logo.png.asset.json";

export type ViewMode = "entry" | "choice" | "fixed" | "floating";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Preview — UEDA EX" },
      { name: "description", content: "Simulação da extensão UEDA EX." },
    ],
  }),
  component: ExtensionPreview,
});

const BRAND = "#009FE3";
const BRAND_DARK = "#0077B0";

/* ============================================================
   Fixed-mode iframe HTML (kept, simplified from previous build)
============================================================ */
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

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildFixedSrcDoc() {
  const chips = SHORTCUTS.map(
    (s) =>
      `<button class="sp-chip sp-chip-modern"><span class="sp-chip-icon">${s.icon}</span><span>${escapeHtml(s.label)}</span></button>`,
  ).join("");

  const override = `
    :root{--ts-brand-primary:${BRAND};--ts-brand-primary-hover:${BRAND_DARK};--ts-brand-primary-rgb:0,159,227;--ts-brand-primary-soft:rgba(0,159,227,.12);--ts-brand-primary-border:rgba(0,159,227,.35);--ts-brand-primary-glow:rgba(0,159,227,.35);--ts-brand-gradient:linear-gradient(135deg,${BRAND},${BRAND_DARK});}
    html,body{height:100%;}
    body{overflow:hidden;animation:none;background:linear-gradient(180deg,#f0f9ff 0%,#ffffff 100%);}
    body.sp-light .sp-header{background:rgba(255,255,255,.65);backdrop-filter:blur(18px) saturate(160%);border-bottom:1px solid rgba(0,159,227,.15);}
    body.sp-light .sp-brand-text{color:#0a2540 !important;font-weight:700;}
    body.sp-light .sp-badge{background:${BRAND} !important;color:#fff !important;border-radius:8px;}
    body.sp-light .sp-body{background:transparent;}
    body.sp-light .sp-profile-card{background:rgba(255,255,255,.55);border:1px solid rgba(0,159,227,.18);backdrop-filter:blur(14px);border-radius:14px;}
    body.sp-light .sp-sync-ok{color:#10c978;}
    body.sp-light .sp-tabs{background:rgba(255,255,255,.55);border:1px solid rgba(0,159,227,.18);backdrop-filter:blur(14px);border-radius:12px;}
    body.sp-light .sp-tab.sp-tab-active{background:rgba(0,159,227,.12);color:${BRAND};}
    body.sp-light .sp-tab-badge{background:${BRAND};color:#fff;}
    body.sp-light .sp-chip-modern{background:rgba(255,255,255,.65);border:1px solid rgba(0,159,227,.15);color:#0a2540;backdrop-filter:blur(10px);}
    body.sp-light .sp-chip-modern:hover{border-color:rgba(0,159,227,.4);}
    body.sp-light .sp-chip-icon{background:rgba(0,159,227,.10);border:1px solid rgba(0,159,227,.15);}
    body.sp-light .sp-compose-card{background:rgba(255,255,255,.60);border:1px solid rgba(0,159,227,.18);backdrop-filter:blur(14px);}
    body.sp-light .sp-send-modern{background:${BRAND};box-shadow:0 10px 30px rgba(0,159,227,.35);}
    body.sp-light .sp-footer{background:transparent;border-top:1px solid rgba(0,159,227,.12);}
    body.sp-light .sp-footer-badge{background:rgba(255,255,255,.6);border:1px solid rgba(0,159,227,.18);color:#0a2540 !important;backdrop-filter:blur(10px);}
  `;

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${sidepanelCss}</style><style>${override}</style></head><body class="sp-light">
    <div class="sp-header"><div class="sp-brand"><span class="sp-brand-text">Ueda EX</span><span class="sp-badge">PRO</span></div></div>
    <div class="sp-body">
      <div class="sp-profile-card">
        <div class="sp-profile-top"><div class="sp-profile-left"><span class="sp-profile-name">Magda</span><span class="sp-status-badge sp-badge-pro">PRO</span></div></div>
        <div class="sp-sync-status sp-sync-ok">✅ Sincronizado! Projeto: f4f7e3...</div>
        <div class="sp-trial-countdown" style="display:flex"><div class="sp-countdown-row"><span>⏳</span><span class="sp-countdown-label">Plano expira em</span><span class="sp-countdown-time">29d 21h 42m</span></div><div class="sp-trial-bar"><div class="sp-trial-bar-fill" style="width:88%"></div></div></div>
      </div>
      <div class="sp-tabs">
        <button class="sp-tab sp-tab-active">⚡ Prompt</button>
        <button class="sp-tab">⭐ Skills</button>
        <button class="sp-tab">💬 Histórico <span class="sp-tab-badge">8</span></button>
      </div>
      <div class="sp-composer-shell">
        <div class="sp-shortcuts-grid sp-shortcuts-modern">${chips}</div>
        <div class="sp-compose-card">
          <textarea class="sp-textarea sp-textarea-modern" rows="4" placeholder="O que vamos criar hoje?"></textarea>
          <div class="sp-compose-toolbar"><div class="sp-compose-tools"></div><button class="sp-send-modern">➜</button></div>
        </div>
      </div>
    </div>
    <div class="sp-footer"><div class="sp-footer-badge">Desenvolvido por Painel Lovable</div></div>
  </body></html>`;
}

/* ============================================================
   Route component
============================================================ */
const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: "entry", label: "Tela de entrada" },
  { id: "choice", label: "Escolha de modo" },
  { id: "fixed", label: "Painel fixo" },
  { id: "floating", label: "Widget flutuante" },
];

function ExtensionPreview() {
  const [mode, setMode] = useState<ViewMode>("entry");
  const fixedSrcDoc = useMemo(() => buildFixedSrcDoc(), []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center">
        <div className="mb-4 flex flex-wrap justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 p-2 backdrop-blur">
          {VIEW_MODES.map((v) => {
            const active = mode === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setMode(v.id)}
                className={
                  "rounded-lg px-4 py-2 text-xs font-medium transition " +
                  (active
                    ? "bg-[#009FE3] text-white shadow-lg shadow-[#009FE3]/30"
                    : "text-slate-300 hover:bg-slate-800")
                }
              >
                {v.label}
              </button>
            );
          })}
        </div>

        <div className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 shadow-2xl">
          <div className="flex items-center gap-2 rounded-t-lg bg-slate-800 px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="h-3 w-3 rounded-full bg-yellow-500" />
            <span className="h-3 w-3 rounded-full bg-green-500" />
            <div className="ml-4 flex-1 truncate rounded-md bg-slate-700/60 px-3 py-1 text-xs text-slate-300">
              chrome-extension://ueda-ex/sidepanel.html
            </div>
          </div>

          <div className="relative flex h-[820px] overflow-hidden rounded-b-lg">
            {mode === "entry" && <EntryPreview />}
            {mode === "choice" && <ChoicePreview />}
            {mode === "fixed" && <FixedPreview srcDoc={fixedSrcDoc} />}
            {mode === "floating" && <FloatingPreview />}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              fetch("/ueda-ex.zip")
                .then((res) => res.blob())
                .then((blob) => {
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = "UEDA EX 5.2.2.zip";
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(a.href);
                });
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#009FE3] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#009FE3]/30 hover:bg-[#0088c2]"
          >
            ⬇ Baixar UEDA EX 5.2.2
          </button>
          <button
            type="button"
            onClick={() => {
              fetch("/ueda-ex-source.zip")
                .then((res) => res.blob())
                .then((blob) => {
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = "ueda-ex-source.zip";
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(a.href);
                });
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-500 bg-slate-700 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-600"
          >
            ⬇ Baixar código-fonte (sem ofuscação)
          </button>
        </div>

      </div>
    </div>
  );
}

/* ============================================================
   Simulated desktop background (behind popups)
============================================================ */
function DesktopBackground() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(135deg, #0a2540 0%, #0e3a5f 45%, #1a5a8a 100%)",
      }}
    >
      {/* Fake browser window */}
      <div className="absolute left-8 top-8 right-8 bottom-8 rounded-xl bg-white/95 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 border-b">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <div className="ml-4 flex-1 rounded bg-white px-3 py-1 text-[11px] text-slate-500 border">
            lovable.dev/projects/...
          </div>
        </div>
        <div className="p-8 space-y-4">
          <div className="h-6 w-1/2 rounded bg-slate-200" />
          <div className="h-3 w-2/3 rounded bg-slate-100" />
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="h-24 rounded-lg bg-slate-100" />
            <div className="h-24 rounded-lg bg-slate-100" />
            <div className="h-24 rounded-lg bg-slate-100" />
          </div>
          <div className="h-3 w-3/4 rounded bg-slate-100" />
          <div className="h-3 w-1/2 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Glass popup shell (blue-tinted)
============================================================ */
function GlassPanel({
  children,
  width = 340,
  className = "",
}: {
  children: React.ReactNode;
  width?: number;
  className?: string;
}) {
  return (
    <div
      className={"rounded-2xl border shadow-2xl " + className}
      style={{
        width,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(224,242,254,0.75))",
        backdropFilter: "blur(24px) saturate(180%)",
        borderColor: "rgba(0,159,227,0.25)",
        boxShadow:
          "0 20px 60px rgba(0,159,227,0.25), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}
    >
      {children}
    </div>
  );
}

function BrandLogo({ size = 56 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl overflow-hidden bg-white shadow-lg"
      style={{
        width: size,
        height: size,
        boxShadow: `0 10px 30px ${BRAND}55`,
      }}
    >
      <img
        src={uedaLogo.url}
        alt="Ueda EX"
        style={{ width: size * 0.72, height: size * 0.72, objectFit: "contain" }}
      />
    </div>
  );
}

/* ============================================================
   ENTRY: centered glass popup with license key
============================================================ */
function EntryPreview() {
  return (
    <div className="relative flex flex-1 items-center justify-center">
      <DesktopBackground />
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[3px]" />
      <GlassPanel width={340} className="relative p-6">
        <div className="flex flex-col items-center text-center gap-3">
          <BrandLogo size={56} />
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Bem-vindo a <span style={{ color: BRAND }}>Ueda EX</span>
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Insira sua chave de licença para desbloquear.
            </p>
          </div>
          <input
            placeholder="UEDAEX-XXXXXXXXXXXXXX"
            className="mt-2 w-full rounded-lg border border-[#009FE3]/25 bg-white/60 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none backdrop-blur focus:border-[#009FE3]"
          />
          <button
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`,
              boxShadow: `0 8px 20px ${BRAND}55`,
            }}
          >
            Validar Licença
          </button>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="mt-1 flex w-full items-center gap-3 rounded-lg border border-[#009FE3]/20 bg-white/50 px-3 py-2.5 text-left backdrop-blur hover:bg-white/70 transition"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
              style={{ background: BRAND }}
            >
              💬
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-slate-900">
                Obter suporte
              </div>
              <div className="text-[10px] text-slate-600">
                Fale com nossa equipe.
              </div>
            </div>
            <span className="text-slate-400">›</span>
          </a>
        </div>
      </GlassPanel>
    </div>
  );
}

/* ============================================================
   CHOICE: fixed vs floating
============================================================ */
function ChoicePreview() {
  return (
    <div className="relative flex flex-1 items-center justify-center">
      <DesktopBackground />
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[3px]" />
      <GlassPanel width={360} className="relative p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <BrandLogo />
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Escolha o modo
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Como você prefere usar a extensão?
            </p>
          </div>
          <div className="flex w-full flex-col gap-2.5">
            <button
              className="flex items-center gap-3 rounded-xl border-2 p-3 text-left transition hover:bg-white/60"
              style={{
                borderColor: BRAND,
                background: "rgba(0,159,227,0.08)",
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                style={{ background: BRAND }}
              >
                ▮▯
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Painel Fixo
                </div>
                <div className="text-[11px] text-slate-600">
                  Ancorado ao navegador
                </div>
              </div>
            </button>
            <button className="flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white/40 p-3 text-left transition hover:bg-white/60">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                style={{ background: `linear-gradient(135deg,${BRAND},${BRAND_DARK})` }}
              >
                ⊙
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Widget Flutuante
                </div>
                <div className="text-[11px] text-slate-600">
                  Botão sobre a página
                </div>
              </div>
            </button>
          </div>
          <button
            className="mt-1 w-full rounded-lg py-2.5 text-sm font-semibold text-white"
            style={{ background: `linear-gradient(135deg,${BRAND},${BRAND_DARK})` }}
          >
            Continuar
          </button>
        </div>
      </GlassPanel>
    </div>
  );
}

/* ============================================================
   FIXED: same as before, iframe with sidepanel css + glass theme
============================================================ */
function FixedPreview({ srcDoc }: { srcDoc: string }) {
  return (
    <div className="relative flex flex-1 min-w-0">
      <DesktopBackground />
      <div
        className="absolute right-0 top-0 h-full border-l shadow-[-8px_0_24px_rgba(0,0,0,0.15)] bg-white"
        style={{
          width: "min(380px, 100%)",
          borderColor: "rgba(0,159,227,0.2)",
        }}
      >
        <iframe
          title="UEDA EX Sidepanel"
          srcDoc={srcDoc}
          style={{ width: "100%", height: "100%", border: 0, display: "block", background: "#fff" }}
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}


/* ============================================================
   FLOATING: pulsing logo → icon rail → expandable to names
   Tabs (Prompt/Skills/Histórico) and user icon open glass popups
============================================================ */
type FloatingTab = null | "prompt" | "skills" | "history" | "user" | "optimize" | "insert-skill" | "new-project" | "download" | "remove-watermark" | "shortcuts";

const RAIL_ITEMS: { id: Exclude<FloatingTab, null>; icon: LucideIcon; label: string }[] = [
  { id: "shortcuts", icon: Wrench, label: "Atalhos" },
  { id: "optimize", icon: Zap, label: "Otimizar" },
  { id: "insert-skill", icon: Sparkles, label: "Inserir Skill" },
  { id: "new-project", icon: FilePlus2, label: "Criar projeto novo" },
  { id: "download", icon: Download, label: "Baixar projeto" },
  { id: "remove-watermark", icon: Eraser, label: "Remover marca d'água" },
  { id: "history", icon: MessageSquare, label: "Histórico" },
  { id: "user", icon: User, label: "Usuário" },
];

function FloatingPreview() {
  const [expanded, setExpanded] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const [activeTab, setActiveTab] = useState<FloatingTab>(null);

  // Logo stays fixed at bottom-right, offset from the edge.
  const anchorRight = 56;
  const anchorBottom = 56;

  return (
    <div className="relative flex-1">
      <DesktopBackground />

      {/* Labels panel — slides out to the LEFT of the icon rail when expanded */}
      {expanded && showNames && (
        <div
          className="absolute flex flex-col gap-1 py-4 pl-4 pr-6 shadow-2xl"
          style={{
            right: anchorRight + 64,
            bottom: anchorBottom + 68,
            width: 168,
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(20px) saturate(180%)",
            borderRadius: 28,
            boxShadow: "0 20px 60px rgba(15,42,66,0.25)",
          }}
        >
          {RAIL_ITEMS.map((it) => {
            const active = activeTab === it.id;
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => setActiveTab(active ? null : it.id)}
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition"
                style={{
                  background: active ? "#0f2a42" : "transparent",
                  color: active ? "#fff" : "#0f2a42",
                }}
              >
                <it.icon size={15} strokeWidth={1.75} />
                <span className="truncate text-[13px] font-medium">{it.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Icon rail — dark vertical pill anchored above the logo */}
      {expanded && (
        <div
          className="absolute flex flex-col items-center gap-2 py-3"
          style={{
            right: anchorRight + 4,
            bottom: anchorBottom + 68,
            width: 48,
            background: "linear-gradient(180deg,#0f2a42,#08192b)",
            borderRadius: 999,
            boxShadow: "0 20px 60px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          <button
            type="button"
            onClick={() => setShowNames((v) => !v)}
            className="flex h-6 w-6 items-center justify-center rounded-full text-white/70 hover:text-white"
            title={showNames ? "Recolher" : "Expandir"}
          >
            {showNames ? "›" : "‹"}
          </button>
          {RAIL_ITEMS.map((it) => {
            const active = activeTab === it.id;
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => setActiveTab(active ? null : it.id)}
                className="flex h-9 w-9 items-center justify-center rounded-full transition"
                style={{
                  background: active ? "#fff" : "transparent",
                  color: active ? "#0f2a42" : "rgba(255,255,255,0.85)",
                  border: active ? "none" : "1px solid rgba(255,255,255,0.18)",
                }}
                title={it.label}
              >
                <it.icon size={15} strokeWidth={1.9} />
              </button>
            );
          })}
        </div>
      )}

      {/* Fixed logo — anchored at bottom, pulls the rail up */}
      <button
        type="button"
        onClick={() => {
          if (expanded) {
            setExpanded(false);
            setActiveTab(null);
            setShowNames(false);
          } else {
            setExpanded(true);
            setShowNames(true);
          }
        }}
        className="absolute"
        style={{ right: anchorRight, bottom: anchorBottom }}
        title={expanded ? "Fechar" : "Abrir extensão"}
      >
        <span
          className="relative flex h-[60px] w-[60px] items-center justify-center rounded-full overflow-hidden ueda-orb"
        >
          {!expanded && <span className="ueda-orb-ring ueda-orb-ring-1" />}
          {!expanded && <span className="ueda-orb-ring ueda-orb-ring-2" />}
          {!expanded && <span className="ueda-orb-wave" />}
          {expanded ? (
            <X size={22} strokeWidth={2.2} color={BRAND_DARK} style={{ position: "relative", zIndex: 2 }} />
          ) : (
            <img src={uedaLogo.url} alt="Ueda EX" className="h-[30px] w-[30px] object-contain relative z-[2]" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }} />
          )}
        </span>

      </button>

      {/* Centered popup for the active tab */}
      {activeTab && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-[3px]"
            onClick={() => setActiveTab(null)}
          />
          <GlassPanel width={380} className="relative p-5">
            <TabPopup tab={activeTab} onClose={() => setActiveTab(null)} />
          </GlassPanel>
        </div>
      )}
    </div>
  );
}

function TabPopup({ tab, onClose }: { tab: Exclude<FloatingTab, null>; onClose: () => void }) {
  const titles: Record<Exclude<FloatingTab, null>, string> = {
    prompt: "Prompt",
    skills: "Skills",
    history: "Histórico",
    user: "Magda",
    optimize: "Otimizar",
    "insert-skill": "Inserir Skill",
    "new-project": "Criar projeto novo",
    download: "Baixar projeto",
    "remove-watermark": "Remover marca d'água",
    shortcuts: "Atalhos",
  };
  const descriptions: Partial<Record<Exclude<FloatingTab, null>, string>> = {
    optimize: "Analisa o projeto e sugere melhorias de performance, código e UX.",
    "insert-skill": "Adiciona uma skill personalizada ao contexto do agente.",
    "new-project": "Cria um novo projeto em branco com a estrutura padrão.",
    download: "Baixa o projeto atual como um arquivo .zip.",
    "remove-watermark": "Remove marcas d'água aplicadas pela extensão.",
  };
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">{titles[tab]}</h3>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white/60"
        >
          ✕
        </button>
      </div>

      {tab === "prompt" && <PromptContent />}
      {tab === "shortcuts" && <PromptContent />}
      {tab === "skills" && <SkillsContent />}
      {tab === "history" && <HistoryContent />}
      {tab === "user" && <UserContent />}
      {descriptions[tab] && (
        <p className="text-sm text-slate-600 leading-relaxed">{descriptions[tab]}</p>
      )}
    </div>
  );
}

function PromptContent() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {SHORTCUTS.map((s) => (
        <button
          key={s.label}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-[#009FE3]/20 bg-white/60 p-2.5 text-center backdrop-blur hover:bg-white/80 transition"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#009FE3]/10 text-lg">
            {s.icon}
          </span>
          <span className="text-[10px] font-medium leading-tight text-slate-800">
            {s.label}
          </span>
        </button>
      ))}
    </div>
  );
}

function SkillsContent() {
  const skills = [
    { icon: "♿", name: "Accessibility Review", desc: "Audita acessibilidade" },
    { icon: "🎨", name: "Redesign", desc: "Refina o design" },
    { icon: "🔍", name: "SEO Review", desc: "Auditoria SEO" },
    { icon: "🎬", name: "Video Creator", desc: "Gera vídeos curtos" },
  ];
  return (
    <div className="space-y-2">
      <button
        className="w-full rounded-lg py-2 text-sm font-semibold text-white"
        style={{ background: BRAND }}
      >
        + Nova Skill
      </button>
      {skills.map((s) => (
        <div
          key={s.name}
          className="flex items-center gap-3 rounded-lg border border-[#009FE3]/20 bg-white/60 p-2.5 backdrop-blur"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#009FE3]/10 text-lg">
            {s.icon}
          </span>
          <div className="flex-1">
            <div className="text-xs font-semibold text-slate-900">{s.name}</div>
            <div className="text-[10px] text-slate-600">{s.desc}</div>
          </div>
          <span className="text-slate-400">›</span>
        </div>
      ))}
    </div>
  );
}

function HistoryContent() {
  const items = [
    "Ajustes na tela de entrada centralizada…",
    "Widget flutuante com efeito de pulsação…",
    "Download da extensão com ajustes aplicados…",
  ];
  return (
    <div className="space-y-2">
      {items.map((t, i) => (
        <div
          key={i}
          className="rounded-lg border border-[#009FE3]/20 bg-white/60 p-3 backdrop-blur"
        >
          <p className="text-xs text-slate-800">{t}</p>
          <p className="mt-1 text-[10px] text-slate-500">há {i + 1}h · ✓✓</p>
        </div>
      ))}
    </div>
  );
}

function UserContent() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full text-white font-bold"
          style={{ background: `linear-gradient(135deg,${BRAND},${BRAND_DARK})` }}
        >
          M
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900">
            Magda <span className="ml-1 rounded bg-[#009FE3] px-1.5 py-0.5 text-[9px] text-white">PRO</span>
          </div>
          <div className="text-[11px] text-emerald-600">✅ Sincronizado</div>
        </div>
      </div>
      <div className="rounded-lg border border-[#009FE3]/20 bg-white/60 p-3 backdrop-blur">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-700">⏳ Plano expira em</span>
          <span className="font-semibold" style={{ color: BRAND }}>
            29d 21h 42m
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full"
            style={{ width: "88%", background: `linear-gradient(90deg,${BRAND},${BRAND_DARK})` }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <button className="rounded-lg border border-[#009FE3]/20 bg-white/60 py-2 hover:bg-white/80">
          🔔 Notificações
        </button>
        <button className="rounded-lg border border-[#009FE3]/20 bg-white/60 py-2 hover:bg-white/80">
          🚪 Sair
        </button>
      </div>
    </div>
  );
}
