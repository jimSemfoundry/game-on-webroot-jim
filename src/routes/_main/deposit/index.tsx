import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/deposit/")({
  beforeLoad: () => {
    throw redirect({
      to: "/finance",
      state: { activeTab: "deposit" } as any
    });
  }
});
