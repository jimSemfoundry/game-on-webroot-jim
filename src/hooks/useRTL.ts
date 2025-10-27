import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// RTL languages list
const RTL_LANGUAGES = ["ar", "fa", "he", "ur", "ps", "sd"];

interface RTLState {
  isRTL: boolean;
  direction: "ltr" | "rtl";
  checkIsRTL: (language: string) => boolean;
  RTL_LANGUAGES: string[];
}

/**
 * Hook to detect and manage RTL (Right-to-Left) language support
 * @returns {RTLState} RTL utilities and state
 */
export const useRTL = (): RTLState => {
  const { i18n } = useTranslation();
  const [isRTL, setIsRTL] = useState(false);

  // Check if current language is RTL
  const checkIsRTL = (language: string) => {
    return RTL_LANGUAGES.some((rtlLang) => language.startsWith(rtlLang));
  };

  // Update RTL state when language changes
  useEffect(() => {
    const currentIsRTL = checkIsRTL(i18n.language);
    setIsRTL(currentIsRTL);

    // Update HTML dir attribute
    document.documentElement.dir = currentIsRTL ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;

    // Add/remove RTL class for additional styling
    if (currentIsRTL) {
      document.documentElement.classList.add("rtl");
    } else {
      document.documentElement.classList.remove("rtl");
    }
  }, [i18n.language]);

  return {
    isRTL,
    direction: (isRTL ? "rtl" : "ltr") as "ltr" | "rtl",
    checkIsRTL,
    RTL_LANGUAGES,
  };
};
