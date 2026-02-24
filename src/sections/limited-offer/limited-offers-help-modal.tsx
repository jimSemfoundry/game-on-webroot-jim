
import { useMemo } from 'react';
import { Modal } from "@/components/ui/Modal";
import { Trans, useTranslation } from 'react-i18next';
import { useRTLContext } from "@/contexts/RTLContext";
import { ICurrentPromoList } from "@/types/double-or-nothing";
import { useCurrencyData } from "@/hooks/useCurrency";
import { useBoundStore } from "@/store";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { CountdownTimerThree } from "@/components/ui/CountdownTimer";



// SVG Components
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.91406 2.91406L11.0802 11.0802" stroke="#EBEBEB" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.91591 11.0802L11.082 2.91406" stroke="#EBEBEB" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BonusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.56369 1.16406C4.10298 1.16646 2.82982 1.21048 2.0221 2.0182C1.21439 2.82591 1.17037 4.09908 1.16797 6.55978H4.03419C3.82946 6.30405 3.67648 6.0024 3.59307 5.66873C3.27909 4.4128 4.4167 3.27518 5.67263 3.58916C6.00631 3.67258 6.30795 3.82555 6.56369 4.03028V1.16406Z" fill="#C4E02C" />
    <path d="M1.16797 7.4375C1.17037 9.89817 1.21439 11.1713 2.0221 11.979C2.82982 12.7867 4.10298 12.8308 6.56369 12.8332V8.23877C6.10886 9.14719 5.16952 9.77083 4.0845 9.77083C3.84287 9.77083 3.647 9.57495 3.647 9.33333C3.647 9.09172 3.84287 8.89583 4.0845 8.89583C4.98096 8.89583 5.7321 8.27359 5.9296 7.4375H1.16797Z" fill="#C4E02C" />
    <path d="M7.4375 12.8332C9.89817 12.8308 11.1713 12.7867 11.979 11.979C12.7867 11.1713 12.8308 9.89817 12.8332 7.4375H8.07153C8.26904 8.27359 9.0202 8.89583 9.91667 8.89583C10.1583 8.89583 10.3542 9.09172 10.3542 9.33333C10.3542 9.57495 10.1583 9.77083 9.91667 9.77083C8.83161 9.77083 7.89227 9.14719 7.4375 8.23877V12.8332Z" fill="#C4E02C" />
    <path d="M12.8332 6.55978C12.8308 4.09908 12.7867 2.82591 11.979 2.0182C11.1713 1.21048 9.89817 1.16646 7.4375 1.16406V4.03028C7.69323 3.82555 7.99488 3.67258 8.32848 3.58916C9.58446 3.27518 10.7221 4.4128 10.4081 5.66873C10.3246 6.0024 10.1717 6.30405 9.96695 6.55978H12.8332Z" fill="#C4E02C" />
    <path d="M5.45837 4.4399C6.10677 4.602 6.56165 5.18458 6.56165 5.8529V6.56165H5.8529C5.18458 6.56165 4.602 6.10677 4.4399 5.45837C4.28613 4.84328 4.84328 4.28613 5.45837 4.4399Z" fill="#C4E02C" />
    <path d="M7.4375 5.8529V6.56165H8.14619C8.81452 6.56165 9.39709 6.10677 9.5592 5.45837C9.71297 4.84328 9.15582 4.28613 8.54076 4.4399C7.89233 4.602 7.4375 5.18458 7.4375 5.8529Z" fill="#C4E02C" />
  </svg>
);

const BackgroundSVG = () => (
  <svg className="w-full h-full" viewBox="0 0 375 138" preserveAspectRatio="xMaxYMax meet" fill="none" xmlns="http://www.w3.org/2000/svg">
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
);

interface LimitedOffersHelpModalProps {
  currentPromo: ICurrentPromoList;
  open: boolean;
  onClose: () => void;
}

