import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useClaimBonus, useClaimBonusMutation, useVipNextLevelData } from "@/hooks/api/useAuth";
import { useVibrantColor } from "@/hooks/useVibrantColor";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useBoundStore } from "@/store";
import { toast } from "sonner";
import Decimal from "decimal.js";
import { useDoubleOrNothingModal } from "@/contexts/ModalsProvider";

const BASE_SCRIM = "color-mix(in oklch, var(--color-base-300) 60%, transparent)";
const DEFAULT_ACCENT = "#C58F3A";

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

export const BonusVipProgressCard = () => {
  const { t } = useTranslation();
  const { status } = useAuth();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { setSyncAction, depositCrypto } = useBoundStore();
  const { openDoubleOrNothingModal } = useDoubleOrNothingModal();

  const currentVip = status?.vip || 1;
  const userXP = useMemo(() => Number(status?.xp || 0), [status]);
  const badgeUrl = useMemo(() => `/images/vip/levels/${currentVip}.png`, [currentVip]);

  const { data: vip } = useVipNextLevelData();
  const fullXP = useMemo(() => Number(vip?.data?.xp || 0), [vip]);
  const nextLevelBonus = useMemo(() => vip?.data?.level_up || "0", [vip]);

  const progress = useMemo(() => {
    if (!fullXP) return 0;
    return Decimal(Math.min((userXP / fullXP) * 100, 100)).toFixed(2, Decimal.ROUND_DOWN).toString();
  }, [userXP, fullXP]);

  const formattedBonus = formatWithConversion(nextLevelBonus, "USDT", {
    showSymbol: true,
    showCode: false,
  });
  const accentStopFallback = useMemo(() => `color-mix(in oklch, ${DEFAULT_ACCENT} 40%, transparent)`, []);
  const fallbackGradient = useMemo(() => buildBackground(accentStopFallback, isMobile), [accentStopFallback, isMobile]);
  const { hex } = useVibrantColor(badgeUrl, {
    fallbackGradient,
    colorTypes: ["DarkMuted"],
    opacity: 0.45,
  });

  const background = useMemo(() => {
    const accentStop = `color-mix(in oklch, ${hex || DEFAULT_ACCENT} 40%, transparent)`;
    return buildBackground(accentStop, isMobile);
  }, [hex, isMobile]);

  // Claim Logic
  const { mutate: claimBonus, isPending: isClaimPending } = useClaimBonusMutation();
  const { data: levelUpClaimData } = useClaimBonus("level_up");

  // Calculate total claimed for level up
  const levelUpClaimSum = useMemo(() => {
    // Try to get sum from levelUpClaimData if available, or calculate from history
    // The user snippet used levelUpClaim?.data?.sum. Let's see if our new hook returns that.
    return levelUpClaimData?.data?.data?.sum || 0;
  }, [levelUpClaimData]);

  const handleClaimBonus = () => {
    claimBonus(
      {
        item: 'level_up',
        currency: depositCrypto?.currency?.currency
      },
      {
        onSuccess: (res: any) => {
          if (res.code !== 0) {
            setSyncAction("OPEN_BONUS_CLAIM_RESPONSE_MODAL", {
              code: res.code,
              tryAgain: () => handleClaimBonus()
            });
            return;
          }

          // Success
          openDoubleOrNothingModal({
            don_record_id: res.data?.don_record_id,
            amount: res.data?.amount
          });
        },
        onError: () => {
          // If error, we might want to show the popup too if it returns a code
          // But usually onError handles network errors.
          // If it's a logic error (already claimed), it might come in onSuccess with code != 0
          // or onError with response.
          toast.error(t('toast:claimBonusFailed'));
        }
      }
    );
  };

  const isClaimAvailable = useMemo(() => {
    return Number(levelUpClaimData?.data?.data?.value ?? 0) > 0;
  }, [levelUpClaimData]);

  return (
    <div
      className={`relative flex min-h-[140px] w-full flex-col items-start gap-4 overflow-hidden rounded-field border ${isClaimAvailable ? 'border-warning' : 'border-base-200/60'} bg-base-300/30 p-4 sm:col-span-1 sm:min-h-[320px] sm:items-center sm:p-6 shadow-md transition-transform duration-200 hover:-translate-y-1`}
      style={{ background }}
    >
      <div className="flex w-full flex-1 items-start gap-3 text-left sm:flex-col sm:items-center sm:text-center">
        {/* VIP Badge */}
        <div className="relative shrink-0">
          <img
            src={badgeUrl}
            alt={`VIP ${currentVip}`}
            className="h-16 w-16 object-contain drop-shadow-lg sm:h-20 sm:w-20"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-1 items-start sm:items-center">
          <h3 className="text-xl font-bold text-base-content sm:text-2xl">VIP {currentVip}</h3>
          <p className="text-xs font-medium text-base-content/60 sm:text-sm leading-5 text-left w-full">
            {t("bonus:vip_progress_description", {
              amount: formattedBonus.formatted,
            })
              .split(formattedBonus.formatted)
              .map((part, index, array) =>
                index === array.length - 1 ? (
                  part
                ) : (
                  <span key={index}>
                    {part}
                    <span className="text-primary">{formattedBonus.formatted}</span>
                  </span>
                ),
              )}
          </p>
        </div>
      </div>

      {/* Progress Bar and Button */}
      <div className="mt-auto flex w-full flex-col gap-3">
        <div className="flex items-center gap-4 sm:flex-col sm:items-stretch">
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold text-base-content/40">
              <span>{t("bonus:progress")}</span>
              <span>{progress}%</span>
            </div>
            <progress className={'progress progress-primary'} value={progress} max={100}></progress>
          </div>

          {isClaimAvailable ? (
            <button
              className="btn btn-primary h-10 min-h-10 w-auto max-w-20 min-w-20 px-3 font-bold sm:btn-md sm:w-full sm:min-w-24 sm:max-w-none sm:px-6"
              onClick={handleClaimBonus}
              disabled={isClaimPending}
            >
              {isClaimPending ? <span className="loading loading-spinner loading-xs"></span> : t('bonus:claim')}
            </button>
          ) : (
            <Link to="/vip-club" className="btn btn-primary btn-soft h-10 min-h-10 w-auto max-w-20 min-w-20 px-3 font-bold sm:btn-md sm:w-full sm:min-w-24 sm:max-w-none sm:px-6">
              {t("bonus:go")}
            </Link>
          )}
        </div>

        <div className="flex items-center justify-between w-full px-0.5">
          <p className="text-xs text-base-content/60 font-medium">{t('bonus:total_vip_bonus_claimed')}</p>
          <p className="text-primary text-xs font-bold">{formatWithConversion(levelUpClaimSum, "USDT").formatted}</p>
        </div>
      </div>
    </div>
  );
};
