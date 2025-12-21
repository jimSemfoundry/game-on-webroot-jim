import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { authService } from "@/services/authService.ts";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { MotionContentBox } from "@/components/modal/UserFinanceModal/c/MotionContentBox.tsx";
import { useBoundStore } from "@/store";
import { toast } from "sonner";
import { InnerImg } from "@/sections/profile/security/ChangePassword.tsx";
import { ChevronLeft } from "lucide-react";
import VerificationInput from "react-verification-input";
import { matchResponseCodeError } from "@/sections/profile/security/response_code.ts";
import md5 from "md5";
import { useQueryClient } from "@tanstack/react-query";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { TActions } from "@/store/type.ts";

interface IStatus {
  step: "STEP1" | "STEP2" | "STEP3",
  new_pin: string,
  confirm_pin: string,
  success: boolean
  bind_pin_loading: boolean
  show_modal: boolean
}

const initStatus: IStatus = {
  step: "STEP1",
  new_pin: "",
  confirm_pin: "",
  success: false,
  bind_pin_loading: false,
  show_modal: false
};

export const SetWithdrawalPINModal = () => {
  const queryClient = useQueryClient();

  const { t } = useTranslation();

  const { user } = useAuth();

  const { syncAction, setSyncAction } = useBoundStore();

  const [status, setStatus] = useState<IStatus>(initStatus);

  const operate_pin_type = useMemo(() => user?.pin_setted ? "UPDATE_PIN" : "BIND_PIN", [user?.pin_setted]);

  /**
   * PIN错误
   */
  const new_pin_code_error = useMemo(() => status.new_pin !== "" && !/^[0-9]{6}$/.test(status.new_pin), [status.new_pin]);
  const repeat_pin_code_error = useMemo(() => status.confirm_pin !== status.new_pin, [status.new_pin, status.confirm_pin]);
  const confirm_pin_code_error = useMemo(() => status.confirm_pin !== "" && !/^[0-9]{6}$/.test(status.confirm_pin), [status.confirm_pin]);

  /**
   * 绑定PIN
   */
  const bindPinCode = () => {
    setStatus((old) => ({
      ...old,
      bind_pin_loading: true
    }));
    authService.updateWithdrawalPin({ new_pin: md5(status.new_pin), confirm_pin: md5(status.confirm_pin) })
      .then((res) => {
        if (res.code === 0) {
          setStatus((old) => ({ ...old, step: "STEP3", opt_code: "" }));

          void queryClient.refetchQueries({ queryKey: ["auth", "currentUser"] });

          // 自定义行为 - 来源于用户提款操作但是未设置PIN码
          user_todo_withdraw_but_unset_pin_code(setSyncAction, status.confirm_pin, syncAction?.data);
        } else {
          toast.error(matchResponseCodeError(res.code));
        }
      })
      .finally(() => {
        setStatus((old) => ({ ...old, show_modal: false, bind_pin_loading: false }));
      });
  };

  /**
   * 事件通知，唤起对应弹窗
   */
  useEffect(() => {
    if (syncAction.type === "OPEN_SET_WITHDRAWAL_PIN_MODAL") {
      setStatus((v) => ({ ...v, ...initStatus, show_modal: true }));
    }
  }, [syncAction]);

  /**
   * 到STEP2输入验证码步骤时默focus输入框
   */
  useLayoutEffect(() => {
    const timer1 = setInterval(() => {
      const dom = document.getElementById("NEW_PIN_CODE");
      if (status.step === "STEP1") dom?.click();
      if (dom) clearInterval(timer1);
    }, 500);

    const timer2 = setInterval(() => {
      const dom = document.getElementById("CONFIRM_PIN_CODE");
      if (status.step === "STEP2") dom?.click();
      if (dom) clearInterval(timer2);
    }, 500);

  }, [status.step]);

  return (
    <Modal
      title={
        <div className="flex items-center gap-x-2 truncate">
          {status.step === "STEP2" &&
            <button className="btn btn-square btn-sm mr-2" onClick={() => setStatus((v) => ({ ...v, step: "STEP1" }))}>
              <ChevronLeft className="w-4 h-4" /></button>}
          <p className="text-lg font-bold truncate">
            {status.step === "STEP1" && (operate_pin_type === "BIND_PIN" ? "Change Withdrawal PIN" : t("common.updateWithdrawalPin"))}
            {status.step === "STEP2" && "Confirm Withdrawal PIN"}
          </p>
        </div>
      }
      isOpen={status.show_modal}
      onClose={() => {
        setStatus((v) => ({ ...v, show_modal: false }));
      }}
      position="modal-middle"
      className="bg-base-400 md:max-w-[420px] shadow-lg"
    >
      {/* set withdrawal pin form */}
      <DisplayContent status={status.step === "STEP1"}>
        <div className="flex flex-col gap-6 items-center">
          <InnerImg name="security-verification-lock" className="md:w-auto md:h-auto w-25 h-25" />

          <div className="flex flex-col gap-2 w-full">
            {/* 输入PIN码 */}
            <VerificationInput
              classNames={{
                container: "!h-17 flex justify-between gap-2 !w-auto",
                character:
                  "!h-17 !cursor-pointer flex items-center justify-center p-0 input !outline-0 !bg-base-200 !border-1 !border-base-200 !text-lg font-extrabold justify-center w-full rounded-lg !text-base-content",
                characterSelected: "!bg-base-200 !border-primary !border-base-200",
                characterInactive: "!bg-base-300 !border-base-300 !text-base-content/10",
                characterFilled: "!bg-base-200 !border-base-200"
              }}
              inputProps={{ id: "NEW_PIN_CODE", autoComplete: "off" }}
              placeholder="0"
              value={status.new_pin}
              onChange={(v) => {
                if (v === "" || /^\d+$/.test(v))
                  setStatus((old) => ({
                    ...old,
                    new_pin: v
                  }));
              }}
            />

            {/* PIN - 格式 - 错误 */}
            <DisplayContent status={new_pin_code_error}>
              <ErrorMessageBox
                className="!mt-0"
                content={t("common.pinMustBeAtLeast6Digits")}
                show={new_pin_code_error} />
            </DisplayContent>
          </div>

          <div className="w-full">
            {/* confirm */}
            <ConfirmBox disabled={!status.new_pin || new_pin_code_error} onClick={() => setStatus((old) => ({
              ...old,
              step: "STEP2"
            }))}
            >
              {t("common:common.continue")}
            </ConfirmBox>
            <DisplayContent status={!!status.new_pin && !new_pin_code_error}>
              <div
                className={"text-xs font-semibold text-primary text-center mt-4"}>{t("common.confirmCodeEntered")}</div>
            </DisplayContent>
          </div>
        </div>
      </DisplayContent>

      {/* re-enter withdrawal pin form */}
      <DisplayContent status={status.step === "STEP2"}>
        <div className="flex flex-col gap-6 items-center">
          <InnerImg name="security-verification-lock" className="md:w-auto md:h-auto w-25 h-25" />

          <div className="flex flex-col gap-2 w-full">
            {/* 输入PIN码 */}
            <VerificationInput
              classNames={{
                container: "!h-17 flex justify-between gap-2 !w-auto",
                character:
                  "!h-17 !cursor-pointer flex items-center justify-center p-0 input !outline-0 !bg-base-200 !border-1 !border-base-200 !text-lg font-extrabold justify-center w-full rounded-lg !text-base-content",
                characterSelected: "!bg-base-200 !border-primary !border-base-200",
                characterInactive: "!bg-base-300 !border-base-300 !text-base-content/10",
                characterFilled: "!bg-base-200 !border-base-200"
              }}
              inputProps={{ id: "CONFIRM_PIN_CODE", autoComplete: "off" }}
              placeholder="0"
              value={status.confirm_pin}
              onChange={(v) => setStatus((old) => ({
                ...old,
                confirm_pin: v
              }))}
            />

            {/* PIN码 - 不一致 - 错误 */}
            <DisplayContent status={repeat_pin_code_error}>
              <ErrorMessageBox content={t("common.ensureSameEntered")} show={repeat_pin_code_error} />
            </DisplayContent>
          </div>

          {/* confirm */}
          <ConfirmBox
            disabled={!status.new_pin || !status.confirm_pin || confirm_pin_code_error || new_pin_code_error || repeat_pin_code_error}
            onClick={bindPinCode}
            loading={status.bind_pin_loading}>
            Continue
          </ConfirmBox>
        </div>
      </DisplayContent>

      {/* withdrawal pin verification success */}
      <DisplayContent status={status.step === "STEP3"}>
        <MotionContentBox
          show={status.step === "STEP3"}
          content={<div className="flex flex-col gap-6 items-center font-semibold">
            <InnerImg name="security-verification-ok" className="md:w-30 md:h-30 w-25 h-25" />
            <div className="flex flex-col gap-4 items-center">
              <p className="text-md">
                {operate_pin_type === "BIND_PIN" ? t("common.pinSetUpSuccessfully") : t("common.pinUpdatedSuccessfully")}
              </p>
              <p className="text-base-content/50 text-sm text-center">
                <Trans i18nKey={t("common.pinSetUpSuccessfullyDescription")} />
              </p>
            </div>
            <ConfirmBox onClick={() => {
              setStatus((old) => ({
                ...old,
                show_modal: false
              }));
            }}>{t("common.close")}</ConfirmBox>
          </div>} />
      </DisplayContent>
    </Modal>
  );
};

export default SetWithdrawalPINModal;

/**
 * 自定义行为 - 来源于用户提款操作但是未设置PIN码
 * 前提：用户操作提款但是未设置PIN码
 * PIN码设置成功则立即执行提现订单创建
 */
function user_todo_withdraw_but_unset_pin_code(action: (v: TActions, data: any) => void, pin: string, type: string) {
  if (type === "OPEN_WITHDRAW_FIAT_PIN_MODAL") action("SYNC_WITHDRAW_FIAT_CREATE", pin);
  if (type === "OPEN_WITHDRAW_CRYPTO_PIN_MODAL") action("SYNC_WITHDRAW_CRYPTO_CREATE", pin);
}

