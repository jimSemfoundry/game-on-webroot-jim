/**
 * Bonus page Mystery Box card, used to open the actual content of Mystery Box.
 */
import Iconify from "@/components/iconify";
import { useAuth } from "@/contexts/AuthContext";
import { useTipsModal, useMysteryBoxModal } from "@/contexts/ModalsProvider";
import { Trans, useTranslation } from "react-i18next";
import { useState, useCallback } from "react";
import { FastAverageColor } from "fast-average-color";
import { VIP_REQUIREMENTS, checkVipAccess } from "../shared/config";
import { VipButton } from "../shared/VipButton";

const BASE_SCRIM = "color-mix(in oklch, var(--color-base-300) 60%, transparent)";
const DEFAULT_GRADIENT = `
  radial-gradient(
    95.05% 100% at 0% 35.47%,
    color-mix(in oklch, #4F9437 40%, transparent) 0%,
    ${BASE_SCRIM} 100%
  ),
  linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
`;

export function MysteryBoxCard() {
  const { t } = useTranslation();
  const { openTipsModal } = useTipsModal();
  const { openMysteryBoxModal } = useMysteryBoxModal();
  const { status } = useAuth();
  const [background, setBackground] = useState<string>(DEFAULT_GRADIENT);
  
  const userVipLevel = status?.vip || 0;
  const requiredVipLevel = VIP_REQUIREMENTS.mysteryBox.requiredLevel;
  const isUnlocked = checkVipAccess(userVipLevel, requiredVipLevel);

  const handleIllustrationLoad = useCallback(async (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const fac = new FastAverageColor();

    try {
      const color = await fac.getColorAsync(img, {
        algorithm: 'sqrt',
        mode: 'precision',
        ignoredColor: [
          [255, 255, 255, 255, 50],
          [0, 0, 0, 255, 150],
          [20, 20, 20, 255, 120],
        ],
      });
      const accentStop = `color-mix(in oklch, ${color.hex} 40%, transparent)`;
      setBackground(`
        radial-gradient(
          95.05% 100% at 0% 35.47%,
          ${accentStop} 0%,
          ${BASE_SCRIM} 100%
        ),
        linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
      `);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("Failed to derive bonus card color", error);
      }
    } finally {
      fac.destroy();
    }
  }, []);

  const handleOpenTips = () => {
    openTipsModal("mysteryBox");
  };
  
  const handleButtonClick = () => {
    if (isUnlocked) {
      openMysteryBoxModal();
    }
  };

  return (
    <div
      className="flex flex-col p-4 gap-2 rounded-field min-h-[110px] sm:h-[128px] w-full relative overflow-hidden border border-base-200 h-[140px]"
      style={{
        background,
      }}
    >
      <button className="btn btn-square btn-xs bg-base-200 absolute right-4 rtl:right-auto rtl:left-4 top-4" onClick={handleOpenTips}>
        <Iconify icon="custom:info" className="text-base-content/50" />
      </button>
      <div className="flex items-center gap-4">
        <img
          src="/images/illustrations/a0460e0b128df2ab73ba3a735212bd9d95c841b1.png"
          alt={t("bonus:mystery_box")}
          className="w-15 h-15"
          onLoad={handleIllustrationLoad}
          loading="lazy"
          decoding="async"
        />
        <div className="flex flex-col justify-between h-full w-full gap-1">
          <p className="text-sm font-bold sm:text-base">{t("bonus:mystery_box")}</p>
          <div className="text-xs text-base-content/50 flex items-center justify-between gap-2">
            <Trans i18nKey="bonus:mystery_box_description2" values={{ vip: requiredVipLevel }} />
            <VipButton requiredLevel={requiredVipLevel} onClick={handleButtonClick} />
          </div>
        </div>
      </div>
    </div>
  );
}
