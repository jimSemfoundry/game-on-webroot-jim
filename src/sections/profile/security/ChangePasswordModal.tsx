import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { DisplayContent } from "@/components/modal/UserFinanceModal";
import { Modal } from "@/components/ui/Modal.tsx";
import { authService } from "@/services/authService.ts";
import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { password_reg_exp } from "@/utils/regexp.ts";
import { TFunction } from "i18next";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { MotionContentBox } from "@/components/modal/UserFinanceModal/c/MotionContentBox.tsx";
import classNames from "classnames";
import { useBoundStore } from "@/store";
import { useAuthModals } from "@/contexts/ModalsProvider.tsx";
import { useNavigate } from "@tanstack/react-router";
import { matchResponseCodeError } from "@/sections/profile/security/response_code.ts";
import { toast } from "sonner";
import Iconify from "@/components/iconify";
import { InnerImg } from "@/sections/profile/security/ChangePassword.tsx";

interface IStatus {
  success: boolean
  loading: boolean
  show_modal: boolean
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
  show_modal: false,
  new_password: "",
  curr_pwd_error: false,
  current_password: "",
  confirm_password: "",
  new_password_view: false,
  current_password_view: false,
  confirm_password_view: false
};

export const ChangePasswordModal = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const { logout } = useAuth();

  const { openSignInModal } = useAuthModals();

  const { syncAction, setSyncAction } = useBoundStore();

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
      })
      .finally(() => {
        setStatus((old) => ({ ...old, loading: false }));
      });
  };

  // 事件通知
  useEffect(() => {
    if (syncAction.type === "OPEN_CHANGE_PASSWORD_MODAL") {
      setStatus((v) => ({ ...v, ...initStatus, show_modal: true }));
      setSyncAction(undefined);
    }
  }, [syncAction]);

  return (
    <Modal
      title={<InnerModalHeader t={t} />}
      isOpen={status.show_modal}
      onClose={() => {
        setStatus((v) => ({ ...v, show_modal: false }));
      }}
      position="modal-middle"
      className="bg-base-400 md:max-w-[420px] shadow-lg"
    >
      {/* change password form */}
      <DisplayContent status={!status.success}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-base-content/50 font-semibold">{t("profile:currentPassword")}</label>

            {/* 当前密码 */}
            <div className="relative flex items-center gap-2">
              <input
                type={status.current_password_view ? "text" : "password"}
                className="input w-full bg-base-300 !outline-0 border-0 font-semibold px-4"
                placeholder="Enter Password"
                value={status.current_password}
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
            <DisplayContent status={current_password_length_error}>
              <ErrorMessageBox
                className="!mt-0"
                content="请输入 6 - 64 个字符组成的密码"
                show={current_password_length_error} />
            </DisplayContent>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-base-content/50 font-semibold">Set New Password</label>

            {/* 输入新密码 */}
            <div className="relative flex items-center gap-2">
              <input
                type={status.new_password_view ? "text" : "password"}
                className="input w-full bg-base-300 !outline-0 border-0 font-semibold px-4"
                placeholder="New Password"
                value={status.new_password}
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
            <DisplayContent status={new_password_match_error}>
              <ErrorMessageBox
                className="!mt-0"
                content={t("profile:newPasswordSameAsCurrent")}
                show={new_password_match_error} />
            </DisplayContent>

            {/* 密码长度不在范围 - 错误 */}
            <DisplayContent status={new_password_length_error}>
              <ErrorMessageBox
                className="!mt-0"
                content="请输入 6 - 64 个字符组成的密码"
                show={new_password_length_error} />
            </DisplayContent>

            {/* 确认新密码 */}
            <div className="relative flex items-center gap-2">
              <input
                type={status.confirm_password_view ? "text" : "password"}
                className="input w-full bg-base-300 !outline-0 border-0 font-semibold px-4"
                placeholder="Re-Enter New Password"
                value={status.confirm_password}
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
            <DisplayContent status={confirm_password_match_error}>
              <ErrorMessageBox
                className="!mt-0"
                content={t("profile:passwordDoNotMatch")}
                show={confirm_password_match_error} />
            </DisplayContent>
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
          show={status.success}
          content={<div className="flex flex-col gap-4 items-center font-semibold">
            <InnerImg name="security-verification-ok" className='md:w-auto md:h-auto w-25 h-25' />
            <div className="flex flex-col gap-4 items-center">
              <p className="text-sm">{t("profile:passwordUpdatedSuccessfully")}</p>
              <p className="text-base-content/50 text-xs text-center">
                <Trans i18nKey="profile:passwordUpdatedDescription" />
              </p>
            </div>
            <ConfirmBox onClick={() => {
              setStatus((old) => ({ ...old, show_modal: false }));

              void logout();

              void navigate({ to: "/casino", search: { openLogin: undefined, redirect: undefined } });

              openSignInModal();
            }}>{t("common.close")}</ConfirmBox>
          </div>} />
      </DisplayContent>
    </Modal>
  );
};

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
      ? <Eye className={classNames("w-4 h-4 text-primary")} />
      : <EyeOff className={classNames("w-4 h-4 text-base-content/50")} />}
  </div>);
};
