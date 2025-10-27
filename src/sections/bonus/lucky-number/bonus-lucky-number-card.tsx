import Iconify from "@/components/iconify";
import { useTipsModal } from "@/contexts/ModalsProvider";
import { Trans, useTranslation } from "react-i18next";
import { useState, useCallback } from "react";
import { FastAverageColor } from "fast-average-color";
import { VIP_REQUIREMENTS } from "../shared/config";
import { VipButton } from "../shared/VipButton";

const BASE_SCRIM = "color-mix(in oklch, var(--color-base-300) 60%, transparent)";
const DEFAULT_GRADIENT = `
  radial-gradient(
    95.05% 100% at 0% 35.47%,
    color-mix(in oklch, #E77732 40%, transparent) 0%,
    ${BASE_SCRIM} 100%
  ),
  linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
`;

export function BonusLuckyNumberCard() {
  const { t } = useTranslation();
  const { openTipsModal } = useTipsModal();
  const [background, setBackground] = useState<string>(DEFAULT_GRADIENT);
  
  const requiredVipLevel = VIP_REQUIREMENTS.luckyNumber.requiredLevel;

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
    openTipsModal("luckyNumber");
  };

  return (
    <div
      className="flex flex-col p-4 gap-2 rounded-field sm:h-[128px] w-full relative overflow-hidden border border-base-200 h-[140px]"
      style={{
        background,
      }}
    >
      <button className="btn btn-square btn-xs bg-base-200 absolute right-4 rtl:right-auto rtl:left-4 top-4" onClick={handleOpenTips}>
        <Iconify icon="custom:info" className="text-base-content/50" />
      </button>
      <div className="flex items-center gap-4">
        <img 
          src="/images/illustrations/isometric2.svg" 
          alt={t("bonus:lucky_number")} 
          className="w-15 h-15" 
          onLoad={handleIllustrationLoad}
          loading="lazy"
          decoding="async"
        />
        <div className="flex flex-col justify-between h-full w-full gap-1">
          <p className="text-sm font-bold sm:text-base">{t("bonus:lucky_number_seven")}</p>
          <div className="text-xs text-base-content/50 flex items-center justify-between gap-2">
            <Trans i18nKey="bonus:lucky_number_seven_description" values={{ number: "7'" }} />
            <VipButton requiredLevel={requiredVipLevel} />
          </div>
        </div>
      </div>
    </div>
  );
}
