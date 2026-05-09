import { useTranslation } from "react-i18next";
import { useBoundStore } from "@/store";
import { useCurrencyData } from "@/hooks/useCurrency";
import { ICurrentPromoList } from "@/types/double-or-nothing";
import { useModals, useTipsModal } from "@/contexts/ModalsProvider.tsx";
import { PromoOptionEntry } from "@/sections/components/PromoOptionEntry.tsx";
import { InnerBonusParams } from "@/sections/components/InnerComponents.tsx";

export const everyDayBonusText = (
  {
    bonus_rate
  }: any) => {
  const rate = Number(bonus_rate ?? 0);
  return (Number.isFinite(rate) ? rate : 0) * 100;
};

export const everyDayAmountText = (
  {
    currentPromo,
    depositType,
    depositFiat,
    depositCrypto,
    exchangeRates,
    convertCurrency,
    formatCurrency
  }: any) => {
  const rawRate = Number(currentPromo?.bonus_rate ?? 0);
  const rate = Number.isFinite(rawRate) ? rawRate : 0;

  const currency = depositType === "fiat" ? depositFiat?.currency?.currency : depositCrypto?.currency?.currency;
  const decimals = depositType === "fiat" ? depositFiat?.currency?.display_decimal : depositCrypto?.currency?.display_decimal;

  const value =
    convertCurrency({
      amount: currentPromo?.max_deposit,
      fromCurrency: "USDT",
      toCurrency: currency,
      exchangeRates,
      decimals
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
    currency,
    showSymbol: true,
    showCode: false
  }).formatted;
};

export const EveryDayBonus = ({ currentPromo }: { currentPromo: ICurrentPromoList }) => {
  const { t } = useTranslation();

  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();

  const { depositFiat, depositCrypto, depositType } = useBoundStore();

  const { openTipsModal } = useTipsModal();

  const { openSpecialOffersModal } = useModals();

  const _currentPromo = {
    ...currentPromo,
    bonus_rate: depositType === "fiat" ? currentPromo?.fiat_bonus_rate : currentPromo?.crypto_bonus_rate
  };

  return (
    <PromoOptionEntry
      title={t("bonus:super_sunday")}
      onClick={() => openTipsModal("sundaySuperBonus", _currentPromo)}
      onExpand={openSpecialOffersModal}
      extraNode={<>
        <InnerBonusParams>
          {t("bonus:cash_bonus_low",
            {
              value: everyDayBonusText({
                bonus_rate: _currentPromo?.bonus_rate
              })
            })}
        </InnerBonusParams>
        <InnerBonusParams>
          {t("casino:upTo")} {
          everyDayAmountText({
            currentPromo: _currentPromo,
            depositType,
            depositFiat,
            depositCrypto,
            exchangeRates,
            convertCurrency,
            formatCurrency
          })
        }
        </InnerBonusParams>
        <InnerBonusParams>1X</InnerBonusParams>
      </>}
    />
  );
};

