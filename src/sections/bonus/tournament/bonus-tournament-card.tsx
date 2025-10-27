import Iconify from "@/components/iconify";
import { BonusClaimConfirmationModal } from "@/sections/bonus/shared/double-or-nothing/bonus-claim-confirmation-modal";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useClaimBonus, useClaimBonusMutation } from "@/hooks/api/useAuth";
import { useBonusClaimConfirmation } from "@/sections/bonus/shared/use-bonus-claim-confirmation";
import { useTranslation } from "react-i18next";
import { useState, useCallback } from "react";
import { FastAverageColor } from "fast-average-color";
import { BonusTournamentHelpModal } from "./bonus-tournament-help-modal";

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
  const { t } = useTranslation();
  const { isInitialized } = useAuth();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [background, setBackground] = useState<string>(DEFAULT_GRADIENT);

  const { mutate: claimBonus, isPending: isClaimPending } = useClaimBonusMutation();
  const { modalState, openClaimConfirmation, closeClaimConfirmation } = useBonusClaimConfirmation();
  
  const { data: claimData, isLoading: isDataLoading } = useClaimBonus("tournament");
  
  const isLoading = !isInitialized || isDataLoading;
  
  const tournamentData = claimData?.data?.data;
  const claimableAmount = parseFloat(tournamentData?.value || "0");
  const currency = tournamentData?.currency || "USDT";

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

  const handleClaim = () => {
    openClaimConfirmation({
      bonusType: "Tournament Reward",
      claimableAmount: claimableAmount,
      onNormalClaim: () => claimBonus({ item: "tournament" }),
      onDoubleClaim: () => claimBonus({ item: "tournament" }) // TODO: Add double claim support to API
    });
  };

  const handleOpenTips = () => {
    setIsHelpModalOpen(true);
  };

  if (isLoading) {
    return (
      <div
        className="flex flex-col p-4 gap-2 rounded-field h-[140px] w-full relative overflow-hidden border border-base-200"
        style={{
          background: DEFAULT_GRADIENT,
        }}
      >
        <div className="skeleton w-6 h-6 absolute right-4 rtl:right-auto rtl:left-4 top-4 rounded-btn"></div>
        <div className="flex items-center gap-2 h-15">
          <div className="skeleton w-15 h-15 rounded-box"></div>
          <div className="flex flex-col justify-start h-full w-full">
            <div className="skeleton h-4 w-32 rounded-box"></div>
          </div>
        </div>

        <div className="flex items-center gap-1 w-full">
          <div className="flex-1 bg-base-300 rounded-btn h-12 flex items-center px-3 gap-2">
            <div className="skeleton w-4 h-4 rounded-box"></div>
            <div className="skeleton h-4 flex-1 rounded-box"></div>
          </div>
          <div className="skeleton w-20 h-12 rounded-btn"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col p-4 gap-2 rounded-field h-[140px] sm:h-[170px] w-full relative overflow-hidden border border-base-200"
      style={{
        background,
      }}
    >
      <button className="btn btn-square btn-xs bg-base-200 absolute right-4 rtl:right-auto rtl:left-4 top-4" onClick={handleOpenTips}>
        <Iconify icon="custom:info" className="text-base-content/50" />
      </button>
      <div className="flex items-center gap-2 h-15">
        <img
          src="/images/illustrations/976143dfd2c953990ba4fcb7aec3cf7b471c5beb.png"
          alt={t("bonus:tournament_reward")}
          className="w-15 h-15 -rotate-8"
          onLoad={handleIllustrationLoad}
          loading="lazy"
          decoding="async"
        />
        <div className="flex flex-col justify-start h-full w-full">
          <p className="text-sm font-bold sm:text-base">{t("bonus:tournament_reward")}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 w-full">
        <label className="input input-md disabled:bg-base-300 bg-base-300 border-none flex-1">
          <Iconify icon="custom:cash" />
          <input type="text" className="grow border-none outline-none" readOnly value={formatWithConversion(claimableAmount, currency).formatted} />
        </label>

        <button 
          className="btn btn-primary btn-soft btn-md px-0 w-20 max-w-20" 
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

      <BonusClaimConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeClaimConfirmation}
        onNormalClaim={modalState.onNormalClaim || (() => {})}
        onDoubleClaim={modalState.onDoubleClaim || (() => {})}
        bonusType={modalState.bonusType}
        claimableAmount={modalState.claimableAmount}
        isLoading={isClaimPending}
      />

      <BonusTournamentHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

    </div>
  );
}
