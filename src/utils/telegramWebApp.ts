import {
  closingBehavior,
  init,
  isTMA,
  miniApp,
  off,
  on,
  openLink,
  openTelegramLink,
  retrieveLaunchParams,
  retrieveRawInitData,
  swipeBehavior,
  themeParams,
  viewport,
} from "@tma.js/sdk-react";

type TelegramPlatform = "android" | "ios" | string;

let sdkInitialized = false;
let stopViewportCssVarsBinding: VoidFunction | undefined;
let viewportMounted = false;
const VIEWPORT_MOUNT_TIMEOUT_MS = 800;
const TG_PARAMS_CACHE_KEY = "__tg_raw_launch_params";

function getCachedLaunchParams() {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage?.getItem(TG_PARAMS_CACHE_KEY) ?? "";
  } catch {
    return "";
  }
}

function getLaunchParamsSafe() {
  try {
    return retrieveLaunchParams();
  } catch {
    return null;
  }
}

function hasTelegramWebAppObject() {
  if (typeof window === "undefined") return false;
  return Boolean((window as any)?.Telegram?.WebApp);
}

function isTelegramAppLink(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "t.me";
  } catch {
    return false;
  }
}

export function isTelegramWebApp() {
  try {
    return isTMA();
  } catch {
    return hasTelegramWebAppObject();
  }
}

export function isTelegramEnvironment() {
  return isTelegramWebApp();
}

export async function ensureTelegramSdkMounted() {
  if (!isTelegramContext()) return false;

  if (!sdkInitialized) {
    try {
      init();
      sdkInitialized = true;
    } catch {
      return false;
    }
  }

  try {
    themeParams.mount();
  } catch {
    // ignore
  }

  try {
    miniApp.mount();
  } catch {
    // ignore
  }

  try {
    closingBehavior.mount();
  } catch {
    // ignore
  }

  try {
    swipeBehavior.mount(); 
  } catch {
    // ignore
  }

  try {
    const mountPromise = viewport
      .mount()
      .then(() => true)
      .catch(() => false);
    const timeoutPromise = new Promise<boolean>((resolve) => {
      window.setTimeout(() => resolve(false), VIEWPORT_MOUNT_TIMEOUT_MS);
    });

    viewportMounted = await Promise.race([mountPromise, timeoutPromise]);
  } catch {
    viewportMounted = false;
    // ignore
  }

  if (viewportMounted && !stopViewportCssVarsBinding) {
    stopViewportCssVarsBinding = viewport.bindCssVars((key: string) => {
      const map: Record<string, string> = {
        height: "--tg-viewport-height",
        width: "--tg-viewport-width",
        stableHeight: "--tg-viewport-stable-height",
        safeAreaInsetTop: "--tg-safe-area-inset-top",
        safeAreaInsetRight: "--tg-safe-area-inset-right",
        safeAreaInsetBottom: "--tg-safe-area-inset-bottom",
        safeAreaInsetLeft: "--tg-safe-area-inset-left",
        contentSafeAreaInsetTop: "--tg-content-safe-area-inset-top",
        contentSafeAreaInsetRight: "--tg-content-safe-area-inset-right",
        contentSafeAreaInsetBottom: "--tg-content-safe-area-inset-bottom",
        contentSafeAreaInsetLeft: "--tg-content-safe-area-inset-left",
      };
      return map[key] ?? null;
    });
  }

  if (viewportMounted && typeof document !== "undefined") {
    document.documentElement.style.setProperty("--app-viewport-height", "var(--tg-viewport-height)");
  }

  return true;
}

export function openExternalUrl(url: string): boolean {
  if (typeof window === "undefined") return false;
  if (!url) return false;

  if (isTelegramWebApp()) {
    try {
      if (isTelegramAppLink(url)) {
        openTelegramLink(url);
        return true;
      }

      openLink(url);
      return true;
    } catch {
      return false;
    }
  }

  window.location.href = url;
  return true;
}

// 在用户点击同步栈里预开 about:blank 标签页,占住浏览器的"用户手势"额度。
// 之后异步拿到真正的 URL,再用 navigateNewTabPopup() 把 URL 填进去。
// Telegram WebApp 环境返回 null —— TG 走 SDK openLink 不受 popup blocker 限制,不需要预开。
// 接口出错时调用方需要 popup?.close() 关掉空白窗。
//
// 注意:**不能**用 'noopener'/'noreferrer' 特性字符串 —— 浏览器规范规定带这些
// 特性时 window.open 返回 null,导致后续无法 close 空白窗。改为打开后手动
// 清空 popup.opener 来获得等同 noopener 的安全隔离(about:blank 同源,可写)。
export function preOpenNewTabPopup(): Window | null {
  if (typeof window === "undefined") return null;
  if (isTelegramWebApp()) return null;
  const popup = window.open("about:blank", "_blank");
  if (popup) {
    try {
      popup.opener = null;
    } catch {
      // 某些浏览器/嵌入环境可能不允许写 opener,不影响后续功能
    }
  }
  return popup;
}