export const LimitedOffersHelpModal = ({ currentPromo, open, onClose }: LimitedOffersHelpModalProps) => {
  const { t } = useTranslation('popup');
  const { isRTL } = useRTLContext();
  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();
  const { depositFiat, depositCrypto, depositType } = useBoundStore();
  const { selectedCurrency } = useDisplayCurrencyFormatter();

  // Memoize currency calculations
  const currentCurrency = useMemo(
    () => depositType === 'fiat' ? depositFiat?.currency?.currency : depositCrypto?.currency?.currency,
    [depositType, depositFiat?.currency?.currency, depositCrypto?.currency?.currency]
  );

  const formattedMinAmount = useMemo(() => {
    const value = convertCurrency({
      amount: currentPromo?.min_amount,
      fromCurrency: 'USDT',
      toCurrency:
        depositType === "fiat"
          ? depositFiat?.currency?.currency
          : depositCrypto?.currency?.currency,
      exchangeRates: exchangeRates,
    }) || 0;

    const valueNum = depositType === "fiat" ? Math.ceil(value) : value;

    return formatCurrency({
      amount: valueNum,
      currency: depositType === "fiat" ? depositFiat?.currency?.currency : depositCrypto?.currency?.currency,
      showSymbol: true,
      showCode: false,
    }).formatted;
  }, [currentPromo?.min_amount, depositType, depositFiat?.currency?.currency, depositCrypto?.currency?.currency, convertCurrency, formatCurrency]);

  const formattedBonusAmount = useMemo(() => {
    const value = convertCurrency({
      amount: currentPromo?.bonus_amount,
      fromCurrency: 'USDT',
      toCurrency: currentCurrency,
      exchangeRates: exchangeRates,
    }) || 0;

    return formatCurrency({
      currency: currentCurrency,
      amount: value,
      showCode: false,
      showSymbol: true,
    }).formatted;
  }, [currentPromo?.bonus_amount, currentCurrency, convertCurrency, exchangeRates, formatCurrency]);

  return (
    <Modal
      hideTitle
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
      zIndex={1006}
      className="bg-transparent md:w-[500px] max-w-lg p-0"
    >
      <div className="flex flex-col gap-1">
        {/* 上方带渐变的独立卡片 */}
        <div className="rounded-box text-center relative overflow-hidden h-[138px] flex items-center">
          <div className="relative z-10 flex items-center h-full justify-between w-full">
            <div className="w-full h-full rounded-lg relative overflow-hidden bg-base-400">
              <div
                className="absolute inset-0 w-full h-full"
                style={{ transform: isRTL ? "scaleX(-1)" : "none" }}
              >
                <BackgroundSVG />
              </div>
              <div className="relative px-4 pt-4">
                <div className="flex flex-col justify-start items-start relative z-10 gap-3">
                  <p className="text-lg text-base text-white font-bold whitespace-pre-line leading-5 text-left">
                    {t('bonus:recovery_bonus_title')}
                  </p>
                  <button className="btn btn-primary min-w-[151px] h-[38px] p-2 my-1 whitespace-pre-line text-left leading-4 font-bold text-[14px]">
                    {t('popup:cash_bonus_btn', { value: '' })}
                  </button>
                </div>
                <img
                  src="/images/special-offer/specialOffer.png"
                  alt="Recovery Bonus"
                  className="w-[152px] h-[152px] absolute top-[1px]"
                  style={{
                    [isRTL ? "left" : "right"]: "-7px",
                    transform: isRTL ? "scaleX(-1)" : "none",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 下方独立的主卡片 - 包含close按钮 */}
        <div className="bg-base-400 rounded-box relative" style={{ background: 'rgba(7, 11, 16, 1)' }}>
          {/* Close按钮 - 位于右上角 */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rtl:left-4 rtl:right-auto btn btn-square btn-sm bg-base-300 hover:bg-base-200 border-0"
            aria-label="Close"
          >
            <CloseIcon />
          </button>

          <div className="flex flex-col gap-4 px-4 pt-5">
            {/* Bonus Details 标题 */}
            <div className="flex items-center gap-2">
              <BonusIcon />
              <h3 className="text-base font-bold text-white">{t('popup:offer_details')}</h3>
            </div>

            <div className="max-h-[400px] overflow-y-auto pb-12 flex flex-col gap-4">
              {/* 描述文本 */}
              {/*<p className="text-xs text-base-content/50 leading-5">*/}
              {/*  <Trans*/}
              {/*    i18nKey={'popup:doubleOrNothing.offer_details_desc'}*/}
              {/*    components={[<span className="text-primary" />]}*/}
              {/*    values={{*/}
              {/*      value: '15%',*/}
              {/*      amount: formattedMinAmount,*/}
              {/*      cash_bonus: formattedBonusAmount,*/}
              {/*    }}*/}
              {/*  />*/}

              {/*</p>*/}
              <div className="flex gap-2.5 justify-between">
                <div className="py-3 bg-base-300 rounded-field px-4 flex-1">
                  <p className="text-xs text-base-content/50 mb-1 font-semibold">{t('bonus:deposit')}</p>
                  <p className="text-lg font-bold text-primary">{formattedMinAmount}</p>
                </div>
                <div className="py-3 bg-base-300 rounded-field px-4 flex-1">
                  <p className="text-xs text-base-content/50 mb-1 font-semibold">
                    {t('popup:doubleOrNothing.cash_bonus')}
                  </p>
                  <p className="text-lg font-bold text-primary">{formattedBonusAmount}</p>
                </div>
              </div>
              {/* Release Frequency 区块 */}
              <div className="py-3 bg-base-300 rounded-field px-4">
                <p className="text-xs text-base-content/50 mb-1 font-semibold">{t('popup:offer_expiry')}</p>
                <div className="text-lg font-bold text-primary inline-flex">
                  <CountdownTimerThree expireTime={currentPromo?.expired_at} />
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm text-white">{t("popup:claim_distribution")}</p>
                <p className="mt-3 text-base-content/50 text-xs leading-5">
                  <Trans
                    i18nKey={'popup:doubleOrNothing.claim_distribution_desc'}
                    components={[<span className="text-primary" />]}
                    values={{
                      currency: selectedCurrency
                    }}
                  />
                </p>
              </div>
              <div>
                <p className="font-semibold text-sm text-white">{t("popup:generalTerms")}</p>
                <p className="mt-3 text-base-content/50 text-xs leading-5 whitespace-pre-line">
                  {t("popup:doubleOrNothing.generalTerms_description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
