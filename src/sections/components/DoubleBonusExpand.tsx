import { useTranslation } from "react-i18next";
import { useBoundStore } from "@/store";
import { useCurrencyData } from "@/hooks/useCurrency";
import { ICurrentPromoList } from "@/types/double-or-nothing";
import { useTipsModal } from "@/contexts/ModalsProvider.tsx";
import { InnerBonusParams } from "@/sections/components/InnerComponents.tsx";
import { PromoOptionWrap } from "@/sections/components/PromoOptionWrap.tsx";
import { CountdownTimerThree } from "@/components/ui/CountdownTimer.tsx";
import { doubleAmountText, doubleBonusText } from "@/sections/components/DoubleBonus.tsx";

export const DoubleBonusExpand = ({ currentPromo }: { currentPromo: ICurrentPromoList }) => {
  const { t } = useTranslation();

  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();

  const { depositFiat, depositCrypto, depositType } = useBoundStore();

  const { openTipsModal } = useTipsModal();

  return (
    <PromoOptionWrap
      icon={"/images/double-nothing/recoveryBonus.png"}
      title={t("bonus:recovery_bonus_title")}
      onClick={() => openTipsModal("doubleOrNothing", currentPromo)}
      countdown={<div className="text-primary font-semibold text-[11px] flex items-center gap-1">
        <div>{t("bonus:expires_in")}</div>
        <CountdownTimerThree expireTime={currentPromo?.expired_at} />
      </div>}
      extraNode={
        <InnerBonusParams className={"text-[12px] !py-1 !px-2"}>
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
      }
    />
  );
};

