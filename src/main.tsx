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
  disableTelegramVerticalSwipes,
  enableTelegramClosingConfirmation,
  ensureTelegramSdkMounted,
  expandTelegramViewport,
  getTelegramInitData,
  getTelegramViewportSnapshot,
  isTelegramContext,
  markTelegramReady,
  requestTelegramFullscreen,
  setTelegramHeaderColor,
  subscribeTelegramViewportChanges
} from "./utils/telegramWebApp";
import { publicService } from "./services/publicService";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH_QUERY_KEYS } from "./hooks/api/useAuth";
import { useEffect } from "react";
import { scheduleIdle, trackCustomEvent, uuidv4Generate } from "@/utils/helper.ts";

type TelegramBootDebugState = {
  phase?: string;
  reason?: string;
  ready?: boolean;
  mounted?: boolean;
  hasInitData?: boolean;
  initDataLength?: number;
  loginStatus?: "idle" | "pending" | "success" | "failed";
  error?: string;
  timestamp?: number;
  attempts?: number;
};

declare global {
  interface Window {
    __tgDebugBoot?: TelegramBootDebugState;
  }
}

const updateTelegramBootDebugState = (patch: TelegramBootDebugState) => {
  if (typeof window === "undefined") return;
  window.__tgDebugBoot = {
    ...(window.__tgDebugBoot ?? {}),
    ...patch,
    timestamp: Date.now()
  };
};

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
    const telegramContext = isTelegramContext();
    if (!telegramContext) return;

    // 注：原 localStorage 清空 + 首次登录调用已搬到下方 scheduleIdle 内（t110774 PR6），
    // 让 TG 用户首屏 paint 不被 4 次 storage 写 + 同步 attemptTelegramLogin 阻塞。

    let cancelled = false;
    let inFlight = false;
    let fullscreenRequested = false;
    let viewportListenersBound = false;
    let telegramBehaviorConfigured = false;
    let loginRetryAttempts = 0;
    let loginRetryTimer: ReturnType<typeof setTimeout> | null = null;
    const cleanupFns: Array<() => void> = [];
    let loginAttempts = 0;

    updateTelegramBootDebugState({
      phase: "effect_start",
      reason: "initial",
      loginStatus: "idle",
      attempts: 0,
    });

    const MAX_LOGIN_RETRY_ATTEMPTS = 6;
    const LOGIN_RETRY_DELAYS_MS = [400, 900, 1500, 2500, 3500, 5000] as const;

    const clearLoginRetryTimer = () => {
      if (loginRetryTimer) {
        clearTimeout(loginRetryTimer);
        loginRetryTimer = null;
      }
    };

    const scheduleLoginRetry = (reason: "initial" | "authExpired") => {
      if (cancelled || inFlight) return;
      if (localStorage.getItem("token")) return;
      if (loginRetryAttempts >= MAX_LOGIN_RETRY_ATTEMPTS) return;

      const delayMs = LOGIN_RETRY_DELAYS_MS[loginRetryAttempts] ?? LOGIN_RETRY_DELAYS_MS[LOGIN_RETRY_DELAYS_MS.length - 1];
      loginRetryAttempts += 1;
      clearLoginRetryTimer();
      loginRetryTimer = setTimeout(() => {
        loginRetryTimer = null;
        void attemptTelegramLogin(reason);
      }, delayMs);
    };

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const waitForInitData = async (timeoutMs = 4000, intervalMs = 300) => {
      const start = Date.now();
      while (!cancelled && Date.now() - start < timeoutMs) {
        const initData = getTelegramInitData();
        if (initData) return initData;
        await delay(intervalMs);
      }
      return getTelegramInitData() ?? "";
    };

    const ensureTelegramReady = async () => {
      updateTelegramBootDebugState({ phase: "ensure_ready_start" });
      const mounted = await ensureTelegramSdkMounted();
      updateTelegramBootDebugState({ mounted, phase: "ensure_ready_after_mount" });
      if (!mounted || cancelled) {
        updateTelegramBootDebugState({
          ready: false,
          phase: cancelled ? "ensure_ready_cancelled" : "ensure_ready_unavailable",
          reason: cancelled ? "cancelled" : "webapp_unavailable",
        });
        return null;
      }

      markTelegramReady();
      expandTelegramViewport();

      if (!telegramBehaviorConfigured) {
        telegramBehaviorConfigured = true;
        enableTelegramClosingConfirmation();
        disableTelegramVerticalSwipes();
      }

      if (!fullscreenRequested) {
        const requestedFullscreen = await requestTelegramFullscreen();
        if (requestedFullscreen) {
          setTelegramHeaderColor("bg_color");
          fullscreenRequested = true;
        }
      }

      if (!viewportListenersBound) {
        viewportListenersBound = true;
        const syncTelegramViewport = () => {
          if (typeof document === "undefined") return;
          const root = document.documentElement;
          const snapshot = getTelegramViewportSnapshot();

          if (typeof snapshot.viewportHeight === "number" && snapshot.viewportHeight > 0) {
            root.style.setProperty("--tg-viewport-height", `${snapshot.viewportHeight}px`);
            root.style.setProperty("--app-viewport-height", `${snapshot.viewportHeight}px`);
          }
          if (typeof snapshot.viewportStableHeight === "number" && snapshot.viewportStableHeight > 0) {
            root.style.setProperty("--tg-viewport-stable-height", `${snapshot.viewportStableHeight}px`);
          }

          // Telegram Mini App safe areas (if supported by current client).
          // These drive `--safe-area-inset-*` (and Chatwoot sizing) via CSS.
          if (snapshot.safeAreaInset) {
            root.style.setProperty("--tg-safe-area-inset-top", `${Math.max(0, snapshot.safeAreaInset.top)}px`);
            root.style.setProperty("--tg-safe-area-inset-right", `${Math.max(0, snapshot.safeAreaInset.right)}px`);
            root.style.setProperty("--tg-safe-area-inset-bottom", `${Math.max(0, snapshot.safeAreaInset.bottom)}px`);
            root.style.setProperty("--tg-safe-area-inset-left", `${Math.max(0, snapshot.safeAreaInset.left)}px`);
          }

          if (snapshot.contentSafeAreaInset) {
            root.style.setProperty("--tg-content-safe-area-inset-top", `${Math.max(0, snapshot.contentSafeAreaInset.top)}px`);
            root.style.setProperty("--tg-content-safe-area-inset-right", `${Math.max(0, snapshot.contentSafeAreaInset.right)}px`);
            root.style.setProperty("--tg-content-safe-area-inset-bottom", `${Math.max(0, snapshot.contentSafeAreaInset.bottom)}px`);
            root.style.setProperty("--tg-content-safe-area-inset-left", `${Math.max(0, snapshot.contentSafeAreaInset.left)}px`);
          }
          if (typeof snapshot.isFullscreen === "boolean") {
            root.classList.toggle("tg-fullscreen", snapshot.isFullscreen);
          }
        };

        syncTelegramViewport();
        const unsubscribeViewport = subscribeTelegramViewportChanges(syncTelegramViewport);

        cleanupFns.push(() => {
          unsubscribeViewport();
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

      updateTelegramBootDebugState({ ready: true, phase: "ensure_ready_done" });
      return true;
    };

    async function attemptTelegramLogin(reason: "initial" | "authExpired" = "initial") {
      if (cancelled || inFlight) return;
      loginAttempts += 1;
      updateTelegramBootDebugState({
        phase: "attempt_login_start",
        reason,
        loginStatus: "idle",
        attempts: loginAttempts,
      });
      // 在 Telegram Mini App 中，每次都需要调用 loginByTMA
      // 不检查 localStorage.getItem("token")，确保切换账号后能正确登录

      const ready = await ensureTelegramReady();
      if (!ready || cancelled) {
        updateTelegramBootDebugState({
          phase: "attempt_login_skip",
          reason: cancelled ? "cancelled" : "webapp_unavailable",
          ready: Boolean(ready),
          loginStatus: "failed",
        });
        console.warn(`Telegram login skipped: WebApp unavailable (reason: ${reason}).`);
        scheduleLoginRetry(reason);
        return;
      }
      if (localStorage.getItem("token")) {
        updateTelegramBootDebugState({
          phase: "attempt_login_skip",
          reason: "token_exists",
          loginStatus: "success",
        });
        return;
      }

      const initData = await waitForInitData();
      updateTelegramBootDebugState({
        phase: "attempt_login_after_wait_init_data",
        hasInitData: Boolean(initData),
        initDataLength: initData?.length ?? 0,
      });
      if (!initData) {
        updateTelegramBootDebugState({
          phase: "attempt_login_skip",
          reason: "init_data_empty",
          loginStatus: "failed",
        });
        console.warn("Telegram login skipped: initData is empty after wait.");
        scheduleLoginRetry(reason);
        return;
      }

      inFlight = true;
      updateTelegramBootDebugState({ phase: "attempt_login_request", loginStatus: "pending" });

      try {
        const device_id = uuidv4Generate();
        const res = await publicService.loginByTMA({ device_id });
        if (cancelled) return;
        if (res.code !== 0) {
          updateTelegramBootDebugState({
            phase: "attempt_login_failed",
            loginStatus: "failed",
            error: `code:${res.code}`,
          });
          console.warn("Telegram login failed:", res);
          toast.error(i18n.t("toast:signInFailed"), {
            description: i18n.t("login:pleaseTryAgainLater")
          });
          return;
        }
        if (!res?.data?.token || !res?.data?.username) {
          updateTelegramBootDebugState({
            phase: "attempt_login_failed",
            loginStatus: "failed",
            error: "missing_token_or_username",
          });
          console.warn("Telegram login response missing token or username.");
          toast.error(i18n.t("toast:signInFailed"), {
            description: i18n.t("login:pleaseTryAgainLater")
          });
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

        // GTM 记录推送
        trackCustomEvent('login', 'userLogin', {
          id: res?.user?.id,
          username: res?.user?.username,
          nick_name: res?.user?.nickname,
          country: res?.user?.country
        })
      } catch (error) {
        if (cancelled) return;
        updateTelegramBootDebugState({
          phase: "attempt_login_failed",
          loginStatus: "failed",
          error: error instanceof Error ? error.message : String(error),
        });
        console.warn("Telegram login request failed:", error);
        toast.error(i18n.t("toast:signInFailed"), {
          description: i18n.t("login:pleaseTryAgainLater")
        });
        scheduleLoginRetry(reason);
      } finally {
        inFlight = false;
      }
    }

    void ensureTelegramReady();
    // t110774 §3.6 / PR6: 把 4 次 localStorage.removeItem + 第一次 attemptTelegramLogin
    // 推迟到首屏渲染完成后的 idle 期再做。仅 TG 路径生效（前面 isTelegramContext() 守卫）；
    // 非 TG 用户零回归，已在 line 107 提前 return。
    scheduleIdle(() => {
      if (cancelled) return;
      // 在 Telegram 环境中，每次启动时清空旧的认证信息，强制重新登录
      // 这样可以确保切换 Telegram 账号后使用正确的账号
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("user");
      localStorage.removeItem("status");
      console.log("🔄 Telegram context detected - cleared old auth data for fresh login");
      void attemptTelegramLogin();
    });

    const handleAuthExpired = () => {
      inFlight = false;
      loginRetryAttempts = 0;
      clearLoginRetryTimer();
      void attemptTelegramLogin("authExpired");
    };

    const handleVisibilityOrFocus = () => {
      if (cancelled || inFlight) return;
      if (localStorage.getItem("token")) return;
      void attemptTelegramLogin("initial");
    };

    window.addEventListener("auth:expired", handleAuthExpired);
    window.addEventListener("focus", handleVisibilityOrFocus);
    window.addEventListener("pageshow", handleVisibilityOrFocus);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleVisibilityOrFocus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      clearLoginRetryTimer();
      cleanupFns.forEach((cleanup) => cleanup());
      window.removeEventListener("auth:expired", handleAuthExpired);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      window.removeEventListener("pageshow", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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

  updateTelegramBootDebugState({ phase: "auth_boot_start", reason: "initial" });

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

  updateTelegramBootDebugState({ phase: "auth_boot_done" });
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
