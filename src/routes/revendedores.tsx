import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Palette,
  Type as TypeIcon,
  Image as ImageIcon,
  MessageSquare,
  FileText,
  Globe,
  Mail,
  Phone,
  RefreshCw,
  Save,
  Download,
  Plus,
  Trash2,
  Users,
  Upload,
  LifeBuoy,
  ArrowLeft,
} from "lucide-react";
import {
  type Reseller,
  emptyReseller,
  loadResellers,
  saveResellers,
  supportUrl,
} from "@/lib/reseller";
import { buildResellerPackage, downloadBlob } from "@/lib/reseller-package";

const EXT_VERSION = "5.3.1";
const ACCENT = "#e0393e";

export const Route = createFileRoute("/revendedores")({
  head: () => ({
    meta: [
      { title: "Revendedores — Identidade visual UEDA EX" },
      {
        name: "description",
        content:
          "Cadastre revendedores, defina logo, cores e contatos e baixe a extensão UEDA EX ofuscada já personalizada.",
      },
      { property: "og:title", content: "Revendedores — Identidade visual UEDA EX" },
      {
        property: "og:description",
        content:
          "Personalize a extensão UEDA EX com a marca de cada revendedor e baixe o pacote ofuscado.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResellersPage,
});

/* ------------------------------------------------------------------ */
/* small UI atoms (local, dark "painel" aesthetic from the reference)  */
/* ------------------------------------------------------------------ */

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: typeof Palette;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
      <Icon size={15} style={{ color: ACCENT }} />
      <h2 className="text-[11px] font-bold tracking-[0.18em] text-slate-200 uppercase">
        {children}
      </h2>
    </div>
  );
}

function Field({
  label,
  hint,
  icon: Icon,
  children,
}: {
  label: string;
  hint?: string;
  icon?: typeof Palette;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">
        {Icon ? <Icon size={12} /> : null}
        {label}
      </label>
      {children}
      {hint ? (
        <p className="mt-2 text-[9px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/5 bg-[#111b2e] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-[#e0393e]/60";

/* ------------------------------------------------------------------ */
/* page                                                               */
/* ------------------------------------------------------------------ */

function ResellersPage() {
  const [list, setList] = useState<Reseller[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Reseller>(() => emptyReseller());
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"login" | "chat">("login");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = loadResellers();
    setList(stored);
    if (stored.length) {
      setActiveId(stored[0].id);
      setDraft(stored[0]);
    }
  }, []);

  const set = useCallback(<K extends keyof Reseller>(key: K, value: Reseller[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const persist = useCallback(
    (next: Reseller[]) => {
      setList(next);
      saveResellers(next);
    },
    [],
  );

  const handleSave = useCallback(() => {
    if (!draft.name.trim()) {
      setStatus("Informe o nome do revendedor antes de salvar.");
      return;
    }
    const exists = list.some((r) => r.id === draft.id);
    const next = exists
      ? list.map((r) => (r.id === draft.id ? draft : r))
      : [...list, draft];
    persist(next);
    setActiveId(draft.id);
    setStatus("Revendedor salvo.");
  }, [draft, list, persist]);

  const handleNew = useCallback(() => {
    const fresh = emptyReseller();
    setDraft(fresh);
    setActiveId(fresh.id);
    setStatus(null);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      const next = list.filter((r) => r.id !== id);
      persist(next);
      if (draft.id === id) handleNew();
    },
    [draft.id, handleNew, list, persist],
  );

  const handleLogo = useCallback((file: File | null) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setStatus("A logo deve ter no máximo 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set("logo", String(reader.result));
    reader.onerror = () => setStatus("Não foi possível ler o arquivo de logo.");
    reader.readAsDataURL(file);
  }, [set]);

  const handleDownload = useCallback(async () => {
    if (!draft.name.trim()) {
      setStatus("Informe o nome do revendedor antes de gerar o pacote.");
      return;
    }
    setBusy(true);
    setStatus("Gerando pacote ofuscado personalizado…");
    try {
      const { blob, filename } = await buildResellerPackage(draft, {
        version: EXT_VERSION,
      });
      downloadBlob(blob, filename);
      setStatus(`Pacote gerado: ${filename}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Falha ao gerar o pacote.");
    } finally {
      setBusy(false);
    }
  }, [draft]);

  const preview = useMemo(() => {
    const name = draft.name.trim() || "Nome do revendedor";
    return {
      name,
      color: draft.color || "#4fa1c9",
      logo: draft.logo,
      welcome: draft.welcome || "Bem-vindo! Ative sua chave para continuar.",
      footer: draft.footer || `© ${new Date().getFullYear()} — Todos os direitos reservados`,
      supportLabel: draft.supportLabel || "Obter suporte",
      support: supportUrl(draft),
    };
  }, [draft]);

  return (
    <div className="min-h-screen bg-[#080d18] text-slate-200">
      <div className="mx-auto max-w-[1500px] px-4 py-8 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-slate-400 uppercase hover:text-slate-200"
          >
            <ArrowLeft size={14} /> Voltar à prévia
          </Link>
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">
            <Users size={14} /> {list.length} revendedor(es)
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* -------------------- form column -------------------- */}
          <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#0b1425]">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-[#0d1729] px-8 py-6">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: "rgba(224,57,62,.12)" }}
                >
                  <Palette size={20} style={{ color: ACCENT }} />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-white italic uppercase">
                    Identidade visual
                  </h1>
                  <p className="text-sm text-slate-400">
                    Molde o ecossistema com a essência da marca do revendedor.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleNew}
                  className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase hover:text-slate-100"
                >
                  <Plus size={13} /> Novo
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[11px] font-bold tracking-[0.14em] text-white uppercase"
                  style={{ background: ACCENT }}
                >
                  <Save size={14} /> Salvar alterações
                </button>
              </div>
            </header>

            <div className="space-y-10 px-8 py-8">
              {/* essência visual */}
              <section>
                <SectionTitle icon={TypeIcon}>Essência visual</SectionTitle>
                <div className="grid gap-6 md:grid-cols-2">
                  <Field
                    label="Nome da operação"
                    hint="Nomenclatura pública do ecossistema."
                  >
                    <input
                      className={inputCls}
                      value={draft.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="Ex.: Ueda EX"
                    />
                  </Field>
                  <Field label="Cor de identidade" hint="Tom cromático primário do software.">
                    <div className="flex gap-3">
                      <input
                        type="color"
                        aria-label="Selecionar cor"
                        className="h-[46px] w-[56px] cursor-pointer rounded-lg border border-white/5 bg-transparent"
                        value={draft.color}
                        onChange={(e) => set("color", e.target.value)}
                      />
                      <input
                        className={inputCls}
                        value={draft.color}
                        onChange={(e) => set("color", e.target.value)}
                        placeholder="#4fa1c9"
                      />
                    </div>
                  </Field>
                </div>

                <div className="mt-8">
                  <SectionTitle icon={ImageIcon}>Logotipo de interface</SectionTitle>
                  <div className="flex flex-wrap items-center gap-8 rounded-2xl bg-[#0f1a2d] p-8">
                    <div className="flex h-[130px] w-[130px] items-center justify-center rounded-2xl bg-[#0b1425]">
                      {draft.logo ? (
                        <img
                          src={draft.logo}
                          alt={`Logo de ${preview.name}`}
                          className="max-h-[110px] max-w-[110px] object-contain"
                        />
                      ) : (
                        <ImageIcon size={28} className="text-slate-600" />
                      )}
                    </div>
                    <div>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={(e) => handleLogo(e.target.files?.[0] ?? null)}
                      />
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#131f35] px-6 py-3 text-[11px] font-bold tracking-[0.14em] text-slate-100 uppercase hover:border-white/20"
                      >
                        <Upload size={14} style={{ color: ACCENT }} /> Upload nova logo
                      </button>
                      <p className="mt-4 text-[10px] font-bold tracking-[0.12em] text-slate-500 uppercase">
                        Formato recomendado: quadrado (512px).
                        <br />
                        PNG transparente · máximo 2MB.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* canais */}
              <section>
                <SectionTitle icon={MessageSquare}>Canais de atendimento</SectionTitle>
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Portal de suporte / site" icon={Globe}>
                    <input
                      className={inputCls}
                      value={draft.site}
                      onChange={(e) => set("site", e.target.value)}
                      placeholder="https://suamarca.com.br/"
                    />
                  </Field>
                  <Field label="E-mail estratégico" icon={Mail}>
                    <input
                      className={inputCls}
                      value={draft.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="suporte@suaempresa.com"
                    />
                  </Field>
                  <Field
                    label="WhatsApp business"
                    icon={Phone}
                    hint="Apenas caracteres numéricos (DDI + DDD + número)."
                  >
                    <input
                      className={inputCls}
                      value={draft.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="5577999134858"
                    />
                  </Field>
                  <Field
                    label="Link de renovação"
                    icon={RefreshCw}
                    hint="Link para onde o usuário será enviado quando a licença expirar."
                  >
                    <input
                      className={inputCls}
                      value={draft.renewUrl}
                      onChange={(e) => set("renewUrl", e.target.value)}
                      placeholder="https://suamarca.com.br"
                    />
                  </Field>
                  <Field label="Rótulo do botão de suporte" icon={LifeBuoy}>
                    <input
                      className={inputCls}
                      value={draft.supportLabel}
                      onChange={(e) => set("supportLabel", e.target.value)}
                      placeholder="Obter suporte"
                    />
                  </Field>
                </div>
              </section>

              {/* mensagens */}
              <section>
                <SectionTitle icon={FileText}>Mensagens de interface</SectionTitle>
                <Field label="Boas-vindas premium" hint="Exibida no onboarding do cliente.">
                  <textarea
                    className={`${inputCls} min-h-[120px] resize-y`}
                    maxLength={200}
                    value={draft.welcome}
                    onChange={(e) => set("welcome", e.target.value)}
                  />
                </Field>
                <div className="mt-6">
                  <Field label="Assinatura de rodapé">
                    <input
                      className={inputCls}
                      value={draft.footer}
                      onChange={(e) => set("footer", e.target.value)}
                    />
                  </Field>
                </div>
              </section>

              {/* lista */}
              {list.length > 0 ? (
                <section>
                  <SectionTitle icon={Users}>Revendedores cadastrados</SectionTitle>
                  <ul className="space-y-3">
                    {list.map((r) => (
                      <li
                        key={r.id}
                        className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
                          r.id === activeId
                            ? "border-[#e0393e]/50 bg-[#131f35]"
                            : "border-white/5 bg-[#0f1a2d]"
                        }`}
                      >
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0b1425]"
                          style={{ boxShadow: `inset 0 0 0 1px ${r.color}55` }}
                        >
                          {r.logo ? (
                            <img
                              src={r.logo}
                              alt=""
                              className="max-h-6 max-w-6 object-contain"
                            />
                          ) : (
                            <span className="text-xs font-bold" style={{ color: r.color }}>
                              {r.name.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setDraft(r);
                            setActiveId(r.id);
                            setStatus(null);
                          }}
                          className="flex-1 text-left"
                        >
                          <span className="block text-sm font-semibold text-slate-100">
                            {r.name}
                          </span>
                          <span className="block text-xs text-slate-500">
                            {r.email || r.site || r.phone || "sem contato"}
                          </span>
                        </button>
                        <button
                          type="button"
                          aria-label={`Remover ${r.name}`}
                          onClick={() => handleDelete(r.id)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-slate-200"
                        >
                          <Trash2 size={15} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          </div>

          {/* -------------------- preview column -------------------- */}
          <aside className="lg:sticky lg:top-8 h-fit rounded-3xl border border-white/5 bg-[#0b1425] p-5">
            <div className="mb-3 flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: "#34d399" }}
              />
              <span className="text-sm font-semibold text-slate-100">
                Pré-visualização em tempo real
              </span>
            </div>
            <div className="mb-4 flex gap-4 text-xs">
              {(["login", "chat"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`capitalize ${
                    tab === t ? "text-slate-100 font-semibold" : "text-slate-500"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="rounded-2xl bg-[#050a14] p-3">
              <div className="rounded-2xl border border-white/5 bg-[#0a1020] p-4">
                {/* header */}
                <div className="mb-5 flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: preview.color }}
                  />
                  <span className="text-xs font-bold text-slate-100">{preview.name}</span>
                </div>

                {tab === "login" ? (
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                      {preview.logo ? (
                        <img
                          src={preview.logo}
                          alt=""
                          className="max-h-10 max-w-10 object-contain"
                        />
                      ) : (
                        <ImageIcon size={20} className="text-slate-600" />
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-100">
                      Bem vindo a {preview.name}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400 italic">
                      {preview.welcome}
                    </p>
                    <div className="mt-4 rounded-lg border border-white/5 bg-[#111b2e] px-3 py-2 text-left text-[11px] text-slate-500">
                      Sua chave de licença...
                    </div>
                    <button
                      type="button"
                      className="mt-3 w-full rounded-lg py-2 text-xs font-bold text-white"
                      style={{ background: preview.color }}
                    >
                      Ativar licença
                    </button>
                    <div className="mt-2 w-full rounded-lg border border-white/5 bg-[#0f1a2d] py-2 text-xs text-slate-300">
                      ⛨ {preview.supportLabel}
                    </div>
                    <p className="mt-4 text-[9px] text-slate-500">{preview.footer}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="ml-auto w-fit max-w-[85%] rounded-2xl px-3 py-2 text-[11px] text-white"
                      style={{ background: preview.color }}
                    >
                      Crie uma landing page premium
                    </div>
                    <div className="max-w-[90%] text-[11px] text-slate-300">
                      Claro! Vou estruturar a landing com hero, provas sociais e CTA.
                    </div>
                    <div className="rounded-xl border border-white/5 bg-[#111b2e] p-3">
                      <p className="text-[11px] text-slate-500">Pergunte algo…</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex gap-2 text-slate-400">
                          <span className="text-[11px]">📎</span>
                          <span className="text-[11px]">✨</span>
                          <span className="text-[11px]">⬇</span>
                          <span className="text-[11px]">🧽</span>
                        </div>
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-[11px] text-white"
                          style={{ background: preview.color }}
                        >
                          ➤
                        </span>
                      </div>
                    </div>
                    <p className="pt-2 text-center text-[9px] text-slate-500">
                      {preview.footer}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-slate-400">
              Esta é a visualização real de como a marca do revendedor aparecerá na
              extensão.
            </p>

            <button
              type="button"
              disabled={busy}
              onClick={handleDownload}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-[11px] font-bold tracking-[0.14em] text-white uppercase disabled:opacity-60"
              style={{ background: ACCENT }}
            >
              <Download size={15} />
              {busy ? "Gerando…" : `Baixar extensão ${EXT_VERSION}`}
            </button>
            <p className="mt-2 text-center text-[10px] text-slate-500">
              Pacote ofuscado, já com logo, cores e contatos do revendedor.
            </p>

            {status ? (
              <p className="mt-4 rounded-lg border border-white/5 bg-[#0f1a2d] px-3 py-2 text-center text-[11px] text-slate-300">
                {status}
              </p>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
