import { UserStats } from "@/sections/profile/dashboard/UserStats.tsx";
import { Top3Games } from "@/sections/profile/dashboard/Top3Games.tsx";
import { ReferralProgram } from "@/sections/profile/dashboard/ReferralProgram.tsx";
import { Achievements } from "@/sections/profile/dashboard/Achievements.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { SettingsBox } from "../security/settings-box";

export function Index() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="md:flex gap-4 items-start">
      <div className={`flex flex-col gap-4 flex-1 pb-5 md:p-0`}>
        <UserStats />
        <Top3Games />
        {isMobile && (<ReferralProgram />)}
        <Achievements />
        {isMobile && (<SettingsBox />)}
      </div>
      {!isMobile
        &&
        <div className="flex flex-col gap-4">
          <ReferralProgram />
          <SettingsBox />
        </div>
      }
    </div>
  );
}
