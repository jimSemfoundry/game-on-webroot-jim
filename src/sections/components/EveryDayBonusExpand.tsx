import { useTranslation } from "react-i18next";
import { useBoundStore } from "@/store";
import { useCurrencyData } from "@/hooks/useCurrency";
import { ICurrentPromoList } from "@/types/double-or-nothing";
import { useTipsModal } from "@/contexts/ModalsProvider.tsx";
import { InnerBonusParams } from "@/sections/components/InnerComponents.tsx";
import { PromoOptionWrap } from "@/sections/components/PromoOptionWrap.tsx";
import { everyDayAmountText, everyDayBonusText } from "@/sections/components/EveryDayBonus.tsx";

export const EveryDayBonusExpand = ({ currentPromo }: { currentPromo: ICurrentPromoList }) => {
  const { t } = useTranslation();

  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();

  const { depositFiat, depositCrypto, depositType } = useBoundStore();

  const { openTipsModal } = useTipsModal();

  const _currentPromo = {
    ...currentPromo,
    bonus_rate: depositType === "fiat" ? currentPromo?.fiat_bonus_rate : currentPromo?.crypto_bonus_rate
  };

  return (
    <PromoOptionWrap
      icon={"/images/bonus/super-bonus.png"}
      title={t("bonus:super_sunday")}
      onClick={() => openTipsModal("sundaySuperBonus", _currentPromo)}
      extraNode={<>
        <InnerBonusParams className={"text-[12px] !py-1 !px-2"}>
          {t("bonus:cash_bonus_low",
            {
              value: everyDayBonusText({
                bonus_rate: _currentPromo?.bonus_rate
              })
            })}
        </InnerBonusParams>
        <InnerBonusParams className={"text-[12px] !py-1 !px-2"}>
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
        <InnerBonusParams className={"text-[12px] !py-1 !px-2"}>1X</InnerBonusParams>
      </>}
    />
  );
};

