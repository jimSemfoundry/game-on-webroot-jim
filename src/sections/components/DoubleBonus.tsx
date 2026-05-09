import { useTranslation } from "react-i18next";
import { useBoundStore } from "@/store";
import { useCurrencyData } from "@/hooks/useCurrency";
import { ICurrentPromoList } from "@/types/double-or-nothing";
import { useModals, useTipsModal } from "@/contexts/ModalsProvider.tsx";
import { PromoOptionEntry } from "@/sections/components/PromoOptionEntry.tsx";
import { InnerBonusParams } from "@/sections/components/InnerComponents.tsx";
import { CountdownTimerThree } from "@/components/ui/CountdownTimer.tsx";

export const doubleAmountText = (
  {
    amount,
    depositType,
    depositFiat,
    depositCrypto,
    exchangeRates,
    convertCurrency,
    formatCurrency
  }: any) => {
  const currency = depositType === "fiat" ? depositFiat?.currency?.currency : depositCrypto?.currency?.currency;
  const decimals = depositType === "fiat" ? depositFiat?.currency?.display_decimal : depositCrypto?.currency?.display_decimal;

  const value =
    convertCurrency({
      amount,
      fromCurrency: "USDT",
      toCurrency: currency,
      exchangeRates,
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

export  const doubleBonusText = ({
                            amount,
                            depositType,
                            depositFiat,
                            depositCrypto,
                            exchangeRates,
                            convertCurrency,
                            formatCurrency
                          }: any) => {
  const value =
    convertCurrency({
      amount,
      fromCurrency: "USDT",
      toCurrency:
        depositType === "fiat"
          ? depositFiat?.currency?.currency
          : depositCrypto?.currency?.currency,
      exchangeRates
    }) || 0;

  return formatCurrency({
    currency:
      depositType === "fiat"
        ? depositFiat?.currency?.currency
        : depositCrypto?.currency?.currency,
    amount: value,
    showCode: false,
    showSymbol: true
  }).formatted;
};

export const DoubleBonus = ({ currentPromo }: { currentPromo: ICurrentPromoList }) => {
  const { t } = useTranslation();

  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();

  const { depositFiat, depositCrypto, depositType } = useBoundStore();

  const { openTipsModal } = useTipsModal();

  const { openSpecialOffersModal } = useModals();

  return (
    <PromoOptionEntry
      title={t("bonus:recovery_bonus_title")}
      onClick={() => openTipsModal("doubleOrNothing", currentPromo)}
      onExpand={openSpecialOffersModal}
      countdown={<div className="text-primary font-semibold text-[11px] flex items-center gap-1">
        <div>{t("bonus:expires_in")}</div>
        <CountdownTimerThree expireTime={currentPromo?.expired_at} />
      </div>}
      extraNode={<>
        <InnerBonusParams>
          {t("bonus:deposit_get",
            {
              amount: doubleAmountText({
                amount: currentPromo?.min_amount,
                depositType,
                depositFiat,
                depositCrypto,
                exchangeRates,
                convertCurrency,
                formatCurrency
              }),
              cash_bonus: doubleBonusText({
                amount: currentPromo?.bonus_amount,
                depositType,
                depositFiat,
                depositCrypto,
                exchangeRates,
                convertCurrency,
                formatCurrency
              })
            })}
        </InnerBonusParams>
      </>}
    />
  );
};

