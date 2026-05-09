import { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal.tsx";
import { emitter } from "@/store/emitter.ts";
import { Service } from "@/components/icons/Service.tsx";

export enum ECode {
  "CODE_50001" = 50001,
  "CODE_50002" = 50002,
  "CODE_50003" = 50003,
  "CODE_50004" = 50004,
  "CODE_50005" = 50005,
  "CODE_50006" = 50006,
  "CODE_50007" = 50007,
  "CODE_50008" = 50008,
  "CODE_50009" = 50009,
  "CODE_50010" = 50010,
  "CODE_50011" = 50011,
  "CODE_59999" = 59999
}

const oops_code = new Set([ECode.CODE_50003, ECode.CODE_50006, ECode.CODE_50011]);

export const BonusClaimResponseModal = (
  {
    data,
    open,
    onClose
  }: {
    data: any,
    open: boolean;
    onClose: () => void;
  }) => {
  const { t } = useTranslation();

  return (
    <Modal
      hideTitle
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
      zIndex={1600}
      className="bg-base-300 overflow-y-visible md:max-w-[360px] p-5"
      closeButtonClassName={"z-1"}
    >
      <InnerClaimStatus
        show={data?.code === ECode.CODE_50003}
        desc=""
        // desc='Next Claim in:'
        icon="claim-warning"
        title={t("bonus:come_back_tomorrow")}
        btnText={t("bonus:i_will_wait")}
        subTitle={t("bonus:bonus_reset_daily")}
        onClick={onClose}
      />

      <InnerClaimStatus
        show={!oops_code.has(data?.code) && data?.code > 0}
        desc={t("bonus:another_go")}
        icon="claim-reset"
        title={t("bonus:oops")}
        btnText={t("information:tryAgain")}
        subTitle={t("bonus:quick_reset")}
        onClick={() => {
          onClose();
          data?.tryAgain?.();
        }}
      />

      {/*寻求客服帮助*/}
      <InnerServiceAssistance show={data?.code === ECode.CODE_50006} onClick={onClose} />

      <InnerClaimStatus
        show={data?.code === ECode.CODE_50011}
        desc={<p
          className={"whitespace-pre-line"}>{t("bonus:achievementsAvailableLevel2", "Come back when you are VIP level {{level}} and above.", { level: 2 })}</p>}
        icon="achievement"
        title=""
        btnText={t("bonus:gotIt", "Got It")}
        subTitle={<p
          className={"whitespace-pre-line"}>{t("bonus:achievementsAvailableLevel1", "Achievements are available to VIP level {{level}} and above.", { level: 2 })}</p>}
        onClick={onClose}
      />
    </Modal>
  );
};

export default BonusClaimResponseModal;

const InnerClaimStatus = ({ icon, show, title, subTitle, desc, btnText, onClick }: {
  icon: string,
  show: boolean,
  title: ReactNode,
  subTitle: ReactNode,
  desc: ReactNode,
  btnText: string,
  onClick?: () => void
}) => {
  return (show && <div className="flex flex-col gap-4 items-center text-sm relative font-semibold">
    <img src={`/images/bonus/${icon}.png`} className="w-36 absolute -top-16" alt="" />
    <h1 className="text-lg md:text-xl text-white font-bold mt-20 whitespace-pre-line text-center">{title}</h1>
    <p className="text-base-content/60 text-center text-xs">{subTitle}</p>
    {desc && (<div className="text-white text-center">{desc}</div>)}
    <button className="btn btn-secondary w-full" onClick={onClick}>{btnText}</button>
  </div>);
};

// 寻求客服帮助
const InnerServiceAssistance = ({ show, onClick }: { show: boolean, onClick: () => void }) => {
  const { t } = useTranslation();

  return show && <div className="flex flex-col gap-4 items-center font-semibold overflow-hidden">
    <img src="/images/bonus/claim-warning.png" className="h-25" alt="" />
    <div className="flex flex-col gap-4 items-center">
      <p className="text-lg">{t("transaction:transactionStatus.failed")}</p>
      <p className="text-base-content/50 text-sm text-center">
        <Trans i18nKey="toast:pleaseContactCustomerService" />
      </p>
    </div>

    <div className="flex gap-4 items-center w-full">
      <button className={"btn btn-primary"}
              onClick={onClick}>{t("common:common.back")}</button>
      <button className={"flex-1 btn btn-outline btn-primary"} onClick={() => {
        onClick();
        emitter.emit("OPEN_CHAT");
      }}><Service width={18} />{t("chat:customerService")}</button>
    </div>
  </div>;
};
