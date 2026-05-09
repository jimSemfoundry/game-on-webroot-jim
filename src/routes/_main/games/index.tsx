import { createFileRoute, Outlet } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/games/")({
  validateSearch: (search: Record<string, unknown>) => ({
    openFinance: (search.openFinance as string) || undefined,
  }),
  beforeLoad: () => {
    throw redirect({
      to: "/casino",
      search: {
        redirect: undefined,
        startapp: undefined,
        openLogin: undefined,
        openSignUp: undefined,
        openFinance: undefined,
      },
    });
  },
  component: RouteComponent
});

function RouteComponent() {
  return <Outlet />;
}
