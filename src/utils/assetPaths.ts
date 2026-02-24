const getSourcePathPrefix = () => {
  const model = import.meta.env.VITE_PROMOTION_MODEL;
  const appid = import.meta.env.VITE_FOLDER;
  return appid && model === "roibest" ? `/${appid}` : "";
};

const normalizeBaseUrl = (value?: string) => (value ? value.replace(/\/+$/, "") : "");

const getAssetBaseUrl = (envValue?: string) => {
  if (envValue) return normalizeBaseUrl(envValue);
  return getSourcePathPrefix();
};

const getLogoBaseUrl = () => getAssetBaseUrl(import.meta.env.VITE_LOGO_BASE_URL);

export const getLogoFullUrl = (theme: string) => {
  const overrideUrl = import.meta.env.VITE_LOGO_FULL_URL;
  if (overrideUrl) return overrideUrl;
  const baseUrl = getLogoBaseUrl();
  if (import.meta.env.VITE_LOGO_BASE_URL) return `${baseUrl}`;
  return `${baseUrl}/logos/${theme}/logo-full.svg`;
};

export const getLogoPwaUrl = (theme: string) => {
  const overrideUrl = import.meta.env.VITE_LOGO_PWA_URL;
  if (overrideUrl) return overrideUrl;
  const baseUrl = getLogoBaseUrl();
  if (import.meta.env.VITE_LOGO_BASE_URL) return `${baseUrl}/logos/logo-pwa.png`;
  return `${baseUrl}/logos/${theme}/logo-pwa.png`;
};

export const getLogoLoaderUrl = (theme: string) => {
  const overrideUrl = import.meta.env.VITE_LOGO_LOADER_URL;
  if (overrideUrl) return overrideUrl;
  const baseUrl = getLogoBaseUrl();
  if (import.meta.env.VITE_LOGO_BASE_URL) return `${baseUrl}/logos/1stlogo.svg`;
  return `${baseUrl}/logos/${theme}/1stlogo.svg`;
};

export const getFaviconAppleUrl = (theme: string) => {
  const overrideUrl = import.meta.env.VITE_FAVICON_APPLE_URL;
  if (overrideUrl) return overrideUrl;
  const baseUrl = getAssetBaseUrl(import.meta.env.VITE_FAVICON_BASE_URL);
  if (import.meta.env.VITE_FAVICON_BASE_URL) return `${baseUrl}/favicon/${theme}/apple-touch-icon.png`;
  return `${baseUrl}/favicon/${theme}/apple-touch-icon.png`;
};

export const getFaviconUrl = (theme: string, fileName: string) => {
  const baseUrl = getAssetBaseUrl(import.meta.env.VITE_FAVICON_BASE_URL);
  return `${baseUrl}/favicon/${theme}/${fileName}`;
};

export const getFaviconRootUrl = (fileName: string) => {
  const baseUrl = getAssetBaseUrl(import.meta.env.VITE_FAVICON_BASE_URL);
  return `${baseUrl}/${fileName}`;
};
