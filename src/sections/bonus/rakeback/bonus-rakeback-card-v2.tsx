import Iconify from "@/components/iconify";
import { Countdown } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useTipsModal } from "@/contexts/ModalsProvider";
import { useActivateBoosterMutation, useClaimBonus, useClaimBonusMutation } from "@/hooks/api/useAuth";
import { useTranslation } from "react-i18next";
import { useBoundStore } from "@/store";
import { useDoubleOrNothingModal } from "@/contexts/ModalsProvider";
import { CardLoading } from "@/sections/bonus/components/CardLoading.tsx";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";

export function BonusRakebackCardV2() {
  const { t } = useTranslation(["popup", "bonus"]);
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { status, isInitialized } = useAuth();
  const { openTipsModal } = useTipsModal();
  const { mutate: claimBonus, isPending: isClaimPending } = useClaimBonusMutation();
  const { mutate: activateBooster, isPending: isActivatePending } = useActivateBoosterMutation();
  const ILLUSTRATION_URL = useBonusDetailsImage("super_rakeback", 96);

  const { setSyncAction } = useBoundStore();

  // 查询是否有待领取的rakeback bonus
  const { data: claimData, isLoading: isDataLoading } = useClaimBonus("rakeback");

  // 优化的loading状态：未初始化或数据加载中时显示骨架屏
  const isLoading = !isInitialized || isDataLoading;

  // 处理嵌套的数据结构
  const rakebackData = claimData?.data?.data;

  const claimableAmount = parseFloat(rakebackData?.value || "0") || 0;
  const currency = rakebackData?.currency || "USDT";

  const { openDoubleOrNothingModal } = useDoubleOrNothingModal();

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

  // 可领取状态
  const isClaimable = 1 <= Number(claimableAmount);

  return (
    <div
      className={`flex flex-col p-4 rounded-2xl bg-base-200 w-full overflow-hidden border min-h-[140px] justify-between ${isClaimable ? "border-warning" : "border-base-200"}`}
    >
      <div className="flex justify-between">
        <div className="flex items-center gap-4">
          <img src={ILLUSTRATION_URL} alt={t("bonus:super_rakeback")} className="w-12 h-12" loading="lazy"
            decoding="async" />
          <div className="flex flex-col">
            <p className="text-sm font-bold sm:text-base">{t("bonus:super_rakeback")}</p>
            <button
              className="btn btn-primary btn-soft btn-xs min-w-[211px] flex items-center justify-between px-3"
              onClick={handleActivateBooster}
              disabled={isActivatePending || (status?.battery ?? 0) <= 0}
            >
              <span>
                {isActivatePending ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : isBatteryActive ? (
                  <Countdown className="text-xs" target={batteryExpireMs} />
                ) : (
                  t("bonus:activate_booster")
                )}
              </span>
              <span className="flex items-center gap-2 text-xs">
                <img src="/images/illustrations/c5c2985e7dcfa56bb27b5f698d5ca09a6ea2a31e.png" className="w-4 h-4" />
                x&nbsp;{status?.battery ?? 0}
              </span>
            </button>
          </div>
        </div>
        <Info onClick={handleOpenTips} />
      </div>

      <div className="flex items-center gap-2 w-full bg-base-300 h-13 rounded-field pr-0.5">
        <label className="input input-md disabled:bg-base-300 bg-base-300 border-none flex-1">
          <Iconify icon="custom:cash" className="w-4.5 h-4.5" />
          <input
            type="text"
            className="grow border-none outline-none font-semibold"
            readOnly
            value={formatWithConversion(claimableAmount, currency, { showCode: false }).formatted}
          />
          <span className={`text-sm font-bold ${isClaimable ? "text-primary" : "text-base-content/50"}`}>≥{formatWithConversion(1, "USD", { showCode: false }).formatted}</span>
        </label>
        <button
          className="btn btn-primary btn-md h-12 rounded-field"
          onClick={handleClaim}
          disabled={!isClaimable || isClaimPending || claimableAmount <= 0}
        >
          {isClaimPending ? <span className="loading loading-spinner loading-xs" /> : t("bonus:claim")}
        </button>
      </div>

    </div>
  );
}
