import { useLanguageModal, useThemeSwitcherModal, useWalletModal } from "@/contexts/ModalsProvider";
import { ChevronDown, ChevronRight, CircleDollarSign, SwatchBook } from "lucide-react";
import { AnimatePresence, m } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Iconify from '../iconify/iconify'
import { useAuth } from '@/contexts/AuthContext'
import { getLanguageDisplayName } from '@/utils/languages'
import getSymbolFromCurrency from 'currency-symbol-map'
import { useDisplayCurrency } from '@/contexts/DisplayCurrencyContext'
import { useChatwootContext } from '@/contexts/ChatwootContext'
import { useTheme } from "@/contexts/ThemeContext.tsx";

export const SidebarFooter = ({ isMini }: { isMini: boolean }) => {
  const { user } = useAuth()
  const { selectedCurrency } = useDisplayCurrency()
  const { toggleWidget } = useChatwootContext()

  const [isSettingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const { openModal: openLanguageModal } = useLanguageModal()
  const { openModal: openWalletModal } = useWalletModal()
  const { openModal: openThemeSwitcherModal } = useThemeSwitcherModal()
  const { t, i18n } = useTranslation()
  const {state} = useTheme()
  const isThemeSwitcherEnabled = import.meta.env.VITE_ENABLE_THEME_SWITCHER === 'true'
  
  // 获取当前显示的货币（优先用户设置，其次CurrencyContext选择）
  const displayCurrency = user?.currency_fiat || selectedCurrency

  // Memoized click outside handler to prevent unnecessary re-renders
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
      setSettingsOpen(false)
    }
  }, [])

  // Click outside to close settings
  useEffect(() => {
    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSettingsOpen, handleClickOutside])

  return (
    <div ref={settingsRef}>
      <div className="rounded-xl">
        {isMini ? (
          <div className="flex flex-col gap-y-1 py-2">
            <button 
              onClick={toggleWidget}
              className="cursor-pointer flex items-center justify-center rounded-field hover:bg-base-200 text-base-content group relative h-11 w-11 py-3 px-2  max-w-none bg-base-400"
            >
              <Iconify icon="custom:headphone" className="w-5 h-5 shrink-0 text-base-content/70 group-hover:text-primary" />
              {/* Tooltip for mini mode */}
              <div className="fixed left-20 rtl:right-20 px-2 py-1 bg-base-100 shadow-lg text-base-content rounded-selector badge badge-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {t('menu:support')}
              </div>
            </button>
            <button className="cursor-pointer flex items-center justify-center rounded-field hover:bg-base-200 text-base-content group relative h-11 w-11 py-3 px-2  max-w-none bg-base-400">
              <Iconify icon="custom:setting" className="w-5 h-5 shrink-0 text-base-content/70 group-hover:text-primary" />
              {/* Tooltip for mini mode */}
              <div className="fixed left-20 rtl:right-20 px-2 py-1 bg-base-100 shadow-lg text-base-content rounded-selector badge badge-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {t('menu:settings')}
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <div 
              onClick={toggleWidget}
              className="btn flex w-full items-center justify-between btn-md md:btn-lg"
            >
              <div className="flex items-center gap-x-3">
                <Iconify icon="custom:headphone" className="w-5 h-5 shrink-0 text-base-content/70" />
                <span className="text-sm font-semibold">{t('menu:support')}</span>
              </div>
              <div className="flex items-center gap-x-2">
                <span className="badge badge-soft badge-primary badge-sm md:badge-md">24/7</span>
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
                    <div className="flex items-center gap-x-3">
                      <Iconify icon="custom:global" className="w-5 h-5 shrink-0 text-base-content/70" />
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-base-content/50">{t("menu:language")}</span>
                        <span className="text-sm font-semibold">
                          {getLanguageDisplayName(i18n.language)}
                        </span>
                      </div>
                    </div>
                    <div
                      className="flex items-center justify-center btn-square btn-xs rounded-lg bg-primary text-primary-content">
                      <ChevronDown size={16} />
                    </div>
                  </button>
                  <button className="flex items-center justify-between bg-base-200 btn btn-md md:btn-lg w-full"
                          onClick={openWalletModal}>
                    <div className="flex items-center gap-x-3">
                      <CircleDollarSign size={20} className="w-5 h-5 shrink-0 opacity-50" />
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-base-content/50">{t("menu:gameCurrency")}</span>
                        <span className="text-xs font-semibold">
                          {getSymbolFromCurrency(displayCurrency || "")} {displayCurrency || "USD"}
                        </span>
                      </div>
                    </div>
                    <div
                      className="flex items-center justify-center btn-square btn-xs rounded-lg bg-primary text-primary-content">
                      <ChevronDown size={16} />
                    </div>
                  </button>

                  {isThemeSwitcherEnabled && (
                    <button className="flex items-center justify-between bg-base-200 btn btn-md md:btn-lg w-full"
                            onClick={openThemeSwitcherModal }>
                      <div className="flex items-center gap-x-3">
                        <SwatchBook size={20} className="w-5 h-5 shrink-0 opacity-50" />
                        <div className="flex flex-col items-start">
                          <span className="text-xs text-base-content/50">主题切换</span>
                          <span className="text-xs font-semibold">
                            {state.currentTheme}
                          </span>
                        </div>
                      </div>
                      <div
                        className="flex items-center justify-center btn-square btn-xs rounded-lg bg-primary text-primary-content">
                        <ChevronDown size={16} />
                      </div>
                    </button>
                  )}
                </m.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between rounded-lg"
                 onClick={() => setSettingsOpen(!isSettingsOpen)}>
              <span className="px-2 text-sm md:text-base font-semibold text-base-content/50">{t("menu:settings")}</span>
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
  )
}
