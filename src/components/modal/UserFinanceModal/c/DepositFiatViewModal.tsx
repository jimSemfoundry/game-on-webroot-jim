/**
 * Deposit Fiat 订单确认窗口
 *
 * 使用发布订阅模式来唤起弹窗
 */

import { Modal } from "@/components/ui/Modal.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useBoundStore } from "@/store";
import { useTranslation } from "react-i18next";
import { FormBox } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { emitter } from "@/store/emitter.ts";

export const DepositFiatViewModal = (
  {
    open,
    onClose
  }: {
    open: boolean;
    onClose: () => void;
  }) => {
  const { t } = useTranslation();

  // from data store, share common data
  const { depositFiat } = useBoundStore();

  // 查询代币信息
  const { getCurrencySymbol } = useCurrencyData();

  return (
    <Modal
      title={<span className="flex items-center gap-2 text-sm font-semibold">{t("finance:newFiatDeposit")}</span>}
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
      className="bg-base-400 p-4 md:max-w-[360px] shadow-lg"
    >
      <div className="flex flex-col gap-4">
        <div
          className="flex items-center gap-4 rounded-lg p-4 mt-4"
          style={{
            background: `
        radial-gradient(100% 157.05% at 0% 46.47%, 
        color-mix(in oklch, var(--color-info), transparent 60%) 50%,
        color-mix(in oklch, var(--color-base-300), transparent 30%)`,
          }}
        >
          <img src="/icons/isometric/1.svg" className="h-15 w-15" alt="Bonus" />
          <p className="flex flex-col gap-3 font-semibold">
            <span className="text-xs leading-4">
              {t(
                "finance:pleaseCompleteYourPaymentUsingThePopUpWindowDoNotCloseItUntilYouSeeTheConfirmationScreenIndicatingYourPaymentWasSuccessful",
              )}
            </span>

            <span className="text-xs leading-4">
              {t("finance:noteThatOnceTheTimeLimitExpiresYourTransactionCannotBeResumedAndYourOrderWillBeCanceled")}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FormBox label={t("finance:depositAmount")}>
            <div className="bg-base-300 flex h-10 items-center justify-center rounded-lg text-xs font-bold">
              {getCurrencySymbol(depositFiat.currency?.currency)}
              {Number(depositFiat.formItem?.amount).toLocaleString()} {depositFiat.currency?.currency}
            </div>
          </FormBox>

          <FormBox label={t("finance:depositMethod")}>
            <div className="bg-base-300 flex h-10 items-center justify-center rounded-lg text-xs font-bold px-2">
              <span className="truncate">{depositFiat.method?.display_name} </span>
            </div>
          </FormBox>
        </div>

        <button
          className="btn btn-primary font-bold"
          onClick={() => {
            onClose()
            emitter.emit("SYNC_DEPOSIT_FIAT_CREATE");
          }}
        >
          {t("finance:iUnderstand")}
        </button>
      </div>
    </Modal>
  );
};

export default DepositFiatViewModal;