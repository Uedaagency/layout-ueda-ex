import { createFileRoute } from "@tanstack/react-router";

import { buildSrcDoc, DEFAULTS } from "./index";

export const Route = createFileRoute("/sidepanel.html")({
  head: () => ({
    meta: [
      { title: "UEDA EX — Sidepanel Preview" },
      {
        name: "description",
        content: "Visualização direta do painel lateral UEDA EX renderizado a partir do ZIP.",
      },
      { property: "og:title", content: "UEDA EX Sidepanel Preview" },
      {
        property: "og:description",
        content: "Preview direto do painel lateral da extensão UEDA EX.",
      },
    ],
  }),
  component: SidepanelPreviewRoute,
});

function SidepanelPreviewRoute() {
  const srcDoc = buildSrcDoc(DEFAULTS);

  return (
    <main className="h-screen w-screen overflow-hidden bg-background">
      <iframe
        title="UEDA EX sidepanel"
        srcDoc={srcDoc}
        className="h-full w-full border-0"
        sandbox="allow-same-origin"
      />
    </main>
  );
}