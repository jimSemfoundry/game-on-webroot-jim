import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useReducer } from "react";
import { themeConfigService, type RuntimeThemeConfig } from "../services/themeConfigService";
import { getAllPresetThemes } from "../themes/presets";
import { buildFinalTheme } from "../utils/themeMerger";

export interface ThemeColors {
  primary: string;
  primaryContent: string;
  secondary: string;
  secondaryContent: string;
  accent: string;
  accentContent: string;
  neutral: string;
  neutralContent: string;
  base100: string;
  base200: string;
  base300: string;
  base400: string; // 自定义 base-400 颜色
  baseContent: string;
  info: string;
  infoContent: string;
  success: string;
  successContent: string;
  warning: string;
  warningContent: string;
  error: string;
  errorContent: string;
}

export interface ThemeConfig {
  name: string;
  // light/dark schema marker for Tailwind/DaisyUI integration
  colorSchema?: "light" | "dark";
  colors: ThemeColors;

  // DaisyUI border radius settings
  radiusSelector: string; // e.g., "1rem" - for selectors like buttons, inputs
  radiusField: string; // e.g., "0.5rem" - for form fields
  radiusBox: string; // e.g., "1rem" - for cards, modals, boxes

  // DaisyUI size settings
  sizeSelector: string; // e.g., "0.25rem" - for selector component sizing
  sizeField: string; // e.g., "0.25rem" - for field component sizing

  // Border width
  border: string; // e.g., "1px" - global border width

  fontFamily: string;
  noise?: number; // DaisyUI noise effect (0-1)
  depth?: number; // DaisyUI depth/shadow effect (0-1)
}

interface ThemeState {
  currentTheme: string;
  availableThemes: Record<string, ThemeConfig>; // Preset themes only
  runtimeConfig: RuntimeThemeConfig | null;
  finalTheme: ThemeConfig | null; // Merged theme with overrides
}

type ThemeAction =
  | { type: "SET_RUNTIME_CONFIG"; payload: RuntimeThemeConfig }
  | { type: "SET_FINAL_THEME"; payload: ThemeConfig }
  | { type: "SET_CURRENT_THEME"; payload: string };

// Get preset themes
const defaultThemes = getAllPresetThemes();

// Get initial config from service and build the final theme for initial state
const initialRuntimeConfig = themeConfigService.getCurrentConfig();
const initialFinalTheme = buildFinalTheme(initialRuntimeConfig);

const initialState: ThemeState = {
  currentTheme: initialRuntimeConfig.currentTheme,
  availableThemes: defaultThemes,
  runtimeConfig: initialRuntimeConfig,
  finalTheme: initialFinalTheme || defaultThemes.light,
};

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case "SET_RUNTIME_CONFIG":
      const finalTheme = buildFinalTheme(action.payload);
      return {
        ...state,
        runtimeConfig: action.payload,
        currentTheme: action.payload.currentTheme,
        finalTheme: finalTheme || state.finalTheme,
      };
    case "SET_FINAL_THEME":
      return {
        ...state,
        finalTheme: action.payload,
      };
    case "SET_CURRENT_THEME":
      return {
        ...state,
        currentTheme: action.payload,
      };
    default:
      return state;
  }
}

interface ThemeContextType {
  state: ThemeState;
  applyTheme: (theme: ThemeConfig) => void;
  switchTheme: (themeName: string) => void;
  getAvailableThemes: () => string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  const applyTheme = (theme: ThemeConfig) => {
    const root = document.documentElement;

    root.style.setProperty("--color-primary", theme.colors.primary);
    root.style.setProperty("--color-primary-content", theme.colors.primaryContent);
    root.style.setProperty("--color-secondary", theme.colors.secondary);
    root.style.setProperty("--color-secondary-content", theme.colors.secondaryContent);
    root.style.setProperty("--color-accent", theme.colors.accent);
    root.style.setProperty("--color-accent-content", theme.colors.accentContent);
    root.style.setProperty("--color-neutral", theme.colors.neutral);
    root.style.setProperty("--color-neutral-content", theme.colors.neutralContent);
    root.style.setProperty("--color-base-100", theme.colors.base100);
    root.style.setProperty("--color-base-200", theme.colors.base200);
    root.style.setProperty("--color-base-300", theme.colors.base300);
    root.style.setProperty("--color-base-400", theme.colors.base400);
    root.style.setProperty("--color-base-content", theme.colors.baseContent);
    root.style.setProperty("--color-info", theme.colors.info);
    root.style.setProperty("--color-info-content", theme.colors.infoContent);
    root.style.setProperty("--color-success", theme.colors.success);
    root.style.setProperty("--color-success-content", theme.colors.successContent);
    root.style.setProperty("--color-warning", theme.colors.warning);
    root.style.setProperty("--color-warning-content", theme.colors.warningContent);
    root.style.setProperty("--color-error", theme.colors.error);
    root.style.setProperty("--color-error-content", theme.colors.errorContent);

    // Apply DaisyUI radius settings
    root.style.setProperty("--radius-selector", theme.radiusSelector);
    root.style.setProperty("--radius-field", theme.radiusField);
    root.style.setProperty("--radius-box", theme.radiusBox);

    // Apply DaisyUI size settings
    root.style.setProperty("--size-selector", theme.sizeSelector);
    root.style.setProperty("--size-field", theme.sizeField);

    // Apply border width
    root.style.setProperty("--border", theme.border);

    // Apply font family
    root.style.setProperty("--font-family", theme.fontFamily);

    // Apply DaisyUI specific properties
    if (theme.noise !== undefined) {
      root.style.setProperty("--noise", theme.noise.toString());
    }
    if (theme.depth !== undefined) {
      root.style.setProperty("--depth", theme.depth.toString());
    }

    // Sync dark mode trigger for Tailwind v4 dark variant mapping
    // We map `dark:` to `[data-theme="dark"]` in styles.css via @custom-variant
    // Ensure the root element carries the proper marker when switching themes.
    const isDark = theme.colorSchema ? theme.colorSchema === "dark" : theme.name?.toLowerCase().includes("dark");
    root.setAttribute("data-theme", isDark ? "dark" : "light");
    // Optional: also toggle class for libraries expecting `.dark`
    root.classList.toggle("dark", !!isDark);
  };

  const switchTheme = (themeName: string) => {
    const theme = state.availableThemes[themeName];
    if (theme) {
      dispatch({ type: "SET_CURRENT_THEME", payload: themeName });
      dispatch({ type: "SET_FINAL_THEME", payload: theme });
      applyTheme(theme);
    }
  };

  const getAvailableThemes = () => {
    return Object.keys(state.availableThemes);
  };

  useEffect(() => {
    // On initial mount, apply the theme that was calculated for the initial state.
    if (state.finalTheme) {
      applyTheme(state.finalTheme);
    }
  }, []);

  const value: ThemeContextType = {
    state,
    applyTheme,
    switchTheme,
    getAvailableThemes,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
