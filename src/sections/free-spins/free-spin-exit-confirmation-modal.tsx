import { Modal } from "@/components/ui/Modal";
import { useCancelFreeSpinRecord } from "@/query/free-spins";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { FreeSpinExitConfirmProps } from './types';

export const FreeSpinExitConfirm = ({
  freeSpinData,
  open,
  onClose,
  onExitConfirmed,
}: FreeSpinExitConfirmProps) => {
  const { t } = useTranslation();
  const cancelFreeSpinRecordMutation = useCancelFreeSpinRecord();
  
  const freeSpinsCount = freeSpinData?.bet_count || '';

  const handleExitAnyway = () => {
    cancelFreeSpinRecordMutation.mutate(freeSpinData?.id || '', {
      onSuccess: (data: any) => {
        if (data.code === 0) {
          toast.success(t('toast:bonusCancelledSuccessfully'));
          // 调用确认退出回调，关闭所有弹窗
          if (onExitConfirmed) {
            onExitConfirmed();
          } else {
            onClose();
          }
        } else {
          toast.error(t('toast:bonusCancelledFailed'));
        }
      },
    })
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={<div className="text-base-content font-semibold text-base">{t('popup:freeSpins.are_you_sure')}</div>}
      className="w-[335px] bg-base-400"
      style={{ zIndex: 30000 }}
      position="modal-middle"
    >
      <div className="flex flex-col">
        <img src="/images/illustrations/warning.png" alt="Warning" className="m-auto w-25 h-25" />
        <div className="text-center text-base-content font-[600] text-[16px] mt-4 ">
          {t('popup:freeSpins.you_will_lose_your')} <br />
          <span className="text-primary"> {freeSpinsCount} {t('popup:freeSpins.freeSpins')}</span> <br />
          {t('popup:freeSpins.if_you_cancel_now')}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={onClose}
            className="btn btn-primary text-primary-content flex-1 h-12 rounded-2 px-4 shadow"
          >
            {t('popup:freeSpins.go_back')}
          </button>
          <button
            onClick={handleExitAnyway}
            className="btn bg-primary/10 text-primary flex-1 h-12 rounded-2 px-4"
          >
            {t('popup:freeSpins.exit_anyway')}
          </button>
        </div>
      </div>
    </Modal>
  );
};
