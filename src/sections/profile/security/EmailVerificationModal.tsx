import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { DisplayContent } from "@/components/modal/UserFinanceModal";
import { Modal } from "@/components/ui/Modal.tsx";
import { authService } from "@/services/authService.ts";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { email_reg_exp } from "@/utils/regexp.ts";
import { TFunction } from "i18next";
import { MotionContentBox } from "@/components/modal/UserFinanceModal/c/MotionContentBox.tsx";
import { useBoundStore } from "@/store";
import { toast } from "sonner";
import { InnerImg } from "@/sections/profile/security/ChangePassword.tsx";
import { ChevronLeft, Mail } from "lucide-react";
import VerificationInput from "react-verification-input";
import Countdown from "@/sections/profile/security/Countdown.tsx";
import dayjs from "dayjs";
import { matchResponseCodeError } from "@/sections/profile/security/response_code.ts";
import { useQueryClient } from "@tanstack/react-query";

interface IStatus {
  step: "STEP1" | "STEP2" | "STEP3",
  email: string,
  opt_code: string,
  success: boolean
  send_code_loading: boolean
  bind_mail_loading: boolean
  finished: boolean
  show_modal: boolean
  countdown: number
  end_timestamp: number
}

const initStatus: IStatus = {
  step: "STEP1",
  email: "",
  opt_code: "",
  success: false,
  send_code_loading: false,
  bind_mail_loading: false,
  finished: false,
  show_modal: false,
  countdown: 60,
  end_timestamp: 0
};

