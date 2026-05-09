import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { authService } from "@/services/authService.ts";
import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { password_reg_exp } from "@/utils/regexp.ts";
import { TFunction } from "i18next";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { MotionContentBox } from "@/components/modal/UserFinanceModal/c/MotionContentBox.tsx";
import clsx from "clsx";
import { useAuthModals } from "@/contexts/ModalsProvider.tsx";
import { useNavigate } from "@tanstack/react-router";
import { matchResponseCodeError } from "@/sections/profile/security/response_code.ts";
import { toast } from "sonner";
import Iconify from "@/components/iconify";
import { InnerImg } from "@/sections/profile/security/ChangePassword.tsx";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

interface IStatus {
  success: boolean
  loading: boolean
  new_password: string,
  curr_pwd_error: boolean
  current_password: string
  confirm_password: string,
  new_password_view: boolean,
  current_password_view: boolean,
  confirm_password_view: boolean,
}

const initStatus = {
  success: false,
  loading: false,
  new_password: "",
  curr_pwd_error: false,
  current_password: "",
  confirm_password: "",
  new_password_view: false,
  current_password_view: false,
  confirm_password_view: false
};

export const ChangePasswordModal = (
  {
    open,
    onClose
  }: {
    open: boolean;
    onClose: () => void;
  }) => {
  const navigate = useNavigate();

  const { t } = useTranslation('profile');

  const { logout } = useAuth();

  const { openSignInModal } = useAuthModals();

  const [status, setStatus] = useState<IStatus>(initStatus);

  const new_password_length_error = useMemo(() => status.new_password !== "" && status.new_password.length < 6, [status.new_password]);
  const current_password_length_error = useMemo(() => status.current_password !== "" && status.current_password.length < 6, [status.current_password]);
  const confirm_password_match_error = useMemo(() => status.confirm_password !== "" && status.confirm_password !== status.new_password, [status.new_password, status.confirm_password]);
  const new_password_match_error = useMemo(() => status.new_password !== "" && status.current_password === status.new_password, [status.new_password, status.current_password]);
  const input_null_error = useMemo(() =>
    status.new_password === "" ||
    status.current_password === "" ||
    status.confirm_password === ""
    , [status.new_password, status.current_password, status.confirm_password]);

  // 修改密码
  const submit = () => {
    setStatus((old) => ({ ...old, loading: true }));

    authService.changePassword({
      new_password: status.new_password,
      current_password: status.current_password,
      confirm_password: status.confirm_password
    })
      .then((res) => {
        if (res.code === 0) {
          setStatus((old) => ({ ...old, success: true }));
        } else {
          toast.error(t(matchResponseCodeError(res.code)));
        }
      }).catch((error) => {
        console.info(error);
      })
      .finally(() => {
        setStatus((old) => ({ ...old, loading: false }));
      });
  };

  return (
    <Modal
      title={<InnerModalHeader t={t} />}
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
      className="bg-base-400 md:max-w-[420px] shadow-lg"
    >
      {/* change password form */}
      <DisplayContent status={!status.success}>
        <div className="flex flex-col gap-4">
          <div className="relative">
            <label className="text-sm text-base-content/50 font-semibold">{t("profile:currentPassword")}</label>

            {/* 当前密码 */}
            <div className="relative flex items-center gap-2">
              <input
                type={status.current_password_view ? "text" : "password"}
                className="input w-full bg-base-300 !outline-0 border-0 font-semibold px-4"
                value={status.current_password}
                placeholder={t("profile:enterPassword")}
                onChange={(v) => {
                  const current_password = v.target.value.replace(password_reg_exp, "");
                  setStatus((old) => ({
                    ...old,
                    curr_pwd_error: false,
                    current_password
                  }));
                }}
              />
              <InnerPasswordView onClick={(v) => {
                setStatus((old) => ({
                  ...old,
                  current_password_view: v
                }));
              }} />
            </div>

            {/* 当前密码 - 密码长度不在范围 - 错误 */}
            <ErrorMessageBox
              sample
              content={t("profile:passwordLengthRequirement", "Please enter a password between 6 and 64 characters.")}
              show={current_password_length_error} />
          </div>

          <div className="flex flex-col gap-2">
            <div className={"relative"}>
              <label className="text-sm text-base-content/50 font-semibold">{t("profile:setNewPassword")}</label>

              {/* 输入新密码 */}
              <div className="relative flex items-center gap-2">
                <input
                  type={status.new_password_view ? "text" : "password"}
                  className="input w-full bg-base-300 !outline-0 border-0 font-semibold px-4"
                  value={status.new_password}
                  placeholder={t("profile:newPassword")}
                  onChange={(v) => {
                    const new_password = v.target.value.replace(password_reg_exp, "");
                    setStatus((old) => ({
                      ...old,
                      new_password
                    }));
                  }}
                />
                <InnerPasswordView onClick={(v) => {
                  setStatus((old) => ({
                    ...old,
                    new_password_view: v
                  }));
                }} />
              </div>

              {/* 新老密码一致 - 错误 */}
              <ErrorMessageBox
                sample
                content={t("profile:newPasswordSameAsCurrent")}
                show={new_password_match_error} />

              {/* 密码长度不在范围 - 错误 */}
              <ErrorMessageBox
                sample
                content={t("profile:passwordLengthRequirement", "Please enter a password between 6 and 64 characters.")}
                show={new_password_length_error && !new_password_match_error} />
            </div>

            {/* 确认新密码 */}
            <div className="relative">
              <div className="relative flex items-center gap-2">
                <input
                  type={status.confirm_password_view ? "text" : "password"}
                  className="input w-full bg-base-300 !outline-0 border-0 font-semibold px-4"
                  value={status.confirm_password}
                  placeholder={t("profile:re_enter_new_password")}
                  onChange={(v) => {
                    const confirm_password = v.target.value.replace(password_reg_exp, "");
                    setStatus((old) => ({
                      ...old,
                      confirm_password
                    }));
                  }}
                />
                <InnerPasswordView onClick={(v) => {
                  setStatus((old) => ({
                    ...old,
                    confirm_password_view: v
                  }));
                }} />
              </div>

              {/* 两次输入的密码不一致 - 错误 */}
              <ErrorMessageBox
                sample
                content={t("profile:passwordDoNotMatch")}
                show={confirm_password_match_error} />
            </div>
          </div>

          {/* confirm */}
          <ConfirmBox disabled={
            input_null_error ||
            new_password_length_error ||
            confirm_password_match_error ||
            current_password_length_error ||
            new_password_match_error
          } onClick={submit} loading={status.loading}>
            {t("finance:continue")}
          </ConfirmBox>
        </div>
      </DisplayContent>

      {/* change password success */}
      <DisplayContent status={status.success}>
        <MotionContentBox
          sample
          show={status.success}
          content={<div className="flex flex-col gap-4 items-center font-semibold">
            <InnerImg name="security-verification-ok" className="md:w-auto md:h-auto w-25 h-25" />
            <div className="flex flex-col gap-4 items-center">
              <p className="text-sm">{t("profile:passwordUpdatedSuccessfully")}</p>
              <p className="text-base-content/50 text-xs text-center">
                <Trans i18nKey="profile:passwordUpdatedDescription" />
              </p>
            </div>
            <ConfirmBox onClick={() => {
              onClose();

              void logout();

              void navigate({
                to: "/casino",
                search: {
                  openLogin: undefined,
                  openSignUp: undefined,
                  redirect: undefined,
                  startapp: undefined,
                  openFinance: undefined
                }
              });

              openSignInModal();
            }}>{t("common:common.close")}</ConfirmBox>
          </div>} />
      </DisplayContent>
    </Modal>
  );
};

export default ChangePasswordModal;

const InnerModalHeader = ({ t }: { t: TFunction }) => {
  return (
    <div className="flex items-center gap-x-2">
      <Iconify icon="custom:password-check" className={"w-4.5 h-4.5 md:w-5 md:h-5 text-primary"} />
      <p className="text-lg font-bold">{t("profile:changePassword")}</p>
    </div>
  );
};

const InnerPasswordView = ({ onClick }: { onClick: (view: boolean) => void }) => {
  const [view, setView] = useState<boolean>(false);
  return (<div className="z-1 absolute right-4 cursor-pointer rtl:left-4 rtl:right-auto" onClick={() => {
    setView(!view);
    onClick(!view);
  }}>
    {view
      ? <Eye className={clsx("w-4 h-4 text-primary")} />
      : <EyeOff className={clsx("w-4 h-4 text-base-content/50")} />}
  </div>);
};
