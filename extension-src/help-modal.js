/* Ajuda Flutuante - Floating Help Modal
 * Self-contained: injects a floating "?" button (bottom-right) that opens a
 * centered modal with a search bar, help topics list and a "Fale Conosco" CTA.
 */
(function () {
  "use strict";
  if (window.__uedaHelpModalLoaded) return;
  window.__uedaHelpModalLoaded = true;

  const NS = "ueda-help";
  const TOPICS = [
    { title: "Primeiros Passos", desc: "Como instalar e configurar a extensão." },
    { title: "Gerenciamento de Conta", desc: "Licença, chave e dispositivos." },
    { title: "Atalhos e Templates", desc: "Use prompts prontos e atalhos rápidos." },
    { title: "Modos de Exibição", desc: "Slide, flutuante e popup." },
    { title: "FAQ", desc: "Perguntas frequentes e soluções." },
  ];

  // ---------- styles ----------
  const css = `
    .${NS}-fab{
      position:fixed;right:20px;bottom:20px;width:48px;height:48px;
      border-radius:50%;border:none;cursor:pointer;z-index:2147483000;
      background:linear-gradient(135deg,#0b1a2a,#061321);color:#fff;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 6px 18px rgba(0,0,0,.35);
      font:600 20px/1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
      transition:transform .2s ease, box-shadow .2s ease;
    }
    .${NS}-fab:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(0,0,0,.45)}
    .${NS}-overlay{
      position:fixed;inset:0;background:rgba(0,0,0,.5);
      z-index:2147483001;opacity:0;pointer-events:none;
      transition:opacity .3s ease;
    }
    .${NS}-overlay.open{opacity:1;pointer-events:auto}
    .${NS}-modal{
      position:fixed;top:50%;left:50%;
      transform:translate(-50%,-50%) scale(.8);
      transform-origin:bottom right;
      opacity:0;pointer-events:none;z-index:2147483002;
      width:min(560px,80vw);max-height:90vh;overflow:hidden;
      background:#fff;color:#0f1b2d;border-radius:12px;
      box-shadow:0 4px 20px rgba(0,0,0,.2);
      display:flex;flex-direction:column;
      transition:opacity .3s ease-out, transform .3s ease-out;
      font:14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
    }
    .${NS}-modal.open{opacity:1;pointer-events:auto;transform:translate(-50%,-50%) scale(1)}
    .${NS}-modal.closing{opacity:0;transform:translate(-50%,-50%) scale(.8);transition:opacity .3s ease-in, transform .3s ease-in}
    .${NS}-head{display:flex;align-items:center;justify-content:space-between;padding:18px 20px 8px}
    .${NS}-title{margin:0;font-size:18px;font-weight:700}
    .${NS}-close{background:transparent;border:none;font-size:22px;cursor:pointer;color:#64748b;line-height:1;padding:4px 8px;border-radius:6px}
    .${NS}-close:hover{background:#f1f5f9;color:#0f1b2d}
    .${NS}-body{padding:8px 20px 16px;overflow-y:auto}
    .${NS}-search{
      width:100%;box-sizing:border-box;padding:10px 12px;
      border:1px solid #e2e8f0;border-radius:8px;font-size:14px;
      outline:none;transition:border-color .15s ease;
    }
    .${NS}-search:focus{border-color:#0b1a2a}
    .${NS}-list{list-style:none;margin:14px 0 0;padding:0;display:flex;flex-direction:column;gap:8px}
    .${NS}-item{padding:12px;border:1px solid #eef2f7;border-radius:8px;cursor:pointer;transition:background .15s}
    .${NS}-item:hover{background:#f8fafc}
    .${NS}-item-title{font-weight:600;margin:0 0 2px}
    .${NS}-item-desc{margin:0;color:#64748b;font-size:13px}
    .${NS}-foot{padding:12px 20px 18px;border-top:1px solid #eef2f7}
    .${NS}-cta{
      width:100%;padding:11px 14px;border:none;border-radius:8px;cursor:pointer;
      background:#0b1a2a;color:#fff;font-weight:600;font-size:14px;
      transition:background .15s;
    }
    .${NS}-cta:hover{background:#132b45}
    @media (max-width:768px){
      .${NS}-modal{width:95vw}
    }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.documentElement.appendChild(style);

  // ---------- DOM ----------
  const fab = document.createElement("button");
  fab.className = `${NS}-fab`;
  fab.setAttribute("aria-label", "Ajuda");
  fab.title = "Ajuda";
  fab.textContent = "?";

  const overlay = document.createElement("div");
  overlay.className = `${NS}-overlay`;

  const modal = document.createElement("div");
  modal.className = `${NS}-modal`;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.innerHTML = `
    <div class="${NS}-head">
      <h2 class="${NS}-title">Como podemos ajudar hoje?</h2>
      <button class="${NS}-close" aria-label="Fechar">×</button>
    </div>
    <div class="${NS}-body">
      <input type="search" class="${NS}-search" placeholder="Buscar ajuda..." />
      <ul class="${NS}-list"></ul>
    </div>
    <div class="${NS}-foot">
      <button class="${NS}-cta" type="button">Fale Conosco</button>
    </div>
  `;

  const list = modal.querySelector(`.${NS}-list`);
  const search = modal.querySelector(`.${NS}-search`);
  const renderTopics = (filter = "") => {
    const q = filter.trim().toLowerCase();
    list.innerHTML = "";
    TOPICS.filter(t => !q || t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q))
      .forEach(t => {
        const li = document.createElement("li");
        li.className = `${NS}-item`;
        li.innerHTML = `<p class="${NS}-item-title"></p><p class="${NS}-item-desc"></p>`;
        li.querySelector(`.${NS}-item-title`).textContent = t.title;
        li.querySelector(`.${NS}-item-desc`).textContent = t.desc;
        list.appendChild(li);
      });
  };
  renderTopics();
  search.addEventListener("input", e => renderTopics(e.target.value));

  // ---------- open/close ----------
  const open = () => {
    modal.classList.remove("closing");
    overlay.classList.add("open");
    modal.classList.add("open");
  };
  const close = () => {
    if (!modal.classList.contains("open")) return;
    modal.classList.add("closing");
    modal.classList.remove("open");
    overlay.classList.remove("open");
    setTimeout(() => modal.classList.remove("closing"), 300);
  };

  fab.addEventListener("click", open);
  overlay.addEventListener("click", close);
  modal.querySelector(`.${NS}-close`).addEventListener("click", close);
  modal.querySelector(`.${NS}-cta`).addEventListener("click", () => {
    window.open("mailto:contato@ueda.ex?subject=Ajuda%20UEDA%20EX", "_blank");
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

  const mount = () => {
    document.body.appendChild(fab);
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
  };
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount, { once: true });
})();
