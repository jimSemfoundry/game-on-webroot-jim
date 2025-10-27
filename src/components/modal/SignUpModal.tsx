import { useAuth } from "@/contexts/AuthContext";
import { useAuthModals } from "@/contexts/ModalsProvider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { authService } from "@/services/authService";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { AccordionContent, AccordionTrigger } from "@radix-ui/react-accordion";
import { ChevronDown, X } from "lucide-react";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import Iconify from "../iconify";
import { Accordion, AccordionItem } from "../ui/Accordion";
import { Modal } from "../ui/Modal";
import { PasswordInput } from "../ui/PasswordInput";
import { PhoneEmailInput } from "../ui/PhoneEmailInput";
import SocialLogin from "@/components/socialLogin";

type SignUpModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const SignUpModal = ({ isOpen, onClose }: SignUpModalProps) => {
  const { t } = useTranslation();
  const { openSignInModal } = useAuthModals();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const captchaRef = useRef<HCaptcha>(null);

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
      toast.error("You must agree to the terms and conditions");
      return;
    }
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    console.log("Validation passed, setting submitting state");
    setIsSubmitting(true);

    try {
      console.log("Executing captcha...");
      if (captchaRef.current) {
        captchaRef.current.execute();
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

    try {
      await authService.signUp({
        username,
        password,
        hcaptcha_token: captchaToken,
        email_subscription_flag: agreeMarketing,
        startapp: localStorage.getItem("startapp") || "",
      });

      console.log("Sign up successful, attempting auto-login...");

      // 注册成功后自动登录
      try {
        await login(username, password);
        toast.success("Account created and logged in successfully!");
        onClose();
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
      toast.error("Sign up failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  const renderPromoCard = () => (
    <div className="relative h-[140px] overflow-hidden sm:h-[615px]  rounded-t-box w-full sm:w-[310px] sm:rounded-r-none rtl:rotate-y-180">
      {/** Title */}
      <div className="font-extrabold text-xl sm:text-2xl leading-5 sm:leading-6 whitespace-pre-line p-7 sm:p-6 z-50 relative rtl:rotate-y-180">
        <p className="text-base-content">{t("login:signUpModal.promoTitle1")}</p>
        <p className="text-primary">{t("login:signUpModal.promoTitle2")}</p>
      </div>
      {/** Illustration */}
      <img
        src="/images/illustrations/d4e43016f111393f13035dec78c262fcd55ee1ed.png"
        className="absolute z-20 w-[229px] h-[229px] left-[153px] rtl:right -[153px] rtl:rotate-y-180 top-0 md:-left-[48px] md:top-[179px] md:min-w-[442px] md:min-h-[442px] object-cover bg-no-repeat"
      />
      {/** Background */}
      <div
        className="absolute inset-0 z-0 rounded-t-box"
        style={{
          background:
            "linear-gradient(90deg, transparent 28.45%, color-mix(in oklch, var(--color-base-300), transparent 30%) 99.82%), linear-gradient(270deg, transparent 71.67%, color-mix(in oklch, var(--color-base-300), transparent 10%) 100%), linear-gradient(0deg, transparent 40.33%, color-mix(in oklch, var(--color-base-300), transparent 10%) 85.41%), linear-gradient(180deg, transparent 0%, color-mix(in oklch, var(--color-base-300), transparent 10%) 59.51%), url(/images/illustrations/75a2f479bdb1a69ccf2140854ec9033038e744a5.png) lightgray center / cover no-repeat",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
          WebkitTransform: "translateZ(0)",
          transform: "translateZ(0)",
        }}
      />
      {/** Ellipse 4 */}
      <div className="absolute -top-[230px] left-[112px] w-[286px] h-[286px] rounded-full bg-base-300 blur-[38px] z-10 sm:-left-[147px] sm:-top-[359px] sm:w-[600px] sm:h-[600px] sm:blur-[80px]" />
      {/**Ellipse 3 */}
      <div className="absolute top-[50px] left-[153px] w-[286px] h-[166px] rounded-full bg-primary blur-[38px] z-0 sm:-left-[63px] sm:top-[225px] sm:w-[600px] sm:h-[348px] sm:blur-[80px]" />
      {/**Rectangle 2 */}
      <div className="absolute -top-[85px] left-[152px] w-[71px] h-[311px] bg-primary/10 skew-x-[12deg] rotate-[36deg] translate-x-4 sm:translate-x-16 sm:-left-[63px] sm:-top-[57px] sm:w-[148px] sm:h-[652px]" />
      {/**Rectangle 3 */}
      <div className="absolute -top-[60px] left-[218px] w-[110px] h-[350px] skew-x-[12deg] rotate-[36deg] bg-primary/10 border-primary/40 border-l-[18px] translate-x-2 sm:left-[74px] sm:-top-[2px] sm:w-[230px] sm:h-[732px] sm:border-l-[38px]" />
    </div>
  );

  const renderLoginForm = () => (
    <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1 relative">
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
        <PhoneEmailInput placeholder={t("login:emailOrPhoneNumber")} value={username} onChange={(value) => setUsername(value)} />
        <PasswordInput value={password} onChange={(value) => setPassword(value)} />

        {/* <p className="text-sm text-base-content/50 text-end hover:underline cursor-pointer sm:text-md font-semibold">{t('forgotPassword')}</p> */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="group flex items-center justify-end w-full cursor-pointer select-none">
              <div className="flex items-center gap-2">
                <p className="text-xs md:text-sm font-semibold text-base-content/50">{t("referral:referralCode")}</p>
                <ChevronDown
                  size={16}
                  className="text-base-content/50 transition-transform duration-300 group-data-[state=open]:rotate-180"
                />
              </div>
            </AccordionTrigger>
            <AccordionContent className="mt-2">
              <input
                placeholder={t("referral:referralCode")}
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="input input-md sm:input-lg input-ghost bg-base-300 text-base-content w-full"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex flex-col gap-y-2 px-3">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              className="checkbox checkbox-sm md:checkbox-md checkbox-primary"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            ></input>
            <p className="text-xs md:text-sm text-base-content/50">{t("login:userAgreementConfirm")}</p>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              className="checkbox checkbox-sm md:checkbox-md checkbox-primary"
              checked={agreeMarketing}
              onChange={(e) => setAgreeMarketing(e.target.checked)}
            ></input>
            <p className="text-xs md:text-sm text-base-content/50">{t("login:marketingPromotions")}</p>
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

      <button type="button" className="btn btn-ghost btn-md sm:btn-lg text-primary" onClick={handleClickSignIn}>
        {t("login:alreadyHaveAnAccount")}
      </button>

      {/* 社媒登录 */}
      <SocialLogin />
    </div>
  );

  return (
    <>
      <Modal
        hideTitle
        isOpen={isOpen}
        onClose={onClose}
        closeButtonClassName="hidden"
        className="bg-base-400 rounded-t-box xs:min-h-[72%] md:h-[615px] left-2 right-2 sm:left-auto sm:right-auto sm:min-w-[742px] p-0 sm:p-0"
        position={isMobile ? "modal-bottom" : "modal-middle"}
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
            ref={captchaRef}
            custom
            theme="dark"
          />,
          document.body,
        )}
    </>
  );
};
