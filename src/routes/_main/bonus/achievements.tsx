import { BonusAchievementsPageV2 } from "@/sections/bonus/achievements/bonus-achievements-page-v2";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/bonus/achievements")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <BonusAchievementsPageV2 />
  );
}
