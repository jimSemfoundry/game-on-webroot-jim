import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/withdraw/")({
  beforeLoad: () => {
    throw redirect({
      to: "/finance",
      state: { activeTab: "withdraw" } as any
    });
  }
});
