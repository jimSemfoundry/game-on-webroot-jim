import { useTranslation } from "react-i18next";
import { UnAuthCard } from "../bonus-components/unAuth-card.tsx";
import { BuddyBallCard } from "./buddy-ball-card";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";
// import { useSidebar } from "@/contexts/SidebarContext.tsx";
// import { useNavigate } from "@tanstack/react-router";
// import { BonusListHeader } from "@/sections/bonus";
// import { Balls } from "@/components/icons/Balls.tsx";

export const BuddyBallIndex = () => {
  const { t } = useTranslation(["buddyBalls"]);
  const { isAuthenticated } = useAuth();
  const buddyBallsImg = useBonusDetailsImage("buddy_balls", 96);

  // const { isMobile } = useSidebar();
  // const navigate = useNavigate();

  return (
    <>
      {/* <BonusListHeader
        title={t("buddyBalls:buddyBalls")}
        icon={
          <Balls className="w-4 h-4 text-primary" />
        }
        hasArrow={isMobile}
        hasHistory
        jumpTo={() => void navigate({ to: "/buddy-balls/history" })}
        childrenClassName="sm:grid sm:grid-cols-3 flex flex-col gap-3"
      > */}
        {isAuthenticated && (
          <BuddyBallCard />
        )}

        {!isAuthenticated && (
          <UnAuthCard
            bgcolor="radial-gradient(100% 308% at 100% 0%, #75C300 0%, #0A2200 100%)"
            title={t("bonus:buddy_ball_title")}
            imgSrc={buddyBallsImg}
          />
        )}
      {/* </BonusListHeader> */}
    </>
  );
};