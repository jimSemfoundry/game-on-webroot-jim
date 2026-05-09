import Iconify from "@/components/iconify";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useClaimBonus, useClaimBonusMutation } from "@/hooks/api/useAuth";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { BonusTournamentHelpModal } from "./bonus-tournament-help-modal";
import { useBoundStore } from "@/store";
import { useDoubleOrNothingModal } from "@/contexts/ModalsProvider";
import { CardLoading } from "@/sections/bonus/components/CardLoading.tsx";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";

export function BonusTournamentCardV2() {
  const { t } = useTranslation('bonus');
  const { isInitialized } = useAuth();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const ILLUSTRATION_URL = useBonusDetailsImage("tournament_reward", 96);

  const { mutate: claimBonus, isPending: isClaimPending } = useClaimBonusMutation();

  const { data: claimData, isLoading: isDataLoading } = useClaimBonus("tournament");
  const { setSyncAction } = useBoundStore();
  const { openDoubleOrNothingModal } = useDoubleOrNothingModal();

  const isLoading = !isInitialized || isDataLoading;

  const tournamentData = claimData?.data?.data;
  const claimableAmount = parseFloat(tournamentData?.value || "0") || 0;
  const currency = tournamentData?.currency || "USDT";

  const handleClaim = () => {
    claimBonus(
      { item: "tournament" },
      {
        onSuccess: (response) => {
          if (response.code !== 0) {
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

  // 可领取状态
  const isClaimable = claimableAmount > 0;

  return (
    <div
      className={`flex flex-col p-4 rounded-2xl bg-base-200 w-full overflow-hidden border min-h-[140px] justify-between ${isClaimable ? "border-warning" : "border-base-200"}`}
    >

      <div className="flex justify-between">
        <div className="flex gap-4 items-center">
          <img
            src={ILLUSTRATION_URL}
            alt={t("bonus:tournament_reward")}
            className="w-12 h-12"
            loading="lazy"
            decoding="async"
          />
          <div className="flex flex-col">
            <p className="text-sm font-bold sm:text-base">{t("bonus:tournament_reward")}</p>
            <p className="text-xs text-base-content/50 font-semibold">{t("bonus:prize_pool")}: <span className="text-primary">{formatWithConversion(100000, "USD", { showCode: false }).formatted}</span></p>
          </div>
        </div>
        <Info onClick={handleOpenTips} />
      </div>

      <div className="flex items-center gap-2 w-full bg-base-300 h-13 rounded-field pr-0.5">
        <label className="input input-md disabled:bg-base-300 bg-base-300 border-none flex-1">
          <Iconify icon="custom:cash" />
          <input type="text" className="grow border-none outline-none font-semibold" readOnly
            value={formatWithConversion(claimableAmount, currency, { showCode: false }).formatted} />
        </label>
        <button
          className="btn btn-primary btn-md h-12 rounded-field"
          onClick={handleClaim}
          disabled={!isClaimable || isClaimPending || claimableAmount <= 0}
        >
          {isClaimPending ? <span className="loading loading-spinner loading-xs" /> : t("bonus:claim")}
        </button>
      </div>

      <BonusTournamentHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}
