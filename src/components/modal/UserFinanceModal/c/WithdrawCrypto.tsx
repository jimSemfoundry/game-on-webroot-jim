import { WarningCard } from "@/components/modal/UserFinanceModal/c/WarningCard.tsx";
import { WithdrawAddressAdd } from "@/components/modal/UserFinanceModal/c/WithdrawAddressAdd.tsx";
import { WithdrawCryptoAmount } from "@/components/modal/UserFinanceModal/c/WithdrawCryptoAmount.tsx";
import { WithdrawCryptoSelect } from "@/components/modal/UserFinanceModal/c/WithdrawCryptoSelect.tsx";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useBoundStore } from "@/store";
import { emitter } from "@/store/emitter.ts";

export const WithdrawCrypto = () => {
  const { t } = useTranslation();

  const { setWithdrawCrypto } = useBoundStore();

  // 事件通知【CLOSE_FINANCE_MODAL- 关闭finance操作窗口】需要重置表单状态
  useEffect(() => {
    const em = emitter.addListener("CLOSE_FINANCE_MODAL", function() {
      setWithdrawCrypto({
        comment: "",
        toWallet: "",
        inputAmount: ""
      });
    });

    return () => em?.remove()
  }, []);

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
