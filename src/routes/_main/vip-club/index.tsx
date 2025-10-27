import { VipFAQ } from "@/sections/vip/vip-faq.tsx";
import { VipFeatureCards } from "@/sections/vip/vip-feature-cards.tsx";
import { VipHero } from "@/sections/vip/vip-hero.tsx";
import { VipRewardsTable } from "@/sections/vip/vip-rewards-table.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/vip-club/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6 pb-26">
      <VipHero />
      <div className="px-5 sm:px-0">
        <VipRewardsTable />
      </div>
      <div className="px-5 sm:px-0">
        <VipFeatureCards />
      </div>
      <div className="px-5 sm:px-0">
        <VipFAQ />
      </div>
    </div>
  );
}
