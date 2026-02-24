import ReactDOM from "react-dom/client";

import { RouterProvider, createBrowserHistory, createRouter } from "@tanstack/react-router";
import { createHashHistory } from "@tanstack/react-router";
import i18n from "i18next";
import { toast } from "sonner";

import * as TanStackQueryProvider from "./integrations/tanstack-query/root-provider.tsx";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import { registerIcons } from "./components/iconify/register-icons";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./i18n";
import reportWebVitals from "./reportWebVitals.ts";
import type { RouterContext } from "./routes/__root";
import "./styles.css";
import { initPWAUpdate } from "./utils/pwaUpdate";
import {
  getTelegramInitData,
  isTelegramContext,
  isTelegramEnvironment,
  requestTelegramFullscreen
} from "./utils/telegramWebApp";
import { publicService } from "./services/publicService";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH_QUERY_KEYS } from "./hooks/api/useAuth";
import { useEffect } from "react";
import { scheduleIdle, uuidv4Generate } from "@/utils/helper.ts";

// Create a new router instance
const router = createRouter({
  routeTree,
  history: import.meta.env.VITE_PROMOTION_MODEL === "roibest" ? createHashHistory() : createBrowserHistory(),
  // Prefix all routes with /main without changing the file-based routes
  basepath: "/main",
  context: {
    ...TanStackQueryProvider.getContext(),
    // auth 状态会在 InnerApp 组件中动态更新
    auth: {
      isAuthenticated: false,
      user: null,
      status: null,
      isLoading: true
    }
  } satisfies RouterContext,
  defaultPreload: false,
  scrollRestoration: false,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0
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
    // 在 Telegram 环境中，每次启动时清空旧的认证信息，强制重新登录
    // 这样可以确保切换 Telegram 账号后使用正确的账号
    if (isTelegramContext()) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("user");
      localStorage.removeItem("status");
      console.log("🔄 Telegram context detected - cleared old auth data for fresh login");
    }

    let cancelled = false;
    let inFlight = false;
    let loginAttempts = 0;
    const maxLoginAttempts = 3;
    let fullscreenRequested = false;
    let viewportListenersBound = false;
    let telegramBehaviorConfigured = false;
    const cleanupFns: Array<() => void> = [];

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const waitForTelegramWebApp = async (timeoutMs = 5000, intervalMs = 100) => {
      const start = Date.now();
      while (!cancelled && Date.now() - start < timeoutMs) {
        const tg = window.Telegram?.WebApp;
        if (tg) return tg;
        await delay(intervalMs);
      }
      return window.Telegram?.WebApp;
    };

    const waitForInitData = async (timeoutMs = 4000, intervalMs = 300) => {
      const start = Date.now();
      while (!cancelled && Date.now() - start < timeoutMs) {
        const initData = getTelegramInitData();
        if (initData) return initData;
        await delay(intervalMs);
      }
      return getTelegramInitData() ?? "";
    };

    function showRetryToast(description?: string) {
      toast.error(i18n.t("toast:signInFailed"), {
        description: description ?? i18n.t("login:pleaseTryAgainLater"),
        action: {
          label: i18n.t("information:retry"),
          onClick: () => {
            void attemptTelegramLogin();
          }
        }
      });
    }

    const ensureTelegramReady = async () => {
      const tg = await waitForTelegramWebApp();
      if (!tg || cancelled) return null;
      tg.ready?.();
      tg.expand?.();

      if (!telegramBehaviorConfigured) {
        telegramBehaviorConfigured = true;
        tg.enableClosingConfirmation?.();
        tg.disableVerticalSwipes?.();
      }

      if (!fullscreenRequested) {
        fullscreenRequested = true;
        const requestedFullscreen = requestTelegramFullscreen();
        if (requestedFullscreen) {
          tg.setHeaderColor?.("bg_color");
        }
      }

      if (!viewportListenersBound) {
        viewportListenersBound = true;
        const syncTelegramViewport = () => {
          if (typeof document === "undefined") return;
          const root = document.documentElement;
          if (typeof tg.viewportHeight === "number" && tg.viewportHeight > 0) {
            root.style.setProperty("--tg-viewport-height", `${tg.viewportHeight}px`);
            root.style.setProperty("--app-viewport-height", `${tg.viewportHeight}px`);
          }
          if (typeof tg.viewportStableHeight === "number" && tg.viewportStableHeight > 0) {
            root.style.setProperty("--tg-viewport-stable-height", `${tg.viewportStableHeight}px`);
          }

          // Telegram Mini App safe areas (if supported by current client).
          // These drive `--safe-area-inset-*` (and Chatwoot sizing) via CSS.
          if (tg.safeAreaInset) {
            root.style.setProperty("--tg-safe-area-inset-top", `${Math.max(0, tg.safeAreaInset.top)}px`);
            root.style.setProperty("--tg-safe-area-inset-right", `${Math.max(0, tg.safeAreaInset.right)}px`);
            root.style.setProperty("--tg-safe-area-inset-bottom", `${Math.max(0, tg.safeAreaInset.bottom)}px`);
            root.style.setProperty("--tg-safe-area-inset-left", `${Math.max(0, tg.safeAreaInset.left)}px`);
          }

          if (tg.contentSafeAreaInset) {
            root.style.setProperty("--tg-content-safe-area-inset-top", `${Math.max(0, tg.contentSafeAreaInset.top)}px`);
            root.style.setProperty("--tg-content-safe-area-inset-right", `${Math.max(0, tg.contentSafeAreaInset.right)}px`);
            root.style.setProperty("--tg-content-safe-area-inset-bottom", `${Math.max(0, tg.contentSafeAreaInset.bottom)}px`);
            root.style.setProperty("--tg-content-safe-area-inset-left", `${Math.max(0, tg.contentSafeAreaInset.left)}px`);
          }
          if (typeof tg.isFullscreen === "boolean") {
            root.classList.toggle("tg-fullscreen", tg.isFullscreen);
          }
        };

        syncTelegramViewport();
        tg.onEvent?.("viewportChanged", syncTelegramViewport);
        tg.onEvent?.("fullscreenChanged", syncTelegramViewport);
        tg.onEvent?.("safeAreaChanged", syncTelegramViewport);
        tg.onEvent?.("contentSafeAreaChanged", syncTelegramViewport);

        cleanupFns.push(() => {
          tg.offEvent?.("viewportChanged", syncTelegramViewport);
          tg.offEvent?.("fullscreenChanged", syncTelegramViewport);
          tg.offEvent?.("safeAreaChanged", syncTelegramViewport);
          tg.offEvent?.("contentSafeAreaChanged", syncTelegramViewport);
          if (typeof document !== "undefined") {
            const root = document.documentElement;
            root.classList.remove("tg-fullscreen");
            root.style.removeProperty("--app-viewport-height");
            root.style.removeProperty("--tg-viewport-height");
            root.style.removeProperty("--tg-viewport-stable-height");

            root.style.removeProperty("--tg-safe-area-inset-top");
            root.style.removeProperty("--tg-safe-area-inset-right");
            root.style.removeProperty("--tg-safe-area-inset-bottom");
            root.style.removeProperty("--tg-safe-area-inset-left");

            root.style.removeProperty("--tg-content-safe-area-inset-top");
            root.style.removeProperty("--tg-content-safe-area-inset-right");
            root.style.removeProperty("--tg-content-safe-area-inset-bottom");
            root.style.removeProperty("--tg-content-safe-area-inset-left");
          }
        });
      }

      return tg;
    };

    const scheduleRetry = () => {
      if (cancelled) return;
      if (loginAttempts >= maxLoginAttempts) {
        showRetryToast();
        return;
      }
      setTimeout(() => {
        void attemptTelegramLogin("retry");
      }, 800);
    };

    async function attemptTelegramLogin(reason: "initial" | "retry" | "authExpired" = "initial") {
      if (cancelled || inFlight) return;
      // 在 Telegram Mini App 中，每次都需要调用 loginByTMA
      // 不检查 localStorage.getItem("token")，确保切换账号后能正确登录

      const tg = await ensureTelegramReady();
      if (!tg || cancelled) {
        console.warn(`Telegram login skipped: WebApp unavailable (reason: ${reason}).`);
        // 如果确实不在 Telegram 环境，直接退出，不要无限重试
        if (isTelegramEnvironment()) {
          scheduleRetry();
        }
        return;
      }
      if (localStorage.getItem("token")) return;

      const initData = await waitForInitData();
      if (!initData) {
        console.warn("Telegram login skipped: initData is empty after wait.");
        scheduleRetry();
        return;
      }

      inFlight = true;
      loginAttempts += 1;

      try {
        const device_id = uuidv4Generate();
        const res = await publicService.loginByTMA({ device_id });
        if (cancelled) return;
        if (res.code !== 0) {
          console.warn("Telegram login failed:", res);
          scheduleRetry();
          return;
        }
        if (!res?.data?.token || !res?.data?.username) {
          console.warn("Telegram login response missing token or username.");
          scheduleRetry();
          return;
        }

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.username);
        if (res.user) {
          localStorage.setItem("user", JSON.stringify(res.user));
        }
        if (res.status) {
          localStorage.setItem("status", JSON.stringify(res.status));
        }

        queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, res);
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
      } catch (error) {
        if (cancelled) return;
        console.warn("Telegram login request failed:", error);
        scheduleRetry();
      } finally {
        inFlight = false;
      }
    }

    if (isTelegramContext()) {
      void ensureTelegramReady();
    }
    void attemptTelegramLogin();

    const handleAuthExpired = () => {
      loginAttempts = 0;
      inFlight = false;
      void attemptTelegramLogin("authExpired");
    };

    window.addEventListener("auth:expired", handleAuthExpired);

    return () => {
      cancelled = true;
      cleanupFns.forEach((cleanup) => cleanup());
      window.removeEventListener("auth:expired", handleAuthExpired);
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
        isLoading: auth.isLoading
      }
    }
  });

  return <RouterProvider router={router} />;
}

