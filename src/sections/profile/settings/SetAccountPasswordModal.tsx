import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox";
import { MotionContentBox } from "@/components/modal/UserFinanceModal/c/MotionContentBox";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents";
import { PhoneEmailInput } from "@/components/ui/PhoneEmailInput";
import { password_reg_exp } from "@/utils/regexp";
import { authService } from "@/services/authService";
import { useCurrentUser } from "@/hooks/api/useAuth";
import Iconify from "@/components/iconify";
import { InnerImg } from "@/sections/profile/security/ChangePassword";

type PasswordField = "new" | "confirm";

const initPasswordState = {
  new: "",
  confirm: "",
};

const initVisibilityState = {
  new: false,
  confirm: false,
};

const initTouchedState = {
  account: false,
  new: false,
  confirm: false,
};

export function SetAccountPasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation('profile');
  const { refetch } = useCurrentUser();

  const [account, setAccount] = useState("");
  const [accountValid, setAccountValid] = useState(false);
  const [password, setPassword] = useState(initPasswordState);
  const [visibility, setVisibility] = useState(initVisibilityState);
  const [touched, setTouched] = useState(initTouchedState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const trimmedAccount = account.trim();
  const accountIsValid = trimmedAccount !== "" && accountValid;

  const newPasswordError = useMemo(
    () => touched.new && password.new.length < 6,
    [password.new.length, touched.new],
  );

  const confirmPasswordError = useMemo(
    () =>
      touched.confirm &&
      (password.confirm.length < 6 || password.confirm !== password.new),
    [password.confirm.length, password.new, touched.confirm],
  );

  const accountError = useMemo(
    () => touched.account && !accountIsValid,
    [accountIsValid, touched.account],
  );

  const canSubmit = useMemo(
    () =>
      accountIsValid &&
      password.new.length >= 6 &&
      password.confirm.length >= 6 &&
      password.confirm === password.new &&
      !loading,
    [
      accountIsValid,
      loading,
      password.confirm,
      password.new,
    ],
  );

  useEffect(() => {
    if (!open) {
      setAccount("");
      setAccountValid(false);
      setPassword(initPasswordState);
      setVisibility(initVisibilityState);
      setTouched(initTouchedState);
      setLoading(false);
      setSuccess(false);
    }
  }, [open]);

  const handlePasswordChange = (field: PasswordField, value: string) => {
    const sanitized = value.replace(password_reg_exp, "");
    setPassword((prev) => ({
      ...prev,
      [field]: sanitized,
    }));

    if (field === "new" && sanitized.length >= 6) {
      setTouched((prev) => ({ ...prev, new: false }));
    }
    if (field === "confirm" && sanitized.length >= 6 && sanitized === password.new) {
      setTouched((prev) => ({ ...prev, confirm: false }));
    }
  };

  const toggleVisibility = (field: PasswordField) => {
    setVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = () => {
    const nextTouched = { ...touched };
    let hasError = false;

    if (!accountIsValid) {
      nextTouched.account = true;
      hasError = true;
    }
    if (password.new.length < 6) {
      nextTouched.new = true;
      hasError = true;
    }
    if (password.confirm.length < 6 || password.confirm !== password.new) {
      nextTouched.confirm = true;
      hasError = true;
    }

    setTouched(nextTouched);
    if (hasError) return;

    setLoading(true);
    authService
      .setTmaPassword({
        username: trimmedAccount,
        password: password.new,
      })
      .then((res) => {
        if (res.code === 0) {
          setSuccess(true);
          refetch();
          return;
        }

        if (res.code === 401) {
          toast.error(t("common:common.usernameMustBeValidEmailOrMobileNumber"));
        } else if (res.code === 402) {
          toast.error(t("common:common.youCanNotSetYourOwnEmailOrMobileAsPassword"));
        } else if (res.code === 403) {
          toast.error(t("common:common.emailOrMobileIsUsed"));
        } else {
          toast.error(res.msg || t("common:common.setAccountAndPasswordFailed"));
        }
      })
      .catch(() => {
        toast.error(t("common:common.setAccountAndPasswordFailed"));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-x-2">
          <Iconify icon="custom:password-check" className="w-4.5 h-4.5 md:w-5 md:h-5 text-primary" />
          <p className="text-lg font-bold">{t("profile:setAccountAndPassword")}</p>
        </div>
      }
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
      className="bg-base-400 md:max-w-[420px] shadow-lg"
    >
      <DisplayContent status={!success}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-base-content/70">{t("profile:setOtherDevices")}</p>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-base-content/50 font-semibold">{t("profile:account")}</label>
            <PhoneEmailInput
              placeholder={t("login:emailOrPhoneNumber")}
              value={account}
              onChange={(value) => {
                setAccount(value);
                if (touched.account) {
                  setTouched((prev) => ({ ...prev, account: false }));
                }
              }}
              onValidationChange={(isValid) => {
                setAccountValid(isValid);
              }}
            />
            <ErrorMessageBox
              className="!mt-0"
              content={t("common:common.usernameMustBeValidEmailOrMobileNumber")}
              show={accountError}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-base-content/50 font-semibold">{t("profile:password")}</label>
            <div className="relative flex items-center gap-2">
              <input
                type={visibility.new ? "text" : "password"}
                className="input w-full bg-base-300 !outline-0 border-0 font-semibold px-4"
                placeholder={t("profile:enterPassword")}
                value={password.new}
                onChange={(e) => handlePasswordChange("new", e.target.value)}
                minLength={6}
                maxLength={16}
              />
              <PasswordViewToggle
                active={visibility.new}
                onClick={() => toggleVisibility("new")}
              />
            </div>
            <ErrorMessageBox
              className="!mt-0"
              content={t("profile:PasswordDescription")}
              show={newPasswordError}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-base-content/50 font-semibold">{t("profile:confirmPassword")}</label>
            <div className="relative flex items-center gap-2">
              <input
                type={visibility.confirm ? "text" : "password"}
                className="input w-full bg-base-300 !outline-0 border-0 font-semibold px-4"
                placeholder={t("profile:confirmPassword")}
                value={password.confirm}
                onChange={(e) => handlePasswordChange("confirm", e.target.value)}
                minLength={6}
                maxLength={16}
              />
              <PasswordViewToggle
                active={visibility.confirm}
                onClick={() => toggleVisibility("confirm")}
              />
            </div>
            <ErrorMessageBox
              className="!mt-0"
              content={t("profile:passwordDoNotMatch")}
              show={confirmPasswordError}
            />
          </div>

          <ConfirmBox disabled={!canSubmit} loading={loading} onClick={handleSubmit}>
            {t("common:common.continue")}
          </ConfirmBox>
        </div>
      </DisplayContent>

      <DisplayContent status={success}>
        <MotionContentBox
          sample
          show={success}
          content={
            <div className="flex flex-col gap-6 items-center font-semibold">
              <InnerImg name="security-verification-ok" className="md:w-30 md:h-30 w-25 h-25" />
              <div className="flex flex-col gap-4 items-center">
                <p className="text-md">{t("common:common.setAccountAndPasswordSuccessfully")}</p>
                <p className="text-base-content/50 text-sm text-center">
                  {t("common:common.setAccountAndPasswordSuccessfullyDescription")}
                </p>
              </div>
              <ConfirmBox onClick={onClose}>{t("common:common.close")}</ConfirmBox>
            </div>
          }
        />
      </DisplayContent>
    </Modal>
  );
}

const PasswordViewToggle = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
  <button
    type="button"
    className="absolute right-4 rtl:left-4 rtl:right-auto"
    onClick={onClick}
  >
    {active ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-base-content/50" />}
  </button>
);
