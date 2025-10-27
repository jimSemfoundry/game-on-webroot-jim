import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { Card } from "@/sections/profile/c/Card.tsx";
import Iconify from "@/components/iconify";
import { useCurrentUser } from "@/hooks/api/useAuth.ts";
import { authService } from "@/services/authService.ts";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { AvatarModal } from "./AvatarModal.tsx";

export function ProfileAvatar() {
  const { t } = useTranslation();

  const { user } = useAuth();

  const { refetch } = useCurrentUser();

  const [status, setStatus] = useState<{
    loading: boolean
    nickname: string
    showAvatar: boolean
  }>({
    loading: false,
    nickname: "",
    showAvatar: false
  });

  // 昵称格式验证
  const nickname_error = useMemo(() => status.nickname !== "" && !/^[A-Za-z_][A-Za-z0-9_]{5,15}$/.test(status.nickname), [status.nickname]);

  const handle = () => {
    setStatus((v) => ({ ...v, loading: true }));

    authService.updateUser({
      nickname: status.nickname
    })
      .then((res) => {
        if (res.code === 0) {
          void refetch();
          toast.success(t("toast:editSuccess"));
        } else {
          toast.error(t("toast:editError"));
        }
      })
      .finally(() => {
        setStatus((v) => ({ ...v, loading: false }));
      });
  };

  // 设置默认数据
  useEffect(() => {
    if (user?.nickname) setStatus((v) => ({ ...v, nickname: user?.nickname }));
  }, [user?.nickname]);

  return (
    <Card
      className="md:p-6 md:gap-4 md:mx-0 md:max-w-80" title={t("common.profile")}
      icon={<Iconify icon="custom:user" className="text-primary" />}>
      <div className="flex w-full flex-col items-center gap-3">
        {/* 头像编辑 */}
        <div className="relative border-2 border-primary rounded-full cursor-pointer" onClick={() =>
          setStatus((v) => ({ ...v, showAvatar: true }))}>
          <img src={user?.avatar || "/icons/avatar/default.png"} className="h-20 w-20 rounded-full" alt={""} />
          <div
            className="bg-base-100 absolute right-0 bottom-0 flex h-5 w-5 items-center justify-center rounded-full">
            <Iconify icon="custom:pen" className="text-primary w-4 h-4" />
          </div>
        </div>

        {/* 昵称编辑 */}
        <div className="flex w-full flex-col gap-2 font-semibold text-base-content/50">
          <fieldset className="fieldset">
            <h4 className="text-sm">Nickname</h4>
            <div className="relative">
              <input
                type="text"
                value={status.nickname}
                onChange={(e) => {
                  setStatus((v) => ({ ...v, nickname: e.target.value }));
                }}
                className={"input w-full rounded-md px-4 text-sm bg-base-300 border-none !outline-none"}
                maxLength={16}
                minLength={6}
              />
              <ErrorMessageBox
                show={nickname_error}
                content={<>
                  {t("profile:nicknameIsRequired")}<br/>Can only contain letters, numbers, and underscores, and cannot start with a number
                </>} />
            </div>
          </fieldset>

          <p className="relative text-xs">{t("common.usernameDescription")}</p>
        </div>

        <ConfirmBox
          disabled={
            !status.nickname ||
            nickname_error ||
            user?.nickname === status.nickname}
          loading={status.loading} onClick={handle}>
          {t("common.save")}
        </ConfirmBox>

        <AvatarModal open={status.showAvatar} onClose={() => setStatus((v) => ({ ...v, showAvatar: false }))} />
      </div>
    </Card>
  );
}
