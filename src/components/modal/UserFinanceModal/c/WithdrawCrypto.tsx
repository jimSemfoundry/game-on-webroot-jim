import { WarningCard } from "@/components/modal/UserFinanceModal/c/WarningCard.tsx";
import { WithdrawAddressAdd } from "@/components/modal/UserFinanceModal/c/WithdrawAddressAdd.tsx";
import { WithdrawCryptoAmount } from "@/components/modal/UserFinanceModal/c/WithdrawCryptoAmount.tsx";
import { WithdrawCryptoSelect } from "@/components/modal/UserFinanceModal/c/WithdrawCryptoSelect.tsx";
import { useTranslation } from "react-i18next";

export const  WithdrawCrypto = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <WithdrawCryptoSelect />
      <WithdrawAddressAdd />
      <WithdrawCryptoAmount />
      <WarningCard>
        <p className="text-xs leading-4 flex-1">
          {t("finance:forSecurityPurposesLargeOrSuspiciousWithdrawalsMayTakeUpTo24HoursToProcess")}
        </p>
      </WarningCard>
    </div>
  );
};
