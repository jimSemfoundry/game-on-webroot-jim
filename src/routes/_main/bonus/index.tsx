import {
  Hero,
  BonusStoreIndex,
  GeneralBonusIndex,
  VipBonusIndex,
  BonusAchievementsListV2,
  CheckInIndex
} from "@/sections/bonus";
import { AlliancePartnerships } from "@/sections/casino/AlliancePartnerships.tsx";
import { Footer } from "@/sections/casino/Footer.tsx";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { GetPromoCodeCard } from "@/sections/bonus/GetPromoCodeCard.tsx";
import { BonusFreeSpinsIndex } from "@/sections/bonus/free-spins/bonus-free-spins-index";

export const Route = createFileRoute("/_main/bonus/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      view: (search.view as string) || undefined,
      tab: (search.tab as string) || undefined
    };
  },
  beforeLoad: ({ search }) => {
    const isLegacyAchievementsPath = search.view === "achievements" || search.tab === "achievements" || search.tab === "achievement";
    if (isLegacyAchievementsPath) {
      throw redirect({ to: "/bonus/achievements" });
    }
  },
  component: RouteComponent
});

function RouteComponent() {

  const shouldHideAlliancePartnerships = import.meta.env.VITE_HIDE_ALLIANCE_PARTNERSHIPS === "true";

  return (
    <div className="flex flex-col pb-26 gap-4 mx-5">
      <Hero />

      <div className="flex flex-col gap-2">
  
        <div className="xl:hidden">
          <CheckInIndex />
        </div>

        <BonusFreeSpinsIndex />

        <BonusStoreIndex />
        
        <GeneralBonusIndex />

        <VipBonusIndex />

        <BonusAchievementsListV2 closeModal={() => { }} layout="list" />

        {/* 用户获取优惠码 */}
        <GetPromoCodeCard />
      </div>


      {!shouldHideAlliancePartnerships && (
        <div className="sm:block hidden">
          <AlliancePartnerships />
        </div>
      )}
      <div className="sm:block hidden">
        <Footer />
      </div>
    </div>
  );
}
