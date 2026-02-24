/**
 * Bonus page Mystery Box card, used to open the actual content of Mystery Box.
 */
import Iconify from "@/components/iconify";
import { useTipsModal } from "@/contexts/ModalsProvider";
import { useVibrantColor } from "@/hooks/useVibrantColor";
import { useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { VIP_REQUIREMENTS } from "../shared/config";
import { VipButton } from "../shared/VipButton";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useNavigate } from "@tanstack/react-router";
import { useHasMysteryBox } from "@/query/bouns";
import { MysteryBoxModal } from "./bonus-mystery-box-modal";

const BASE_SCRIM = "color-mix(in oklch, var(--color-base-300) 60%, transparent)";
const ILLUSTRATION_URL = "/images/illustrations/a0460e0b128df2ab73ba3a735212bd9d95c841b1.png";
const DEFAULT_ACCENT = "#4F9437";

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

export function MysteryBoxCard() {
  const { t } = useTranslation('bonus');
  const { openTipsModal } = useTipsModal();
  const { data: conquestsReward } = useHasMysteryBox();
  const [isOpenMysteryBoxModal, setIsOpenMysteryBoxModal] = useState(false);

  // const { status } = useAuth();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const navigate = useNavigate();

  // const userVipLevel = status?.vip || 0;
  const requiredVipLevel = VIP_REQUIREMENTS.mysteryBox.requiredLevel;
  // const isUnlocked = checkVipAccess(userVipLevel, requiredVipLevel);

  // 可领取状态
  const isClaimable = conquestsReward?.data?.has_mystery_box ?? false;


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
    openTipsModal("mysteryBox");
  };

  const handleButtonClick = () => {
    if (conquestsReward?.data?.has_mystery_box ?? false) {
      setIsOpenMysteryBoxModal(true);
    } else {
      navigate({ to: "/explore", search: { tab: "freespins" } });
    }
  };

  return (
    <>
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
            <img src={ILLUSTRATION_URL} alt={t("bonus:mystery_box")} className="w-full h-full object-contain" loading="lazy" decoding="async" />
          </div>
          <div className="flex flex-1 flex-col gap-1 sm:gap-2 sm:items-center">
            <p className="text-sm font-bold sm:text-base text-left w-full">{t("bonus:mystery_box")}</p>
            <p className="text-xs text-base-content/60 leading-5 sm:flex-1 text-left w-full">
              <Trans i18nKey="bonus:mystery_box_description2" values={{ vip: requiredVipLevel }} />
            </p>
            <div className="hidden sm:flex sm:w-full sm:justify-center sm:mt-auto">
              <VipButton requiredLevel={requiredVipLevel} onClick={handleButtonClick} />
            </div>
          </div>
          <div className="flex sm:hidden">
            <VipButton requiredLevel={requiredVipLevel} onClick={handleButtonClick} />
          </div>
        </div>
      </div>

      <MysteryBoxModal
        isOpen={isOpenMysteryBoxModal}
        onClose={() => {
          setIsOpenMysteryBoxModal(false)
        }} />
    </>
  );
}
