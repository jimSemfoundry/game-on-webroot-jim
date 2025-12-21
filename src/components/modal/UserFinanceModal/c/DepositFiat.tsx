import { DepositFiatForm } from "@/components/modal/UserFinanceModal/c/DepositFiatForm.tsx";
import { DepositFiatSelect } from "@/components/modal/UserFinanceModal/c/DepositFiatSelect.tsx";
import { SecureCard } from "@/components/modal/UserFinanceModal/c/SecureCard.tsx";
import { WarningCard } from "@/components/modal/UserFinanceModal/c/WarningCard.tsx";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { SpecialOffersH5 } from "./SpecialOffers.tsx"


export const DepositFiat = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <DepositFiatSelect />

      <SpecialOffersH5 />

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
