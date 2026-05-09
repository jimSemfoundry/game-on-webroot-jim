import { useBonusSwitch } from "@/hooks/api/useAuth";
import { BonusAchievementsListV2 } from "./bonus-achievements-list-v2";
import { CheckInIndex, Hero } from "@/sections/bonus";

export function BonusAchievementsPageV2() {
  const { switchData, isLoading: isSwitchLoading } = useBonusSwitch();

  const isAchievementDisabled = !isSwitchLoading && switchData?.bonus_switch?.achievement === 0;

  return (
    <div className="flex flex-col gap-4 mx-5">

      <Hero type={"achievementBonus"} disabled={isAchievementDisabled} />

      <div className="xl:hidden">
        <CheckInIndex />
      </div>

      {!isAchievementDisabled &&
        <>
          <BonusAchievementsListV2 closeModal={() => { }} layout="list" haveMoreButton={false} />
        </>
      }
    </div>
  );
}

