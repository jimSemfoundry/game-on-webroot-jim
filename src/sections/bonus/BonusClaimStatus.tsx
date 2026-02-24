import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal.tsx";
import { useFinanceModal } from "@/contexts/ModalsProvider.tsx";
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

  const { openUserFinanceModalWithTab } = useFinanceModal();

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
          onClose()
          data?.tryAgain?.();
        }}
      />

      <InnerClaimStatus
        show={data?.code === ECode.CODE_50006}
        desc={t("bonus:next_claim")}
        icon="claim-fuel"
        title={t("bonus:out_of_fuel")}
        btnText={t("bonus:refill_claim")}
        subTitle={t("bonus:out_of_charge")}
        onClick={() => {
          onClose()
          openUserFinanceModalWithTab(`deposit_${randomString()}`);
        }}
      />

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
