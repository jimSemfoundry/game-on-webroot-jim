import { useTranslation } from "react-i18next";
import { UnAuthCard } from "../bonus-components/unAuth-card.tsx";
import { BonusRakebackCardV2 } from "./bonus-rakeback-card-v2";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";

export const BonusRakebackIndex = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const rakebackImg = useBonusDetailsImage("super_rakeback", 96);

  return (
    <>
      {isAuthenticated && (
        <BonusRakebackCardV2 /> 
      )}

      {!isAuthenticated && (
        <UnAuthCard
          bgcolor="radial-gradient(80% 300% at 0% 46.47%, rgba(15, 20, 26, 0) 0%, rgba(43, 78, 177, 0.4) 100%)"
          titleDom={
            <p className="text-lg font-bold uppercase leading-5 text-start">
              <span className="text-base-content block">{t("popup:rakeback.super")}</span>
              <span className="text-primary block">{t("bonus:item.rakeback")}</span>
            </p>
          }
          imgSrc={rakebackImg}
        />
      )}
    </>
  );
};