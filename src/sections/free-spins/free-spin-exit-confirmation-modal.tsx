import { Modal } from "@/components/ui/Modal";
import { useCancelFreeSpinRecord } from "@/query/free-spins";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { FreeSpinExitConfirmProps } from "./types";

export const FreeSpinExitConfirm = ({
                                      freeSpinData,
                                      open,
                                      onClose,
                                      onExitConfirmed
                                    }: FreeSpinExitConfirmProps) => {
  const { t } = useTranslation(['popup', 'toast']);
  const cancelFreeSpinRecordMutation = useCancelFreeSpinRecord();

  const freeSpinsCount = freeSpinData?.bet_count || "";

  const handleExitAnyway = () => {
    cancelFreeSpinRecordMutation.mutate(freeSpinData?.id || "", {
      onSuccess: (data: any) => {
        if (data.code === 0) {
          toast.success(t("toast:bonusCancelledSuccessfully"));
          // 调用确认退出回调，关闭所有弹窗
          if (onExitConfirmed) {
            onExitConfirmed();
          } else {
            onClose();
          }
        } else {
          toast.error(t("toast:bonusCancelledFailed"));
        }
      }
    });
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={<div className="text-base-content font-semibold text-base">{t("popup:freeSpins.are_you_sure")}</div>}
      style={{ zIndex: 30000 }}
      className="w-[335px] free-spin-polygon bg-base-200 p-6"
      position="modal-middle"
      closeButtonClassName="bg-white/10 z-50"
    >
      <div className="flex flex-col">
        <img src="/images/illustrations/warning.png" alt="Warning" className="m-auto w-22 h-22" />
        <div className="text-center text-base-content/60 font-[600] text-[14px] mt-4 font-bold">
          {t("popup:freeSpins.you_will_lose_your")} <br />
          <span
            className="text-primary text-[18px] font-extrabold"> {freeSpinsCount} {t("popup:freeSpins.freeSpins")}</span>
          <br />
          {t("popup:freeSpins.if_you_cancel_now")}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={onClose}
            className="btn btn-primary text-primary-content flex-1"
          >
            {t("popup:freeSpins.go_back")}
          </button>
          <button
            onClick={handleExitAnyway}
            className="btn btn-soft text-primary flex-1"
          >
            {t("popup:freeSpins.exit_anyway")}
          </button>
        </div>
      </div>
    </Modal>
  );
};
