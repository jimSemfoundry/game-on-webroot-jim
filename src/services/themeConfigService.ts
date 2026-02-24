import type { ThemeConfig } from "../contexts/ThemeContext";

export interface RuntimeThemeConfig {
  currentTheme: string;
  colorSchema?: "light" | "dark";
  customOverrides?: {
    colors?: Partial<ThemeConfig["colors"]>;
    // DaisyUI radius settings
    radiusSelector?: string;
    radiusField?: string;
    radiusBox?: string;
    // DaisyUI size settings
    sizeSelector?: string;
    sizeField?: string;
    // Border width
    border?: string;
    fontFamily?: string;
    noise?: number;
    depth?: number;
  };
  brandConfig?: {
    brandName: string;
    version: string;
    lastUpdated: string;
  };
}

function parseThemeConfig(): RuntimeThemeConfig {
  const configJson = import.meta.env.VITE_THEME_CONFIG;
  // console.info(configJson);
  if (!configJson) {
    console.warn("VITE_THEME_CONFIG is not set. Using default theme.");
    return {
      currentTheme: "default",
      customOverrides: {},
      brandConfig: {
        brandName: "Default",
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
      },
    };
  }
  try {
    return JSON.parse(configJson);
  } catch (error) {
    console.error("Failed to parse VITE_THEME_CONFIG. Using default theme.", error);
    return {
      currentTheme: "light",
      customOverrides: {},
      brandConfig: {
        brandName: "Default",
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
      },
    };
  }
}

class ThemeConfigService {
  private config: RuntimeThemeConfig;

  constructor() {
    this.config = parseThemeConfig();
  }

  getCurrentConfig(): RuntimeThemeConfig {
    return this.config;
  }
}

export const themeConfigService = new ThemeConfigService();