const initTelegramCacheGuard = () => {
  if (!isTelegramContext()) return;

  const SW_CLEANUP_KEY = "telegram_sw_cleanup_done";
  const VERSION_RELOAD_PREFIX = "telegram_version_reload_";

  const getSessionItem = (key: string) => {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const setSessionItem = (key: string, value: string) => {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // ignore
    }
  };

  const cleanupServiceWorkerAndCaches = async () => {
    let didCleanup = false;

    if ("serviceWorker" in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length) {
          await Promise.all(registrations.map((registration) => registration.unregister()));
          didCleanup = true;
        }
      } catch {
        // ignore
      }
    }

    if ("caches" in window) {
      try {
        const cacheNames = await caches.keys();
        if (cacheNames.length) {
          await Promise.all(cacheNames.map((name) => caches.delete(name)));
          didCleanup = true;
        }
      } catch {
        // ignore
      }
    }

    return didCleanup;
  };

  const checkVersion = async () => {
    const currentVersion = (window as any).version;
    if (!currentVersion) return;

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}version.json`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      const remoteVersion = data?.version;
      if (!remoteVersion) return;

      if (String(remoteVersion) !== String(currentVersion)) {
        const reloadKey = `${VERSION_RELOAD_PREFIX}${remoteVersion}`;
        if (!getSessionItem(reloadKey)) {
          setSessionItem(reloadKey, "1");
          // 延迟刷新，避免与 PWA 更新机制冲突
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    } catch {
      // ignore
    }
  };

  void (async () => {
    if ("serviceWorker" in navigator) {
      const cleanupDone = getSessionItem(SW_CLEANUP_KEY) === "1";
      if (!cleanupDone) {
        const didCleanup = await cleanupServiceWorkerAndCaches();
        setSessionItem(SW_CLEANUP_KEY, "1");
        if (didCleanup) {
          window.location.reload();
          return;
        }
      }
    }

    await checkVersion();
  })();
};

const initTelegramAuthBoot = () => {
  if (!isTelegramContext()) return;

  // Always force a fresh TMA login on each open.
  // This prevents reusing a previous account's token when the user switches
  // Telegram accounts.
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user");
    localStorage.removeItem("status");
  } catch {
    // ignore
  }
};

initTelegramAuthBoot();
initTelegramCacheGuard();
uuidv4Generate();

void registerIcons();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    (window as unknown as { __pwaPromptEvent?: Event }).__pwaPromptEvent = event;
  });
}

scheduleIdle(() => {
  if (import.meta.env.DEV) performance.mark("boot:idle-start"); // debug code

  // Service Worker is handled by vite-plugin-pwa
// Initialize PWA update mechanism
  initPWAUpdate();

  if (import.meta.env.DEV) { // debug code
    performance.mark("boot:idle-end");
    performance.measure("boot:idle", "boot:idle-start", "boot:idle-end");
  }
});

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <TanStackQueryProvider.Provider>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </TanStackQueryProvider.Provider>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
