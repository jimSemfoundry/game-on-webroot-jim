import { useTranslation } from "react-i18next";
import { Card } from "@/sections/profile/c/Card.tsx";
import { useBoundStore } from "@/store";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { InnerImg } from "./ChangePassword";
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export function EmailVerification() {
  const { t } = useTranslation('profile');

  const { user } = useAuth();

  const { setSyncAction } = useBoundStore();

  return (
    <Card className="p-4 bg-base-300 justify-between">
      <div className="flex items-center gap-2 font-semibold md:flex-col md:justify-center">
        <InnerImg name="security-email-verification" />
        <div className="flex flex-col flex-1 gap-2 w-full">
          <p className="text-sm md:text-base">{user?.is_bind_email === 1 ? t("profile:verified_email") : t("profile:emailVerification")}</p>
          {user?.is_bind_email !== 1 && <p className="text-xs md:text-sm text-base-content/50">{t("profile:ensure_email_valid")}</p>}
        </div>
      </div>
      {
        user?.is_bind_email === 1 && (
          <VerificationInput value={user?.email || ''} />
        )
      }
      <ConfirmBox
        className={`btn-sm md:text-sm md:btn-md ${user?.is_bind_email === 1 ? 'btn-outline' : ''}`}
        onClick={() => setSyncAction("OPEN_EMAIL_VERIFICATION_MODAL")}>
        {user?.is_bind_email === 1
          ? t("profile:change_key")
          : t("profile:verifyEmail")}
      </ConfirmBox>
    </Card>
  );
}

type VerificationInputProps = {
  value: string
}

export const VerificationInput = ({ value }: VerificationInputProps) => {
  const [showVerification, setShowVerification] = useState(false)

  const handleShowVerification = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    setShowVerification(!showVerification)
  }

  return (
    <label className="input input-md sm:input-lg input-ghost !outline-0 bg-base-200 text-base-content w-full text-base">
      <input type={showVerification ? 'text' : 'password'} readOnly className={`${showVerification ? '' : 'text-base-content/50'}`} value={value} />
      <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={handleShowVerification}>
        {showVerification ? (
          <Eye className="w-4 h-4 md:w-5 md:h-5 text-primary" />
        ) : (
          <EyeOff className="w-4 h-4 md:w-5 md:h-5 text-base-content/50" />
        )}
      </button>
    </label>
  )
}
