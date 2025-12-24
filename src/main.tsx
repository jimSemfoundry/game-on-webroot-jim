import ReactDOM from "react-dom/client";

import { RouterProvider, createBrowserHistory, createRouter } from "@tanstack/react-router";
import { createHashHistory } from "@tanstack/react-router";

import * as TanStackQueryProvider from "./integrations/tanstack-query/root-provider.tsx";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import "./components/iconify/register-icons";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./i18n";
import reportWebVitals from "./reportWebVitals.ts";
import type { RouterContext } from "./routes/__root";
import "./styles.css";
import { initPWAUpdate } from "./utils/pwaUpdate";
import { useDeferredPromptStore } from './store/deferredPrompt.ts';
import { isTelegramWebApp } from "./utils/telegramWebApp";
import { publicService } from "./services/publicService";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH_QUERY_KEYS } from "./hooks/api/useAuth";
import { useEffect } from "react";

// Create a new router instance
const router = createRouter({
  routeTree,
  history: import.meta.env.VITE_PROMOTION_MODEL === 'roibest' ? createHashHistory() : createBrowserHistory(),
  // Prefix all routes with /main without changing the file-based routes
  basepath: '/main',
  context: {
    ...TanStackQueryProvider.getContext(),
    // auth 状态会在 InnerApp 组件中动态更新
    auth: {
      isAuthenticated: false,
      user: null,
      status: null,
      isLoading: true,
    },
  } satisfies RouterContext,
  defaultPreload: "intent",
  scrollRestoration: false,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});



// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

/**
 * 内部应用组件 - 将认证状态注入到 Router Context
 * 必须在 TanStackQueryProvider 内部才能使用 useAuth
 */
function InnerApp() {
  const auth = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initData) return;
    tg.ready?.();
    tg.expand?.();
  }, []);

  useEffect(() => {
    if (!isTelegramWebApp()) return;
    if (localStorage.getItem("token")) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await publicService.loginByTMA({});
        if (cancelled) return;
        if (res.code !== 0) return;
        if (!res?.data?.token || !res?.data?.username) return;

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.username);
        if (res.user) {
          localStorage.setItem("user", JSON.stringify(res.user));
        }
        if (res.status) {
          localStorage.setItem("status", JSON.stringify(res.status));
        }

        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  // 更新 router context 中的 auth 状态
  // 这样在所有路由的 beforeLoad 中都可以访问到最新的认证状态
  router.update({
    context: {
      ...router.options.context,
      auth: {
        isAuthenticated: auth.isAuthenticated,
        user: auth.user,
        status: auth.status,
        isLoading: auth.isLoading,
      },
    },
  });

  return <RouterProvider router={router} />;
}

const setupPwaDetection = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    useDeferredPromptStore.getState().setDeferredPrompt(e);
  });
};

setupPwaDetection()
// Service Worker is handled by vite-plugin-pwa
// Initialize PWA update mechanism
initPWAUpdate();

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <TanStackQueryProvider.Provider>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </TanStackQueryProvider.Provider>,
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
