import { WarningCard } from "@/components/modal/UserFinanceModal/c/WarningCard.tsx";
import { WithdrawFiatForm } from "@/components/modal/UserFinanceModal/c/WithdrawFiatForm.tsx";
import { WithdrawFiatSelect } from "@/components/modal/UserFinanceModal/c/WithdrawFiatSelect.tsx";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

export const WithdrawFiat = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <WithdrawFiatSelect />

      {/* 动态表单 */}
      <WithdrawFiatForm />

      <CustomWarningCard t={t} />
    </div>
  );
};

const CustomWarningCard = ({ t }: { t: TFunction }) => {
  return (
    <WarningCard>
      <p className="text-xs leading-4 flex-1">{t("finance:forSecurityPurposesLargeOrSuspiciousWithdrawalsMayTakeUpTo24HoursToProcess")}</p>
    </WarningCard>
  );
};
