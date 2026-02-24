import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useFinanceModal, useTipsModal } from "@/contexts/ModalsProvider.tsx";
import { useRTLContext } from "@/contexts/RTLContext";
import { useDepositBonusConfig } from "@/hooks/api/usePublic.ts";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useBoundStore } from "@/store";
import { cn } from "@/utils/cn.ts";
import clsx from "clsx";
import { TFunction } from "i18next";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { deposit_bonus_static_info } from "@/sections/bonus/deposit-bonus/helper.ts";
import { Alert } from "@/components/icons/Alert.tsx";

const Bonus = ({ cls, t, type }: { cls?: string; t: TFunction; type: "crypto" | "fiat" }) => {
  const { status } = useAuth();

  const { isUserFinanceOpen } = useFinanceModal()

  const { data, isLoading: bonusLoading } = useDepositBonusConfig(isUserFinanceOpen);

  const { depositCrypto, depositFiat } = useBoundStore();

  const bonusPercent = useMemo(() => {
    const usdBonusConfig = data?.data?.find((item: {
      level: number
    }) => item.level - 1 === status?.deposit_bonus_times);
    return usdBonusConfig?.bonus_percent ?? 1;
  }, [data, status]);

  const bonusAmount = useMemo(() => {
    const usdBonusConfig = data?.data?.find((item: {
      level: number
    }) => item.level - 1 === status?.deposit_bonus_times);
    return usdBonusConfig?.max_bonus_amount ?? 0;
  }, [data, status]);

  const { formatCurrency, exchangeRates, convertCurrency, isLoading: currencyLoading } = useCurrencyData();

  const targetCurrency = type === "crypto"
    ? (depositCrypto.currency?.currency || "USDT")
    : (depositFiat.currency?.currency || "USD");

  return (
    <SmallLoading
      loading={bonusLoading || currencyLoading}
      className={clsx(cls, "h-8 !rounded-lg")}
      content={
        <div
          className={cn("p-2 inline-flex items-center text-xs text-center font-semibold bg-primary rounded-lg text-primary-content", cls)}
        >
                    <span className="tracking-tighter">
                        {bonusPercent * 100}% {t("finance:up_to")}{" "}
                      {
                        formatCurrency({
                          currency: targetCurrency,
                          amount: convertCurrency({
                            amount: bonusAmount,
                            fromCurrency: "USDT",
                            toCurrency: targetCurrency,
                            exchangeRates
                          }),
                          showCode: false,
                          showSymbol: true
                        }).formatted
                      }
                    </span>
        </div>
      }
    />
  );
};

const Slogan = ({ cls, t }: { cls?: string; t: TFunction }) => {
  const { status, isLoading } = useAuth();

  const { openTipsModal } = useTipsModal();

  return (
    <div className="flex gap-4 items-center">
      <div className={cls}>
        <SmallLoading
          loading={isLoading}
          content={
            <p className={"whitespace-pre-line"}>
              {(status?.deposit_bonus_times ?? 0) >= 4
                ? deposit_bonus_static_info(t)[4]?.alias
                : deposit_bonus_static_info(t)[(status?.deposit_bonus_times ?? 0)]?.title
              }
            </p>
          }
          className="bg-base-400 min-w-auto mb-1"
        />
      </div>
      <button
        className={"btn btn-square bg-base-200"}
        onClick={() => openTipsModal('depositBonus')}>
        <Alert />
      </button>
    </div>
  );
};

