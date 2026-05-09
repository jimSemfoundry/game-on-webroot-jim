import { useTranslation } from "react-i18next";
import Iconify from "@/components/iconify";
import { BonusListHeader } from "@/sections/bonus";
import { BonusTournamentIndex } from "../tournament";
import { BuddyBallIndex } from "../buddy-ball";
import { BonusRakebackIndex } from "../rakeback";
import { useSidebar } from "@/contexts/SidebarContext";
import { useIsLeagueEnabled } from "@/hooks/api/usePublic";
import LuckySpinIndex from "../lucky-spin";
import { BountyBonusCard } from "@/sections/bounty/BountyBonusCard";

export const GeneralBonusIndex = () => {
  const { t } = useTranslation();
  const { isMobile } = useSidebar();
  const { isLeagueEnabled } = useIsLeagueEnabled();

  return (
    <BonusListHeader
      title={t("bonus:general_bonus")}
      icon={<Iconify icon="custom:bonus" className="w-4 h-4 text-primary" />}
      hasArrow={isMobile}
      childrenClassName="grid grid-cols-1 gap-3 min-[1150px]:grid-cols-2 min-[1550px]:grid-cols-3"
    >
      <BuddyBallIndex />
      <BountyBonusCard />
      <LuckySpinIndex />
      <BonusRakebackIndex />
      {isLeagueEnabled && <BonusTournamentIndex />}
    </BonusListHeader>
  );
};
