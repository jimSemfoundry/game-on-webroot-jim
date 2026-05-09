import { useAuth } from "@/contexts/AuthContext";
import { useTipsModal } from "@/contexts/ModalsProvider";
import { useUserAchievements } from "@/hooks/api/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { Trans, useTranslation } from "react-i18next";
import { useMemo } from "react";
import { VipButton } from "../shared/VipButton";
import { useVibrantColor } from "@/hooks/useVibrantColor";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";

const BASE_SCRIM = "color-mix(in oklch, var(--color-base-300) 60%, transparent)";
const DEFAULT_ACCENT = "#D21D3B";

const buildBackground = (accentStop: string, isMobile: boolean) =>
  isMobile
    ? `
      radial-gradient(
        95.05% 100% at 0% 35.47%,
        ${accentStop} 0%,
        ${BASE_SCRIM} 100%
      ),
      linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
    `
    : `radial-gradient(72.45% 49.48% at 50% 8.89%, ${accentStop} 0%, rgba(51, 51, 51, 0.08) 100%), var(--color-base-200)`;

export function BonusAchievementsCard() {
  const { t } = useTranslation();
  const { openTipsModal } = useTipsModal();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const { isInitialized } = useAuth();
  const { data: achievementsData, isLoading: isAchievementsLoading } = useUserAchievements("asc");
  const ILLUSTRATION_URL = useBonusDetailsImage("achievements", 96);

  const isClaimable = useMemo(() => {
    if (!isInitialized || isAchievementsLoading) return false;
    if (!achievementsData?.data || !Array.isArray(achievementsData.data)) return false;

    return achievementsData.data.some((achievement: any) => {
      const steps = achievement?.achievementStep;
      if (!Array.isArray(steps)) return false;
      return steps.some((step: any) => step?.is_finish === true && step?.is_claim !== true);
    });
  }, [achievementsData?.data, isAchievementsLoading, isInitialized]);

  // const requiredVipLevel = 0;

  const accentStopFallback = useMemo(() => `color-mix(in oklch, ${DEFAULT_ACCENT} 40%, transparent)`, []);
  const fallbackGradient = useMemo(() => buildBackground(accentStopFallback, isMobile), [accentStopFallback, isMobile]);
  const { hex } = useVibrantColor(ILLUSTRATION_URL, {
    fallbackGradient,
    colorTypes: ["DarkMuted"],
    opacity: 0.45,
  });

  const background = useMemo(() => {
    const accentStop = `color-mix(in oklch, ${hex || DEFAULT_ACCENT} 40%, transparent)`;
    return buildBackground(accentStop, isMobile);
  }, [hex, isMobile]);

  const handleOpenTips = () => {
    openTipsModal("achievement");
  };

  const handleButtonClick = () => {
    void navigate({ to: "/bonus/achievements" });
  };

  return (
    <div
      className={`relative flex w-full items-center gap-4 overflow-hidden rounded-field border ${isClaimable ? "border-warning" : "border-base-200/60"} bg-base-300/30 p-4 shadow-md transition-transform duration-200 hover:-translate-y-1 min-h-[145px] sm:min-h-[290px] sm:flex-col sm:items-center sm:gap-3 sm:p-5`}
      style={{
        background,
      }}
    >
      <Info className="absolute right-4 rtl:right-auto rtl:left-4 top-4" onClick={handleOpenTips} />
      <div className="flex w-full items-center gap-4 sm:flex-1 sm:flex-col sm:items-center sm:gap-3 sm:text-center">
        <div className="w-16 h-16 sm:size-[82px] grid place-items-center rounded-xl">
          <img
            src={ILLUSTRATION_URL}
            alt={t("bonus:achievements")}
            className="w-full h-full object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 sm:gap-2 sm:items-center">
          <p className="text-sm font-bold sm:text-base text-left w-full">{t("bonus:achievements")}</p>
          <p className="text-xs text-base-content/60 leading-5 sm:flex-1 text-left w-full">
            <Trans i18nKey="bonus:achievements_card_description" />
          </p>
          <div className="hidden sm:flex sm:w-full sm:justify-center sm:mt-auto">
            <VipButton requiredLevel={0} onClick={handleButtonClick} claimable={isClaimable} useClaimStateWhenUnlocked={isClaimable} />
          </div>
        </div>
        <div className="flex sm:hidden">
          <VipButton requiredLevel={0} onClick={handleButtonClick} claimable={isClaimable} useClaimStateWhenUnlocked={isClaimable} />
        </div>
      </div>

    </div>
  );
}