export const BonusCardForH5 = () => {
  const { t } = useTranslation();
  const { isRTL } = useRTLContext();
  const { depositType } = useBoundStore();

  return (
    <div className="w-full h-[138px] rounded-lg relative overflow-hidden border border-primary">
      <div className="absolute inset-0 w-full h-full"
           style={{
             transform: isRTL ? "scaleX(-1)" : "none"
           }}
      >
        <svg className="w-full h-full" viewBox="0 0 375 138" preserveAspectRatio="xMaxYMax meet" fill="none"
             xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_f_23_1347)">
            <ellipse cx="237.234" cy="202" rx="192" ry="179" fill="var(--color-primary)" />
          </g>
          <rect width="131.692" height="417.524"
                transform="matrix(0.803413 0.595422 -0.455574 0.890198 94.2208 23.0442)" fill="var(--color-primary)"
                fillOpacity="0.19" />
          <mask id="path-3-outside-1_23_1347" maskUnits="userSpaceOnUse" x="-45.251" y="32.2906" width="363.902"
                height="528.847" fill="black">
            <rect fill="white" x="-45.251" y="32.2906" width="363.902" height="528.847" />
            <path d="M199.746 55.5121L318.572 143.575L104.947 561L-13.8779 472.937L199.746 55.5121Z" />
          </mask>
          <path d="M199.746 55.5121L318.572 143.575L104.947 561L-13.8779 472.937L199.746 55.5121Z"
                fill="color-mix(in oklch, var(--color-base-400) 20%, transparent)" />
          <path
            d="M-13.8779 472.937L16.7307 495.621L230.355 78.1966L199.746 55.5121L169.138 32.8276L-44.4866 450.252L-13.8779 472.937Z"
            fill="var(--color-primary)" mask="url(#path-3-outside-1_23_1347)" />
          <g filter="url(#filter1_f_23_1347)">
            <circle cx="178.166" cy="40.9316" r="191.932" fill="var(--color-base-400)" />
          </g>
          <defs>
            <filter id="filter0_f_23_1347" x="-116.061" y="-138.295" width="706.591" height="680.591"
                    filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="80.6477" result="effect1_foregroundBlur_23_1347" />
            </filter>
            <filter id="filter1_f_23_1347" x="-175.061" y="-312.295" width="706.454" height="706.454"
                    filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="80.6477" result="effect1_foregroundBlur_23_1347" />
            </filter>
          </defs>
        </svg>
      </div>
      <div className="relative px-4 pt-4">
        {/* 存款次数 */}
        <Slogan cls="text-lg/5 font-bold uppercase" t={t} />
        {/* 存款奖励百分比 */}
        <Bonus cls="mt-4" t={t} type={depositType} />
      </div>
      <img src="/images/finance/bonus.png" alt="" className="w-auto h-[100%] absolute top-[0px]"
           style={{
             [isRTL ? "left" : "right"]: "0px",
             transform: isRTL ? "scaleX(-1)" : "none"
           }} loading='lazy' />

    </div>

  );
};

export const BonusCardForPC = () => {
  const { t } = useTranslation();
  const { depositType } = useBoundStore();
  const { isRTL } = useRTLContext();

  return (
    <div className="w-[208px] h-[244px] rounded-lg relative overflow-hidden border border-primary">
      {/* 主题底纹-start */}
      <div className="absolute inset-0 w-full h-full"
           style={{
             transform: isRTL ? "scaleX(-1)" : "none"
           }}
      >
        <svg width="208" height="244" viewBox="0 0 208 244" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_f_13183_41706)">
            <ellipse cx="237.234" cy="202" rx="192" ry="179" fill="var(--color-primary)" />
          </g>
          <rect width="131.692" height="417.524"
                transform="matrix(0.803413 0.595422 -0.455574 0.890198 94.2227 23.0469)" fill="var(--color-primary)"
                fillOpacity="0.19" />
          <mask id="path-3-outside-1_13183_41706" maskUnits="userSpaceOnUse" x="-45.2512" y="32.2942" width="363.902"
                height="528.847" fill="black">
            <rect fill="white" x="-45.2512" y="32.2942" width="363.902" height="528.847" />
            <path d="M199.746 55.5156L318.571 143.579L104.947 561.004L-13.8781 472.94L199.746 55.5156Z" />
          </mask>
          <path d="M199.746 55.5156L318.571 143.579L104.947 561.004L-13.8781 472.94L199.746 55.5156Z"
                fill="color-mix(in oklch, var(--color-base-400) 19%, transparent)" />
          <path
            d="M-13.8781 472.94L16.7305 495.625L230.355 78.2001L199.746 55.5156L169.137 32.8311L-44.4867 450.256L-13.8781 472.94Z"
            fill="#E7FB78" mask="url(#path-3-outside-1_13183_41706)" />
          <g filter="url(#filter1_f_13183_41706)">
            <circle cx="178.166" cy="40.9316" r="191.932" fill="var(--color-base-400)" />
          </g>
          <defs>
            <filter id="filter0_f_13183_41706" x="-116.061" y="-138.295" width="706.591" height="680.591"
                    filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="80.6477" result="effect1_foregroundBlur_13183_41706" />
            </filter>
            <filter id="filter1_f_13183_41706" x="-175.061" y="-312.295" width="706.454" height="706.45"
                    filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="80.6477" result="effect1_foregroundBlur_13183_41706" />
            </filter>
          </defs>
        </svg>
      </div>

      <div className="relative px-4 pt-4 z-111">
        {/* 存款次数 */}
        <Slogan cls="text-lg/5 font-extrabold uppercase mb-8" t={t} />
        {/* 存款奖励百分比 */}
        <Bonus cls="mt-3" t={t} type={depositType} />
      </div>
      {/* 申请奖励 */}
      {/* <Applied cls="btn-sm z-11" /> */}
      <img src="/images/finance/bonus.png" alt=""
           className="absolute bottom-[0px] w-[175px]"
           style={{
             [isRTL ? "left" : "right"]: "0px",
             transform: isRTL ? "scaleX(-1)" : "none"
           }}
      />
    </div>
  );
};
