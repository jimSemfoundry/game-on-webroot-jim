import Iconify from "@/components/iconify";
import { Countdown } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useTipsModal } from "@/contexts/ModalsProvider";
import { useActivateBoosterMutation, useClaimBonus, useClaimBonusMutation } from "@/hooks/api/useAuth";
import { useBonusClaimConfirmation } from "@/sections/bonus/shared/use-bonus-claim-confirmation";
import { useTranslation } from "react-i18next";
import { useState, useCallback } from "react";
import { FastAverageColor } from "fast-average-color";
import { BonusClaimConfirmationModal } from "../shared/double-or-nothing/bonus-claim-confirmation-modal";
import { authService } from "@/services/authService";
import { DoubledUp } from "../shared/double-or-nothing/DoubledUp";
import { IDoubledUpProps } from "@/types/double-or-nothing";
import { Nothing } from "../shared/double-or-nothing/Nothing";

const BASE_SCRIM = "color-mix(in oklch, var(--color-base-300) 60%, transparent)";
const DEFAULT_GRADIENT = `
  radial-gradient(
    95.05% 100% at 0% 35.47%,
    color-mix(in oklch, #2B4EB1 40%, transparent) 0%,
    ${BASE_SCRIM} 100%
  ),
  linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
`;

export function BonusRakebackCard() {
  const { t } = useTranslation();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { status, isInitialized } = useAuth();
  const { openTipsModal } = useTipsModal();
  const { mutate: claimBonus, isPending: isClaimPending } = useClaimBonusMutation();
  const { mutate: activateBooster, isPending: isActivatePending } = useActivateBoosterMutation();
  const { modalState, openClaimConfirmation, closeClaimConfirmation } = useBonusClaimConfirmation();
  const [background, setBackground] = useState<string>(DEFAULT_GRADIENT);

  // 查询是否有待领取的rakeback bonus
  const { data: claimData, isLoading: isDataLoading } = useClaimBonus("rakeback");

  // 优化的loading状态：未初始化或数据加载中时显示骨架屏
  const isLoading = !isInitialized || isDataLoading;

  // 处理嵌套的数据结构
  const rakebackData = claimData?.data?.data;

  const claimableAmount = parseFloat(rakebackData?.value || "0");
  const currency = rakebackData?.currency || "USDT";

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

  const [donData, setDonData] = useState<IDoubledUpProps | null>(null);
  const [donRecordId, setDonRecordId] = useState<string | null>(null);

  const handleClaim = () => {
    openClaimConfirmation({
      bonusType: "Super Rakeback",
      claimableAmount: claimableAmount,
      onNormalClaim: () => claimBonus({ item: "rakeback" }),
      onDoubleClaim: () => claimBonus(
        { item: "rakeback" },
        {
          onSuccess: (response) => {
            setDonRecordId(response.data.don_record_id);
            authService.donDeal(response.data.don_record_id).then((res) => {
              if (res.code === 0) {
                setDonData(res.data);
              }
            })
          }
        }
      ),
    });
  };

  const handleOpenTips = () => {
    openTipsModal("superRakeback");
  };

  const handleActivateBooster = () => {
    activateBooster();
  };

  // Check if battery is active (battery_expire is a future Unix timestamp)
  const isBatteryActive = status?.battery_expire && new Date(status.battery_expire * 1000) > new Date();

  // Convert Unix timestamp to milliseconds for Countdown component
  const batteryExpireMs = status?.battery_expire ? status.battery_expire * 1000 : 0;

  if (isLoading) {
    return (
      <div
        className="flex flex-col p-4 gap-2 rounded-field h-[170px] w-full relative overflow-hidden border border-base-200"
        style={{
          background: DEFAULT_GRADIENT,
        }}
      >
        <div className="skeleton w-6 h-6 absolute right-4 rtl:right-auto rtl:left-4 top-4 rounded-btn"></div>
        <div className="flex items-center gap-2 h-15">
          <div className="skeleton w-15 h-15 rounded-box"></div>
          <div className="flex flex-col justify-between h-full w-full">
            <div className="skeleton h-4 w-32 rounded-box"></div>
            <div className="flex items-center gap-1 w-full justify-end">
              <div className="skeleton h-8 w-24 rounded-btn"></div>
              <div className="skeleton h-8 w-16 rounded-btn"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 w-full">
          <div className="flex-1 bg-base-300 rounded-btn h-12 flex items-center px-3 gap-2">
            <div className="skeleton w-4 h-4 rounded-box"></div>
            <div className="skeleton h-4 flex-1 rounded-box"></div>
          </div>
          <div className="skeleton w-20 h-12 rounded-btn"></div>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="skeleton h-3 w-20 rounded-box"></div>
          <div className="skeleton h-3 w-4 rounded-box"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col p-4 gap-2 rounded-field h-[170px] w-full relative overflow-hidden border border-base-200"
      style={{
        background,
      }}
    >
      <button className="btn btn-square btn-xs bg-base-200 absolute right-4 rtl:right-auto rtl:left-4 top-4" onClick={handleOpenTips}>
        <Iconify icon="custom:info" className="text-base-content/50" />
      </button>
      <div className="flex items-center gap-2 h-15">
        <img
          src="/images/illustrations/29283baa24f82bafe627e3b11c521761551173bb.png"
          alt={t("bonus:super_rakeback")}
          className="w-15 h-15"
          onLoad={handleIllustrationLoad}
          loading="lazy"
          decoding="async"
        />
        <div className="flex flex-col justify-between h-full w-full">
          <p className="text-sm font-bold sm:text-base">{t("bonus:super_rakeback")}</p>
          <div className="flex items-center gap-1 w-full justify-end">
            <button
              className="btn btn-primary btn-soft btn-sm"
              onClick={handleActivateBooster}
              disabled={isActivatePending || (status?.battery ?? 0) <= 0}
            >
              <img src="/images/illustrations/c5c2985e7dcfa56bb27b5f698d5ca09a6ea2a31e.png" className="w-4 h-4" />
              {isActivatePending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : isBatteryActive ? (
                <Countdown className="text-xs" target={batteryExpireMs} />
              ) : (
                t("bonus:activate_booster")
              )}
            </button>
            <button className="btn btn-sm flex-1 text-base-content/50 px-0 w-20 max-w-20">x&nbsp;{status?.battery ?? 0}</button>
          </div>
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

      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-base-content/50">{t("bonus:deposit_bonus")}</p>
        <p className="text-xs font-semibold text-base-content/50">0</p>
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
