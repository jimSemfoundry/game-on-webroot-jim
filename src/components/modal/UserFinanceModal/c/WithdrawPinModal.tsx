import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { MotionContentBox } from "@/components/modal/UserFinanceModal/c/MotionContentBox.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useBoundStore } from "@/store";
import { useToggle } from "ahooks";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import VerificationInput from "react-verification-input";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

export const WithdrawPinModal = () => {
  const { t } = useTranslation();

  const { user } = useAuth();

  const [status, { set }] = useToggle<boolean>(false);

  // from data store, share common data
  const { syncAction } = useBoundStore();

  // 事件通知
  useEffect(() => {
    if (syncAction.type === "OPEN_WITHDRAW_CRYPTO_PIN_MODAL" || syncAction.type === "OPEN_WITHDRAW_FIAT_PIN_MODAL") set(true);
  }, [syncAction]);

  return (
    <Modal
      isOpen={status}
      title={
        <span className="text-sm font-semibold">
          {user?.pin_setted ? t("finance:enter_withdrawal_pin") : t("finance:setWithdrawalPin")}
        </span>
      }
      onClose={() => set(false)}
      className="bg-base-400 md:max-w-[360px]"
      position="modal-middle"
    >
      <MotionContentBox sample show={!user?.pin_setted} content={<NoPinCode onClose={() => set(false)} />} />
      <MotionContentBox sample show={!!user?.pin_setted}
                        content={<HavePinCode show={status} onClose={() => set(false)} />} />
    </Modal>
  );
};

// 未设置PIN码，去设置
const NoPinCode = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();

  const { syncAction, setSyncAction } = useBoundStore();

  return (
    <div className="flex flex-col gap-4">
      <div
        className="p-4 flex items-center gap-4 rounded-lg"
        style={{
          background: `
        radial-gradient(100% 157.05% at 0% 46.47%, 
        color-mix(in oklch, var(--color-info), transparent 60%) 50%,
        color-mix(in oklch, var(--color-base-300), transparent 30%)`
        }}
      >
        <img src="/icons/isometric/38.svg" alt="" />
        <p className="text-xs leading-4 font-semibold">{t("finance:setWithdrawalPinDescription")}</p>
      </div>

      <ConfirmBox
        onClick={() => {
          onClose();

          const ty = syncAction.type;

          /**
           * 自定义行为 - 来源于用户提款操作但是未设置PIN码
           * 前提：用户操作提款但是未设置PIN码
           * PIN码设置成功则立即执行提现订单创建
           *
           * @params: ty = syncAction.type -》 用户正在操作什么类型的提款
           *
           * OPEN_WITHDRAW_CRYPTO_PIN_MODAL 加密提款
           * OPEN_WITHDRAW_FIAT_PIN_MODAL   法币提款
           */
          setSyncAction("OPEN_SET_WITHDRAWAL_PIN_MODAL", ty);
        }}
      >
        {t("common.confirm")}
      </ConfirmBox>
    </div>
  );
};

// 已设置PIN码，去交易
const HavePinCode = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
  const { t } = useTranslation();

  const [pin, setPin] = useState<string>("");

  // from data store, share common data
  const { setSyncAction, syncAction } = useBoundStore();

  const isError = useMemo(() => pin !== "" && !/^[0-9]{6}$/.test(pin), [pin]);

  // 默认focus input
  useLayoutEffect(() => {
    const timer = setInterval(() => {
      const dom = document.getElementById("PIN");
      if (show) dom?.click();
      if (dom) clearInterval(timer);
    }, 500);
  }, [show]);

  return (
    <div className="flex flex-col gap-4 items-center">
      <img src="/images/profile/security-verification-lock.png" className="w-25 h-25" />
      <div className="flex flex-col gap-2 w-full" autoFocus>
        <p className="text-xs font-semibold text-base-content/50">{t("common.confirmNewPlaceholder")}</p>
        <VerificationInput
          classNames={{
            container: "flex justify-between gap-2 !w-auto",
            character:
              "!cursor-pointer flex items-center justify-center font-sans p-0 input !outline-0 !bg-base-200 !border-2 !border-base-200 !text-xl font-bold justify-center w-full rounded-lg !text-base-content",
            characterSelected: "!bg-base-200 !border-primary !border-base-200"
            // characterInactive: "!bg-base-300 !border-base-300"
          }}
          inputProps={{ id: "PIN", autoComplete: "off" }}
          placeholder="-"
          value={pin}
          onChange={(v) => {
            if (v === "" || /^\d+$/.test(v)) setPin(v);
          }}
        />
        <DisplayContent status={isError}>
          <ErrorMessageBox sample content={t("common.pinMustBeAtLeast6Digits")} show={isError} />
        </DisplayContent>
      </div>
      <ConfirmBox
        disabled={pin === "" || isError}
        onClick={() => {
          const ty = syncAction.type;
          if (ty === "OPEN_WITHDRAW_FIAT_PIN_MODAL") {
            setSyncAction("SYNC_WITHDRAW_FIAT_CREATE", pin);
          }
          if (ty === "OPEN_WITHDRAW_CRYPTO_PIN_MODAL") {
            setSyncAction("SYNC_WITHDRAW_CRYPTO_CREATE", pin);
          }
          setPin("");
          onClose();
        }}
      >
        {t("common.confirmPIN")}
      </ConfirmBox>
    </div>
  );
};

export default WithdrawPinModal;
