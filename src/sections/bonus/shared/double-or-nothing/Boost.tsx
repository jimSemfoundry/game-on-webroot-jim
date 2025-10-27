import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "react-i18next";
import { CountdownTimerThree } from "@/components/ui/CountdownTimer";
import { useState, forwardRef, useImperativeHandle } from "react";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";

import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { ICurrentPromo } from "@/types/double-or-nothing";
import { useFinanceModal } from "@/contexts/ModalsProvider";
import { useCurrencyData } from "@/hooks/useCurrency";

export interface BoostRef {
  checkDonPromoHandler: (don_record_id: string) => Promise<void>;
}

export const Boost = forwardRef<BoostRef>((_, ref) => {

  const [open, setOpen] = useState(false);
  const { openUserFinanceModalWithTab } = useFinanceModal();
  const { t } = useTranslation();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const [donPromo, setDonPromo] = useState<ICurrentPromo | null>(null);
  const { user } = useAuth();

  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();
  // Get the current user's selected currency
  // const currentCurrency = useMemo(() => {
  //   if (!currencies || !user?.currency_fiat) return null;
  //   const found = currencies.find((c) => c.currency === user.currency_fiat);
  //   return found || null;
  // }, [currencies, user?.currency_fiat]);

  const checkDonPromoHandler = async (don_record_id: string) => {
    if (user) {
      authService.checkDonPromo(don_record_id).then((resCheck) => {
        if (resCheck.code === 51005) {
          authService.getCurrentPromo().then((res) => {
            if (res.data) {
              setDonPromo(res.data);
              setOpen(true);
            }
          })
        }
      });
    }
  }

  useImperativeHandle(ref, () => {
    return {
      checkDonPromoHandler
    }
  });

  return (
    <Modal
      isOpen={open}
      closeButtonClassName="hidden"
      hideTitle
      onClose={() => setOpen(false)}
      style={{
        background: 'transparent',
        padding: '0',
      }}>
      <div className="relative h-[492px] max-w-[351px] pt-[136px] mx-auto">
        <img src="/images/double-nothing/nothing.png" alt="" className="w-full object-cover absolute top-0 left-[50%] translate-x-[-50%] z-[1] pointer-events-none" />
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
            <div className='bg-base-200 rounded-lg flex items-center justify-center w-6 h-6'>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.916992 0.916626L9.08311 9.08274" stroke="#A6ADBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M0.91689 9.08274L9.08301 0.916626" stroke="#A6ADBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white leading-8">{t('bonus:recovery_bonus')}</p>
          <p className="text-base font-semibold test-sm text-base-content/80 leading-5">{t('bonus:boost_your_balance')}</p>
          <div className="text-primary text-2xl leading-6 font-bold mt-4 mb-5">
            {t('gameDetail:get', {
              value: `${formatWithConversion(donPromo?.bonus_amount || 0, user?.currency_fiat || 'USDT', {
                showSymbol: true,
                showCode: true,
                minimizeDecimals: true,
              }).formatted}`
            })}
          </div>
          <p className="text-white font-semibold leading-5 test-sm ">
            {t('bonus:if_you_deposit_of_or_more', {
              amount: `${(() => {
                const value = convertCurrency({
                  amount: donPromo?.min_amount || 0,
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
            })}
          </p>
          <div className="text-base font-semibold test-sm pt-1 text-base-content/80 pt-1 flex items-center justify-center gap-1">
            <p>{t('gameDetail:expires')}</p>
            {CountdownTimerThree({ expireTime: donPromo?.expired_at || 0 })}
          </div>
          <button className="btn btn-primary h-12 w-50 mt-[10px]"
            onClick={() => {
              setOpen(false)
              openUserFinanceModalWithTab("deposit")
            }
            }>{t('bonus:continue')}</button>
        </div>
      </div>
    </Modal>
  );
});