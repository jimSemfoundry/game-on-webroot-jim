import { Modal } from "../ui/Modal";
import { useTheme } from "@/contexts/ThemeContext.tsx";
import { useSidebar } from "@/contexts/SidebarContext.tsx";
import { getThemeNames } from "@/themes/presets.ts";
import { SwatchBook } from "lucide-react";

type ThemeSwitcherModalProps = {
  isOpen: boolean
  onClose: () => void
}

export const ThemeSwitcherModal = ({ isOpen, onClose }: ThemeSwitcherModalProps) => {
  const { isMobile } = useSidebar();

  const { state, switchTheme } = useTheme();

  return (
    <Modal position={isMobile ? "modal-bottom" : "modal-middle"} isOpen={isOpen} onClose={onClose} title={
      <div className="flex items-center gap-x-2 h-8">
        <SwatchBook className="w-5 h-5 text-primary" />
        <p className="text-base md:text-xl font-semibold">主题设置</p>
      </div>
    } className="bg-base-400 md:w-[420px] max-w-sm mx-auto overflow-hidden">
      <div className="flex flex-col max-h-[60vh]">
        <ul className="flex-1 min-h-0 overflow-hidden">
          <div className="my-2"></div>
          {getThemeNames().map((themeName) => {
            const theme = state.availableThemes[themeName];
            const isActive = state.currentTheme === themeName;
            return (
              <li key={themeName}>
                <button
                  className={`cursor-pointer flex items-center gap-2 p-2 w-full text-left rounded ${
                    isActive ? "bg-primary/20" : "hover:bg-base-200"
                  }`}
                  onClick={() => {
                    switchTheme(themeName);
                    onClose()
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-base-content/20"
                    style={{
                      background: theme ? `linear-gradient(45deg, ${theme.colors.primary} 25%, ${theme.colors.secondary} 75%)` : "#000"
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
    </Modal>
  );
};
