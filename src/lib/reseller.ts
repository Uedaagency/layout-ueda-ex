/**
 * Reseller (revendedor) branding model + local persistence.
 *
 * Lovable Cloud is not enabled for this project, so reseller records live in
 * the browser (localStorage). Each record carries everything needed to
 * personalise the UEDA EX extension package.
 */

export interface Reseller {
  id: string;
  /** Nome da operação — substitui "UEDA EX" nos textos da extensão. */
  name: string;
  /** Cor de identidade (hex). */
  color: string;
  /** Logo em data URL (png/jpg/svg). */
  logo: string | null;
  /** Telefone / WhatsApp — apenas dígitos (DDI + DDD + número). */
  phone: string;
  email: string;
  /** Site institucional / portal de suporte. */
  site: string;
  /** Link de renovação de licença. */
  renewUrl: string;
  /** Texto do botão de suporte. */
  supportLabel: string;
  /** Mensagem de boas-vindas na tela de login. */
  welcome: string;
  /** Assinatura de rodapé. */
  footer: string;
  createdAt: string;
}

export const STORAGE_KEY = "ueda_resellers_v1";

export function emptyReseller(): Reseller {
  return {
    id: crypto.randomUUID(),
    name: "",
    color: "#4fa1c9",
    logo: null,
    phone: "",
    email: "",
    site: "",
    renewUrl: "",
    supportLabel: "Obter suporte",
    welcome: "Bem-vindo! Ative sua chave para continuar.",
    footer: `© ${new Date().getFullYear()} — Todos os direitos reservados`,
    createdAt: new Date().toISOString(),
  };
}

export function loadResellers(): Reseller[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Reseller[]) : [];
  } catch {
    return [];
  }
}

export function saveResellers(list: Reseller[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function whatsappLink(phone: string): string {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

/** Best-effort support URL: site > whatsapp > mailto. */
export function supportUrl(r: Reseller): string {
  if (r.site && /^https?:\/\//i.test(r.site)) return r.site;
  const wa = whatsappLink(r.phone);
  if (wa) return wa;
  return r.email ? `mailto:${r.email}` : "";
}

export function slugify(s: string): string {
  return (
    String(s)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "revendedor"
  );
}
