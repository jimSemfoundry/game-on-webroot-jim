import { useTranslation } from "react-i18next";
import { UnAuthCard } from "../bonus-components/unAuth-card.tsx";
import { BonusTournamentCardV2 } from "./bonus-tournament-card-v2";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";

export const BonusTournamentIndex = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const tournamentImg = useBonusDetailsImage("tournament_reward", 96);

  return (
    <>
      {isAuthenticated && (
        <BonusTournamentCardV2 />   
      )}

      {!isAuthenticated && (
        <UnAuthCard
          bgcolor="radial-gradient(80% 300% at 0% 46.47%, rgba(15, 20, 26, 0) 0%, rgba(246, 109, 25, 0.4) 100%)"
          titleDom={
            <p className="text-lg font-bold uppercase leading-5 text-start">
              <span className="text-base-content block">{t("casino:tournaments")}</span>
              <span className="block text-base-content">{t("bonus:rewards")}</span>
            </p>
          }
          imgSrc={tournamentImg}
        />
      )}
    </>
  );
};