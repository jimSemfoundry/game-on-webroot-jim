import { useAuth } from "@/contexts/AuthContext";
import { useAuthModals } from "@/contexts/ModalsProvider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { authService } from "@/services/authService";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import Iconify from "../iconify";
import { Modal } from "../ui/Modal";
import { PasswordInput } from "../ui/PasswordInput";
import { PhoneEmailInput } from "../ui/PhoneEmailInput";
import { useNavigate } from "@tanstack/react-router";
import SocialLogin from "@/components/socialLogin";
import { useCountryCodeByIp } from "@/sections/profile/security/helper.ts";
import type { Country } from "react-phone-number-input";
import { getAuthErrorMessageKey } from "./errorCodes";

type SignInModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FormMode = "signin" | "forgot-password" | "reset-password";

export const SignInModal = ({ isOpen, onClose }: SignInModalProps) => {
  const { t } = useTranslation('profile');
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();

  const { login } = useAuth();
  const { openSignUpModal } = useAuthModals();
  const { data: countryCodeResponse } = useCountryCodeByIp();

  // 获取重定向参数（从当前 URL）
  let redirectPath = "/";
  try {
    // 尝试获取当前页面的搜索参数
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    redirectPath = url.searchParams.get("redirect") || "/";
  } catch (error) {
    // 如果获取失败，使用默认值
    redirectPath = "/";
  }

  // Form state
  const [formMode, setFormMode] = useState<FormMode>("signin");

  // Sign in form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(false);

  // Forgot password form
  const [resetUsername, setResetUsername] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isResetUsernameValid, setIsResetUsernameValid] = useState(false);

  // hCaptcha ref for forgot password
  const resetCaptchaRef = useRef<HCaptcha>(null);

  const CODE_FORGET_PASSWORD_USER_NOT_FOUND = 20014;
  const CODE_FORGET_PASSWORD_USERNAME_INVALID = 20015;
  const CODE_FORGET_PASSWORD_HOST_INVALID = 20016;
  const CODE_FORGET_PASSWORD_CONTACT_NOT_BOUND = 20017;
  const CODE_FORGET_PASSWORD_SEND_CODE_FAILED = 20018;

  const defaultPhoneCountry = useMemo(() => {
    const code = countryCodeResponse?.data?.country_code;
    if (!code) return undefined;
    return code.toUpperCase() as Country;
  }, [countryCodeResponse?.data?.country_code]);

  const resetFormState = useCallback(() => {
    setFormMode("signin");
    setUsername("");
    setPassword("");
    setIsLoading(false);
    setIsUsernameValid(false);
    setResetUsername("");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
    setIsResetLoading(false);
    setIsResetUsernameValid(false);
    resetCaptchaRef.current?.resetCaptcha?.();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      const timeoutId = window.setTimeout(() => {
        resetFormState();
      }, 250);

      return () => window.clearTimeout(timeoutId);
    }

    return undefined;
  }, [isOpen, resetFormState]);

  const handleClickSignUp = () => {
    onClose();
    openSignUpModal();
  };

  const handleSignIn = async () => {
    // Check if username is valid before submitting
    if (!isUsernameValid) {
      toast.error(t("login:pleaseEnterValidUsernameOrEmail"));
      return;
    }

    if (!password.trim()) {
      toast.error(t("login:pleaseEnterPassword"));
      return;
    }

    try {
      setIsLoading(true);
      await login(username, password);
      toast.success(t("toast:signInSuccess"));
      onClose();

      // 登录成功后重定向到原始页面
      if (redirectPath && redirectPath !== "/" && redirectPath !== "/casino") {
        // 使用短暂延迟确保登录状态已更新
        setTimeout(() => {
          navigate({ to: redirectPath as any });
        }, 100);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setFormMode("forgot-password");
  };

  const handleBackToSignIn = () => {
    setFormMode("signin");
    // Reset form fields
    setResetUsername("");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSendResetCode = async () => {
    console.info(`isOpen=${isOpen}`);
    console.info(`formMode=${formMode}`);

    if (!resetUsername.trim()) {
      toast.error(t("login:pleaseCheckYourUsername"));
      return;
    }

    // Check if reset username is valid
    if (!isResetUsernameValid) {
      toast.error(t("login:pleaseEnterValidUsernameOrEmail"));
      return;
    }

    setIsResetLoading(true);

    try {
      if (resetCaptchaRef.current && resetCaptchaRef.current.execute) {
        resetCaptchaRef.current?.execute();
      }
    } catch (error) {
      console.error("Error executing captcha:", error);
      setIsResetLoading(false);
    }
  };

  const handleResetCaptchaVerify = async (token: string) => {
    if (!token) {
      console.error("No captcha token available");
      setIsResetLoading(false);
      return;
    }

    const data: any = {
      username: resetUsername,
      hcaptcha_token: token,
    };

    if (import.meta.env.VITE_PROMOTION_MODEL === 'roibest') {
      data.url = window.location.origin + window.location.pathname + '#';
    }

    try {
      await authService.sendPasswordResetCode(data);
      toast.success(t("common:common.submissionSuccessful"));
      setFormMode("reset-password");
    } catch (error: any) {
      console.error(error);
      const errorCode = error?.code ?? error?.responseData?.code;

      if (errorCode === CODE_FORGET_PASSWORD_USER_NOT_FOUND) {
        toast.error(t("login:forgotPasswordUserNotFound"));
      } else if (errorCode === CODE_FORGET_PASSWORD_USERNAME_INVALID || errorCode === 1002) {
        toast.error(t("login:forgotPasswordUsernameInvalid"));
      } else if (errorCode === CODE_FORGET_PASSWORD_HOST_INVALID) {
        toast.error(t("login:forgotPasswordHostInvalid"));
      } else if (errorCode === CODE_FORGET_PASSWORD_CONTACT_NOT_BOUND) {
        toast.error(t("login:forgotPasswordContactNotBound"));
      } else if (errorCode === CODE_FORGET_PASSWORD_SEND_CODE_FAILED) {
        toast.error(t("login:forgotPasswordSendCodeFailed"));
      } else {
        toast.error(error?.message || "Failed to send verification code");
      }
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleResetCaptchaError = (err: string) => {
    console.error("hCaptcha error:", err);
    setIsResetLoading(false);
  };

  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setVerificationCode(text.trim());
      }
    } catch (error) {
      console.error("Failed to read clipboard:", error);
    }
  };

  const handleResetPassword = async () => {
    if (!verificationCode.trim()) {
      toast.error(t("login:invalidVerificationCode"));
      return;
    }
    if (!newPassword.trim()) {
      toast.error(t("login:passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("login:passwordsDoNotMatch");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("login:passwordTooShort");
      return;
    }

    setIsResetLoading(true);
    authService.resetPassword(resetUsername, verificationCode, newPassword).then((res) => {
      if (res.code === 0 || res.code === 200) {
        toast.success(t("login:passwordResetSuccess"));
        setFormMode("signin");
        // Clear form fields
        setResetUsername("");
        setVerificationCode("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(t(getAuthErrorMessageKey(res.code)));
      }
    }).catch((error) => {
      console.error(error);
      toast.error(t("login:failed_to_reset_password"));
    }).finally(() => {
      setIsResetLoading(false);
    });
  };

  const renderPromoCard = () => (
    <div
      style={{
        isolation: "isolate",
        background:
          `linear-gradient(120deg,
  var(--color-base-300) 0%,
  var(--color-base-400) 52.8%,
  
  color-mix(in oklch, var(--color-primary) 10%, transparent) 53.2%,
  color-mix(in oklch, var(--color-primary) 10%, transparent) 81.8%,
  
  color-mix(in oklch, var(--color-primary) 40%, transparent) 82.2%,
  color-mix(in oklch, var(--color-primary) 40%, transparent) 87.8%,
  
  color-mix(in oklch, var(--color-primary) 20%, transparent) 88.2%,
  color-mix(in oklch, var(--color-primary) 20%, transparent) 92.8%,
  
  color-mix(in oklch, var(--color-primary) 10%, transparent) 93.2%,
  color-mix(in oklch, var(--color-primary) 10%, transparent) 100%
)`
      }}
      className="relative h-[140px] overflow-hidden xs:h-[140px] sm:h-full rounded-t-box w-full sm:w-[310px] sm:rounded-r-none rtl:rotate-y-180">
      {/** Title */}
      <div
        className="font-extrabold text-xl sm:text-2xl leading-5 sm:leading-6 whitespace-pre-line p-7 sm:p-6 z-50 relative rtl:rotate-y-180">
        <p className="text-base-content">{t("login:signInModal.promoTitle1")}</p>
        <p className="text-primary">{t("login:signInModal.promoTitle2")}</p>
      </div>
      {/** Illustration */}
      <img
        src="/images/illustrations/tiger.png"
        alt="Sign in modal image"
        className="absolute left-[171px] z-20 top-0 w-[171px] -rotate-[9deg] h-[224px] object-cover translate-x-4 sm:min-w-[333px] sm:h-[434px] sm:left-0 sm:top-[138px] sm:-ml-4"
      />
    </div>
  );

  const renderSignInForm = () => (
    <div
      className="p-5 sm:p-6 flex flex-col gap-4 flex-1 relative h-full min-h-[400px] overflow-y-auto pb-[max(var(--safe-area-inset-bottom),16px)]"
      onFocusCapture={(e) => {
        // iOS Safari: ensure focused inputs scroll into view on first keyboard open
        if (!isMobile) return;
        const target = e.target as HTMLElement;
        window.setTimeout(() => target.scrollIntoView({ block: "center" }), 50);
      }}
    >
      <div className="flex items-center gap-2">
        <Iconify icon="custom:lock" className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        <h2 className="text-base sm:text-xl font-semibold">{t("login:secureSignIn")}</h2>
        <button
          className={"btn btn-sm btn-square absolute right-4 rtl:left-4 rtl:right-auto top-4 rounded-lg h-7.5 w-7.5 z-50"}
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>

      <form
        className="flex flex-col gap-4 w-full"
        onSubmit={(e) => {
          e.preventDefault();
          handleSignIn();
        }}
      >
        <div className="flex flex-col gap-2">
          <PhoneEmailInput
            placeholder={t("login:emailOrPhoneNumber")}
            value={username}
            onChange={(value) => setUsername(value)}
            onValidationChange={(isValid) => setIsUsernameValid(isValid)}
            defaultCountry={defaultPhoneCountry}
          />
          <PasswordInput value={password} onChange={(value) => setPassword(value)} />
        </div>

        <p className="text-sm text-base-content/50 text-end hover:underline cursor-pointer sm:text-md font-semibold">
          <span onClick={handleForgotPassword}>{t("login:forgotPassword")}</span>
        </p>

        <div className="flex flex-col gap-2">
          <button type="submit" className="btn btn-primary btn-md sm:btn-lg" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="loading loading-spinner loading-sm" />
                {t("login:signIn")}
              </div>
            ) : (
              <p>{t("login:signIn")}</p>
            )}
          </button>
          <button type="button" className="btn btn-ghost btn-md sm:btn-lg text-primary" onClick={handleClickSignUp}>
            {t("login:needAnAccountSignUp")}
          </button>
        </div>
      </form>

      {/* 社媒登录 */}
      <SocialLogin enabled={isOpen} />
    </div>
  );

  const renderForgotPasswordForm = () => (
    <div
      className="p-5 sm:p-6 flex flex-col gap-4 flex-1 relative h-full min-h-[400px] sm:min-h-[455px] justify-between">
      <div className="flex items-center gap-2">
        <Iconify icon="custom:question" className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        <h2 className="text-base sm:text-xl font-semibold">{t("login:recoverPassword")}</h2>
        <button
          className={"btn btn-sm btn-square absolute right-4 rtl:left-4 rtl:right-auto top-4 rounded-lg h-7.5 w-7.5 z-50"}
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-sm text-base-content/70">{t("login:forgotPasswordDescription")}</p>

        <form
          className="flex flex-col gap-4 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendResetCode();
          }}
        >
          <PhoneEmailInput
            placeholder={t("login:emailOrPhoneNumber")}
            value={resetUsername}
            onChange={(value) => setResetUsername(value)}
            onValidationChange={(isValid) => setIsResetUsernameValid(isValid)}
            defaultCountry={defaultPhoneCountry}
          />

          <button type="submit" className="btn btn-primary btn-md sm:btn-lg" disabled={isResetLoading}>
            {isResetLoading ? (
              <div className="flex items-center gap-2">
                <div className="loading loading-spinner loading-sm" />
                {t("login:recoverPassword")}
              </div>
            ) : (
              <p>{t("login:recoverPassword")}</p>
            )}
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <div className="w-full h-px bg-linear-to-r from-base-content/0 to-base-content/10 text-nowrap" />
          <p className="text-nowrap">{t("login:or")}</p>
          <div className="w-full h-px bg-linear-to-r from-base-content/10 to-base-content/0" />
        </div>

        <button type="button" className="btn btn-ghost btn-md sm:btn-lg" onClick={handleBackToSignIn}>
          {t("login:backToSignIn")}
        </button>
      </div>
    </div>
  );

  const renderResetPasswordForm = () => (
    <div
      className="p-5 sm:p-6 flex flex-col gap-4 flex-1 relative h-full min-h-[400px] sm:min-h-[455px] justify-between">
      <div className="flex items-center gap-2">
        <Iconify icon="custom:question" className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        <h2 className="text-base sm:text-xl font-semibold">{t("login:resetPassword")}</h2>
        <button
          className={"btn btn-sm btn-square absolute right-4 rtl:left-4 rtl:right-auto top-4 rounded-lg h-7.5 w-7.5 z-50"}
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center gap-2">
            <label className="input input-md sm:input-lg input-ghost bg-base-300 text-base-content flex-1">
              <input
                type="text"
                placeholder={t("login:OTPCode")}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className=""
              />
              {!isMobile && (
                <button type="button" className="btn btn-primary btn-soft btn-sm" onClick={handlePasteCode}>
                  <Iconify icon="custom:paste" />
                  <p>{t("profile:paste")?.toUpperCase() ?? "PASTE"}</p>
                </button>
              )}
            </label>
          </div>
        </div>

        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleResetPassword();
          }}
        >
          <h3 className="text-base font-semibold mb-2">{t("login:resetPassword")}</h3>
          <div className="flex flex-col gap-2">
            <div className="relative">
              <input
                type="password"
                placeholder={t("login:newPassword")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input input-md sm:input-lg input-ghost bg-base-300 text-base-content w-full"
              />
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder={t("login:confirmPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input input-md sm:input-lg input-ghost bg-base-300 text-base-content w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <button type="submit" className="btn btn-primary btn-md sm:btn-lg" disabled={isResetLoading}>
              {isResetLoading ? (
                <div className="flex items-center gap-2">
                  <div className="loading loading-spinner loading-sm" />
                  {t("login:resetPassword")}
                </div>
              ) : (
                t("login:resetPassword")
              )}
            </button>
          </div>
        </form>
      </div>

      <p className="text-sm text-base-content/70 text-center flex-nowrap">
        <span>{t("login:dontReceiveCode")}</span>{" "}
        <span className="text-primary hover:underline cursor-pointer" onClick={handleSendResetCode}>
          {t("login:resend")}
        </span>
      </p>
    </div>
  );

  const renderCurrentForm = () => (
    <AnimatePresence mode="wait">
      {formMode === "signin" && renderSignInForm()}
      {formMode === "forgot-password" && renderForgotPasswordForm()}
      {formMode === "reset-password" && renderResetPasswordForm()}
    </AnimatePresence>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        hideTitle
        onClose={onClose}
        className="bg-base-400 rounded-t-box max-h-[700px] h-[calc(100svh-48px)] md:max-h-[513px] left-2 right-2 sm:left-auto sm:right-auto sm:min-w-[742px] p-0 sm:p-0"
        closeButtonClassName="hidden"
        position={isMobile ? "modal-bottom" : "modal-middle"}
        zIndex={1002}
        outsideClose={false}
      >
        <div className="card card-xs w-full h-full">
          <div className="card-body p-0 flex flex-col sm:flex-row">
            {/** Promo card */}
            {renderPromoCard()}
            <div className="flex-1">{renderCurrentForm()}</div>
          </div>
        </div>
      </Modal>

      {/* hCaptcha for forgot password rendered outside modal to avoid z-index issues */}
      {isOpen &&
        ["reset-password", "forgot-password"].includes(formMode) &&
        createPortal(
          <HCaptcha
            sitekey="3c365144-fab8-43b8-812a-8af04e8cf134"
            size="invisible"
            onVerify={handleResetCaptchaVerify}
            onError={handleResetCaptchaError}
            ref={resetCaptchaRef}
            custom
            theme="dark"
          />,
          document.body
        )}
    </>
  );
};
