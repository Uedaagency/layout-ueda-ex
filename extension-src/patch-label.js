(function () {
  "use strict";

  const REPLACEMENT = "⚡ Enviado por UEDAEX";

  const EXACT = new Set([
    "SECURITY SCAN",
    "Security Scan",
    "security scan",
    "Security Check",
    "security check",
    "Verificação de segurança",
    "verificação de segurança",
    "Verificación de seguridad",
    "verificación de seguridad",
    "Fix build error",
    "fix build error",
    "Corrigir erros de build",
    "corrigir erros de build",
  ]);

  const REGEXES = [
    /security\s*scan/gi,
    /security\s*check/gi,
    /verifica[cç][ãa]o\s*de\s*seguran[çc]a/gi,
    /verificaci[óo]n\s*de\s*seguridad/gi,
    /fix\s*build\s*error/gi,
    /corrigir\s*erros?\s*de\s*build/gi,
  ];

  function shouldReplace(text) {
    if (!text) return null;
    const trimmed = text.trim();
    if (!trimmed) return null;
    if (EXACT.has(trimmed)) return REPLACEMENT;
    let out = text;
    let changed = false;
    for (const re of REGEXES) {
      if (re.test(out)) {
        out = out.replace(re, REPLACEMENT);
        changed = true;
      }
    }
    return changed ? out : null;
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      const next = shouldReplace(root.nodeValue);
      if (next !== null) root.nodeValue = next;
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const next = shouldReplace(node.nodeValue);
      if (next !== null) node.nodeValue = next;
    }
  }

  function init() {
    try { walk(document.body); } catch (_) {}
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "characterData") {
          const next = shouldReplace(m.target.nodeValue);
          if (next !== null) m.target.nodeValue = next;
        } else {
          m.addedNodes && m.addedNodes.forEach(walk);
        }
      }
    });
    obs.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
