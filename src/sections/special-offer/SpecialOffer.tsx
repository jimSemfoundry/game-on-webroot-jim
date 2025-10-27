import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

import { CountdownTimerThree } from "@/components/ui/CountdownTimer";

import { authService } from "@/services/authService";

import { useFinanceModal } from "@/contexts/ModalsProvider";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/utils/cn";
import { X } from "lucide-react";
import { useCurrencyData } from "@/hooks/useCurrency";

export const SpecialOffer = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const [currentPromo, setCurrentPromo] = useState<any>(null);
  const { user } = useAuth();
  // const { data: currencies } = useSupportedCurrencies();
  const { openUserFinanceModalWithTab } = useFinanceModal();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();

  // Get the current user's selected currency
  // const currentCurrency = useMemo(() => {
  //   if (!currencies || !user?.currency_fiat) return null;
  //   const found = currencies.find((c) => c.currency === user.currency_fiat);
  //   return found || null;
  // }, [currencies, user?.currency_fiat]);

  useEffect(() => {
    if (user) {
      authService.checkDetailPromo().then((resCheck) => {
        if (resCheck.code === 51005) {
          authService.getCurrentPromo().then((res) => {
            if (res.data) {
              setCurrentPromo(res.data);
              setOpen(true);
            }
          })
        }
      });
    }
  }, []);

  return (
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      className="bg-transparent"
      hideTitle
      closeButtonClassName="hidden"
      position="modal-middle"
    >
      <div className="relative h-[446px] max-w-[351px] pt-[90px] mx-auto">
        <img src="/images/special-offer/specialOffer.png" alt="" className="w-[180px] h-[180px] absolute top-0 left-[50%] translate-x-[-50%] z-[1]" />
        <div className="h-[356px] w-full flex flex-col items-center justify-center rounded-2xl pt-[90px] relative"
          style={{
            background: 'color(display-p3 0.027 0.043 0.063)',
          }}>
          <div
            className={`absolute top-4 right-4`}
            onClick={() => {
              setOpen(false);
            }}
          >
            {/* <div className='bg-base-200 rounded-lg flex items-center justify-center w-6 h-6'>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.916992 0.916626L9.08311 9.08274" stroke="#A6ADBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M0.91689 9.08274L9.08301 0.916626" stroke="#A6ADBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div> */}
            <button
              type="button"
              className={cn("btn btn-sm btn-square absolute top-4 right-5 rtl:left-4 rtl:right-auto")}
              onClick={() => {
                setOpen(false);
              }}
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-2xl font-bold text-white">{t('gameDetail:limitedOffer')}</p>
          <p className="text-base font-semibold test-sm pt-1 text-base-content/80">{t('gameDetail:deposit', {
            value: `${(() => {
              const value = convertCurrency({
                amount: currentPromo?.min_amount || 0,
                fromCurrency: 'USDT',
                toCurrency: user?.currency_fiat || 'USDT',
                exchangeRates: exchangeRates,
              }) || 0;

              return formatCurrency({
                currency: user?.currency_fiat || 'USDT',
                amount: value,
                showCode: false,
                showSymbol: true,
              }).formatted
            })()
              }`
          })
          }</p>
          <p className="text-primary text-2xl font-bold leading-5 pt-4">{t('gameDetail:get', {
            value: `${formatWithConversion(currentPromo?.bonus_amount, "USDT", { showSymbol: true, showCode: false }).formatted}`
          })}</p>
          <p className="text-white font-bold leading-5 pt-6 test-sm">{t('gameDetail:instantCashBonus')} </p>
          <div className="text-base font-semibold test-sm pt-1 text-base-content/80 pt-1 flex items-center justify-center gap-1">
            <p>{t('gameDetail:expires')}</p>
            {CountdownTimerThree({ expireTime: currentPromo?.expired_at })}
            {/* <div className="flex items-center justify-center gap-1 font-semibold">
              <div>
                <span className="countdown ">
                  <span style={{ '--value': cashbackTimeLeft.hours } as React.CSSProperties}></span>
                </span>
                h
              </div>
              <div>
                <span className="countdown ">
                  <span style={{ '--value': cashbackTimeLeft.minutes } as React.CSSProperties}></span>
                </span>
                m
              </div>
              <div>
                <span className="countdown ">
                  <span style={{ '--value': cashbackTimeLeft.seconds } as React.CSSProperties}></span>
                </span>
                s
              </div>
            </div> */}
          </div>
          <button className="btn btn-primary h-12 w-50 mt-[10px]" onClick={() => {
            openUserFinanceModalWithTab("deposit");
          }}
          >{t('gameDetail:depositNow')}</button>
        </div>
      </div>

    </Modal>
  );
};