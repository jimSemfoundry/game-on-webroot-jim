import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/signup/")({
  beforeLoad: () => {
    throw redirect({ to: "/casino",
      search: {
        openLogin: undefined,
        openSignUp: "true",
        redirect: undefined,
        startapp: undefined,
        openFinance: undefined
      }
    });
  }
});