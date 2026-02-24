import { clsx, type ClassValue } from "clsx";
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
  const presetTheme = getThemeByName(currentTheme);
  if (presetTheme) {
    return mergeThemeWithOverrides(currentTheme, customOverrides);
  }

  if (!customOverrides) {
    console.warn(`Unknown theme without overrides: ${currentTheme}`);
    return null;
  }

  return buildThemeFromOverrides(currentTheme, customOverrides, config.colorSchema);
}

const REQUIRED_COLOR_KEYS: Array<keyof ThemeConfig["colors"]> = [
  "primary",
  "primaryContent",
  "secondary",
  "secondaryContent",
  "accent",
  "accentContent",
  "neutral",
  "neutralContent",
  "base100",
  "base200",
  "base300",
  "base400",
  "baseContent",
  "info",
  "infoContent",
  "success",
  "successContent",
  "warning",
  "warningContent",
  "error",
  "errorContent",
];

const buildThemeFromOverrides = (
  themeName: string,
  overrides: RuntimeThemeConfig["customOverrides"],
  colorSchema?: ThemeConfig["colorSchema"]
): ThemeConfig | null => {
  if (!overrides?.colors) {
    console.warn(`Missing colors for custom theme: ${themeName}`);
    return null;
  }

  const missingColors = REQUIRED_COLOR_KEYS.filter((key) => !(key in overrides.colors!));
  if (missingColors.length > 0) {
    console.warn(`Missing colors for custom theme ${themeName}: ${missingColors.join(", ")}`);
    return null;
  }

  if (!overrides.radiusSelector || !overrides.radiusField || !overrides.radiusBox) {
    console.warn(`Missing radius settings for custom theme: ${themeName}`);
    return null;
  }

  if (!overrides.sizeSelector || !overrides.sizeField) {
    console.warn(`Missing size settings for custom theme: ${themeName}`);
    return null;
  }

  if (!overrides.border) {
    console.warn(`Missing border setting for custom theme: ${themeName}`);
    return null;
  }

  if (!overrides.fontFamily) {
    console.warn(`Missing fontFamily for custom theme: ${themeName}`);
    return null;
  }

  return {
    name: themeName,
    colorSchema,
    colors: overrides.colors as ThemeConfig["colors"],
    radiusSelector: overrides.radiusSelector,
    radiusField: overrides.radiusField,
    radiusBox: overrides.radiusBox,
    sizeSelector: overrides.sizeSelector,
    sizeField: overrides.sizeField,
    border: overrides.border,
    fontFamily: overrides.fontFamily,
    noise: overrides.noise,
    depth: overrides.depth,
  };
};

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
