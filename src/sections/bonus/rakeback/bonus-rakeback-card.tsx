import Iconify from "@/components/iconify";
import { Countdown } from "@/components/ui";
import ImageColorCard from "@/components/ui/ImageColorCard";
import { LazyImage } from "@/components/ui/LazyImage";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useTipsModal } from "@/contexts/ModalsProvider";
import { useActivateBoosterMutation, useClaimBonus, useClaimBonusMutation } from "@/hooks/api/useAuth";
import { useVibrantColor } from "@/hooks/useVibrantColor";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBoundStore } from "@/store";
import { useNavigate } from "@tanstack/react-router";
import { useDoubleOrNothingModal } from "@/contexts/ModalsProvider";
import { hasAuth } from "@/utils/auth.ts";
import { CardLoading } from "@/sections/bonus/components/CardLoading.tsx";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";


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
  const { t } = useTranslation(["popup", "bonus"]);
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { status, isInitialized } = useAuth();
  const { openTipsModal } = useTipsModal();
  const { mutate: claimBonus, isPending: isClaimPending } = useClaimBonusMutation();
  const { mutate: activateBooster, isPending: isActivatePending } = useActivateBoosterMutation();
  const navigate = useNavigate();
  const ILLUSTRATION_URL = useBonusDetailsImage("super_rakeback", 192);

  const { setSyncAction } = useBoundStore();

  const [background, setBackground] = useState<string>(DEFAULT_GRADIENT);

  // 查询是否有待领取的rakeback bonus
  const { data: claimData, isLoading: isDataLoading } = useClaimBonus("rakeback");

  // 优化的loading状态：未初始化或数据加载中时显示骨架屏
  const isLoading = !isInitialized || isDataLoading;

  // 处理嵌套的数据结构
  const rakebackData = claimData?.data?.data;

  const claimableAmount = parseFloat(rakebackData?.value || "0") || 0;
  const currency = rakebackData?.currency || "USDT";

  const { hex } = useVibrantColor(ILLUSTRATION_URL);

  const { openDoubleOrNothingModal } = useDoubleOrNothingModal();

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
      { item: "rakeback" },
      {
        onSuccess: (response) => {
          if (response.code !== 0) {
            setSyncAction("OPEN_BONUS_CLAIM_RESPONSE_MODAL", {
              code: response.code,
              tryAgain: handleClaim
            });
            return;
          }
          openDoubleOrNothingModal({
            don_record_id: response?.data?.don_record_id,
            amount: response?.data?.amount
          });
        },
        onError: () => {
        }
      }
    );
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
        <p className="text-2xl sm:text-4xl font-bold uppercase leading-6 sm:leading-8 text-start">
          <span className="text-base-content block">{t("popup:rakeback.super")}</span>
          <span className="text-primary block">{t("bonus:item.rakeback")}</span>
          <span className="text-primary block">{t("bonus:program")}</span>
        </p>
        <LazyImage
          src={ILLUSTRATION_URL}
          alt="free spins"
          className="w-[150px] h-[150px] sm:w-[170px] sm:h-[170px] -rotate-4 absolute right-0 top-0 rtl:rotate-y-180 rtl:left-0 rtl:right-auto"
        />
      </ImageColorCard>
    );
  }

  // 可领取状态
  const isClaimable = 1 <= Number(claimableAmount);

  return (
    <div
      className={`flex flex-col p-4 gap-4 rounded-field w-full relative overflow-hidden border ${isClaimable ? "border-warning" : "border-base-200"}`}
      style={{
        background
      }}
    >
      <div className="flex items-center gap-2">
        <img src={ILLUSTRATION_URL} alt={t("bonus:super_rakeback")} className="w-15 h-15" loading="lazy"
             decoding="async" />
        <div className="flex flex-col justify-between h-full w-full gap-4">
          <div className="flex justify-between">
            <p className="text-sm font-bold sm:text-base">{t("bonus:super_rakeback")}</p>
            <Info onClick={handleOpenTips} />
          </div>
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
            <button
              className="btn btn-sm flex-1 text-base-content/50 px-0 w-20 max-w-20">x&nbsp;{status?.battery ?? 0}</button>
          </div>
        </div>
      </div>

      {
        1 > Number(claimableAmount) && (
          <div className="flex w-full items-end justify-between gap-2">
            <div className="flex flex-col flex-1 gap-1.5">
              <div className="flex items-center justify-between text-base-content/50">
                <p className="text-xs font-semibold">
                  {t("bonus:claim")}:
                </p>
                <p className="text-xs font-semibold">
                  {formatWithConversion(claimableAmount, currency, {
                    showCode: false,
                    minimizeDecimals: false
                  }).formatted} / {formatWithConversion(1, "USD", { showCode: false }).formatted}
                </p>
              </div>
              <progress
                className="progress progress-primary"
                value={Number(claimableAmount)}
                max={Number(1)}
              />
            </div>
            <button
              className="btn btn-primary btn-soft text-sm font-semibold max-w-20"
              onClick={() => navigate({ to: "/explore" })}>
              {t("bonus:ongoing")}
            </button>
          </div>
        )
      }
      {
        1 <= Number(claimableAmount)
        && (
          <div className="flex items-center gap-1 w-full">
            <label className="input input-md disabled:bg-base-300 bg-base-300 border-none flex-1">
              <Iconify icon="custom:cash" />
              <input
                type="text"
                className="grow border-none outline-none font-semibold"
                readOnly
                value={formatWithConversion(claimableAmount, currency, { showCode: false }).formatted}
              />
            </label>

            <button
              className="btn btn-primary btn-md px-0 w-20 max-w-20"
              onClick={handleClaim}
              disabled={isClaimPending || claimableAmount <= 0}
            >
              {isClaimPending ? <span className="loading loading-spinner loading-xs" /> : t("bonus:claim")}
            </button>
          </div>
        )
      }
    </div>
  );
}
