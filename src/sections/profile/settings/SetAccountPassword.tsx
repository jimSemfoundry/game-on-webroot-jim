import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/sections/profile/c/Card";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox";
import { SetAccountPasswordModal } from "@/sections/profile/settings/SetAccountPasswordModal";
import { InnerContainer } from "@/sections/profile/security/ChangePassword";

export function SetAccountPassword() {
  const { t } = useTranslation('profile');
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const hasAccount = Boolean(user?.email) || Boolean(user?.mobile);

  return (
    <Card className="bg-base-300 md:p-4 justify-between">
      <InnerContainer
        name="security-change-password"
        title={t("profile:setAccountAndPassword")}
        desc={t("profile:setOtherDevices")}
      />
      <ConfirmBox className="btn-sm md:text-sm md:btn-md" onClick={() => setOpen(true)}>
        {hasAccount ? t("profile:updateAccountAndPassword") : t("profile:enableAccountAndPassword")}
      </ConfirmBox>
      <SetAccountPasswordModal open={open} onClose={() => setOpen(false)} />
    </Card>
  );
}
