export function isMobile(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const mobileKeywords = ["android", "webos", "iphone", "ipad", "ipod", "blackberry", "windows phone", "mobile"];

  return mobileKeywords.some((keyword) => userAgent.includes(keyword));
}

export function isIOS(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

export function isAndroid(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
}

export const isMac = (): boolean => {
  return /macintosh|mac os x/.test(navigator.userAgent.toLowerCase());
};