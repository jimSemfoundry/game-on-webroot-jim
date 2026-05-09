const BETBY_LANG_REGEX = /^[a-zA-Z-]{1,10}$/;

/**
 * 后端 / Betby / aggregation 接口期望的 lang 归一化形式：
 *   - 不合法 → "en"
 *   - 合法 → 小写（"ZH-CN" → "zh-cn"，"VI" → "vi"）
 *
 * 以前 useAggregationConfig 用 toUpperCase()、SportsPromoCarousel 用此 lowercase 方案，
 * 导致同一语言两次大小写不同请求 + React Query 不去重。统一到 lowercase 后共用 query key。
 */
export const normalizeBackendLang = (lang?: string): string => {
  const rawLang = lang?.trim() ?? "";
  if (!BETBY_LANG_REGEX.test(rawLang)) {
    return "en";
  }
  return rawLang.toLowerCase();
};

/**
 * 语言代码到本地名称的映射
 */
export const languageNames: Record<string, string> = {
  en: "English",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  ru: "Русский",
  ar: "العربية",
  hi: "हिन्दी",
  th: "ไทย",
  vi: "Tiếng Việt",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  tl: "Filipino",
  fil: "Filipino",
  fa: "فارسی",
  tr: "Türkçe",
  nl: "Nederlands",
  it: "Italiano",
  ro: "Română",
  pl: "Polski",
  cs: "Čeština",
  hu: "Magyar",
  sv: "Svenska",
  da: "Dansk",
  no: "Norsk",
  fi: "Suomi",
  el: "Ελληνικά",
  he: "עברית",
  uk: "Українська",
  bg: "Български",
  hr: "Hrvatski",
  sr: "Српски",
  sk: "Slovenčina",
  sl: "Slovenščina",
  et: "Eesti",
  lv: "Latviešu",
  lt: "Lietuvių",
};

/**
 * 获取语言的本地名称
 * @param languageCode 语言代码
 * @returns 语言的本地名称
 */
export const getLanguageDisplayName = (languageCode: string): string => {
  return languageNames[languageCode] || languageCode.toUpperCase();
};
