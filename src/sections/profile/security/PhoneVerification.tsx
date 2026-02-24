import { useTranslation } from "react-i18next";
import { Card } from "@/sections/profile/c/Card.tsx";
import { useBoundStore } from "@/store";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { InnerContainer } from "@/sections/profile/security/ChangePassword.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";

export function PhoneVerification() {
  const { t } = useTranslation('profile');

  const { user } = useAuth();

  const { setSyncAction } = useBoundStore();

  return (
    <Card className="p-4 bg-base-300 justify-between">
      <InnerContainer
        name={`security-phone-number-verification`}
        title={t("profile:phoneNumberVerification")}
        desc={t("profile:phoneNumberVerificationDescription")} />
      <ConfirmBox
        className="btn-sm md:text-sm md:btn-md"
        onClick={() => setSyncAction("OPEN_PHONE_VERIFICATION_MODAL")}>
        {user?.is_bind_mobile === 1
          ? t("profile:changePhone")
          : t("profile:verifyPhone")}
      </ConfirmBox>
    </Card>
  );
}
