## Ajustes visuais no overlay flutuante

### 1. Botão "Desativar aqui" → "Extensão ON / Extensão OFF"
Em `extension-src/overlay.js`:
- Adicionar dois novos ícones no `LICON`: `powerOn` e `powerOff` (símbolo padrão de power/liga-desliga, SVG minimalista com o traço vertical + arco).
- No item `toggle-here` do menu FAB, tornar o `icon` dinâmico (via `dynamic: "toggle"` já existente) — no loop de render, quando `it.dynamic === "toggle"`:
  - Label: `overlayFeaturesDisabled ? "Extensão OFF" : "Extensão ON"`.
  - Ícone: `overlayFeaturesDisabled ? LICON.powerOff : LICON.powerOn`.
  - Aplicar classe `ts-fab-toggle-on` ou `ts-fab-toggle-off` no `.ts-fab-circle` para colorir o fundo/borda:
    - ON → verde (`#22c55e` / glow verde suave).
    - OFF → vermelho (`#ef4444` / glow vermelho suave).
- Atualizar o mesmo estado após clicar (já há re-render implícito ao reabrir; garantir refresh imediato reabrindo o menu ou trocando classe + label do item ativo in-place).

### 2. Launcher principal (ícone com logo)
Em `#${LAUNCHER_ID}` (CSS no `overlay.js`):
- Remover `background: #ffffff` (usar `background: transparent`), remover `border: 3px solid #0f2a42` (ou trocar por borda fina translúcida) para deixar apenas a logo + um anel circular sutil.
- Ajustar `img` para preencher melhor (ex. 48px).
- Adicionar animação de **pulsação de ondas contínua** (não só quando `.ts-launcher-active`): novo keyframe `tsLauncherIdlePulse` com múltiplas `box-shadow` concêntricas expandindo/desvanecendo, aplicado por padrão no launcher. Manter `tsLauncherWaves` para o estado ativo (mais intenso).
- Ajuste do `:hover` para não reintroduzir fundo branco.

### 3. Menu flutuante com mais efeito glass
Em `#${MENU_ID}, #${SUBMENU_ID}`:
- Trocar `background: linear-gradient(180deg, #0b1a2a → #061321)` por fundo semitransparente: `background: linear-gradient(180deg, rgba(15,30,50,0.55), rgba(10,20,35,0.45))`.
- Adicionar `backdrop-filter: blur(18px) saturate(140%)` (apenas propriedade padrão — Lightning CSS injeta prefixo).
- Reforçar borda: `border: 1px solid rgba(255,255,255,0.14)`, adicionar realce interno `box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 18px 40px rgba(0,0,0,0.45)`.
- Adicionar pseudo-elemento `::before` posicionado no topo com um "brilho" (gradiente radial branco baixa opacidade) para dar highlight de vidro.

### 4. Painel/popup aberto com mais transparência glass
No container do popup lateral aberto (elemento `sp-body` / painel principal do sidepanel iframe embutido — via CSS injetado no overlay que estiliza o iframe wrapper, ou em `extension-src/sidepanel.css` no `body`/`.sp-body`):
- Fundo do wrapper do iframe: semitransparente com `backdrop-filter: blur(20px) saturate(140%)`.
- Borda translúcida branca e leve highlight superior similar ao menu.
- Confirmar via inspeção qual seletor controla o wrapper do popup (provavelmente `#ts-popup-frame` / `.ts-popup-shell` em `overlay.js`); ajustar apenas esse contêiner para não quebrar legibilidade do conteúdo interno.

### 5. Rebuild
- Regenerar `public/ueda-ex.zip` com `zip` incluindo os arquivos alterados de `extension-src/`.

### Arquivos afetados
- `extension-src/overlay.js` (ícones, CSS launcher, CSS menu, CSS wrapper do popup)
- Possivelmente `extension-src/sidepanel.css` (transparência do painel aberto)
- `public/ueda-ex.zip` (rebuild)

### Observações técnicas
- Manter apenas `backdrop-filter` (sem `-webkit-` manual) conforme regra do stack.
- Usar cores fixas nos SVGs (`currentColor`) e controlar tint via `color` do `.ts-fab-circle`.
- Animação de pulsação em `box-shadow` (composited, barato); duração ~2s, `ease-out`, infinita.
