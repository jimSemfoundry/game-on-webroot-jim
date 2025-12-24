export function isTelegramWebApp() {
  const tg = window.Telegram?.WebApp;
  return Boolean(tg && typeof tg === "object" && tg.initData);
}

export function getTelegramInitData() {
  return window.Telegram?.WebApp?.initData ?? "";
}

export function getTelegramUser() {
  return window.Telegram?.WebApp?.initDataUnsafe?.user ?? null;
}
