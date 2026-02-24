import { SwatchBook } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeNames } from "../../themes/presets";
import { useSidebar } from "@/contexts/SidebarContext";
import { useTranslation } from 'react-i18next';

export default function ThemeSwitcher() {
  const { state, switchTheme } = useTheme();
  const { isMobile } = useSidebar()
  const { t } = useTranslation('common')
  const handleThemeChange = (themeName: string) => {
    switchTheme(themeName);
  };

  const availableThemes = getThemeNames();

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className={`btn btn-square ${isMobile ? 'btn-sm' : ''}`}>
        <SwatchBook className="w-4 h-4" />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content p-2 mt-2 shadow-2xl bg-base-200 rounded-box w-48 max-h-96 overflow-y-auto"
      >
        <li className="menu-title">
          <span className="text-sm font-semibold">{t('common:common.settings')}</span>
        </li>
        <div className="divider my-1"></div>
        {availableThemes.map((themeName) => {
          const theme = state.availableThemes[themeName];
          const isActive = state.currentTheme === themeName;
          
          return (
            <li key={themeName}>
              <button
                className={`flex items-center gap-2 p-2 w-full text-left rounded ${
                  isActive ? 'bg-primary/20' : 'hover:bg-base-200'
                }`}
                onClick={() => handleThemeChange(themeName)}
              >
                <div
                  className="w-4 h-4 rounded-full border border-base-content/20"
                  style={{
                    background: theme ? `linear-gradient(45deg, ${theme.colors.primary} 25%, ${theme.colors.secondary} 75%)` : '#000',
                  }}
                />
                <span className="capitalize flex-1 text-xs font-semibold">{themeName}</span>
                {isActive && (
                  <span className="text-primary text-xs">✓</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
} 
