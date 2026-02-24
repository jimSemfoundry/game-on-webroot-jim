import { Modal } from "@/components/ui/Modal.tsx";
import { Trans, useTranslation } from "react-i18next";
import { Service } from "@/components/icons/Service.tsx";
import { emitter } from "@/store/emitter.ts";

export const WithdrawAMLModal = (
  {
    open,
    onClose
  }: {
    open: boolean;
    onClose: () => void;
  }) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={open}
      title=""
      onClose={onClose}
      className="bg-base-400 md:max-w-[360px] hide-scrollbar"
      position="modal-middle"
    >
      <div className="flex flex-col gap-4 items-center font-semibold overflow-hidden">
        <img src="/icons/ui/warning.png" className="h-25" alt="" />
        <div className="flex flex-col gap-4 items-center">
          <p className="text-lg">{t("transaction:transactionStatus.failed")}</p>
          <p className="text-base-content/50 text-sm text-center">
            <Trans i18nKey="transaction:assistance" />
          </p>
        </div>

        <div className="flex gap-4 items-center w-full">
          <button className={"btn btn-primary"}
                  onClick={onClose}>{t("common:common.back")}</button>
          <button className={"flex-1 btn btn-outline btn-primary"} onClick={() => {
            onClose();
            emitter.emit("OPEN_CHAT");
          }}><Service width={18} />{t("chat:customerService")}</button>
        </div>
      </div>
    </Modal>
  );
};

export default WithdrawAMLModal;
