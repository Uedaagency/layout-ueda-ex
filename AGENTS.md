<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Extensão Chrome (UEDA EX) — OBFUSCAÇÃO OBRIGATÓRIA

- Fonte: `extension-src/`. Zip enviado ao usuário: `public/ueda-ex.zip`.
- **NUNCA** zipar `extension-src/` diretamente. Toda mudança na extensão
  DEVE ser empacotada com `node scripts/build-extension.mjs` (ou
  `bun run build:ext`), que ofusca todos os `.js` com javascript-obfuscator
  em modo MV3-safe (sem eval / sem selfDefending) e gera o zip.
- Se adicionar arquivos JS novos em `extension-src/`, eles são ofuscados
  automaticamente. Libs já minificadas de terceiros vão na lista
  `SKIP_OBFUSCATION` dentro do script.
