import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ThemeConfig } from "../contexts/ThemeContext";
import type { RuntimeThemeConfig } from "../services/themeConfigService";
import { getThemeByName } from "../themes/presets";

export function mergeThemeWithOverrides(themeName: string, overrides?: RuntimeThemeConfig["customOverrides"]): ThemeConfig | null {
  // Get base preset theme
  const baseTheme = getThemeByName(themeName);
  if (!baseTheme) {
    console.warn(`Unknown theme: ${themeName}`);
    return null;
  }

  // If no overrides, return base theme
  if (!overrides) {
    return baseTheme;
  }

  // Deep merge theme with overrides
  const mergedTheme: ThemeConfig = {
    ...baseTheme,
    // DaisyUI radius overrides
    ...(overrides.radiusSelector !== undefined && { radiusSelector: overrides.radiusSelector }),
    ...(overrides.radiusField !== undefined && { radiusField: overrides.radiusField }),
    ...(overrides.radiusBox !== undefined && { radiusBox: overrides.radiusBox }),
    // DaisyUI size overrides
    ...(overrides.sizeSelector !== undefined && { sizeSelector: overrides.sizeSelector }),
    ...(overrides.sizeField !== undefined && { sizeField: overrides.sizeField }),
    // Border width override
    ...(overrides.border !== undefined && { border: overrides.border }),
    // Other overrides
    ...(overrides.fontFamily !== undefined && { fontFamily: overrides.fontFamily }),
    ...(overrides.noise !== undefined && { noise: overrides.noise }),
    ...(overrides.depth !== undefined && { depth: overrides.depth }),
    colors: {
      ...baseTheme.colors,
      ...(overrides.colors || {}),
    },
  };

  return mergedTheme;
}

export function buildFinalTheme(config: RuntimeThemeConfig): ThemeConfig | null {
  const { currentTheme, customOverrides } = config;

  return mergeThemeWithOverrides(currentTheme, customOverrides);
}

export function validateRuntimeConfig(config: any): config is RuntimeThemeConfig {
  if (!config || typeof config !== "object") {
    return false;
  }

  if (typeof config.currentTheme !== "string") {
    return false;
  }

  // Validate customOverrides if present
  if (config.customOverrides !== undefined) {
    if (typeof config.customOverrides !== "object") {
      return false;
    }
  }

  return true;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
