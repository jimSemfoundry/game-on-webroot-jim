import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/login/")({
  beforeLoad: () => {
    throw redirect({ to: "/casino",
      search: {
        openLogin: "true",
        openSignUp: undefined,
        redirect: undefined,
        startapp: undefined,
        openFinance: undefined
      }
    });
  }
});