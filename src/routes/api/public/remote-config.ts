import { createFileRoute } from "@tanstack/react-router";

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? "https://qpssaefptonzbpgcvtrq.supabase.co";
const SUPABASE_ANON =
  process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? "";

const REST_URL =
  SUPABASE_URL +
  "/rest/v1/remote_config" +
  "?id=eq.1&select=config_version,flags,params,texts,links,updated_at&limit=1";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

const FALLBACK = {
  config_version: 0,
  flags: {},
  params: { poll_interval_ms: 20000 },
  texts: {},
  links: {},
  updated_at: null as string | null,
  _stale: true as const,
};

async function readConfig() {
  if (!SUPABASE_ANON) return FALLBACK;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const resp = await fetch(REST_URL, {
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: "Bearer " + SUPABASE_ANON,
      },
      signal: controller.signal,
    });
    if (!resp.ok) return FALLBACK;
    const rows = (await resp.json()) as Array<Record<string, unknown>>;
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return FALLBACK;
    return {
      config_version: Number(row.config_version) || 0,
      flags: row.flags ?? {},
      params: row.params ?? {},
      texts: row.texts ?? {},
      links: row.links ?? {},
      updated_at: (row.updated_at as string) ?? null,
    };
  } catch {
    return FALLBACK;
  } finally {
    clearTimeout(timer);
  }
}

export const Route = createFileRoute("/api/public/remote-config")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { headers: CORS }),
      GET: async () => {
        const config = await readConfig();
        return new Response(JSON.stringify(config), {
          status: 200,
          headers: {
            ...CORS,
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=15, s-maxage=15",
          },
        });
      },
    },
  },
});
