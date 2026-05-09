import Iconify from "@/components/iconify";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useClaimBonus, useClaimBonusMutation } from "@/hooks/api/useAuth";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useVibrantColor } from "@/hooks/useVibrantColor";
import { BonusTournamentHelpModal } from "./bonus-tournament-help-modal";
import ImageColorCard from "@/components/ui/ImageColorCard";
import { LazyImage } from "@/components/ui/LazyImage";
import { useBoundStore } from "@/store";
import { useDoubleOrNothingModal } from "@/contexts/ModalsProvider";
import { CardLoading } from "@/sections/bonus/components/CardLoading.tsx";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { hasAuth } from "@/utils/auth.ts";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";

const BASE_SCRIM = "color-mix(in oklch, var(--color-base-300) 60%, transparent)";
const DEFAULT_GRADIENT = `
  radial-gradient(
    95.05% 100% at 0% 35.47%,
    color-mix(in oklch, #E77732 40%, transparent) 0%,
    ${BASE_SCRIM} 100%
  ),
  linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
`;

export function BonusTournamentCard() {
  const { t } = useTranslation('bonus');
  const { isInitialized } = useAuth();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [background, setBackground] = useState<string>(DEFAULT_GRADIENT);
  const ILLUSTRATION_URL = useBonusDetailsImage("tournament_reward", 192);

  const { mutate: claimBonus, isPending: isClaimPending } = useClaimBonusMutation();

  const { data: claimData, isLoading: isDataLoading } = useClaimBonus("tournament");
  const { setSyncAction } = useBoundStore();
  const { openDoubleOrNothingModal } = useDoubleOrNothingModal();

  const isLoading = !isInitialized || isDataLoading;

  const tournamentData = claimData?.data?.data;
  const claimableAmount = parseFloat(tournamentData?.value || "0") || 0;
  const currency = tournamentData?.currency || "USDT";

  const { hex } = useVibrantColor(ILLUSTRATION_URL);

  useEffect(() => {
    if (hex) {
      const accentStop = `color-mix(in oklch, ${hex} 40%, transparent)`;
      setBackground(`
        radial-gradient(
          95.05% 100% at 0% 35.47%,
          ${accentStop} 0%,
          ${BASE_SCRIM} 100%
        ),
        linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
      `);
    }
  }, [hex]);

  const handleClaim = () => {
    claimBonus(
      { item: "tournament" },
      {
        onSuccess: (response) => {
          if (response.code !== 0 ) {
            setSyncAction("OPEN_BONUS_CLAIM_RESPONSE_MODAL", {
              code: response.code,
              tryAgain: handleClaim
            });
            return
          }
          openDoubleOrNothingModal({
            don_record_id: response?.data?.don_record_id,
            amount: response?.data?.amount
          });
        }
      }
    )
  };

  const handleOpenTips = () => {
    setIsHelpModalOpen(true);
  };

  if (isLoading) return <CardLoading />;

  if (!isLoading && !hasAuth()) {
    return (
      <ImageColorCard
        gradientMode="linear"
        imageUrl={ILLUSTRATION_URL}
        colorOpacity={0.6}
        paletteOrder={["DarkVibrant", "Vibrant", "Muted"]}
        className="flex items-center p-8 gap-2 rounded-field h-[140px] sm:h-[170px] w-full relative overflow-hidden border border-base-200 transition-all duration-500"
      >
        <p className="text-xl sm:text-2xl font-bold uppercase leading-6 sm:leading-8 text-start">
          <span className="text-base-content block">{t("casino:tournaments")}</span>
          <span className="block text-base-content">& {t("bonus:races")}</span>
        </p>
        <LazyImage
          src={ILLUSTRATION_URL}
          alt="free spins"
          className="w-[130px] h-[130px] sm:w-[170px] sm:h-[170px] -rotate-12 absolute right-0 top-0 rtl:rotate-y-180 rtl:left-0 rtl:right-auto"
        />
      </ImageColorCard>
    );
  }

  // 可领取状态
  const isClaimable = claimableAmount > 0;

  return (
    <div
      className={`flex flex-col p-4 gap-4 rounded-field w-full relative overflow-hidden border ${isClaimable ? 'border-warning' : 'border-base-200'}`}
      style={{
        background,
      }}
    >
      <div className="flex items-center gap-2 h-15">
        <img
          src={ILLUSTRATION_URL}
          alt={t("bonus:tournament_reward")}
          className="w-15 h-15"
          loading="lazy"
          decoding="async"
        />
        <div className="flex flex-col justify-start h-full w-full flex-1">
          <div className="flex justify-between">
            <p className="text-sm font-bold sm:text-base">{t("bonus:tournament_reward")}</p>
            <Info onClick={handleOpenTips} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 w-full">
        <label className="input input-md disabled:bg-base-300 bg-base-300 border-none flex-1">
          <Iconify icon="custom:cash" />
          <input type="text" className="grow border-none outline-none font-semibold" readOnly
                 value={formatWithConversion(claimableAmount, currency,{ showCode:false }).formatted} />
        </label>

        <button
          className="btn btn-primary btn-md px-0 w-20 max-w-20"
          onClick={handleClaim}
          disabled={isClaimPending || claimableAmount <= 0}
        >
          {isClaimPending ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            t("bonus:claim")
          )}
        </button>
      </div>

      <BonusTournamentHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

    </div>
  );
}
