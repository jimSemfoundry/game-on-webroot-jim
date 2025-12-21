import Iconify from "@/components/iconify";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { useTranslation } from "react-i18next";
import { UserStats } from "@/sections/profile/dashboard/UserStats.tsx";
import { Top3Games } from "@/sections/profile/dashboard/Top3Games.tsx";
import { ReferralProgram } from "@/sections/profile/dashboard/ReferralProgram.tsx";
import { Achievements } from "@/sections/profile/dashboard/Achievements.tsx";
import { ChangePassword } from "@/sections/profile/security/ChangePassword.tsx";
// import { SetWithdrawalPIN } from "@/sections/_authenticated/SetWithdrawalPIN.tsx";
import { PhoneVerification } from "@/sections/profile/security/PhoneVerification.tsx";
import { EmailVerification } from "@/sections/profile/security/EmailVerification.tsx";
import { Card } from "@/sections/profile/c/Card.tsx";
import { useState } from "react";
import { NavScrollBar } from "@/sections/profile/c/NavScrollBar.tsx";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

export function FreeCombination() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { t } = useTranslation();

  const [navIndex, setNavIndex] = useState<string>("Dashboard");

  return (
    <div className="flex flex-col gap-4 p-5 pt-0 md:p-0">
      {/* Dashboard | Rollover | BetHistory | Security | Setting | Legal */}
      <NavScrollBar setNavIndex={setNavIndex} />

      {/* Dashboard */}
      <DisplayContent status={navIndex === "Dashboard"}>
        <div className="md:flex gap-4 items-start">
          <div className={`flex flex-col gap-4 flex-1`}>
            <UserStats />
            <Top3Games />
            <DisplayContent status={isMobile}><ReferralProgram /></DisplayContent>
            <Achievements />
          </div>
          <DisplayContent status={!isMobile}><ReferralProgram /></DisplayContent>
        </div>
      </DisplayContent>

      {/* Security */}
      <DisplayContent status={navIndex === "Security"}>
        <Card className="md:p-6 md:gap-4" title={t("common.security")}
              icon={<Iconify icon="custom:profile-security" className="text-primary" />}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <ChangePassword />
            {/*TODO*/}
            {/*<SetWithdrawalPIN />*/}
            <EmailVerification />
            <PhoneVerification />
          </div>
        </Card>
      </DisplayContent>
    </div>
  );
}
