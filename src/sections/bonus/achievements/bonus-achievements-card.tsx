import Iconify from "@/components/iconify";
import { useAuth } from "@/contexts/AuthContext";
import { useTipsModal } from "@/contexts/ModalsProvider";
import { useUserAchievements } from "@/hooks/api/useAuth";
import { Trans, useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { VipButton } from "../shared/VipButton";
import { useVibrantColor } from "@/hooks/useVibrantColor";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { BonusAchievementsModal } from "./bonus-achievements-modal";

const BASE_SCRIM = "color-mix(in oklch, var(--color-base-300) 60%, transparent)";
const ILLUSTRATION_URL = "/images/illustrations/0bfb7eed784e639b1f6c07fda138122d67b96eef.png";
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
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);

  const { isInitialized } = useAuth();
  const { data: achievementsData, isLoading: isAchievementsLoading } = useUserAchievements("asc");

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
    setShowAchievementsModal(true);
  };

  return (
    <div
      className={`relative flex w-full items-center gap-4 overflow-hidden rounded-field border ${isClaimable ? "border-warning" : "border-base-200/60"} bg-base-300/30 p-4 shadow-md transition-transform duration-200 hover:-translate-y-1 min-h-[145px] sm:min-h-[290px] sm:flex-col sm:items-center sm:gap-3 sm:p-5`}
      style={{
        background,
      }}
    >
      <button className="btn btn-square btn-xs bg-base-200 absolute right-4 rtl:right-auto rtl:left-4 top-4" onClick={handleOpenTips}>
        <Iconify icon="custom:info" className="text-base-content/50" />
      </button>
      <div className="flex w-full items-center gap-4 sm:flex-1 sm:flex-col sm:items-center sm:gap-3 sm:text-center">
        <div className="w-16 h-16 sm:size-[82px] grid place-items-center rounded-xl">
          <img
            src={ILLUSTRATION_URL}
            alt={t("bonus:achievements")}
            className="w-full h-full object-contain -rotate-6 rtl:rotate-6"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1 sm:gap-2 sm:items-center">
          <p className="text-sm font-bold sm:text-base text-left w-full">{t("bonus:achievements")}</p>
          <p className="text-xs text-base-content/60 leading-5 sm:flex-1 text-left w-full">
            <Trans i18nKey="bonus:achievements_card_description" />
          </p>
          <div className="hidden sm:flex sm:w-full sm:justify-center sm:mt-auto">
            <VipButton requiredLevel={0} onClick={handleButtonClick}/>
          </div>
        </div>
        <div className="flex sm:hidden">
          <VipButton requiredLevel={0} onClick={handleButtonClick}/>
        </div>
      </div>

      <BonusAchievementsModal
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
      />
    </div>
  );
}
