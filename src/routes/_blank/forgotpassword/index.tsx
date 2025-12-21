import { useTranslation } from "react-i18next";
import { useCallback, useMemo, useState } from "react";
import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { publicService } from "@/services/publicService.ts";
import { parseURLParamsToJson } from "@/components/socialLogin/helper.ts";
import { matchResponseCodeError } from "@/sections/profile/security/response_code.ts";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { ChevronLeft, Eye, EyeOff, ShieldPlus } from "lucide-react";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import classNames from "classnames";

interface IStatus {
  current_password: string,
  confirm_password: string,
  is_pending: boolean,
  current_password_view: boolean,
  confirm_password_view: boolean,
}

const initStatus: IStatus = {
  current_password: "",
  confirm_password: "",
  is_pending: false,
  current_password_view: false,
  confirm_password_view: false
};

export const Route = createFileRoute("/_blank/forgotpassword/")({
  component: RouteComponent
});

export function RouteComponent() {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const { search } = useLocation();

  const [status, setStatus] = useState<IStatus>(initStatus);

  const handle = useCallback(async () => {
    setStatus((old) => ({ ...old, is_pending: true }));

    const parsedParams = parseURLParamsToJson(location.search);

    const searchParams = new URLSearchParams(parsedParams);

    const key = searchParams.get("key");
    const token = searchParams.get("token");
    const nonce = searchParams.get("nonce");

    if (!key || !token || !nonce) return toast.error("Password reset link invalid");

    publicService.resetPasswordByToken({
      key,
      token,
      nonce,
      password: status.current_password
    })
      .then((res) => {
        if (res.code === 0) {
          toast.success(t("login:passwordResetSuccess"));
          void navigate({ to: "/casino", search: { openLogin: "true", openSignUp: undefined, redirect: undefined, startapp: undefined, openFinance: undefined } });
        } else {
          toast.error(t(matchResponseCodeError(res.code)));
        }
      })
      .catch(() => {
        toast.error(t("toast:signInFailed"));
        setStatus((old) => ({ ...old, is_pending: false }));
      })
      .finally(() => {
        setStatus((old) => ({ ...old, is_pending: false }));
      });

  }, [status, search]);

  const input_null_error = useMemo(() => status.current_password === "" || status.confirm_password === "", [status.current_password, status.confirm_password]);

  const confirm_password_match_error = useMemo(() => status.confirm_password !== "" && status.confirm_password !== status.current_password, [status.current_password, status.confirm_password]);

  const current_password_length_error = useMemo(() => status.current_password !== "" && status.current_password.length < 6 || status.current_password.length > 64, [status.current_password]);

  return (
    <div className={"md:w-[420px] md:m-auto flex items-center justify-center h-screen w-screen p-5"}>
      <div className="bg-base-200 flex flex-col gap-4 w-full rounded-2xl p-5 py-8 items-center">
        <img src={`/logos/${import.meta.env.VITE_THEME}/logo-full.svg`} alt="" />
        <div className="flex flex-col gap-5 font-semibold w-full mt-3">
          <label className={'flex items-center gap-1'}><ShieldPlus className={'w-4 h-4 text-primary'} strokeWidth={3} />{t("login:resetPassword")}</label>

          {/* 输入新密码 */}
          <div className="flex flex-col gap-1 relative">
            <label className="text-xs font-bold">{t("login:newPassword")}</label>
            <div className={"relative flex items-center"}>
              <input
                type={status.current_password_view ? "text" : "password"}
                placeholder="New Password"
                value={status.current_password}
                onChange={(e) => setStatus((old) => ({
                  ...old,
                  current_password: e.target.value.trim()
                }))}
                className="input input-md bg-base-300 text-base-content w-full !outline-0 border-0 text-xs pr-8"
              />
              <InnerPasswordView onClick={(v) => {
                setStatus((old) => ({
                  ...old,
                  current_password_view: v
                }));
              }} />
            </div>
            {/* 当前密码 - 密码长度不在范围 - 错误 */}
            <DisplayContent className={"absolute -bottom-4.5"} status={current_password_length_error}>
              <ErrorMessageBox
                sample
                className="!mt-0"
                content="Please enter a password consisting of 6 to 64 characters."
                show={current_password_length_error} />
            </DisplayContent>
          </div>

          {/* 确认新密码 */}
          <div className="flex flex-col gap-1 relative">
            <label className="text-xs font-bold">{t("login:confirmPassword")}</label>

            <div className={"relative flex items-center"}>
              <input
                type={status.confirm_password_view ? "text" : "password"}
                placeholder="Re-Enter New Password"
                value={status.confirm_password}
                onChange={(e) => setStatus((old) => ({
                  ...old,
                  confirm_password: e.target.value.trim()
                }))}
                className="input input-md bg-base-300 text-base-content w-full !outline-0 border-0 text-xs pr-8"
              />
              <InnerPasswordView onClick={(v) => {
                setStatus((old) => ({
                  ...old,
                  confirm_password_view: v
                }));
              }} />
            </div>
            {/* 两次输入的密码不一致 - 错误 */}
            <DisplayContent className={"absolute -bottom-4.5"} status={confirm_password_match_error}>
              <ErrorMessageBox
                sample
                className="!mt-0"
                content={t("profile:passwordDoNotMatch")}
                show={confirm_password_match_error} />
            </DisplayContent>
          </div>

          <ConfirmBox
            loading={status.is_pending}
            onClick={() => {
              if (input_null_error || confirm_password_match_error || current_password_length_error) return;
              void handle();
            }}
            className={classNames("btn-primary", { "bg-base-300 border-none text-base-content/50": input_null_error || confirm_password_match_error || current_password_length_error })}
          >
            {t("common.confirm")}
          </ConfirmBox>

          <div className={"text-xs text-base-content/50 text-center flex items-center justify-center"}>
            <button className={"btn btn-soft btn-primary btn-sm"} onClick={() => navigate({
              to: "/casino",
              search: { openLogin: String(true), openSignUp: undefined, redirect: undefined, startapp: undefined, openFinance: undefined }
            })}><ChevronLeft
                className={"w-3 h-3"} strokeWidth={4} />{t("login:backToSignIn")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const InnerPasswordView = ({ onClick }: { onClick: (view: boolean) => void }) => {
  const [view, setView] = useState<boolean>(false);
  return (<div className="z-1 absolute right-3 cursor-pointer rtl:left-4 rtl:right-auto" onClick={() => {
    setView(!view);
    onClick(!view);
  }}>
    {view
      ? <Eye className={classNames("w-4 h-4 text-primary")} />
      : <EyeOff className={classNames("w-4 h-4 text-base-content/50")} />}
  </div>);
};
