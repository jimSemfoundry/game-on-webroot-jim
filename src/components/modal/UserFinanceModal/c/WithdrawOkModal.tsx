import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { useBoundStore } from "@/store";
import { useToggle } from "@/hooks/useToggle";
import { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";

export const WithdrawOkModal = () => {
  const { t } = useTranslation();

  const [status, { set }] = useToggle<boolean>(false);

  const { syncAction } = useBoundStore();

  // 事件通知
  useEffect(() => {
    if (syncAction.type === "OPEN_WITHDRAW_ORDER_OK_MODAL") set(true);
  }, [syncAction]);

  return (
    <Modal
      isOpen={status}
      title={<span className="text-sm font-semibold">{t("transaction:details.withdrawOrderCreated")}</span>}
      onClose={() => set(false)}
      className="bg-base-400 md:max-w-[360px]"
      position="modal-middle"
    >
      <div className="flex flex-col gap-4 items-center font-semibold">
        <img src="/images/profile/security-verification-ok.png" className="h-25" alt="" />
        <div className="flex flex-col gap-4 items-center">
          <p className="text-sm">{t("transaction:details.withdrawProcessing")}</p>
          <p className="text-base-content/50 text-xs text-center">
            <Trans i18nKey="transaction:details.withdrawOrderStatus" />
          </p>
        </div>

        <ConfirmBox onClick={() => set(false)}>{t("common:common.close")}</ConfirmBox>
      </div>
    </Modal>
  );
};

export default WithdrawOkModal