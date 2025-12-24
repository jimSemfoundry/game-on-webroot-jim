import { CountdownTimerThree } from "@/components/ui/CountdownTimer";
import { useTranslation } from "react-i18next";
import { useBoundStore } from "@/store";
import { BadgeAlert } from "lucide-react";
import { useCurrencyData } from "@/hooks/useCurrency";
import { ICurrentPromoList } from "@/types/double-or-nothing";
import { useRTLContext } from "@/contexts/RTLContext";
import { useTipsModal } from "@/contexts/ModalsProvider.tsx";


// const getDepositAmountText = ({
//   amount,
//   depositType,
//   depositFiat,
//   depositCrypto,
//   exchangeRates,
//   convertCurrency,
//   getCurrencySymbol,
//   formatCurrency,
// }: any) => {
//   const value =
//     convertCurrency({
//       amount,
//       fromCurrency: "USDT",
//       toCurrency:
//         depositType === "fiat"
//           ? depositFiat?.currency?.currency
//           : depositCrypto?.currency?.currency,
//       exchangeRates,
//     }) || 0;

//   const valueNum = Math.ceil(value || 0);

//   return depositType === "fiat"
//     ? `${getCurrencySymbol(depositFiat?.currency?.currency)} ${valueNum}`
//     : formatCurrency({
//       amount: value,
//       currency: depositCrypto?.currency?.currency,
//       showSymbol: true,
//     }).formatted;
// };

const getCashBonusText = ({
  bonus_rate,
}: any) => {
  const rate = Number(bonus_rate ?? 0);
  return (Number.isFinite(rate) ? rate : 0) * 100;
};

const getUpToBonusAmountText = ({
  currentPromo,
  depositType,
  depositFiat,
  depositCrypto,
  exchangeRates,
  convertCurrency,
  formatCurrency,
}: any) => {
  const rawRate = Number(currentPromo?.bonus_rate ?? 0);
  const rate = Number.isFinite(rawRate) ? rawRate : 0;
  
  const value =
    convertCurrency({
      amount: currentPromo?.max_deposit,
      fromCurrency: "USDT",
      toCurrency:
        depositType === "fiat"
          ? depositFiat?.currency?.currency
          : depositCrypto?.currency?.currency,
      exchangeRates,
    }) || 0;

  const valueNum = depositType === "fiat" ? Math.ceil(value) : value;
  const amountValue = valueNum * rate;

  // if (Number.isInteger(amountValue)) {
  //   return amountValue.toString();
  // }

  // const amountValueNum = Math.trunc(amountValue * 100) / 100;

  // return depositType === "fiat"
  //   ? `${getCurrencySymbol(depositFiat?.currency?.currency)} ${amountValueNum}`
  //   :
  return formatCurrency({
    amount: amountValue,
    currency: depositType === "fiat" ? depositFiat?.currency?.currency : depositCrypto?.currency?.currency,
    showSymbol: true,
    showCode: false,
  }).formatted;
};

