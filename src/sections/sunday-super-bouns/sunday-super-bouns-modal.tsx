
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CountdownTimerThree } from "@/components/ui/CountdownTimer";
import { useFinanceModal } from "@/contexts/ModalsProvider";


export const SundaySuperBounsModal = () => {

  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  const [currentPromo] = useState<any>(null);
  const { openUserFinanceModalWithTab } = useFinanceModal();


  // useEffect(() => {
  //   if (user) {
  //     checkDetailPromo().then((resCheck) => {
  //       if (resCheck.code === 51005) {
  //         getCurrentPromo().then((res) => {
  //           if (res.data) {
  //             setCurrentPromo(res.data);
  //             setOpen(true);
  //           }
  //         })
  //       }
  //     });
  //   }
  // }, []);

  return (
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      style={{
        background: 'transparent',
      }}>
      <div className="relative h-[446px] max-w-[351px] pt-[90px]">
        <img src="/images/special-offer/superBonus.png" alt="" className="w-[214px] h-[180px] absolute top-0 left-[50%] translate-x-[-50%] z-[1]" />
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
          <p className="text-2xl font-bold text-white">{t('finance:super_sunday_title')}</p>
          <p className="text-base font-semibold test-sm pt-1 text-base-content/80">{t('finance:first_deposit_of_the_day')}</p>
          <p className="text-primary text-2xl font-bold leading-5 pt-4">+ 8% {t('finance:cash_bonus')}</p>
          {/* <p className="text-base font-semibold test-sm pt-1 text-base-content/80">{t('gameDetail:deposit', {
            value: `${(() => {
              const value = convertCurrency(currentPromo?.min_amount, {
                sourceCurrency: 'USDT',
                targetCurrency: user?.currency_fiat || 'USDT',
              }) || '0';

              const valueArray = value.toString().split(' ');

              const valueNum = valueArray[1] ? Math.ceil(parseFloat(valueArray[1].toString().replace(/,/g, ''))) : '';

              return currentCurrency?.currency_type === 'FIAT' ? valueArray[0] + ' ' + valueNum : value;
            })()
              }`
          })
          }</p>
          <p className="text-primary text-2xl font-bold leading-5 pt-4">{t('gameDetail:get', {
            value: `${convertCurrency(currentPromo?.bonus_amount, {
              sourceCurrency: 'USDT',
              targetCurrency: user?.currency_fiat === 'USD' ? 'USDT' : user?.currency_fiat || 'USDT'
            })}`
          })}</p> */}
          <p className="text-white pt-6 text-base test-sm">{t('finance:up_to')} ₱570.18</p>
          <div className="text-base font-semibold test-sm text-base-content/80 flex items-center justify-center gap-1">
            <p>{t('gameDetail:expires')}</p>
            {CountdownTimerThree({ expireTime: currentPromo?.expired_at })}
          </div>
          <button className="btn btn-primary h-12 w-50 mt-[10px]"
            onClick={() => {
              openUserFinanceModalWithTab(`deposit`)
            }}
            >{t('gameDetail:depositNow')}</button>
        </div>
      </div>

    </Modal>
  );
};