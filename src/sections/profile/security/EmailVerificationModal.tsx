import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { authService } from "@/services/authService.ts";
import { useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { email_reg_exp } from "@/utils/regexp.ts";
import { TFunction } from "i18next";
import { MotionContentBox } from "@/components/modal/UserFinanceModal/c/MotionContentBox.tsx";
import { toast } from "sonner";
import { InnerImg } from "@/sections/profile/security/ChangePassword.tsx";
import { ChevronLeft, Mail } from "lucide-react";
import { OTPInput } from "input-otp";
import Countdown from "@/sections/profile/security/Countdown.tsx";
import dayjs from "dayjs";
import { matchResponseCodeError } from "@/sections/profile/security/response_code.ts";
import { useQueryClient } from "@tanstack/react-query";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

interface IStatus {
  step: "STEP1" | "STEP2" | "STEP3",
  email: string,
  opt_code: string,
  success: boolean
  send_code_loading: boolean
  bind_mail_loading: boolean
  finished: boolean
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
  countdown: 60,
  end_timestamp: 0
};

export const EmailVerificationModal = (
  {
    open,
    onClose
  }: {
    open: boolean;
    onClose: () => void;
  }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const { t } = useTranslation("profile");

  const [status, setStatus] = useState<IStatus>(initStatus);

  /**
   * 邮箱格式错误
   */
  const email_format_error = status.email !== "" && !email_reg_exp.test(status.email);

  /**
   * 验证码格式错误
   */
  const email_opt_code_error = status.opt_code !== "" && !/^[0-9]{6}$/.test(status.opt_code);

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
          toast.success(t(matchResponseCodeErrorForEmail(0)));
          setStatus((old) => ({
            ...old,
            step: "STEP2",
            finished: false,
            end_timestamp: dayjs().add(status.countdown * 1000).valueOf()
          }));
          void queryClient.refetchQueries({ queryKey: ["auth", "currentUser"] });
        } else {
          toast.error(t(matchResponseCodeErrorForEmail(res.code)));
        }
      }).catch((error) => {
      console.info(error);
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
        } else if (res.code === 400) {
          toast.error(t("common:invalid_or_expired_verification_code"));
        } else {
          toast.error(t(matchResponseCodeError(res.code)));
        }
      }).catch((error) => {
      console.info(error);
    })
      .finally(() => {
        setStatus((old) => ({ ...old, bind_mail_loading: false }));
      });
  };

  return (
    <Modal
      title={<InnerModalHeader t={t} step={status.step} onClick={() => setStatus((v) => ({ ...v, step: "STEP1" }))} />}
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
      className="bg-base-400 md:max-w-[420px] shadow-lg"
    >
      {/* send email verification code form */}
      <DisplayContent status={status.step === "STEP1"}>
        <div className="flex flex-col gap-6 items-center">
          <InnerImg name="security-email-verification" className="md:w-auto md:h-auto w-25 h-25" />

          <p className="text-base-content/50 text-sm font-semibold">
            {t("profile:emailVerificationDescription")}
          </p>

          <div className="relative flex flex-col gap-2 w-full">
            <label className="text-sm text-base-content/50 font-semibold">
              {t("profile:emailAddress")}
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
            <ErrorMessageBox
              sample
              content={t("login:emailError")}
              show={email_format_error} />
          </div>

          {/* confirm */}
          <ConfirmBox disabled={!status.email || email_format_error} onClick={sendCode}
                      loading={status.send_code_loading}>
            {t("common:common.continue")}
          </ConfirmBox>
        </div>
      </DisplayContent>

      {/* enter email verification code form */}
      <DisplayContent status={status.step === "STEP2"}>
        <div className="flex flex-col gap-6 items-center">
          <InnerImg name="security-email-verification" className="md:w-auto md:h-auto w-25 h-25" />

          <h2 className="text-base-content text-md font-semibold">
            {t("profile:codeSent")}
          </h2>

          <p className="text-base-content/50 text-sm font-semibold text-center">
            {t("profile:codeSentTo")}: {status.email}
          </p>

          <div className="relative flex flex-col gap-2 w-full">
            {/* 输入邮箱验证码 */}
            <OTPInput
              ref={inputRef}
              autoFocus
              maxLength={6}
              inputMode="numeric"
              containerClassName="group flex items-center has-[:disabled]:opacity-50"
              render={({ slots }) => (
                <div className="flex gap-2 justify-between flex-1">
                  {slots.map((slot, idx) => (
                    <div key={idx}
                         className="flex-1 min-w-10 min-h-12 rounded-md flex items-center justify-center bg-base-200 text-2xl font-extrabold font-sans">
                      {slot.char}
                      {slot.hasFakeCaret && <div className="w-px h-4 bg-primary animate-caret-blink" />}
                    </div>
                  ))}
                </div>
              )}
              placeholder="-"
              value={status.opt_code}
              onChange={(v) => {
                if (v === "" || /^\d+$/.test(v))
                  setStatus((old) => ({
                    ...old,
                    opt_code: v
                  }));
              }}
            />

            {/* 验证码 - 格式 - 错误 */}
            <ErrorMessageBox sample content={t("profile:verificationCodeDescription")} show={email_opt_code_error} />
          </div>

          {/* confirm */}
          <ConfirmBox disabled={!status.email || !status.opt_code || email_opt_code_error} onClick={bindEmail}
                      loading={status.bind_mail_loading}>
            {t("common:common.continue")}
          </ConfirmBox>

          {/* 验证码发送倒计时 */}
          <div className="text-[10px] text-base-content/50 font-extrabold flex items-center gap-1">
            {t("profile:notReceiveCode")}
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
          sample
          show={status.step === "STEP3"}
          content={<div className="flex flex-col gap-6 items-center font-semibold">
            <InnerImg name="security-verification-ok" className="md:w-auto md:h-auto w-25 h-25" />
            <div className="flex flex-col gap-4 items-center">
              <p className="text-md">{t("profile:verificationSuccess")}</p>
              <p className="text-base-content/50 text-sm text-center">
                <Trans i18nKey={t("profile:email_address_has_been_verified")} />
              </p>
            </div>
            <ConfirmBox onClick={() => {
              onClose();
              setStatus(initStatus);
            }}>{t("common:common.close")}</ConfirmBox>
          </div>} />
      </DisplayContent>
    </Modal>
  );
};

export default EmailVerificationModal;

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
      return "common:common.verificationCodeSent";
    case 400:
      return "common:invalid_or_expired_verification_code";
    case 402:
      return "common:common.emailHasBeenUsed";
    case 409:
    case 1003:
    case 60001:
      return "common:common.emailAlreadyBound";
    case 429:
      return "common:common.tooManyRequests";
    default:
      return "common:common.emailSendError";
  }
}