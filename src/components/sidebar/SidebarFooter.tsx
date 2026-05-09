import { useLanguageModal, useThemeSwitcherModal, useWalletModal } from "@/contexts/ModalsProvider";
import { ChevronRight, CircleDollarSign, SwatchBook } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Iconify from "../iconify/iconify";
import { useAuth } from "@/contexts/AuthContext";
import { getLanguageDisplayName } from "@/utils/languages";
import { useFiatSymbol } from "@/utils/currencySymbol";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";
import { useChatwootContext } from "@/contexts/ChatwootContext";
import { useTheme } from "@/contexts/ThemeContext.tsx";
import { useSidebar } from "@/contexts/SidebarContext";
import { EnvVariablesGuard } from "@/components/EnvVariablesGuard.tsx";
import { ExpandButton } from "@/components/sidebar/ExpandButton.tsx";
import { LastUpdate } from "@/components/sidebar/LastUpdate.tsx";
import { ClearCache } from "@/components/sidebar/ClearCache.tsx";
import { HideGames } from "@/components/sidebar/HideGames.tsx";
import { ProblemReport } from "@/components/sidebar/ProblemReport";

export const SidebarFooter = ({ isMini }: { isMini: boolean }) => {
  const { user } = useAuth();
  const { selectedCurrency } = useDisplayCurrency();
  const { toggleWidget } = useChatwootContext();
  const { closeDrawer } = useSidebar();

  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const { openModal: openLanguageModal } = useLanguageModal();
  const { openModal: openWalletModal } = useWalletModal();
  const { openModal: openThemeSwitcherModal } = useThemeSwitcherModal();
  const { t, i18n } = useTranslation();
  const { state } = useTheme();

  // TODO: 使用服务端提供的法币缩写符号
  const { showFiatSymbol } = useFiatSymbol()

  // 获取当前显示的货币（优先用户设置，其次CurrencyContext选择）
  const displayCurrency = user?.currency_fiat || selectedCurrency;

  // Memoized click outside handler to prevent unnecessary re-renders
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
      setSettingsOpen(false);
    }
  }, []);

  // Click outside to close settings
  useEffect(() => {
    if (isSettingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSettingsOpen, handleClickOutside]);

  return (
    <div ref={settingsRef}>
      <div className="rounded-xl">
        {isMini ? (
          <div className="flex flex-col gap-y-1 py-2">
            <button
              onClick={() => {
                toggleWidget();
                closeDrawer();
              }}
              className="cursor-pointer flex items-center justify-center rounded-field hover:bg-base-200 text-base-content group relative h-11 w-11 py-3 px-2  max-w-none bg-base-400"
            >
              <Iconify icon="custom:headphone"
                       className="w-5 h-5 shrink-0 text-base-content/70 group-hover:text-primary" />
              {/* Tooltip for mini mode */}
              <div
                className="fixed left-20 rtl:right-20 px-2 py-1 bg-base-100 shadow-lg text-base-content rounded-selector badge badge-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {t("menu:support")}
              </div>
            </button>
            <button
              className="cursor-pointer flex items-center justify-center rounded-field hover:bg-base-200 text-base-content group relative h-11 w-11 py-3 px-2  max-w-none bg-base-400">
              <Iconify icon="custom:setting"
                       className="w-5 h-5 shrink-0 text-base-content/70 group-hover:text-primary" />
              {/* Tooltip for mini mode */}
              <div
                className="fixed left-20 rtl:right-20 px-2 py-1 bg-base-100 shadow-lg text-base-content rounded-selector badge badge-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {t("menu:settings")}
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {/* TODO: 增加版本信息 */}
            {/*<InnerContentVisible show={isSettingsOpen}>*/}
            {/*  <div className="text-[10px] font-extrabold text-base-content/40 text-right underline">*/}
            {/*    v1.0.0*/}
            {/*  </div>*/}
            {/*</InnerContentVisible>*/}
            <div
              onClick={() => {
                toggleWidget();
                closeDrawer();
              }}
              className="btn flex w-full items-center justify-between btn-md md:btn-lg"
            >
              <div className="flex items-center gap-x-3 min-w-0 overflow-hidden">
                <Iconify icon="custom:headphone" className="w-5 h-5 shrink-0 text-base-content/70" />
                <span className="text-sm font-semibold truncate">{t("menu:support")}</span>
              </div>
              <div className="flex items-center gap-x-2 shrink-0">
                <span className="badge badge-soft badge-primary badge-sm md:badge-md rounded-md">24/7</span>
                <ChevronRight size={16} className="rtl:rotate-z-180" />
              </div>
            </div>

            <AnimatePresence>
              {isSettingsOpen && (
                <m.div
                  className="space-y-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <button className="flex items-center justify-between btn btn-md md:btn-lg w-full"
                          onClick={openLanguageModal}>
                    <div className="flex items-center gap-x-3 min-w-0 overflow-hidden text-left">
                      <Iconify icon="custom:global" className="w-5 h-5 shrink-0 text-base-content/70" />
                      <div className="flex flex-col items-start min-w-0">
                        <span className="text-xs text-base-content/50 truncate w-full">{t("menu:language")}</span>
                        <span className="text-sm font-semibold truncate w-full">
                          {getLanguageDisplayName(i18n.language)}
                        </span>
                      </div>
                    </div>
                    <ExpandButton />
                  </button>
                  <button className="flex items-center justify-between bg-base-200 btn btn-md md:btn-lg w-full"
                          onClick={openWalletModal}>
                    <div className="flex items-center gap-x-3 min-w-0 overflow-hidden text-left">
                      <CircleDollarSign size={20} className="w-5 h-5 shrink-0 opacity-50" />
                      <div className="flex flex-col items-start min-w-0">
                        <span className="text-xs text-base-content/50 truncate w-full">{t("menu:gameCurrency")}</span>
                        <span className="text-xs font-semibold truncate w-full">
                          {showFiatSymbol(displayCurrency || "")} {displayCurrency || "USD"}
                        </span>
                      </div>
                    </div>
                    <ExpandButton />
                  </button>
                  <EnvVariablesGuard name={"VITE_ENABLE_THEME_SWITCHER"}>
                    <button className="flex items-center justify-between bg-base-200 btn btn-md md:btn-lg w-full"
                            onClick={openThemeSwitcherModal}>
                      <div className="flex items-center gap-x-3 min-w-0 overflow-hidden text-left">
                        <SwatchBook size={20} className="w-5 h-5 shrink-0 opacity-50" />
                        <div className="flex flex-col items-start min-w-0">
                          <span
                            className="text-xs text-base-content/50 truncate w-full">{t("theme:theme_switching", "Theme Switching")}</span>
                          <span className="text-xs font-semibold truncate w-full">
                            {state.currentTheme}
                          </span>
                        </div>
                      </div>
                      <ExpandButton />
                    </button>
                  </EnvVariablesGuard>
                  {/*游戏隐藏*/}
                  <HideGames onClose={closeDrawer} />
                  {/*api数据刷新*/}
                  <ClearCache />
                  {/*问题反馈*/}
                  <ProblemReport />
                  {/*打包时间显示*/}
                  <LastUpdate />
                </m.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between rounded-lg"
                 onClick={() => setSettingsOpen(!isSettingsOpen)}>
              <span className="px-2 text-sm md:text-base font-semibold text-base-content/50 truncate">{t("menu:settings")}</span>
              <div className="items-center rounded-lg grid grid-cols-2 bg-base-200">
                <button className="flex items-center justify-center btn btn-square btn-ghost btn-sm md:btn-md">
                  <Iconify icon="custom:setting" className="w-5 h-5 shrink-0 text-base-content/70" />
                </button>
                <button className="flex items-center justify-center btn btn-square btn-ghost btn-sm md:btn-md">
                  <Iconify icon="custom:global" className="w-5 h-5 shrink-0 text-base-content/70" />
                </button>
              </div>
                </div>
          </div>
        )}
      </div>
    </div>
  );
};
