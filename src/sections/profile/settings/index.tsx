import { Profile } from "@/sections/profile/settings/Profile.tsx";
import { Personal } from "@/sections/profile/settings/Personal.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { IDVerification } from "@/sections/profile/settings/IDVerification.tsx";
import { PublicProfile } from "@/sections/profile/settings/PublicProfile.tsx";

export function Index() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  return (
    <div className="flex flex-col gap-4 md:w-full md:flex-row md:items-start">
      {
        isMobile
          ? (<><Profile /><Personal /><IDVerification /><PublicProfile /></>)
          : (<><Personal className={"flex-1"} /><div className={'flex flex-col gap-4'}>
            <Profile /><PublicProfile />
          </div></>)
      }
    </div>
  );
}
