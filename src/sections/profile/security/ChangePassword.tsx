import { useTranslation } from "react-i18next";
import { Card } from "@/sections/profile/c/Card.tsx";
import { ChangePasswordModal } from "@/sections/profile/security/ChangePasswordModal.tsx";
import { useBoundStore } from "@/store";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import classNames from "classnames";

export function ChangePassword() {
  const { t } = useTranslation();

  const { setSyncAction } = useBoundStore();

  return (
    <>
      <Card className="bg-base-300 md:p-4 justify-between">
        <InnerContainer
          name={`security-change-password`}
          title={t("profile:changePassword")}
          desc={t("profile:updatePasswordDescription")} />
        <ConfirmBox
          className="btn-sm md:text-sm md:btn-md"
          onClick={() => setSyncAction("OPEN_CHANGE_PASSWORD_MODAL")}>
          {t("profile:changePassword")}
        </ConfirmBox>
      </Card>
      <ChangePasswordModal />
    </>
  );
}

export const InnerImg = ({ name, className }: { name: string, className?: string }) => {
  return <img src={`/images/profile/${name}.png`} className={classNames("w-14 h-14 md:w-21 md:h-21", className)}
              alt="" />;
};

export const InnerContainer = ({ name, title, desc }: { name: string, title: string, desc: string }) => {
  return (<div className="flex items-center gap-2 font-semibold md:flex-col md:justify-center">
    <InnerImg name={name} />
    <div className="flex flex-col flex-1 gap-2 w-full">
      <p className="text-sm md:text-base">{title}</p>
      <p className="text-xs md:text-sm text-base-content/50">{desc}</p>
    </div>
  </div>);
};
