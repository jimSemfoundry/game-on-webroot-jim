import { useTranslation } from "react-i18next";
import { Card } from "@/sections/profile/c/Card.tsx";
import { useBoundStore } from "@/store";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { InnerContainer } from "@/sections/profile/security/ChangePassword.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";

export function SetWithdrawalPIN() {
  const { t } = useTranslation();

  const { user } = useAuth();

  const { setSyncAction } = useBoundStore();

  return (
    <Card className="p-4 bg-base-300 justify-between">
      <InnerContainer
        name={`security-withdrawal-pin`}
        title={t("profile:setWithdrawalPIN")}
        desc={t("profile:setWithdrawalPINDescription")} />
      <ConfirmBox className="btn-sm md:text-sm md:btn-md"
                  onClick={() => setSyncAction("OPEN_SET_WITHDRAWAL_PIN_MODAL")}>
        {user?.pin_setted ? t("profile:updateWithdrawalPin") : t("profile:enableWithdrawalPin")}
      </ConfirmBox>
    </Card>
  );
}
