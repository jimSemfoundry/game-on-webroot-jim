import { useSidebar } from "@/contexts/SidebarContext";
import { BonusListHeader } from "@/sections/bonus";
import { useTranslation } from "react-i18next";
import Iconify from "@/components/iconify";
import { UnAuthCard } from "../bonus-components/unAuth-card.tsx";
import { InnerBonusCard } from "./InnerComponents.tsx";
import { SportsBonusCard } from "@/sections/sports-bonus/sports-bonus-store/SportsBonusCard.tsx";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import { useSportsBonusIsRegionBanned } from "@/hooks/api/useAuth.ts";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";

export const BonusStoreIndex = () => {
  const { t } = useTranslation();
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: baseConfig } = useBaseConfig();
  const { data: regionBannedResp } = useSportsBonusIsRegionBanned();
  const bonusStoreImg = useBonusDetailsImage("bonus_store", 96);
  const sportsBonusImg = useBonusDetailsImage("sports_bonus", 96);

  const slot_bonus_wallet_on = baseConfig?.data?.bonus_switch?.slot_bonus_wallet !== 0;
  const sports_bonus_wallet_on = baseConfig?.data?.bonus_switch?.sports_bonus_wallet !== 0;
  const sports_region_banned = regionBannedResp?.data?.is_region_banned === 1;
  const is_show_betby = baseConfig?.data?.is_show_betby !== 0;  // 是否开启 betby

  return (
    <BonusListHeader
      title={t("bonus:bonus_store")}
      icon={
        <Iconify icon="custom:bonus-store" className="w-4 h-4 text-primary" />
      }
      hasArrow={isMobile}
      hasHistory
      jumpTo={() => void navigate({ to: "/dollars/bonus/history" })}
      childrenClassName="grid grid-cols-1 gap-3 min-[1150px]:grid-cols-2 min-[1550px]:grid-cols-3"
    >
      {isAuthenticated && slot_bonus_wallet_on && (
        <InnerBonusCard />
      )}

      {is_show_betby && isAuthenticated && sports_bonus_wallet_on && !sports_region_banned && (
        <SportsBonusCard />
      )}

      {!isAuthenticated && slot_bonus_wallet_on && (
        <UnAuthCard
          bgcolor="radial-gradient(100% 308% at 100% 0%, rgba(251, 191, 0, 0.5) 0%, rgba(61, 42, 0, 0.5) 100%)"
          title={t("bonus:slotBonus")}
          imgSrc={bonusStoreImg}
        />
      )}

      {is_show_betby && !isAuthenticated && sports_bonus_wallet_on && !sports_region_banned && (
        <UnAuthCard
          bgcolor="radial-gradient(100% 308% at 100% 0%, rgba(170, 67, 255, 0.5) 0%, rgba(56, 43, 189, 0.5) 75%, rgba(18, 35, 167, 0.5) 100%)"
          titleDom={
            <div className="flex flex-col items-start gap-0.5">
              <h2 className="text-lg font-bold text-base-content uppercase leading-5">
                {t("bonus:sportsBonus")}
              </h2>
              <span className="text-xs font-bold text-base-content/80">FIFA 2026</span>
            </div>
          }
          imgSrc={sportsBonusImg}
        />
      )}
    </BonusListHeader>
  );
};