import { useTranslation } from "react-i18next";
import { Card } from "@/sections/profile/c/Card.tsx";
import { useBoundStore } from "@/store";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { InnerImg } from "./ChangePassword";
import { VerificationInput } from "./EmailVerification";

export function PhoneVerification() {
  const { t } = useTranslation('profile');

  const { user } = useAuth();

  const { setSyncAction } = useBoundStore();

  return (
    <Card className="p-4 bg-base-300 justify-between">
      <div className="flex items-center gap-2 font-semibold md:flex-col md:justify-center">
        <InnerImg name="security-phone-number-verification" />
        <div className="flex flex-col flex-1 gap-2 w-full">
          <p className="text-sm md:text-base">{user?.is_bind_mobile === 1 ? t("profile:verified_phone_number") : t("profile:phoneNumberVerification")}</p>
          {user?.is_bind_mobile !== 1 && <p className="text-xs md:text-sm text-base-content/50">{t("profile:ensure_phone_valid")}</p>}
        </div>
      </div>
      {
        user?.is_bind_mobile === 1 && (
          <VerificationInput value={user?.mobile || ''} />
        )
      }
      <ConfirmBox
        className={`btn-sm md:text-sm md:btn-md ${user?.is_bind_mobile === 1 ? 'btn-outline' : ''}`}
        onClick={() => setSyncAction("OPEN_PHONE_VERIFICATION_MODAL")}>
        {user?.is_bind_mobile === 1
          ? t("profile:change_key")
          : t("profile:verifyPhone")}
      </ConfirmBox>
    </Card>
  );
}
