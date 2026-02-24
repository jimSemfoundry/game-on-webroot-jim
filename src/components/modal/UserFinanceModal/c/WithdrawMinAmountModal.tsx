/**
 * Withdraw 提款最小额度提示
 *
 * 使用发布订阅模式来唤起弹窗
 */

import { Modal } from "@/components/ui/Modal.tsx";
import { useBoundStore } from "@/store";
import { useToggle } from "@/hooks/useToggle";
import { BadgeAlert } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const WithdrawMinAmountModal = () => {
  const { t } = useTranslation();

  const [status, { set }] = useToggle<boolean>(false);

  // from data store, share common data
  const { syncAction } = useBoundStore();

  // 事件通知
  useEffect(() => {
    if (syncAction.type === "OPEN_WITHDRAW_MIN_AMOUNT_MODAL") set(true);
  }, [syncAction]);

  return (
    <Modal
      title={<BadgeAlert className={"w-6 h-6 text-primary"} />}
      isOpen={status}
      onClose={() => set(false)}
      position="modal-middle"
      className="bg-base-400 md:max-w-[360px] shadow-lg"
    >
      <p className="leading-4 text-xs font-semibold text-base-content/50 pr-4">{t("finance:minimumWithdrawalAmountTooltip")}</p>
    </Modal>
  );
};

export default WithdrawMinAmountModal;