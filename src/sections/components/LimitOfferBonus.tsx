import { useTranslation } from "react-i18next";
import { useBoundStore } from "@/store";
import { useCurrencyData } from "@/hooks/useCurrency";
import { ICurrentPromoList } from "@/types/double-or-nothing";
import { useModals, useTipsModal } from "@/contexts/ModalsProvider.tsx";
import { PromoOptionEntry } from "@/sections/components/PromoOptionEntry.tsx";
import { InnerBonusParams } from "@/sections/components/InnerComponents.tsx";
import { CountdownTimerThree } from "@/components/ui/CountdownTimer.tsx";

export const limitOfferMinAmount = (
  currentPromo: ICurrentPromoList,
  depositType: string,
  depositFiat: any,
  depositCrypto: any,
  convertCurrency: any,
  exchangeRates: any,
  formatCurrency: any
) => {
  const currency = depositType === "fiat" ? depositFiat?.currency?.currency : depositCrypto?.currency?.currency;
  const decimals = depositType === "fiat" ? depositFiat?.currency?.display_decimal : depositCrypto?.currency?.display_decimal;

  const value =
    convertCurrency({
      amount: currentPromo?.min_amount,
      fromCurrency: "USDT",
      toCurrency: currency,
      exchangeRates: exchangeRates,
      decimals
    }) || 0;

  const valueNum = depositType === "fiat" ? Math.ceil(value) : value;

  return formatCurrency({
    amount: valueNum,
    currency,
    showSymbol: true,
    showCode: false
  }).formatted;
};

export const limitOfferBonusAmount = (
  currentPromo: ICurrentPromoList,
  depositType: string,
  depositFiat: any,
  depositCrypto: any,
  convertCurrency: any,
  exchangeRates: any,
  formatCurrency: any
) => {
  const currency = depositType === "fiat" ? depositFiat?.currency?.currency : depositCrypto?.currency?.currency;
  const decimals = depositType === "fiat" ? depositFiat?.currency?.display_decimal : depositCrypto?.currency?.display_decimal;

  const value =
    convertCurrency({
      amount: currentPromo?.bonus_amount,
      fromCurrency: "USDT",
      toCurrency: currency,
      exchangeRates: exchangeRates,
      decimals
    }) || 0;

  return formatCurrency({
    currency,
    amount: value,
    showCode: false,
    showSymbol: true
  }).formatted;
};

export const LimitOfferBonus = ({ currentPromo }: { currentPromo: ICurrentPromoList }) => {
  const { t } = useTranslation();

  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();

  const { depositFiat, depositCrypto, depositType } = useBoundStore();

  const { openTipsModal } = useTipsModal();

  const { openSpecialOffersModal } = useModals();

  return (
    <PromoOptionEntry
      title={t("finance:limited_offer")}
      onClick={() => openTipsModal("limitedOffers", currentPromo)}
      onExpand={openSpecialOffersModal}
      countdown={<div className="text-primary font-semibold text-[11px] flex items-center gap-1">
        <div>{t("bonus:expires_in")}</div>
        <CountdownTimerThree expireTime={currentPromo?.expired_at} />
      </div>}
      extraNode={<>
        <InnerBonusParams>
          {t("finance:deposit_plus_cash_bonus",
            {
              amount: limitOfferMinAmount(
                currentPromo,
                depositType,
                depositFiat,
                depositCrypto,
                convertCurrency,
                exchangeRates,
                formatCurrency
              ),
              cash_bonus: limitOfferBonusAmount(
                currentPromo,
                depositType,
                depositFiat,
                depositCrypto,
                convertCurrency,
                exchangeRates,
                formatCurrency
              )
            })}
        </InnerBonusParams>
      </>}
    />
  );
};

