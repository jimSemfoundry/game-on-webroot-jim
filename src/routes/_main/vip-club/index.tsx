import { VipFAQ } from "@/sections/vip/vip-faq.tsx";
import { VipFeatureCardsV2 } from "@/sections/vip/vip-feature-cards-v2.tsx";
import { VipHero } from "@/sections/vip/vip-hero.tsx";
import { VipRewardsTableV2 } from "@/sections/vip/vip-rewards-table-v2.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/vip-club/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6 pb-26 overflow-x-hidden mx-5">
      <VipHero />
      <div className=" ">
        <VipRewardsTableV2 />
      </div>
      <div className=" ">
        <VipFeatureCardsV2 />
      </div>
      <div className=" ">
        <VipFAQ />
      </div>
    </div>
  );
}
