import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/landing/$splat")({
  validateSearch: (search: Record<string, unknown>) => ({
    url: (search.url as string) || undefined,
  }),
  beforeLoad: ({ params, search }) => {
    let targetUrl: string | undefined;

    if (search.url) {
      try {
        targetUrl = decodeURIComponent(search.url);
      } catch {
        targetUrl = search.url;
      }
    }

    if (!targetUrl) {
      const splat = (params as { splat?: string }).splat || "";

      if (/^https?:\/\//i.test(splat)) {
        targetUrl = splat;
      }
    }

    if (!targetUrl) {
      return;
    }

    try {
      const resolvedTarget = new URL(targetUrl, window.location.href).href;
      if (resolvedTarget === window.location.href) {
        return;
      }
    } catch {
      // ignore URL parsing errors and fall back to replace
    }

    window.location.replace(targetUrl);
  },
  component: () => null,
});
