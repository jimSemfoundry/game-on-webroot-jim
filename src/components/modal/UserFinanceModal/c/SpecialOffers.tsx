import { useTranslation } from "react-i18next";
import { useGetPromoByPage } from "@/query/promo.tsx";
import { useFinanceModal } from "@/contexts/ModalsProvider.tsx";
import { EveryDayBonus } from "@/sections/components/EveryDayBonus.tsx";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import { LimitOfferBonus } from "@/sections/components/LimitOfferBonus.tsx";
import { DoubleBonus } from "@/sections/components/DoubleBonus.tsx";
import { SPECIAL_OFFER_DEPOSIT_SET } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

export const SpecialOffersH5 = () => {
  const { t } = useTranslation();

  const { isUserFinanceOpen } = useFinanceModal();

  const { currentPromo, total } = useGetPromoByPage(isUserFinanceOpen);

  return <div>
    <div className="flex items-center gap-2 mb-2">
      <p className="text-[12px] font-semibold text-base-content/50">{t("finance:specialOffers")}</p>
      <span
        className="indicator-item badge badge-soft rounded-sm p-0 font-extrabold h-4 w-4 text-[12px]">{total}</span>
    </div>

    <InnerDisplayContent show={currentPromo?.promo_code === "special_offer_don_deposit"}>
      <DoubleBonus currentPromo={currentPromo} />
    </InnerDisplayContent>

    <InnerDisplayContent show={currentPromo?.promo_code === "special_offer_sunday"}>
      <EveryDayBonus currentPromo={currentPromo} />
    </InnerDisplayContent>

    <InnerDisplayContent
      show={SPECIAL_OFFER_DEPOSIT_SET.has(currentPromo?.promo_code)}>
      <LimitOfferBonus currentPromo={currentPromo} />
    </InnerDisplayContent>
  </div>;
};