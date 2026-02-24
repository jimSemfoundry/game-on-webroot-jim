import Iconify from "@/components/iconify";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { useSupportedLanguages } from "@/hooks/api/usePublic";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguageModal, useWalletModal } from "@/contexts/ModalsProvider";
import { getIconDirection } from "@/utils/rtl";
import { useRTLContext } from "@/contexts/RTLContext";
import { cn } from "@/utils/themeMerger";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { useNavigate } from "@tanstack/react-router";
import { Card } from "@/sections/profile/c/Card.tsx";
import { isTelegramWebApp } from "@/utils/telegramWebApp";

export function SettingsBox() {
  const { t, i18n } = useTranslation(['profile', 'common']);
  const { openModal: openLanguageModal } = useLanguageModal()
  const { openModal: openWalletModal } = useWalletModal()
  const { user, logout } = useAuth()
  const { selectedCurrency } = useDisplayCurrency()
  const displayCurrency = user?.currency_fiat || selectedCurrency
  const { isRTL } = useRTLContext();
  const navigate = useNavigate();
  const { data: languages } = useSupportedLanguages();
  
  const currentLanguageLabel = languages?.find((lang: any) => 
    lang.value?.toLowerCase() === i18n.language?.toLowerCase()
  )?.label || i18n.language;

  return (
    <Card className="sm:max-w-[335px]" title={t("common:common.settings")} icon={<Iconify icon='custom:settings' className='text-primary' />}>
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-semibold sm:text-base">{t('menu:gameCurrency')}</h4>
        <button className="btn btn-md flex h-12 w-full items-center justify-between bg-base-300 " onClick={openWalletModal}>
          <div className='flex items-center gap-2'>
            <CurrencyIcon currency={displayCurrency || 'USD'} className="w-5 h-5 shrink-0" />
            <span className="text-xs font-semibold sm:text-base text-base-content/50">
              {displayCurrency || 'USD'}
            </span>
          </div>
          <ChevronDown className={cn("w-4 h-4", getIconDirection(isRTL, false))} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-semibold sm:text-base">{t("profile:systemLanguage")}</h4>
        <button className="btn btn-md flex h-12 w-full items-center justify-between bg-base-300" onClick={openLanguageModal}>
          <div className='flex items-center gap-2'>
            <span className="text-xs font-semibold sm:text-base text-base-content/50">
              {currentLanguageLabel}
            </span>
          </div>
          <ChevronDown className={cn("w-4 h-4", getIconDirection(isRTL, false))} />
        </button>
      </div>

      {/* <div className="flex gap-4 h-12 px-4 w-full items-center justify-between bg-base-300 rounded-field">
        <h4 className="text-xs font-semibold sm:text-base text-base-content/50 leading-8">Theme</h4>
        <div className="flex items-center gap-2">
          <input type="checkbox" className="toggle toggle-primary" />
          <span className="text-sm text-base-content/50">
            NIGHT
          </span>
        </div>
      </div> */}

      {!isTelegramWebApp() && (
        <button className="btn btn-md btn-soft h-10 w-full" onClick={async () => {
          await logout();
          void navigate({ to: "/casino", search: { openLogin: undefined, openSignUp: undefined, redirect: undefined, startapp: undefined, openFinance: undefined } });
        }}>
          {t("common:logout")}
          <Iconify icon="custom:logout" className="w-4 h-4" />
        </button>
      )}
    </Card>
  )
}
