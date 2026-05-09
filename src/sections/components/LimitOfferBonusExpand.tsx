import { useTranslation } from "react-i18next";
import { useBoundStore } from "@/store";
import { useCurrencyData } from "@/hooks/useCurrency";
import { ICurrentPromoList } from "@/types/double-or-nothing";
import { useTipsModal } from "@/contexts/ModalsProvider.tsx";
import { InnerBonusParams } from "@/sections/components/InnerComponents.tsx";
import { PromoOptionWrap } from "@/sections/components/PromoOptionWrap.tsx";
import { CountdownTimerThree } from "@/components/ui/CountdownTimer.tsx";
import { limitOfferBonusAmount, limitOfferMinAmount } from "@/sections/components/LimitOfferBonus.tsx";

export const LimitOfferBonusExpand = ({ currentPromo }: { currentPromo: ICurrentPromoList }) => {
  const { t } = useTranslation();

  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();

  const { depositFiat, depositCrypto, depositType } = useBoundStore();

  const { openTipsModal } = useTipsModal();

  return (
    <PromoOptionWrap
      icon={"/images/special-offer/specialOffer.png"}
      title={t("finance:limited_offer")}
      onClick={() => openTipsModal("limitedOffers", currentPromo)}
      countdown={<div className="text-primary font-semibold text-[11px] flex items-center gap-1">
        <div>{t("bonus:expires_in")}</div>
        <CountdownTimerThree expireTime={currentPromo?.expired_at} />
      </div>}
      extraNode={
        <InnerBonusParams className={"text-[12px] !py-1 !px-2"}>
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
      }
    />
  );
};

