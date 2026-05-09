import Iconify from "@/components/iconify";
import { useBonusSwitch } from "@/hooks/api/useAuth";
import { useTranslation } from "react-i18next";
import { BonusAchievementsList } from "./bonus-achievements-list";
import { Hero } from "@/sections/bonus";

export function BonusAchievementsPage() {
  const { t } = useTranslation();
  const { switchData, isLoading: isSwitchLoading } = useBonusSwitch();

  const isAchievementDisabled = !isSwitchLoading && switchData?.bonus_switch?.achievement === 0;

  return (
    <div className="flex flex-col pb-26">
      <Hero type={"achievementBonus"} disabled={isAchievementDisabled} />

      {!isAchievementDisabled && <>
        <section className="px-5">
          <div className="flex items-center gap-2">
            <Iconify icon="custom:profile-achievements" className="w-5 h-5 text-primary" />
            <h1 className="text-sm font-bold">{t("bonus:achievements")}</h1>
          </div>
        </section>
        <section className="p-2 sm:p-3">
          <BonusAchievementsList closeModal={() => {}} layout="list" />
        </section>
      </>}
    </div>
  );
}

