import Iconify from "@/components/iconify";
import { Card } from "@/sections/profile/c/Card.tsx";
import { ChangePassword } from "@/sections/profile/security/ChangePassword.tsx";
import { EmailVerification } from "@/sections/profile/security/EmailVerification.tsx";
import { PhoneVerification } from "@/sections/profile/security/PhoneVerification.tsx";
import { SetWithdrawalPIN } from "@/sections/profile/security/SetWithdrawalPIN.tsx";
import { useTranslation } from "react-i18next";
import { isTelegramWebApp } from "@/utils/telegramWebApp";
import { SetAccountPassword } from "@/sections/profile/settings/SetAccountPassword";

export function Index() {
  const { t } = useTranslation();
  const isTelegram = isTelegramWebApp();

  return (
    <Card title={t("common.security")} icon={<Iconify icon="custom:profile-security" className="text-primary" />}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {isTelegram ? <SetAccountPassword /> : <ChangePassword />}
        <SetWithdrawalPIN />
        <PhoneVerification />
        <EmailVerification />
      </div>
    </Card>
  );
}