export const SundaySuperBounsBanner = ({ currentPromo }: { currentPromo: ICurrentPromoList }) => {

  const { t } = useTranslation();
  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();
  const { depositFiat, depositCrypto, depositType } = useBoundStore();
  const { isRTL } = useRTLContext();
  const { openTipsModal } = useTipsModal();

  return (
    <div className="w-full h-[138px] rounded-lg relative overflow-hidden ">
      <div className="absolute inset-0 w-full h-full"
        style={{
          transform: isRTL ? "scaleX(-1)" : "none",
        }}
      >
        <svg className='w-full h-full' viewBox="0 0 375 138" preserveAspectRatio="xMaxYMax meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_f_23_1347)">
            <ellipse cx="237.234" cy="202" rx="192" ry="179" fill="var(--color-primary)" />
          </g>
          <rect width="131.692" height="417.524" transform="matrix(0.803413 0.595422 -0.455574 0.890198 94.2208 23.0442)" fill="var(--color-primary)" fillOpacity="0.19" />
          <mask id="path-3-outside-1_23_1347" maskUnits="userSpaceOnUse" x="-45.251" y="32.2906" width="363.902" height="528.847" fill="black">
            <rect fill="white" x="-45.251" y="32.2906" width="363.902" height="528.847" />
            <path d="M199.746 55.5121L318.572 143.575L104.947 561L-13.8779 472.937L199.746 55.5121Z" />
          </mask>
          <path d="M199.746 55.5121L318.572 143.575L104.947 561L-13.8779 472.937L199.746 55.5121Z" fill="color-mix(in oklch, var(--color-base-400) 20%, transparent)" />
          <path d="M-13.8779 472.937L16.7307 495.621L230.355 78.1966L199.746 55.5121L169.138 32.8276L-44.4866 450.252L-13.8779 472.937Z" fill="var(--color-primary)" mask="url(#path-3-outside-1_23_1347)" />
          <g filter="url(#filter1_f_23_1347)">
            <circle cx="178.166" cy="40.9316" r="191.932" fill="var(--color-base-400)" />
          </g>
          <defs>
            <filter id="filter0_f_23_1347" x="-116.061" y="-138.295" width="706.591" height="680.591" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="80.6477" result="effect1_foregroundBlur_23_1347" />
            </filter>
            <filter id="filter1_f_23_1347" x="-175.061" y="-312.295" width="706.454" height="706.454" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="80.6477" result="effect1_foregroundBlur_23_1347" />
            </filter>
          </defs>
        </svg>
      </div>
      <div className="relative px-4 pt-4">
        <div className='flex-inline flex-col justify-center relative z-10'>
          <div className="flex items-center gap-4">
            <p className="text-lg test-base text-white font-bold whitespace-pre-line leading-5">{t('bonus:super_sunday')}</p>
            <BadgeAlert
              strokeWidth={3}
              className="w-5 h-5 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                openTipsModal("sundaySuperBouns", currentPromo);
              }}
            />
          </div>
          {/* <button className="btn btn-primary min-w-[151px] h-[42px] p-2 my-1 whitespace-pre-line text-left leading-4 font-bold text-ml text-[14px]">
            {t('bonus:super_deposit_bonus',
              {
                amount: getDepositAmountText({
                  amount: currentPromo?.max_deposit,
                  depositType,
                  depositFiat,
                  depositCrypto,
                  exchangeRates,
                  convertCurrency,
                  getCurrencySymbol,
                  formatCurrency,
                }),
                bonus_rate: getCashBonusText({
                  bonus_rate: currentPromo?.bonus_rate,
                }),
              })}
          </button> */}
          <button className="btn btn-primary min-w-[151px] h-auto p-1 my-0.5 whitespace-pre-line text-left leading-4 font-bold text-ml text-[14px]">
            {t('bonus:cash_bonus_low',
              {
                value: getCashBonusText({
                  bonus_rate: currentPromo?.bonus_rate,
                }),
              })}
          </button>
          <div className="flex items-center gap-1">
            <button className="btn btn-primary btn-soft p-1.5 text-xs h-auto flex font-bold">
              {t('casino:upTo')} {
                getUpToBonusAmountText({
                  currentPromo,
                  depositType,
                  depositFiat,
                  depositCrypto,
                  exchangeRates,
                  convertCurrency,
                  formatCurrency,
                })
              }
            </button>
            <button className="btn btn-primary btn-soft p-1.5 text-xs h-auto flex font-bold">
              1x
            </button>
          </div>

          <div className='text-primary font-semibold text-sm leading-5 flex items-center gap-1'>
            <div>{t('bonus:expires_in')}</div> <CountdownTimerThree expireTime={currentPromo?.expired_at} />
          </div>
        </div>
        <img src="/images/bonus/super-bonus.png" className='w-[194px] h-[163px] absolute top-[-3px]'
          style={{
            [isRTL ? "left" : "right"]: "-20px",
            transform: isRTL ? "scaleX(-1)" : "none",
          }}
        />
      </div>
    </div>
  );
};

