import Iconify from "@/components/iconify";
import { BonusClaimConfirmationModal } from "@/sections/bonus/shared/double-or-nothing/bonus-claim-confirmation-modal";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useTipsModal } from "@/contexts/ModalsProvider";
import { useClaimConquestMutation, useConquestsCompleted, useConquestsReward } from "@/hooks/api/useAuth";
import { useBonusClaimConfirmation } from "@/sections/bonus/shared/use-bonus-claim-confirmation";
import { m } from "motion/react";
import { useTranslation } from "react-i18next";
import { useState, useCallback } from "react";
import { FastAverageColor } from "fast-average-color";
import { IDoubledUpProps } from "@/types/double-or-nothing";
import { DoubledUp } from "../shared/double-or-nothing/DoubledUp";
import { Nothing } from "../shared/double-or-nothing/Nothing";
import { authService } from "@/services/authService";

const BASE_SCRIM = "color-mix(in oklch, var(--color-base-300) 60%, transparent)";
const DEFAULT_GRADIENT = `
  radial-gradient(
    95.05% 100% at 0% 35.47%,
    color-mix(in oklch, #D21D3B 40%, transparent) 0%,
    ${BASE_SCRIM} 100%
  ),
  linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
`;

export function BonusConquestsCard() {
  const { t } = useTranslation();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { openTipsModal } = useTipsModal();
  const [background, setBackground] = useState<string>(DEFAULT_GRADIENT);

  // API数据查询
  const { data: conquestsCompleted } = useConquestsCompleted();
  const { data: conquestsReward } = useConquestsReward();
  const { mutate: claimConquest, isPending: isClaimPending } = useClaimConquestMutation();
  const { modalState, openClaimConfirmation, closeClaimConfirmation } = useBonusClaimConfirmation();

  // 解析API数据
  const completedCount = conquestsCompleted?.data?.completed_conquest || 0;
  const totalCount = conquestsCompleted?.data?.total_conquest || 0;
  const claimableAmount = conquestsCompleted?.data?.has_claim_value || 0;
  const rewardAmount = conquestsReward?.data?.conquest_reward || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // 判断是否有可领取的奖励
  const hasClaimableReward = claimableAmount > 0;

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

  const [donRecordId, setDonRecordId] = useState<string | null>(null);
  const [donData, setDonData] = useState<IDoubledUpProps | null>(null);

  const handleButtonClick = () => {
    if (hasClaimableReward) {
      openClaimConfirmation({
        bonusType: "Conquests",
        claimableAmount: claimableAmount,
        onNormalClaim: () => claimConquest(),
        onDoubleClaim: () => claimConquest(
          undefined,
          {
            onSuccess: (response: any) => {
              setDonRecordId(response.data.don_record_id);
              authService.donDeal(response.data.don_record_id).then((res) => {
                if (res.code === 0) {
                  setDonData(res.data);
                }
              });
            }
          }
        )
      });
    }
  };

  const handleOpenTips = () => {
    openTipsModal("conquest");
  };

  return (
    <div
      className="flex flex-col p-4 gap-3 rounded-field h-full w-full relative overflow-hidden border border-base-200"
      style={{
        background,
      }}
    >
      <button className="btn btn-square btn-xs bg-base-200 absolute right-4 rtl:right-auto rtl:left-4 top-4" onClick={handleOpenTips}>
        <Iconify icon="custom:info" className="text-base-content/50" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <img
          src="/images/illustrations/eizDsf61VZqnUMmvlAedUuwXehab4SDAw0GzPr9aizTmvx0d1SPQqk5XCgrG4lmgPRAruRqgyLxngVvEfUiCsDvW6B3H.svg"
          alt={t("bonus:conquests")}
          className="w-12 h-12"
          onLoad={handleIllustrationLoad}
          loading="lazy"
          decoding="async"
        />
        <div className="flex flex-col gap-1">
          <p className="text-sm sm:text-base font-bold text-base-content">{t("bonus:conquests")}</p>
          <p className="text-xs text-base-content/70 leading-tight">
            {t("bonus:complete_conquests_to_release")}
            <br />
            {formatWithConversion(rewardAmount, "USD").formatted} {t("bonus:from_your_bonus_pool_today")}
          </p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-base-content/70 font-semibold flex-nowrap">
              {completedCount}/{totalCount} {t("bonus:completed")}
            </p>
            <div className="flex items-center gap-1">
              <p className="text-[10px] text-base-content/70 font-semibold flex-nowrap">{t("bonus:claimable")}:</p>
              <p className="text-[10px] font-bold text-primary">
                {formatWithConversion(claimableAmount, "USD", { showCode: false }).formatted}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full">
            <div className="h-2 bg-base-content/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary/60 rounded-full relative overflow-hidden" style={{ width: `${progress}%` }}>
                {/* Animated stripes */}
                <m.div
                  className="absolute inset-0 w-[calc(100%+24px)] -left-3"
                  style={{
                    background: `repeating-linear-gradient(
                      45deg,
                      rgba(255, 255, 255, 0.2) 0px,
                      rgba(255, 255, 255, 0.2) 3px,
                      transparent 3px,
                      transparent 6px
                    )`,
                  }}
                  animate={{
                    x: [0, 8.485], // 6px × √2 ≈ 8.485px (45度对角线距离)
                  }}
                  transition={{
                    duration: 1.0,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 ml-4 rtl:ml-auto rtl:mr-4">
          <button
            className="btn btn-primary btn-soft btn-md font-semibold px-0 w-20 max-w-20"
            onClick={handleButtonClick}
            disabled={isClaimPending}
          >
            {isClaimPending ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <>
                {hasClaimableReward ? t("bonus:claim") : "Go"}
                <Iconify icon="mdi:chevron-right" className="w-4 h-4 rtl:rotate-180" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Claim Confirmation Modal */}

      <BonusClaimConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeClaimConfirmation}
        onNormalClaim={modalState.onNormalClaim || (() => { })}
        onDoubleClaim={modalState.onDoubleClaim || (() => { })}
        bonusType={modalState.bonusType}
        claimableAmount={modalState.claimableAmount}
        isLoading={isClaimPending}
      />
      {donData?.is_win === true && <DoubledUp donData={donData} />}
      {donData?.is_win === false && donRecordId && <Nothing don_record_id={donRecordId} />}
    </div>
  );
}
