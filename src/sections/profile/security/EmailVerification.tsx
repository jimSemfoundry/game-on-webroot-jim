import { useTranslation } from "react-i18next";
import { Card } from "@/sections/profile/c/Card.tsx";
import { useBoundStore } from "@/store";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { InnerContainer } from "@/sections/profile/security/ChangePassword.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";

export function EmailVerification() {
  const { t } = useTranslation('profile');

  const { user } = useAuth();

  const { setSyncAction } = useBoundStore();

  return (
    <Card className="p-4 bg-base-300 justify-between">
      <InnerContainer
        name={`security-email-verification`}
        title={t("profile:emailVerification")}
        desc={t("profile:emailVerificationDescription")} />
      <ConfirmBox
        className="btn-sm md:text-sm md:btn-md"
        onClick={() => setSyncAction("OPEN_EMAIL_VERIFICATION_MODAL")}>
        {user?.is_bind_email === 1
          ? t("profile:changeEmail")
          : t("profile:verifyEmail")}
      </ConfirmBox>
    </Card>
  );
}
