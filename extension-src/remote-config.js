// ============================================================
// remote-config.js — Configuração dinâmica da UEDA EX
// ------------------------------------------------------------
// Generaliza o padrão de remote-branding.js / update-check.js
// para servir TEXTOS, FLAGS, PARÂMETROS e LINKS remotamente.
//
// Fluxo:
//   1. Aplica cache local imediatamente (sem flash / sem espera).
//   2. Faz fetch da SUA API (/api/public/remote-config).
//   3. Se a API falhar, cai no Supabase REST direto (fallback).
//   4. Compara `config_version`. Se aumentou, salva no cache e
//      mostra um TOAST não-bloqueante "Atualizar" (não recarrega
//      nada sozinho — o usuário decide).
//
// MV3-safe: só transporta DADOS. Nenhuma linha de config é
// executada como código. As flags são LIDAS por código que já
// está embarcado na extensão.
// ============================================================
(function () {
  "use strict";

  // ---- Endpoints ----
  var API_ENDPOINT = "https://exlovable.uedaagency.com.br/api/public/remote-config";
  var SUPABASE_URL = "https://qpssaefptonzbpgcvtrq.supabase.co";
  var SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwc3NhZWZwdG9uemJwZ2N2dHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NDY4NTUsImV4cCI6MjA5OTUyMjg1NX0.rZVreithJxc4w3T4W45zXTyATai3yjYennoa4nU9Uu8";
  var REST_ENDPOINT =
    SUPABASE_URL +
    "/rest/v1/remote_config?id=eq.1&select=config_version,flags,params,texts,links,updated_at&limit=1";

  var CACHE_KEY = "ueda_remote_config";
  var DEFAULT_POLL_MS = 20000;
  var FETCH_TIMEOUT = 8000;

  // ---- Estado em memória ----
  var current = null; // último config aplicado
  var pollTimer = null;

  // ---------- helpers de cache ----------
  function readCacheSync() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return null;
  }

  function saveCache(cfg) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cfg));
    } catch (_) {}
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        var obj = {};
        obj[CACHE_KEY] = cfg;
        chrome.storage.local.set(obj);
      }
    } catch (_) {}
  }

  // ---------- aplicação da config ----------
  // Publica a config num global lido pelo resto da extensão e
  // dispara um evento para quem quiser reagir dinamicamente.
  function applyConfig(cfg, opts) {
    if (!cfg) return;
    current = cfg;
    try {
      window.UEDA_REMOTE_CONFIG = cfg;
    } catch (_) {}

    // Helpers convenientes para o resto do código consumir:
    try {
      window.uedaFlag = function (name, fallback) {
        var f = (cfg.flags || {})[name];
        return typeof f === "undefined" ? fallback : f;
      };
      window.uedaParam = function (name, fallback) {
        var p = (cfg.params || {})[name];
        return typeof p === "undefined" ? fallback : p;
      };
      window.uedaText = function (key, locale) {
        var loc = locale || "pt-BR";
        var t = (cfg.texts || {})[loc] || {};
        return t[key];
      };
      window.uedaLink = function (name) {
        return (cfg.links || {})[name];
      };
    } catch (_) {}

    try {
      window.dispatchEvent(
        new CustomEvent("ueda:remote-config", { detail: cfg })
      );
    } catch (_) {}

    // Reajusta o intervalo de polling se o servidor mandou um novo.
    var poll = (cfg.params && cfg.params.poll_interval_ms) || DEFAULT_POLL_MS;
    restartPolling(poll);

    // Se veio de um fetch fresco e a versão subiu vs. o que estava
    // em cache antes, oferece o toast (a menos que seja o boot).
    if (opts && opts.notifyIfNewer && opts.previousVersion != null) {
      if ((cfg.config_version || 0) > opts.previousVersion) {
        showUpdateToast(cfg);
      }
    }
  }

  // ---------- fetch ----------
  function fetchJson(url, options) {
    var controller =
      typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = controller
      ? setTimeout(function () {
          controller.abort();
        }, FETCH_TIMEOUT)
      : null;
    var opts = Object.assign({ cache: "no-store" }, options || {});
    if (controller) opts.signal = controller.signal;
    return fetch(url, opts).then(function (resp) {
      if (timer) clearTimeout(timer);
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      return resp.json();
    });
  }

  function normalize(data) {
    var row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;
    return {
      config_version: Number(row.config_version) || 0,
      flags: row.flags || {},
      params: row.params || {},
      texts: row.texts || {},
      links: row.links || {},
      updated_at: row.updated_at || null,
    };
  }

  // API própria primeiro; Supabase REST como fallback.
  function fetchRemote() {
    return fetchJson(API_ENDPOINT + "?t=" + Date.now())
      .then(normalize)
      .catch(function () {
        return fetchJson(REST_ENDPOINT + "&t=" + Date.now(), {
          headers: {
            apikey: SUPABASE_ANON,
            Authorization: "Bearer " + SUPABASE_ANON,
          },
        }).then(normalize);
      });
  }

  function check(isBoot) {
    var previousVersion = current ? current.config_version || 0 : 0;
    return fetchRemote()
      .then(function (cfg) {
        if (!cfg) return;
        // Ignora fallback "stale" (config_version 0) se já temos algo melhor.
        if (cfg.config_version === 0 && previousVersion > 0) return;
        saveCache(cfg);
        applyConfig(cfg, {
          notifyIfNewer: !isBoot,
          previousVersion: previousVersion,
        });
      })
      .catch(function () {
        /* mantém cache atual em silêncio */
      });
  }

  // ---------- polling ----------
  function restartPolling(intervalMs) {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(function () {
      check(false);
    }, Math.max(5000, intervalMs || DEFAULT_POLL_MS));
  }

  // ---------- toast não-bloqueante ----------
  function injectToastStyles() {
    if (document.getElementById("__ueda_rc_toast_styles")) return;
    var s = document.createElement("style");
    s.id = "__ueda_rc_toast_styles";
    s.textContent =
      "#__ueda_rc_toast{position:fixed;right:18px;bottom:18px;z-index:2147483647;" +
      "display:flex;align-items:center;gap:12px;max-width:340px;padding:12px 14px;" +
      "border-radius:14px;background:linear-gradient(180deg,#111827,#0b0f16);" +
      "border:1px solid rgba(56,189,248,.28);color:#f8fafc;" +
      "font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;" +
      "font-size:13px;line-height:1.4;box-shadow:0 18px 44px rgba(0,0,0,.42);" +
      "opacity:0;transform:translateY(10px);transition:opacity .25s,transform .25s}" +
      "#__ueda_rc_toast.__visible{opacity:1;transform:translateY(0)}" +
      "#__ueda_rc_toast .__ico{width:30px;height:30px;flex:0 0 30px;border-radius:9px;" +
      "background:rgba(56,189,248,.14);display:grid;place-items:center;color:#7dd3fc;font-size:16px}" +
      "#__ueda_rc_toast .__msg{flex:1;min-width:0}" +
      "#__ueda_rc_toast .__msg b{display:block;font-weight:800;color:#fff;margin-bottom:1px}" +
      "#__ueda_rc_toast .__msg span{color:#cbd5e1;font-size:11.5px}" +
      "#__ueda_rc_toast button{border:none;cursor:pointer;border-radius:10px;" +
      "padding:8px 12px;font-weight:800;font-size:12px}" +
      "#__ueda_rc_toast .__go{background:linear-gradient(135deg,#00a8ff,#0078ff);color:#fff}" +
      "#__ueda_rc_toast .__x{background:transparent;color:#94a3b8;padding:8px 6px}";
    (document.head || document.documentElement).appendChild(s);
  }

  function dismissToast() {
    var el = document.getElementById("__ueda_rc_toast");
    if (!el) return;
    el.classList.remove("__visible");
    setTimeout(function () {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 280);
  }

  function showUpdateToast(cfg) {
    if (!document.body) {
      document.addEventListener(
        "DOMContentLoaded",
        function () {
          showUpdateToast(cfg);
        },
        { once: true }
      );
      return;
    }
    injectToastStyles();
    dismissToast();

    var title =
      (window.uedaText && window.uedaText("update_available")) ||
      "Nova configuração disponível";
    var action =
      (window.uedaText && window.uedaText("update_action")) || "Atualizar";

    var el = document.createElement("div");
    el.id = "__ueda_rc_toast";
    el.innerHTML =
      '<div class="__ico">↻</div>' +
      '<div class="__msg"><b></b><span>Clique para aplicar as novidades.</span></div>' +
      '<button class="__go" type="button"></button>' +
      '<button class="__x" type="button" aria-label="Fechar">✕</button>';
    el.querySelector(".__msg b").textContent = title;
    el.querySelector(".__go").textContent = action;

    el.querySelector(".__go").addEventListener("click", function () {
      // "Atualizar" = re-aplicar config e recarregar só a UI da extensão.
      try {
        applyConfig(cfg);
      } catch (_) {}
      dismissToast();
      // Recarrega apenas a página da própria extensão (sidepanel),
      // nunca a aba do usuário.
      try {
        if (location.protocol === "chrome-extension:") location.reload();
      } catch (_) {}
    });
    el.querySelector(".__x").addEventListener("click", dismissToast);

    document.body.appendChild(el);
    requestAnimationFrame(function () {
      el.classList.add("__visible");
    });
  }

  // ---------- sincronização entre contextos ----------
  try {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(function (changes, area) {
        if (area === "local" && changes[CACHE_KEY] && changes[CACHE_KEY].newValue) {
          var prev = current ? current.config_version || 0 : 0;
          var next = changes[CACHE_KEY].newValue;
          applyConfig(next, { notifyIfNewer: true, previousVersion: prev });
        }
      });
    }
  } catch (_) {}

  // ---------- boot ----------
  // 1) cache síncrono imediato
  var cached = readCacheSync();
  if (cached) applyConfig(cached, { notifyIfNewer: false });

  // 2) também tenta o chrome.storage.local (compartilhado)
  try {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([CACHE_KEY], function (res) {
        var s = res && res[CACHE_KEY];
        if (s && !cached) applyConfig(s, { notifyIfNewer: false });
        check(true); // primeira busca fresca é boot (não notifica)
      });
    } else {
      check(true);
    }
  } catch (_) {
    check(true);
  }

  // 3) revalidação em foco / visibilidade
  try {
    window.addEventListener("focus", function () {
      check(false);
    });
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) check(false);
    });
  } catch (_) {}

  // Expor um método manual de refresh, se algum botão quiser usar.
  try {
    window.uedaRefreshConfig = function () {
      return check(false);
    };
  } catch (_) {}
})();
