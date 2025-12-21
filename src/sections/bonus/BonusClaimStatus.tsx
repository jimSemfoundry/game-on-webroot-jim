import { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal.tsx";
import { useFinanceModal } from "@/contexts/ModalsProvider.tsx";
import { useBoundStore } from "@/store";
import { randomString } from "@/components/modal/UserFinanceModal/helper.ts";

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
  "CODE_59999" = 59999
}

let exec_onetime = false;

export const BonusClaimResponseModal = () => {
  const { t } = useTranslation();

  const [open, setOpen] = useState<boolean>(false);

  const { syncAction } = useBoundStore();

  const { openUserFinanceModalWithTab } = useFinanceModal();

  // 事件通知
  useEffect(() => {
    if (!exec_onetime && syncAction.type === "OPEN_BONUS_CLAIM_RESPONSE_MODAL") {
      setOpen(true);
      exec_onetime = true;
    }
  }, [syncAction]);

  useEffect(() => {
    if (!open) exec_onetime = false;
  }, [open]);

  return (
    <Modal
      hideTitle
      isOpen={open}
      onClose={() => {
        setOpen(false);
      }}
      position="modal-middle"
      zIndex={1600}
      className="bg-base-300 overflow-y-visible md:max-w-[360px]"
      closeButtonClassName={"z-1"}
    >
      <InnerClaimStatus
        show={syncAction.data?.code === ECode.CODE_50003}
        desc=""
        // desc='Next Claim in:'
        icon="claim-warning"
        title={t("bonus:come_back_tomorrow")}
        btnText={t("bonus:i_will_wait")}
        subTitle={t("bonus:bonus_reset_daily")}
        onClick={() => {
          setOpen(false);
        }}
      />

      <InnerClaimStatus
        show={![ECode.CODE_50003, ECode.CODE_50006].includes(syncAction.data?.code) && syncAction.data?.code > 0}
        desc={t("bonus:another_go")}
        icon="claim-reset"
        title={t("bonus:oops")}
        btnText={t("information:tryAgain")}
        subTitle={t("bonus:quick_reset")}
        onClick={() => {
          setOpen(false);
          syncAction.data?.tryAgain?.();
        }}
      />

      <InnerClaimStatus
        show={syncAction.data?.code === ECode.CODE_50006}
        desc={t("bonus:next_claim")}
        icon="claim-fuel"
        title={t("bonus:out_of_fuel")}
        btnText={t("bonus:refill_claim")}
        subTitle={t("bonus:out_of_charge")}
        onClick={() => {
          setOpen(false);
          openUserFinanceModalWithTab(`deposit_${randomString()}`);
        }}
      />
    </Modal>
  );
};

export default BonusClaimResponseModal

const InnerClaimStatus = ({ icon, show, title, subTitle, desc, btnText, onClick }: {
  icon: string,
  show: boolean,
  title: ReactNode,
  subTitle: ReactNode,
  desc: ReactNode,
  btnText: string,
  onClick?: () => void
}) => {
  return (show && <div className="flex flex-col gap-4 items-center text-sm relative font-semibold px-5">
    <img src={`/images/bonus/${icon}.png`} className="w-36 absolute -top-16" alt="" />
    <h1 className="text-lg md:text-xl text-white font-bold mt-20 whitespace-pre-line text-center">{title}</h1>
    <p className="text-base-content/60 text-center text-xs">{subTitle}</p>
    {desc&&(<div className="text-white text-center">{desc}</div>)}
    <button className="btn btn-secondary w-full" onClick={onClick}>{btnText}</button>
  </div>);
};

/**
 *  /api/Achievement/claim
 *  /api/Claim/claim
 *  /api/Conquest/claim
 *  CODE_BONUS_START = 50001;
 *  CODE_BONUS_CLAIM_NOT_FOUND = 50001; //
 *  CODE_BONUS_CLAIM_VALUE_IS_0 = 50002; //
 *  CODE_BONUS_CLAIM_TOMORROW = 50003; //。
 *  CODE_BONUS_CLAIM_ALREADY_CLAIMED = 50004; //
 *  CODE_BONUS_CLAIM_TOO_FREQUENT = 50005; //。
 *  CODE_BONUS_POOL_NOT_ENOUGH = 50006; //
 *  CODE_BONUS_POOL_NOT_FOUND = 50007; //
 *  CODE_BONUS_CLAIM_EXPIRED = 50008; //。
 *  CODE_BONUS_CLAIM_TRY_AGAIN = 50009; //
 *  CODE_BONUS_INPUT_PARAM_ERROR = 50010; //
 *  CODE_BONUS_GENERATE_FAILED = 59999;   //
 *  CODE_BONUS_END = 59999;
 */
