import { createFileRoute, redirect } from "@tanstack/react-router";

function App() {
  return <div className="p-4 text-center space-y-4 h-full"></div>;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    openLogin: (search.openLogin as string) || undefined,
    redirect: (search.redirect as string) || undefined,
    startapp: (search.startapp as string) || undefined, // 广告来源
  }),
  beforeLoad: ({ search }) => {
    const ad = { startapp: search.startapp }; // 广告来源
    // 如果有登录相关参数，转发到 casino 页面
    throw redirect({
      to: "/casino",
      search: search.openLogin
        ? {
          openLogin: search.openLogin,
          openSignUp: undefined,
          redirect: search.redirect,
          openFinance: undefined,
          ...ad,
        }
        : {
          openLogin: undefined,
          openSignUp: undefined,
          redirect: undefined,
          openFinance: undefined,
          ...ad,
        },
    });
  },
  component: App,
});