export const EmailVerificationModal = () => {
  const queryClient = useQueryClient();

  const { t } = useTranslation();

  const { syncAction, setSyncAction } = useBoundStore();

  const [status, setStatus] = useState<IStatus>(initStatus);

  /**
   * 邮箱格式错误
   */
  const email_format_error = useMemo(() => status.email !== "" && !email_reg_exp.test(status.email), [status.email]);

  /**
   * 验证码格式错误
   */
  const email_opt_code_error = useMemo(() => status.opt_code !== "" && !/^[0-9]{6}$/.test(status.opt_code), [status.opt_code]);

  /**
   * 发送邮箱验证码
   */
  const sendCode = () => {
    setStatus((old) => ({
      ...old,
      send_code_loading: true
    }));
    authService.sendEmailCode({ email: status.email })
      .then((res) => {
        if (res.code === 0) {
          toast.success(matchResponseCodeErrorForEmail(0));
          setStatus((old) => ({
            ...old,
            step: "STEP2",
            finished: false,
            end_timestamp: dayjs().add(status.countdown * 1000).valueOf()
          }));
          void queryClient.refetchQueries({ queryKey: ["auth", "currentUser"] });
        } else {
          toast.error(matchResponseCodeErrorForEmail(res.code));
        }
      })
      .finally(() => {
        setStatus((old) => ({
          ...old,
          send_code_loading: false
        }));
      });
  };

  /**
   * 绑定邮箱
   */
  const bindEmail = () => {
    setStatus((old) => ({
      ...old,
      bind_mail_loading: true
    }));
    authService.bindEmail({ email: status.email, code: status.opt_code })
      .then((res) => {
        if (res.code === 0) {
          setStatus((old) => ({ ...old, step: "STEP3", opt_code: "" }));
        } else {
          toast.error(matchResponseCodeError(res.code));
        }
      })
      .finally(() => {
        setStatus((old) => ({ ...old, bind_mail_loading: false }));
      });
  };

  /**
   * 事件通知，唤起对应弹窗
   */
  useEffect(() => {
    if (syncAction.type === "OPEN_EMAIL_VERIFICATION_MODAL") {
      setStatus((v) => ({ ...v, ...initStatus, show_modal: true }));
      setSyncAction(undefined);
    }
  }, [syncAction]);

  /**
   * 到STEP2输入验证码步骤时默focus输入框
   */
  useLayoutEffect(() => {
    const timer = setInterval(() => {
      const dom = document.getElementById("OPT_CODE");
      if (status.step === "STEP2") dom?.click();
      if (dom) clearInterval(timer);
    }, 500);
  }, [status.step]);

  return (
    <Modal
      title={<InnerModalHeader t={t} step={status.step} onClick={() => setStatus((v) => ({ ...v, step: "STEP1" }))} />}
      isOpen={status.show_modal}
      onClose={() => {
        setStatus((v) => ({ ...v, show_modal: false }));
      }}
      position="modal-middle"
      className="bg-base-400 md:max-w-[420px] shadow-lg"
    >
      {/* send email verification code form */}
      <DisplayContent status={status.step === "STEP1"}>
        <div className="flex flex-col gap-6 items-center">
          <InnerImg name="security-email-verification" className='md:w-auto md:h-auto w-25 h-25' />

          <p className="text-base-content/50 text-sm font-semibold">
            {t("profile:emailVerificationDescription")}
          </p>

          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm text-base-content/50 font-semibold">
              Email Address
            </label>

            {/* 输入邮箱地址 */}
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                className="input w-full bg-base-300 !outline-0 border-0 font-semibold px-4 pl-11"
                placeholder="Enter Email"
                value={status.email}
                onChange={(v) => {
                  setStatus((old) => ({
                    ...old,
                    email: v.target.value
                  }));
                }}
              />
              <Mail className="left-4 absolute w-4.5 h-4.5 text-base-content/50 z-1" />
            </div>

            {/* 邮箱地址 - 格式 - 错误 */}
            <DisplayContent status={email_format_error}>
              <ErrorMessageBox
                className="!mt-0"
                content={t("login:emailError")}
                show={email_format_error} />
            </DisplayContent>
          </div>

          {/* confirm */}
          <ConfirmBox disabled={!status.email || email_format_error} onClick={sendCode}
                      loading={status.send_code_loading}>
            Continue
          </ConfirmBox>
        </div>
      </DisplayContent>

      {/* enter email verification code form */}
      <DisplayContent status={status.step === "STEP2"}>
        <div className="flex flex-col gap-6 items-center">
          <InnerImg name="security-email-verification" className='md:w-auto md:h-auto w-25 h-25' />

          <h2 className="text-base-content text-md font-semibold">
            Enter the Code We Sent
          </h2>

          <p className="text-base-content/50 text-sm font-semibold">
            A code has been sent to: {status.email}
          </p>

          <div className="flex flex-col gap-2 w-full">
            {/* 输入邮箱验证码 */}
            <VerificationInput
              classNames={{
                container: "!h-17 flex justify-between gap-2 !w-auto",
                character:
                  "!h-17 !cursor-pointer flex items-center justify-center p-0 input !outline-0 !bg-base-200 !border-1 !border-base-200 !text-lg font-extrabold justify-center w-full rounded-lg !text-base-content",
                characterSelected: "!bg-base-200 !border-primary !border-base-200",
                characterInactive: "!bg-base-300 !border-base-300 !text-base-content/10",
                characterFilled: "!bg-base-200 !border-base-200"
              }}
              inputProps={{ id: "OPT_CODE", autoComplete: "off" }}
              placeholder="0"
              value={status.opt_code}
              onChange={(v) => setStatus((old) => ({
                ...old,
                opt_code: v
              }))}
            />

            {/* 验证码 - 格式 - 错误 */}
            <DisplayContent status={email_opt_code_error}>
              <ErrorMessageBox content={t("profile:verificationCodeDescription")} show={email_opt_code_error} />
            </DisplayContent>
          </div>

          {/* confirm */}
          <ConfirmBox disabled={!status.email || !status.opt_code || email_opt_code_error} onClick={bindEmail}
                      loading={status.bind_mail_loading}>
            Continue
          </ConfirmBox>

          {/* 验证码发送倒计时 */}
          <div className="text-[10px] text-base-content/50 font-extrabold flex items-center gap-1">
            Didn’t receive the code?
            {status.finished && <div className="text-primary cursor-pointer flex items-center gap-1"
                                     onClick={sendCode}>Resend {status.send_code_loading && (
              <span className="loading loading-spin w-2.5 h-2.5" />)}.</div>}
            {!status.finished && status.end_timestamp > 0 && (<div className="inline-flex items-center gap-1">
              Resend in
              <Countdown end={status.end_timestamp} onFinished={(v) => {
                if (v) setStatus((old) => ({
                  ...old,
                  finished: v
                }));
              }} />
            </div>)}
          </div>
        </div>
      </DisplayContent>

      {/* verify email verification success */}
      <DisplayContent status={status.step === "STEP3"}>
        <MotionContentBox
          show={status.step === "STEP3"}
          content={<div className="flex flex-col gap-6 items-center font-semibold">
            <InnerImg name="security-verification-ok" className='md:w-auto md:h-auto w-25 h-25' />
            <div className="flex flex-col gap-4 items-center">
              <p className="text-md">Verification Success</p>
              <p className="text-base-content/50 text-sm text-center">
                <Trans i18nKey="Your email address has been verified. You're all set to continue." />
              </p>
            </div>
            <ConfirmBox onClick={() => {
              setStatus(initStatus);
            }}>{t("common.close")}</ConfirmBox>
          </div>} />
      </DisplayContent>
    </Modal>
  );
};

const InnerModalHeader = ({ t, step, onClick }: { t: TFunction, step?: string, onClick?: () => void }) => {
  return (
    <div className="flex items-center gap-x-2">
      {step === "STEP2" &&
        <button className="btn btn-square btn-sm mr-2" onClick={onClick}><ChevronLeft className="w-4 h-4" /></button>}
      <p className="text-lg font-bold">{t("profile:emailVerification")}</p>
    </div>
  );
};

function matchResponseCodeErrorForEmail(code: number): string {
  switch (code) {
    case 0:
      return "common.verificationCodeSent";
    case 402:
      return "common.emailHasBeenUsed";
    case 409:
    case 60001:
      return "common.emailAlreadyBound";
    case 1003:
      return "您的操作过于频繁，请稍后再试！";
    default:
      return "common.emailSendError";
  }
}
