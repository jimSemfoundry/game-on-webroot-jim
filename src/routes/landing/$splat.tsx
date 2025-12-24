import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/landing/$splat")({
  validateSearch: (search: Record<string, unknown>) => ({
    url: (search.url as string) || undefined,
  }),
  beforeLoad: ({ params, search, location }) => {
    const baseUrl =
      typeof window !== "undefined" ? window.location.origin : undefined;

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
      } else if (baseUrl) {
        const base = baseUrl.replace(/\/$/, "");
        const path = splat ? `/${splat}` : "";
        targetUrl = `${base}${path}${location.search ?? ""}${location.hash ?? ""}`;
      }
    }

    if (!targetUrl) {
      return;
    }

    window.location.replace(targetUrl);
  },
  component: () => null,
});
