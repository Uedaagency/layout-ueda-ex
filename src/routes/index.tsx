import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pré-configuração da Extensão UEDA EX" },
      {
        name: "description",
        content:
          "Configure visualmente a extensão UEDA EX com pré-visualização em tempo real do painel lateral.",
      },
      { property: "og:title", content: "Pré-configuração UEDA EX" },
      {
        property: "og:description",
        content: "Ajuste marca, cores e tema com preview instantâneo.",
      },
    ],
  }),
  component: ConfigPreview,
});

type Theme = "dark" | "light";

interface Config {
  brandName: string;
  extensionName: string;
  primaryColor: string;
  theme: Theme;
  showBadge: boolean;
  badgeText: string;
  footerText: string;
  supportWa: string;
  salesWa: string;
  communityWa: string;
  showNotifBadge: boolean;
  notifCount: number;
}

const DEFAULTS: Config = {
  brandName: "Painel Lovable",
  extensionName: "Sorax",
  primaryColor: "#FF6A00",
  theme: "dark",
  showBadge: true,
  badgeText: "PRO",
  footerText: "Desenvolvido por Painel Lovable",
  supportWa: "https://wa.me/5561998239879",
  salesWa: "https://wa.me/5561998239879",
  communityWa: "https://chat.whatsapp.com/EV6U95tS01t3pu2SSWwvj7",
  showNotifBadge: true,
  notifCount: 3,
};

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function adjust(hex: string, delta: number) {
  const { r, g, b } = hexToRgb(hex);
  const f = delta / 100;
  const adj = (v: number) =>
    f < 0 ? Math.round(v * (1 + f)) : Math.round(v + (255 - v) * f);
  const to = (v: number) => Math.max(0, Math.min(255, adj(v))).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function ConfigPreview() {
  const [cfg, setCfg] = useState<Config>(DEFAULTS);
  const update = <K extends keyof Config>(k: K, v: Config[K]) =>
    setCfg((c) => ({ ...c, [k]: v }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/40 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Pré-configuração da Extensão
            </h1>
            <p className="text-xs text-muted-foreground">
              Ajuste os parâmetros à esquerda — o preview atualiza em tempo real.
            </p>
          </div>
          <button
            onClick={() => setCfg(DEFAULTS)}
            className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition hover:bg-secondary/80"
          >
            Restaurar padrão
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <SettingsPanel cfg={cfg} update={update} />
        <div className="flex justify-center lg:sticky lg:top-6 lg:self-start">
          <ExtensionMockup cfg={cfg} />
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
      <Section title="Identidade da marca">
        <Field label="Nome da marca">
          <input
            className="input"
            value={cfg.brandName}
            onChange={(e) => update("brandName", e.target.value)}
          />
        </Field>
        <Field label="Nome da extensão">
          <input
            className="input"
            value={cfg.extensionName}
            onChange={(e) => update("extensionName", e.target.value)}
          />
        </Field>
        <Field label="Texto do rodapé">
          <input
            className="input"
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
              className="input flex-1 font-mono uppercase"
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

      <Section title="Selo e notificações">
        <Toggle
          label="Exibir selo no header"
          checked={cfg.showBadge}
          onChange={(v) => update("showBadge", v)}
        />
        {cfg.showBadge && (
          <Field label="Texto do selo">
            <input
              className="input"
              maxLength={8}
              value={cfg.badgeText}
              onChange={(e) => update("badgeText", e.target.value.toUpperCase())}
            />
          </Field>
        )}
        <Toggle
          label="Badge de notificações"
          checked={cfg.showNotifBadge}
          onChange={(v) => update("showNotifBadge", v)}
        />
        {cfg.showNotifBadge && (
          <Field label={`Quantidade: ${cfg.notifCount}`}>
            <input
              type="range"
              min={0}
              max={9}
              value={cfg.notifCount}
              onChange={(e) => update("notifCount", Number(e.target.value))}
              className="w-full"
            />
          </Field>
        )}
      </Section>

      <Section title="Links de WhatsApp">
        <Field label="Suporte">
          <input
            className="input"
            value={cfg.supportWa}
            onChange={(e) => update("supportWa", e.target.value)}
          />
        </Field>
        <Field label="Vendas">
          <input
            className="input"
            value={cfg.salesWa}
            onChange={(e) => update("salesWa", e.target.value)}
          />
        </Field>
        <Field label="Comunidade">
          <input
            className="input"
            value={cfg.communityWa}
            onChange={(e) => update("communityWa", e.target.value)}
          />
        </Field>
      </Section>

      <style>{`
        .input {
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid hsl(var(--border, 0 0% 90%));
          border-color: var(--color-border);
          background: var(--color-secondary);
          color: var(--color-foreground);
          font-size: 13px;
          outline: none;
          transition: all 0.15s ease;
        }
        .input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(0,0,0,0.05); }
      `}</style>
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

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-border bg-secondary/40 px-3 py-2">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
            checked ? "left-4" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}

function ExtensionMockup({ cfg }: { cfg: Config }) {
  const tokens = useMemo(() => {
    const rgb = hexToRgb(cfg.primaryColor);
    const hover = adjust(cfg.primaryColor, -12);
    const isDark = cfg.theme === "dark";
    return {
      "--brand": cfg.primaryColor,
      "--brand-hover": hover,
      "--brand-rgb": `${rgb.r}, ${rgb.g}, ${rgb.b}`,
      "--brand-gradient": `linear-gradient(135deg, ${cfg.primaryColor}, ${hover})`,
      "--bg": isDark ? "#0a0a0b" : "#ffffff",
      "--bg-elevated": isDark ? "#111113" : "#fafafa",
      "--bg-surface": isDark ? "#18181b" : "#f4f4f5",
      "--bg-hover": isDark ? "#1f1f23" : "#e4e4e7",
      "--border": isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      "--text-primary": isDark ? "#f4f4f5" : "#18181b",
      "--text-secondary": isDark ? "#a1a1aa" : "#52525b",
      "--text-muted": isDark ? "#71717a" : "#a1a1aa",
      "--success": "#34d399",
      "--warning": "#fbbf24",
    } as React.CSSProperties;
  }, [cfg]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-xs font-medium text-muted-foreground">
        Preview do painel lateral (380×720)
      </div>
      <div
        className="overflow-hidden rounded-2xl border border-border bg-black/40 shadow-2xl"
        style={{ width: 380, height: 720, ...tokens }}
      >
        <div
          className="flex h-full flex-col"
          style={{
            background: "var(--bg)",
            color: "var(--text-primary)",
            fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3.5"
            style={{
              background: "var(--bg-elevated)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "var(--brand)",
                }}
              >
                {cfg.brandName || "\u00A0"}
              </span>
              {cfg.showBadge && cfg.badgeText && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 6,
                    background: "var(--brand-gradient)",
                    color: "#fff",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {cfg.badgeText}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <IconBtn count={cfg.showNotifBadge ? cfg.notifCount : 0}>🔔</IconBtn>
              <IconBtn>{cfg.theme === "dark" ? "🌙" : "☀️"}</IconBtn>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Profile card */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 14,
                marginBottom: 14,
              }}
            >
              <div className="mb-2 flex items-center gap-2.5">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--brand-gradient)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  U
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: 14, fontWeight: 700 }}>usuario@lovable</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {cfg.extensionName} · v5.1
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: 6,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    background: "rgba(52,211,153,0.08)",
                    color: "var(--success)",
                    border: "1px solid rgba(52,211,153,0.15)",
                  }}
                >
                  PRO
                </span>
              </div>
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border)",
                  marginTop: 8,
                }}
              >
                <div className="flex items-center gap-2" style={{ fontSize: 12 }}>
                  <span style={{ color: "var(--text-secondary)" }}>Licença ativa</span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontFamily: "'SF Mono', monospace",
                      fontWeight: 700,
                      color: "var(--brand-hover)",
                    }}
                  >
                    28d 14h
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 8,
                    height: 5,
                    borderRadius: 5,
                    background: "var(--bg-hover)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "72%",
                      height: "100%",
                      background: "var(--brand-gradient)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div
              className="mb-3 flex gap-1 rounded-lg p-1"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
            >
              {["Prompt", "Templates", "Config"].map((t, i) => (
                <div
                  key={t}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "8px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: i === 0 ? "var(--brand)" : "transparent",
                    color: i === 0 ? "#fff" : "var(--text-secondary)",
                  }}
                >
                  {t}
                </div>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              readOnly
              placeholder="Digite seu prompt aqui…"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                fontSize: 13,
                fontFamily: "inherit",
                resize: "none",
                minHeight: 90,
                outline: "none",
              }}
            />

            {/* Primary button */}
            <button
              style={{
                width: "100%",
                padding: 12,
                marginTop: 10,
                border: "none",
                borderRadius: 8,
                background: "var(--brand-gradient)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: `0 4px 16px rgba(var(--brand-rgb), 0.35)`,
              }}
            >
              Enviar prompt
            </button>

            {/* Links */}
            <div className="mt-4 space-y-1.5">
              {[
                { label: "Suporte", href: cfg.supportWa, icon: "💬" },
                { label: "Vendas", href: cfg.salesWa, icon: "🛒" },
                { label: "Comunidade", href: cfg.communityWa, icon: "👥" },
              ].map((l) => (
                <div
                  key={l.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                >
                  <span>{l.icon}</span>
                  <span style={{ fontWeight: 600 }}>{l.label}</span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 10,
                      color: "var(--text-muted)",
                      maxWidth: 180,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {l.href.replace("https://", "")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "10px 14px",
              borderTop: "1px solid var(--border)",
              background: "var(--bg-elevated)",
              textAlign: "center",
              fontSize: 11,
              color: "var(--text-muted)",
            }}
          >
            {cfg.footerText}
          </div>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  count = 0,
}: {
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        color: "var(--text-muted)",
        position: "relative",
        cursor: "pointer",
      }}
    >
      {children}
      {count > 0 && (
        <span
          style={{
            position: "absolute",
            top: -3,
            right: -3,
            minWidth: 16,
            height: 16,
            padding: "0 4px",
            borderRadius: "50%",
            background: "var(--brand-hover)",
            color: "#fff",
            fontSize: 9,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}
