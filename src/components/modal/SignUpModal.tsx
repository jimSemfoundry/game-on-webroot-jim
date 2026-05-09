import { useAuth } from "@/contexts/AuthContext";
import { useAuthModals } from "@/contexts/ModalsProvider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { authService } from "@/services/authService";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import Iconify from "../iconify";
import { Modal } from "../ui/Modal";
import { PasswordInput } from "../ui/PasswordInput";
import { PhoneEmailInput } from "../ui/PhoneEmailInput";
import SocialLogin from "@/components/socialLogin";
import { getCookie } from "@/utils/browser";
import { password_reg_exp } from "@/utils/regexp";
import { useCountryCodeByIp } from "@/sections/profile/security/helper";
import type { Country } from "react-phone-number-input";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import { trackCustomEvent, uuidv4Generate } from "@/utils/helper.ts";

type SignUpModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const SignUpModal = ({ isOpen, onClose }: SignUpModalProps) => {
  const { t } = useTranslation(['login']);
  const { openSignInModal } = useAuthModals();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { login } = useAuth();
  // const siteName = import.meta.env.VITE_WEBSITE_NICKNAME || "";
  const { data: countryCodeResponse } = useCountryCodeByIp();
  const { data: baseConf } = useBaseConfig();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // const [referralCode, setReferralCode] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreeMarketing, setAgreeMarketing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const captchaRef = useRef<HCaptcha>(null);

  const defaultPhoneCountry = useMemo(() => {
    const code = countryCodeResponse?.data?.country_code;
    if (!code) return undefined;
    return code.toUpperCase() as Country;
  }, [countryCodeResponse?.data?.country_code]);

  const handleClickSignIn = () => {
    onClose();
    openSignInModal();
  };

  const handleCaptchaVerify = (token: string) => {
    console.log("Captcha verified with token:", token);
    // Call handleFormSubmission with the token directly instead of relying on state
    handleFormSubmissionWithToken(token);
  };

  const handleCaptchaError = (err: string) => {
    console.error("hCaptcha error:", err);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Form submitted!", { username, password });
    e.preventDefault();

    if (!agreeTerms) {
      toast.error(t("login:must_agree"));
      return;
    }

    if (!username.trim()) {
      toast.error(t("login:pleaseEnterValidUsernameOrEmail"));
      return;
    }

    if (username.length < 6) {
      toast.error(t("login:usernameTooShort"));
      return;
    }

    if (!password.trim()) {
      toast.error(t("login:pleaseEnterPassword"));
      return;
    }

    if (password.length < 6) {
      toast.error(t("login:passwordTooShort"));
      return;
    }

    console.log("Validation passed, setting submitting state");
    setIsSubmitting(true);

    try {
      console.log("Executing captcha...");
      if (captchaRef.current && captchaRef.current.execute) {
        captchaRef.current?.execute();
      }
    } catch (error) {
      console.error("Error executing captcha:", error);
      setIsSubmitting(false);
    }
  };

  const handleFormSubmissionWithToken = async (captchaToken: string) => {
    console.log("Submitting form with captcha token:", captchaToken);

    if (!captchaToken) {
      console.error("No captcha token available");
      setIsSubmitting(false);
      return;
    }

    let data = {
      username,
      password,
      hcaptcha_token: captchaToken,
      email_subscription_flag: agreeMarketing,
      startapp: localStorage.getItem("startapp") || ""
    };

    let ad_param = "";
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("__rb_") && key.endsWith("_params")) {
        ad_param = localStorage.getItem(key) || "";
        break;
      }
    }

    /**
     * 同步旧版本新的修改 t107262 --start
     * https://applink.larksuite.com/client/todo/detail?guid=1c9ac498-b62f-4b02-ba96-cfbcd374715b&suite_entity_num=t107262
     */
    const device_id = uuidv4Generate();

    /**
     * 同步旧版本新的修改 t107262 -- end
     */

    const signupFunction = import.meta.env.VITE_PROMOTION_MODEL === "roibest" ? authService.signupRoiBest : authService.signUp;

    let pixelIdFromAdParam = "";
    try {
      const normalized = ad_param.startsWith("?") ? ad_param.slice(1) : ad_param;
      pixelIdFromAdParam = new URLSearchParams(normalized).get("pixel_id") || "";
    } catch {
      pixelIdFromAdParam = "";
    }

    const signupData = import.meta.env.VITE_PROMOTION_MODEL === "roibest" ?
      {
        ...data,
        ad_param: ad_param,
        device_id
      } : {
        ...data,
        ad_param: ad_param,
        fbp: getCookie("_fbp") || "",
        fbc: getCookie("_fbc") || "",
        pixel_id: pixelIdFromAdParam || import.meta.env.VITE_FACEBOOK_PIXEL_ID || "",
        device_id
      };


    try {
      await signupFunction(signupData);

      console.log("Sign up successful, attempting auto-login...");

      // 注册成功后自动登录
      try {
        await login(username, password);
        toast.success(
          t("toast:account_created_and_logged_in_successfully", {
            defaultValue: "Account created and logged in successfully!"
          })
        );
        onClose();

        // GTM 记录推送
        const { password: _password, hcaptcha_token: _hcaptcha_token, ...trackData } = signupData;
        trackCustomEvent('signup', 'userSignUp', trackData)
      } catch (loginError) {
        console.error("Auto-login failed:", loginError);
        toast.success("Account created successfully! Please sign in.");
        onClose();
        // 可选：打开登录模态框
        // openSignInModal()
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error("Form submission error:", error);
      const apiCode = (error as { code?: number; responseData?: { code?: number } } | undefined)?.code ??
        (error as { responseData?: { code?: number } } | undefined)?.responseData?.code;

      if (apiCode === CODE_EMAIL_ALREADY_REGISTERED) {
        toast.error(t("login:emailAlreadyRegistered"));
      } else if (apiCode === CODE_MOBILE_ALREADY_REGISTERED) {
        toast.error(t("login:phoneNumberAlreadyRegistered"));
      } else if (apiCode === CODE_USERNAME_ALREADY_REGISTERED) {
        toast.error(t("login:usernameAlreadyRegistered"));
      } else if (apiCode === 1002) {
        toast.error(t("login:pleaseCheckYourUsername"));
      } else if (error instanceof Error && error.message) {
        toast.error(error.message);
      } else {
        toast.error(t("login:pleaseTryAgainLater"));
      }
      setIsSubmitting(false);
    }
  };

  const CODE_EMAIL_ALREADY_REGISTERED = 20011;
  const CODE_MOBILE_ALREADY_REGISTERED = 20012;
  const CODE_USERNAME_ALREADY_REGISTERED = 20013;

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
      className="relative h-[140px] overflow-hidden sm:h-[610px] rounded-t-box w-full sm:w-[310px] sm:rounded-r-none rtl:rotate-y-180 flex-shrink-0">
      {/** Title */}
      <div
        className="font-extrabold text-xl sm:text-2xl leading-5 sm:leading-6 whitespace-pre-line p-7 sm:p-6 z-50 relative rtl:rotate-y-180">
        <p className="text-base-content">{t("login:signUpModal.promoTitle1")}</p>
        <p className="text-primary">{t("login:signUpModal.promoTitle2")}</p>
      </div>
      {/** Illustration */}
      <img
        src={import.meta.env.VITE_SIGNUP_MODAL_IMAGE || "/images/illustrations/d4e43016f111393f13035dec78c262fcd55ee1ed.png"}
        className="absolute z-20 w-[229px] h-[229px] left-[153px] rtl:right -[153px] rtl:rotate-y-180 top-0 md:-left-[48px] md:top-[179px] md:min-w-[442px] md:min-h-[442px] object-cover bg-no-repeat"
      />
    </div>
  );

  const renderLoginForm = () => (
    <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1 relative overflow-y-auto">
      <div className="flex items-center gap-2">
        <Iconify icon="custom:lock" className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        <h2 className="text-base sm:text-xl font-semibold">{t("login:secureSignUp")}</h2>
        <button
          className={"btn btn-sm btn-square absolute right-4 rtl:left-4 rtl:right-auto top-4 rounded-lg h-7.5 w-7.5 z-50"}
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>
      <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
        <PhoneEmailInput
          placeholder={t("login:emailOrPhoneNumber")}
          value={username}
          onChange={(value) => setUsername(value)}
          defaultCountry={defaultPhoneCountry}
        />
        <PasswordInput value={password} onChange={(value) => setPassword(value.replace(password_reg_exp, ""))} autoComplete="new-password" />

        {/* <p className="text-sm text-base-content/50 text-end hover:underline cursor-pointer sm:text-md font-semibold">{t('forgotPassword')}</p> */}
        {/*<Accordion type="single" collapsible className="w-full">*/}
        {/*  <AccordionItem value="item-1">*/}
        {/*    <AccordionTrigger className="group flex items-center justify-end w-full cursor-pointer select-none">*/}
        {/*      <div className="flex items-center gap-2">*/}
        {/*        <p className="text-xs md:text-sm font-semibold text-base-content/50">{t("referral:referralCode")}</p>*/}
        {/*        <ChevronDown*/}
        {/*          size={16}*/}
        {/*          className="text-base-content/50 transition-transform duration-300 group-data-[state=open]:rotate-180"*/}
        {/*        />*/}
        {/*      </div>*/}
        {/*    </AccordionTrigger>*/}
        {/*    <AccordionContent className="mt-2">*/}
        {/*      <input*/}
        {/*        placeholder={t("referral:referralCode")}*/}
        {/*        value={referralCode}*/}
        {/*        onChange={(e) => setReferralCode(e.target.value)}*/}
        {/*        className="input input-md sm:input-lg input-ghost bg-base-300 text-base-content w-full"*/}
        {/*      />*/}
        {/*    </AccordionContent>*/}
        {/*  </AccordionItem>*/}
        {/*</Accordion>*/}

        <div className="flex flex-col gap-y-2 px-3 mt-4">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              className="checkbox checkbox-sm md:checkbox-md checkbox-primary rounded-sm"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            ></input>
            <p className="text-xs md:text-sm text-base-content/50">{t("login:userAgreementConfirm")}</p>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              className="checkbox checkbox-sm md:checkbox-md checkbox-primary rounded-sm"
              checked={agreeMarketing}
              onChange={(e) => setAgreeMarketing(e.target.checked)}
            ></input>
            <p
              className="text-xs md:text-sm text-base-content/50">{t("login:marketingPromotions", { siteName: `[${baseConf?.data?.h5?.replace(/^https?:\/\//, "")}]` })}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <button type="submit" className="btn btn-primary btn-md sm:btn-lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                {t("login:signUp")}
              </>
            ) : (
              t("login:signUp")
            )}
          </button>
        </div>
      </form>

      <button type="button" className="btn btn-ghost btn-md sm:btn-lg text-primary -mt-2" onClick={handleClickSignIn}>
        {t("login:alreadyHaveAnAccount")}
      </button>

      {/* 社媒登录 */}
      <SocialLogin enabled={isOpen} />
    </div>
  );

  return (
    <>
      <Modal
        hideTitle
        isOpen={isOpen}
        onClose={onClose}
        closeButtonClassName="hidden"
        className="bg-base-400 rounded-t-box max-h-[700px] h-[calc(100svh-48px)] md:max-h-[610px] left-2 right-2 sm:left-auto sm:right-auto sm:min-w-[742px] p-0 sm:p-0"
        position={isMobile ? "modal-bottom" : "modal-middle"}
        zIndex={1002}
        outsideClose={false}
      >
        <div className="card card-xs w-full h-full">
          <div className="card-body p-0 flex flex-col sm:flex-row">
            {/** Promo card */}
            {renderPromoCard()}
            {renderLoginForm()}
          </div>
        </div>
      </Modal>

      {/* hCaptcha rendered outside of modal to avoid z-index issues */}
      {isOpen &&
        createPortal(
          <HCaptcha
            sitekey="3c365144-fab8-43b8-812a-8af04e8cf134"
            size="invisible"
            onVerify={handleCaptchaVerify}
            onError={handleCaptchaError}
            onClose={() => {
              setIsSubmitting(false);
            }}
            ref={captchaRef}
            custom
            theme="dark"
          />,
          document.body
        )}
    </>
  );
};
