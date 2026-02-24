export function isTelegramWebApp() {
  const tg = window.Telegram?.WebApp;
  if (!tg || typeof tg !== "object") return false;

  if (typeof tg.initData === "string" && tg.initData !== "") return true;

  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  if (!/Telegram/i.test(userAgent)) return false;

  if (typeof tg.platform === "string" && tg.platform) return true;
  if (typeof tg.initDataUnsafe === "object" && tg.initDataUnsafe?.user) return true;

  return hasTelegramWebAppQuery();
}

export function isTelegramEnvironment() {
  return Boolean(window.Telegram?.WebApp);
}

export function openExternalUrl(url: string) {
  if (typeof window === "undefined") return;
  if (!url) return;

  if (isTelegramWebApp()) {
    window.Telegram?.WebApp?.openLink?.(url);
    return;
  }

  window.location.href = url;
}

export function hasTelegramWebAppQuery() {
  if (typeof window === "undefined") return false;
  const search = window.location?.search;
  if (!search) return false;
  const params = new URLSearchParams(search);
  return params.has("tgWebAppPlatform") || params.has("tgWebAppVersion") || params.has("tgWebAppStartParam");
}

export function isTelegramContext() {
  if (isTelegramWebApp()) return true;
  if (!hasTelegramWebAppQuery()) return false;
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  return /Telegram/i.test(userAgent);
}

export function isTelegramMobilePlatform() {
  const platform = window.Telegram?.WebApp?.platform;
  if (typeof platform === "string") {
    const normalized = platform.toLowerCase();
    return normalized === "android" || normalized === "ios";
  }
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  return /android|iphone|ipad|ipod/i.test(userAgent);
}

export function getTelegramInitData() {
  return window.Telegram?.WebApp?.initData ?? "";
}

export function getTelegramUser() {
  return window.Telegram?.WebApp?.initDataUnsafe?.user ?? null;
}

export function requestTelegramFullscreen() {
  if (!isTelegramContext()) return false;
  if (!isTelegramMobilePlatform()) return false;
  const tg = window.Telegram?.WebApp;
  if (!tg || typeof tg !== "object") return false;

  if (tg.isFullscreen) return true;

  if (typeof tg.requestFullscreen !== "function") {
    tg.expand?.();
    return false;
  }

  try {
    tg.requestFullscreen();
    return true;
  } catch {
    return false;
  }
}
