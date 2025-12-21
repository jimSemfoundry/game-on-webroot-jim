// import { PersonalDetails } from "./personal-details";
import { ProfileAvatar } from "./profile-avatar";
// import { IDVerification } from "./id-verification";
import { useMediaQuery } from "@/hooks/useMediaQuery";
// import { Personal } from "@/sections/profile/settings/Personal.tsx";
// import { PublicProfile } from "./public-profile";

export function Index() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  return (
    // <div className="flex sm:flex-row flex-col gap-4 items-start">
    //   <div className={`flex flex-col gap-4 flex-1 pb-5 md:p-0`}>
    //     {isMobile && (<ProfileAvatar />)}
    //     <PersonalDetails />
    //     {isMobile && (<>
    //         <IDVerification />
    //         {/*<PublicProfile />*/}
    //       </>
    //     )}
    //   </div>
    //   {!isMobile
    //     &&
    //     <div className="flex flex-col gap-4">
    //       <ProfileAvatar />
    //       <IDVerification />
    //       {/*<PublicProfile />*/}
    //     </div>
    //   }
    // </div>
    <div className="flex gap-4">
      {isMobile && <div className={`flex flex-col gap-4 flex-1 pb-5 md:p-0`}><ProfileAvatar /></div>}
      {!isMobile && <><ProfileAvatar /></>}
    </div>
  )
}   