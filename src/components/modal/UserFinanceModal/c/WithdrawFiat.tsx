import { WarningCard } from "@/components/modal/UserFinanceModal/c/WarningCard.tsx";
import { WithdrawFiatForm } from "@/components/modal/UserFinanceModal/c/WithdrawFiatForm.tsx";
import { WithdrawFiatSelect } from "@/components/modal/UserFinanceModal/c/WithdrawFiatSelect.tsx";
import { useTranslation } from "react-i18next";

export const WithdrawFiat = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 sm:min-h-100">
      <div className="flex flex-col gap-4 bg-base-400 rounded-2xl p-3">
        <WithdrawFiatSelect />

        {/* 动态表单 */}
        <WithdrawFiatForm />
      </div>
      <WarningCard>
        <p
          className="text-xs leading-4 flex-1">{t("finance:forSecurityPurposesLargeOrSuspiciousWithdrawalsMayTakeUpTo24HoursToProcess")}</p>
      </WarningCard>
    </div>
  );
};
