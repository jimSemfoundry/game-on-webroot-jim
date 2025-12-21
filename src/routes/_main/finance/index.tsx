import { createFileRoute, Outlet } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/finance/")({
  validateSearch: (search: Record<string, unknown>) => ({
    openFinance: (search.openFinance as string) || undefined,
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/casino",
      search: {
        redirect: undefined,
        startapp: undefined,
        openLogin: undefined,
        openSignUp: undefined,
        openFinance: search.openFinance ?? "true",
      },
    });
  },
  component: RouteComponent
});

function RouteComponent() {
  return <Outlet />;
}
