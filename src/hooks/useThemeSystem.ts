import { useTheme } from "../contexts/ThemeContext";
import { getThemeByName, getThemeNames } from "../themes/presets";

export function useThemeSystem() {
  const themeContext = useTheme();

  const isDarkTheme = () => {
    return (
      themeContext.state.currentTheme === "dark" ||
      themeContext.state.currentTheme === "forest" ||
      themeContext.state.currentTheme === "halloween" ||
      themeContext.state.currentTheme === "business" ||
      themeContext.state.currentTheme === "dracula" ||
      themeContext.state.currentTheme === "sunset" ||
      themeContext.state.currentTheme === "abyss"
    );
  };

  const getThemeInfo = () => {
    const current = themeContext.state.finalTheme;
    return {
      name: themeContext.state.currentTheme,
      isDark: isDarkTheme(),
      colors: current?.colors,
      available: themeContext.getAvailableThemes(),
      hasCustomOverrides:
        themeContext.state.runtimeConfig?.customOverrides && Object.keys(themeContext.state.runtimeConfig.customOverrides).length > 0,
    };
  };

  const getAvailablePresetThemes = () => {
    return getThemeNames();
  };

  const isPresetTheme = (themeName: string) => {
    return getThemeNames().includes(themeName);
  };

  const getCurrentConfig = () => {
    return themeContext.state.runtimeConfig;
  };

  const getPresetTheme = (themeName: string) => {
    return getThemeByName(themeName);
  };

  return {
    // Core state
    state: themeContext.state,

    // Theme info
    isDarkTheme,
    getThemeInfo,
    getCurrentConfig,
    getPresetTheme,

    // Available themes
    getAvailablePresetThemes,
    isPresetTheme,
    getAvailableThemes: themeContext.getAvailableThemes,

    // Actions
    applyTheme: themeContext.applyTheme,
  };
}
