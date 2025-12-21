import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useTipsModal } from "@/contexts/ModalsProvider.tsx";
import { useDepositBonusConfig } from "@/hooks/api/usePublic.ts";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useBoundStore } from "@/store";
import { cn } from "@/utils/cn.ts";
import classNames from "classnames";
import { TFunction } from "i18next";
import { BadgeAlert } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Applied } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

const Bonus = ({ cls, t, type }: { cls?: string; t: TFunction; type: "crypto" | "fiat" }) => {
  const { status } = useAuth();

  const { data, isLoading: bonusLoading } = useDepositBonusConfig();

  const { depositCrypto, depositFiat } = useBoundStore();

  const bonusPercent = useMemo(() => {
    const usdBonusConfig = data?.data?.find((item: { level: number }) => item.level - 1 === status?.deposit_bonus_times);
    return usdBonusConfig?.bonus_percent ?? 1;
  }, [data, status]);

  const bonusBuff = useMemo(() => {
    switch (status?.deposit_bonus_times) {
      case 0:
        return 20000;
      case 1:
        return 40000;
      case 2:
        return 60000;
      case 3:
        return 100000;
      default:
        return 0;
    }
  }, [status]);

  const { formatCurrency, exchangeRates, convertCurrency, isLoading: currencyLoading } = useCurrencyData();

  const targetCurrency = type === "crypto" 
    ? (depositCrypto.currency?.currency || "USDT") 
    : (depositFiat.currency?.currency || "USD");

  return (
    <SmallLoading
      loading={bonusLoading || currencyLoading}
      className={classNames(cls, "h-8 !rounded-lg")}
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
                  amount: bonusBuff,
                  fromCurrency: "USDT",
                  toCurrency: targetCurrency,
                  exchangeRates,
                }),
                showCode: false,
                showSymbol: true,
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

  const times = useMemo(() => {
    switch (status?.deposit_bonus_times) {
      case 0:
        return t("finance:first");
      case 1:
        return t("finance:second");
      case 2:
        return t("finance:third");
      case 3:
        return t("finance:fourth");
      default:
        return "";
    }
  }, [status]);

  return (
    <div className="flex gap-4 items-center">
      <div className={cls}>
        <SmallLoading
          loading={isLoading}
          content={
            <>
              {times}
              <br />
            </>
          }
          className="bg-base-400 min-w-auto mb-1"
        />
        {t("common.deposit")}
        <br />
        {t("finance:bonus")}
      </div>
      <BadgeAlert strokeWidth={3} className="w-5 h-5 cursor-pointer" onClick={() => openTipsModal("depositBonus")} />
    </div>
  );
};

export const BonusCardForH5 = () => {
  const { t } = useTranslation();

  const { depositType } = useBoundStore();

  return (
    <div className="md:hidden">
      <div className="relative flex justify-between rounded-lg pl-4 pb-4 pt-6 pr-2.5 overflow-hidden">
        {/* 主题底纹-start */}
        <div
          className="absolute"
          style={{
            background:
              "linear-gradient(90deg, transparent 28.45%, color-mix(in oklch, var(--color-base-300), transparent 30%) 99.82%), linear-gradient(270deg, transparent 71.67%, color-mix(in oklch, var(--color-base-300), transparent 10%) 100%), linear-gradient(0deg, transparent 40.33%, color-mix(in oklch, var(--color-base-300), transparent 10%) 85.41%), linear-gradient(180deg, transparent 0%, color-mix(in oklch, var(--color-base-300), transparent 10%) 59.51%)",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
            WebkitTransform: "translateZ(0)",
            transform: "translateZ(0)",
          }}
        />
        {/** Ellipse 5 */}
        <div className="hidden sm:block absolute -left-[100px] top-[405px] w-[479px] h-[98px] bg-primary/80 rounded-full blur-[46px] z-30" />
        {/** Ellipse 4 */}
        <div className="absolute -top-[230px] left-[112px] w-[286px] h-[286px] rounded-full bg-base-300 blur-[38px] z-10 sm:-left-[147px] sm:-top-[359px] sm:w-[600px] sm:h-[600px] sm:blur-[80px]" />
        {/**Ellipse 3 */}
        <div className="absolute top-[50px] left-[153px] w-[286px] h-[166px] rounded-full bg-primary blur-[38px] z-0 sm:-left-[63px] sm:top-[225px] sm:w-[600px] sm:h-[348px] sm:blur-[80px]" />
        {/**Rectangle 2 */}
        <div className="absolute -top-[85px] left-[152px] w-[71px] h-[311px] bg-primary/10 skew-x-[12deg] rotate-[36deg] translate-x-4 sm:translate-x-16 sm:-left-[63px] sm:-top-[57px] sm:w-[148px] sm:h-[652px]" />
        {/**Rectangle 3 */}
        <div className="absolute -top-[60px] left-[218px] w-[110px] h-[350px] skew-x-[12deg] rotate-[36deg] bg-primary/10 border-primary/40 border-l-[18px] translate-x-2 sm:left-[74px] sm:-top-[2px] sm:w-[230px] sm:h-[732px] sm:border-l-[38px]" />
        {/* 主题底纹-end */}

        <div className="z-1">
          {/* 存款次数 */}
          <Slogan cls="text-lg/5 font-bold uppercase" t={t} />
          {/* 存款奖励百分比 */}
          <Bonus cls="mt-4" t={t} type={depositType} />
        </div>
        {/* 申请奖励 */}
        <Applied cls="btn-sm -my-3.5" />
        <img src="/images/finance/gift.png" alt="" className="absolute right-0 bottom-0 w-[120px]" />
      </div>
    </div>
  );
};

