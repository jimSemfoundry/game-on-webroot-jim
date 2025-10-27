import { BonusCardForH5 } from "@/components/modal/UserFinanceModal/c/BonusCard.tsx"; 
import { DepositFiatForm } from "@/components/modal/UserFinanceModal/c/DepositFiatForm.tsx";
import { DepositFiatSelect } from "@/components/modal/UserFinanceModal/c/DepositFiatSelect.tsx";
import { SecureCard } from "@/components/modal/UserFinanceModal/c/SecureCard.tsx";
import { WarningCard } from "@/components/modal/UserFinanceModal/c/WarningCard.tsx";
import { useCurrentPromo } from "@/query/promo";
import { SpecialOfferBanner } from "@/sections/special-offer/SpecialOfferBanner";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { DoubleOrNothingBanner } from "@/sections/bonus/shared/double-or-nothing/DoubleOrNothingBanner"; 
import { useMediaQuery } from "@/hooks/useMediaQuery";

export const DepositFiat = () => {
  const { t } = useTranslation();
  const { currentPromo, isFetching } = useCurrentPromo();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <div className="flex flex-col gap-4">
      <DepositFiatSelect />

      {
        !isFetching && !currentPromo && <BonusCardForH5 />
      }
      {
        !isFetching && currentPromo?.promo_code && isMobile && currentPromo?.promo_code === 'special_offer_first_deposit' && (
          <SpecialOfferBanner currentPromo={currentPromo}  />
        )
      }
      {
        !isFetching && currentPromo?.promo_code && isMobile && currentPromo?.promo_code === 'special_offer_don_deposit' && (
          <DoubleOrNothingBanner currentPromo={currentPromo} />
        )
      }
      
      {/* 动态表单 */}
      <DepositFiatForm />

      <SecureCard />

      <CustomWarningCard t={t} />
    </div>
  );
};

const CustomWarningCard = ({ t }: { t: TFunction }) => {
  return (
    <WarningCard>
      <ul className="list-decimal text-xs leading-4 text-base-content/50 pl-3">
        <li>{t("finance:ensureThatTheTransferAmountMatchesTheSubmissionAmount")}</li>
        <li>{t("finance:eachOrderIDCanONLYBeUsedOnceToAvoidDuplicates")}</li>
        <li>{t("finance:pleaseFollowTheDepositGuidelinesToPreventTheLossOfFunds")}</li>
      </ul>
    </WarningCard>
  );
};