export const SundaySuperBounsBannerPC = ({ currentPromo }: { currentPromo: any }) => {

  const { t } = useTranslation();
  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();
  const { depositFiat, depositCrypto, depositType } = useBoundStore();
  const { isRTL } = useRTLContext();
  return (
    <div className="w-[208px] h-[244px] rounded-lg relative overflow-hidden border border-primary">
      <div className="absolute inset-0 w-full h-full"
        style={{
          transform: isRTL ? "scaleX(-1)" : "none",
        }}
      >
        <svg width="208" height="244" viewBox="0 0 208 244" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_f_13183_41706)">
            <ellipse cx="237.234" cy="202" rx="192" ry="179" fill="var(--color-primary)" />
          </g>
          <rect width="131.692" height="417.524" transform="matrix(0.803413 0.595422 -0.455574 0.890198 94.2227 23.0469)" fill="var(--color-primary)" fillOpacity="0.19" />
          <mask id="path-3-outside-1_13183_41706" maskUnits="userSpaceOnUse" x="-45.2512" y="32.2942" width="363.902" height="528.847" fill="black">
            <rect fill="white" x="-45.2512" y="32.2942" width="363.902" height="528.847" />
            <path d="M199.746 55.5156L318.571 143.579L104.947 561.004L-13.8781 472.94L199.746 55.5156Z" />
          </mask>
          <path d="M199.746 55.5156L318.571 143.579L104.947 561.004L-13.8781 472.94L199.746 55.5156Z" fill="color-mix(in oklch, var(--color-base-400) 19%, transparent)" />
          <path d="M-13.8781 472.94L16.7305 495.625L230.355 78.2001L199.746 55.5156L169.137 32.8311L-44.4867 450.256L-13.8781 472.94Z" fill="#E7FB78" mask="url(#path-3-outside-1_13183_41706)" />
          <g filter="url(#filter1_f_13183_41706)">
            <circle cx="178.166" cy="40.9316" r="191.932" fill="var(--color-base-400)" />
          </g>
          <defs>
            <filter id="filter0_f_13183_41706" x="-116.061" y="-138.295" width="706.591" height="680.591" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="80.6477" result="effect1_foregroundBlur_13183_41706" />
            </filter>
            <filter id="filter1_f_13183_41706" x="-175.061" y="-312.295" width="706.454" height="706.45" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="80.6477" result="effect1_foregroundBlur_13183_41706" />
            </filter>
          </defs>
        </svg>
      </div>
      <img src="/images/bonus/super-bonus-pc.png" className='w-[172px] h-[146px] absolute bottom-[0px]'
        style={{
          [isRTL ? "left" : "right"]: "0px",
          transform: isRTL ? "scaleX(-1)" : "none",
        }}
      />
      <div className="relative p-4">
        <div className='flex-inline flex-col justify-center'>
          <div className="flex items-center gap-4 mb-2">
            <p className="text-lg test-base text-white font-bold whitespace-pre-line leading-5">{t('bonus:super_sunday')}</p>
          </div>
          <div className='text-primary font-semibold text-sm leading-5 flex items-center gap-1 flex-wrap'>
            <div>{t('bonus:expires_in')}</div> <CountdownTimerThree expireTime={currentPromo?.expired_at} />
          </div>
          <div className="flex items-center gap-1 mb-1.5">
            <button className="btn btn-primary btn-soft p-1.5 text-xs h-auto flex font-bold">
              {t('casino:upTo')} {
                getUpToBonusAmountText({
                  currentPromo,
                  depositType,
                  depositFiat,
                  depositCrypto,
                  exchangeRates,
                  convertCurrency,
                  formatCurrency,
                })
              }
            </button>
            <button className="btn btn-primary btn-soft p-1.5 text-xs h-auto flex font-bold">
              1x
            </button>
          </div>
          {/* <button className="btn btn-primary max-w-[155px] p-2 h-auto m-0 my-1 whitespace-pre-line text-left leading-4 font-bold text-ml text-[14px]">
            {t('bonus:super_deposit_bonus',
              {
                amount: getDepositAmountText({
                  amount: currentPromo?.max_deposit,
                  depositType,
                  depositFiat,
                  depositCrypto,
                  exchangeRates,
                  convertCurrency,
                  getCurrencySymbol,
                  formatCurrency,
                }),
                bonus_rate: getCashBonusText({
                  bonus_rate: currentPromo?.bonus_rate
                }),
              })}
          </button> */}
          <button className="btn btn-primary min-w-[151px] h-[32px] p-1 my-0.5 whitespace-pre-line text-left leading-4 font-bold text-ml text-[14px]">
            {t('bonus:cash_bonus_low',
              {
                value: getCashBonusText({
                  bonus_rate: currentPromo?.bonus_rate,
                }),
              })}
          </button>
        </div>
      </div>
    </div>
  )
}