export const BonusCardForPC = ({ type }: { type: "crypto" | "fiat" }) => {
  const { t } = useTranslation();
  return (
    <div className="h-[264px] relative flex flex-col justify-between rounded-lg p-4 overflow-hidden">
      {/* 主题底纹-start */}
      <div
        className="absolute"
        style={{
          background:
            "linear-gradient(90deg, transparent 28.45%, color-mix(in oklch, var(--color-base-300), transparent 30%) 99.82%), linear-gradient(270deg, transparent 71.67%, color-mix(in oklch, var(--color-base-300), transparent 10%) 100%), linear-gradient(0deg, transparent 40.33%, color-mix(in oklch, var(--color-base-300), transparent 10%) 85.41%), linear-gradient(180deg, transparent 0%, color-mix(in oklch, var(--color-base-300), transparent 10%) 59.51%)",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
          WebkitTransform: "translateZ(0)",
          transform: "translateZ(0)",
        }}
      />
      {/** Ellipse 5 */}
      <div className="hidden sm:block absolute -left-[100px] top-[405px] w-[479px] h-[98px] bg-primary/80 rounded-full blur-[46px] z-30" />
      {/** Ellipse 4 */}
      <div className="absolute -top-[230px] left-[112px] w-[286px] h-[286px] rounded-full bg-base-300 blur-[38px] z-10 sm:-left-[147px] sm:-top-[359px] sm:w-[600px] sm:h-[600px] sm:blur-[80px]" />
      {/**Ellipse 3 */}
      <div className="absolute top-[50px] left-[153px] w-[286px] h-[166px] rounded-full bg-primary blur-[38px] z-0 sm:-left-[63px] sm:top-[225px] sm:w-[600px] sm:h-[348px] sm:blur-[80px]" />
      {/**Rectangle 2 */}
      <div className="absolute -top-[85px] left-[152px] w-[71px] h-[311px] bg-primary/10 skew-x-[12deg] rotate-[36deg] translate-x-4 sm:translate-x-16 sm:-left-[63px] sm:-top-[57px] sm:w-[148px] sm:h-[652px]" />
      {/**Rectangle 3 */}
      <div className="absolute -top-[60px] left-[218px] w-[110px] h-[350px] skew-x-[12deg] rotate-[36deg] bg-primary/10 border-primary/40 border-l-[18px] translate-x-2 sm:left-[74px] sm:-top-[2px] sm:w-[230px] sm:h-[732px] sm:border-l-[38px]" />
      {/* 主题底纹-end */}

      <div className="z-11">
        {/* 存款次数 */}
        <Slogan cls="text-lg/5 font-extrabold uppercase" t={t} />
        {/* 存款奖励百分比 */}
        <Bonus cls="mt-3" t={t} type={type} />
      </div>
      {/* 申请奖励 */}
      <Applied cls="btn-sm z-11" />
      <img src="/images/finance/gift-big.png" alt="" className="z-10 absolute right-0 bottom-0" />
    </div>
  );
};