// 把 preOpenNewTabPopup() 预开的 popup 导航到目标 URL。
// Telegram WebApp 环境忽略 popup,直接走 SDK openLink/openTelegramLink。
export function navigateNewTabPopup(popup: Window | null, url: string): boolean {
  if (typeof window === "undefined") return false;
  if (!url) return false;

  if (isTelegramWebApp()) {
    try {
      if (isTelegramAppLink(url)) {
        openTelegramLink(url);
        return true;
      }
      openLink(url);
      return true;
    } catch {
      return false;
    }
  }

  if (popup) {
    try {
      popup.location.href = url;
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

export function hasTelegramWebAppQuery() {
  if (typeof window === "undefined") return false;
  // TG 官方将参数放在 hash 中，部分客户端也可能放在 search 中
  const search = window.location?.search ?? "";
  const hash = window.location?.hash ?? "";
  const combined = search.replace(/^\?/, "") + "&" + hash.replace(/^#/, "");
  if (!combined || combined === "&") return false;
  const params = new URLSearchParams(combined);
  return params.has("tgWebAppPlatform") || params.has("tgWebAppVersion") || params.has("tgWebAppStartParam");
}

export function isTelegramContext() {
  if (isTelegramWebApp()) return true;
  if (hasTelegramWebAppQuery()) return true;
  // 检查早期缓存的 launch params（URL 可能已被 router 修改）
  if (getCachedLaunchParams()) return true;
  return hasTelegramWebAppObject();
}

export function isTelegramMobilePlatform() {
  const launchParams = getLaunchParamsSafe();
  const platform = launchParams?.tgWebAppPlatform as TelegramPlatform | undefined;
  if (typeof platform === "string") {
    const normalized = platform.toLowerCase();
    return normalized === "android" || normalized === "ios";
  }
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  return /android|iphone|ipad|ipod/i.test(userAgent);
}

export function getTelegramInitData() {
  // 优先走 SDK 标准路径
  try {
    const data = retrieveRawInitData();
    if (data) return data;
  } catch {}
  // 回退：从早期缓存的 launch params 中提取 tgWebAppData
  try {
    const cached = getCachedLaunchParams();
    if (cached) {
      const params = new URLSearchParams(cached);
      return params.get("tgWebAppData") ?? "";
    }
  } catch {}
  return "";
}

export function getTelegramUser() {
  try {
    return retrieveLaunchParams().tgWebAppData?.user ?? null;
  } catch {
    return null;
  }
}

export function getTelegramLaunchParamsSnapshot() {
  const launchParams = getLaunchParamsSafe();
  if (!launchParams) return null;

  return {
    tgWebAppPlatform: launchParams.tgWebAppPlatform,
    tgWebAppVersion: launchParams.tgWebAppVersion,
    tgWebAppStartParam: launchParams.tgWebAppStartParam,
    hasInitData: Boolean(launchParams.tgWebAppData),
    initDataUserId: launchParams.tgWebAppData?.user?.id ?? null,
  };
}

export function getTelegramViewportSnapshot() {
  if (!viewportMounted) {
    return {
      viewportHeight: undefined,
      viewportStableHeight: undefined,
      isFullscreen: undefined,
      safeAreaInset: undefined,
      contentSafeAreaInset: undefined,
    };
  }

  return {
    viewportHeight: (() => {
      try {
        return viewport.height();
      } catch {
        return undefined;
      }
    })(),
    viewportStableHeight: (() => {
      try {
        return viewport.stableHeight();
      } catch {
        return undefined;
      }
    })(),
    isFullscreen: (() => {
      try {
        return viewport.isFullscreen();
      } catch {
        return undefined;
      }
    })(),
    safeAreaInset: (() => {
      try {
        return viewport.safeAreaInsets();
      } catch {
        return undefined;
      }
    })(),
    contentSafeAreaInset: (() => {
      try {
        return viewport.contentSafeAreaInsets();
      } catch {
        return undefined;
      }
    })(),
  };
}

export function markTelegramReady() {
  try {
    miniApp.ready();
  } catch {
    // ignore
  }
}

export function expandTelegramViewport() {
  try {
    viewport.expand();
    return true;
  } catch {
    return false;
  }
}

export function enableTelegramClosingConfirmation() {
  try {
    closingBehavior.enableConfirmation();
  } catch {
    // ignore
  }
}

export function disableTelegramVerticalSwipes() {
  try {
    swipeBehavior.disableVertical();
  } catch {
    // ignore
  }
}

export function setTelegramHeaderColor(color: "bg_color" | "secondary_bg_color" | string) {
  try {
    miniApp.setHeaderColor(color);
  } catch {
    // ignore
  }
}

export function subscribeTelegramViewportChanges(listener: () => void) {
  const events = ["viewport_changed", "fullscreen_changed", "safe_area_changed", "content_safe_area_changed"] as const;
  events.forEach((event) => {
    try {
      on(event, listener);
    } catch {
      // ignore
    }
  });

  return () => {
    events.forEach((event) => {
      try {
        off(event, listener);
      } catch {
        // ignore
      }
    });
  };
}

export async function requestTelegramFullscreen() {
  if (!isTelegramContext()) return false;
  if (!isTelegramMobilePlatform()) return false;

  const mounted = await ensureTelegramSdkMounted();
  if (!mounted || !viewportMounted) return false;

  try {
    if (viewport.isFullscreen()) return true;
  } catch {
    return false;
  }

  try {
    await viewport.requestFullscreen();
    try {
      return viewport.isFullscreen();
    } catch {
      return false;
    }
  } catch {
    expandTelegramViewport();
    return false;
  }
}
