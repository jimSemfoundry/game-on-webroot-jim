import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/swap/")({
  beforeLoad: () => {
    throw redirect({
      to: "/finance",
      state: { activeTab: "swap" } as any
    });
  }
});
