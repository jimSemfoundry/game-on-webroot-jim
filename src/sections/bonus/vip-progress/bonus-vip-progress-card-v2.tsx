import { useAuth } from "@/contexts/AuthContext";
import { useClaimBonus, useClaimBonusMutation } from "@/hooks/api/useAuth";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useBoundStore } from "@/store";
import { toast } from "sonner";
// import Decimal from "decimal.js";
import { useDoubleOrNothingModal } from "@/contexts/ModalsProvider";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
// import Iconify from "@/components/iconify";


export const BonusVipProgressCardV2 = () => {
  const { t } = useTranslation();
  const { status } = useAuth();
  const { setSyncAction, depositCrypto } = useBoundStore();
  const { openDoubleOrNothingModal } = useDoubleOrNothingModal();
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const currentVip = status?.vip || 1;
  // const userXP = useMemo(() => Number(status?.xp || 0), [status]);
  const badgeUrl = useMemo(() => `/images/vip/levels/${currentVip}.png`, [currentVip]);

  // const { data: vip } = useVipNextLevelData();  

  // const fullXP = useMemo(() => Number(vip?.data?.xp || 0), [vip]);
  // const nextLevelBonus = useMemo(() => vip?.data?.level_up || "0", [vip]);

  // const progress = useMemo(() => {
  //   if (!fullXP) return 0;
  //   return Decimal(Math.min((userXP / fullXP) * 100, 100)).toFixed(2, Decimal.ROUND_DOWN).toString();
  // }, [userXP, fullXP]);

  // const formattedBonus = formatWithConversion(nextLevelBonus, "USDT", {
  //   showSymbol: true,
  //   showCode: false,
  // });

  // Claim Logic
  const { mutate: claimBonus, isPending: isClaimPending } = useClaimBonusMutation();
  const { data: levelUpClaimData } = useClaimBonus("level_up");

  const claimable =  levelUpClaimData?.data?.data?.value || 0;

  const formattedBonus = formatWithConversion(claimable, "USDT", {
    showSymbol: true,
    showCode: false,
  });

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

  // const levelUpClaimSum = useMemo(() => {
  //   return levelUpClaimData?.data?.data?.sum || 0;
  // }, [levelUpClaimData]);

  const isClaimAvailable = useMemo(() => {
    return Number(levelUpClaimData?.data?.data?.value ?? 0) > 0;
  }, [levelUpClaimData]);

  return (
    <div
      className={`relative flex w-full items-center overflow-hidden rounded-xl border ${isClaimAvailable ? "border-warning" : "border-base-200/60"} bg-base-200 p-4 shadow-md transition-transform duration-200 hover:-translate-y-1 h-[104px] sm:h-[214px] sm:flex-col sm:items-center`}
    >
      <div className="flex w-full h-full items-center gap-4 sm:flex-1 sm:flex-col sm:items-center sm:gap-3 sm:text-center sm:pt-8 ">
        {/* VIP Badge */}
        <div className="relative shrink-0">
          <img
            src={badgeUrl}
            alt={`VIP ${currentVip}`}
            className="h-12 w-12 object-contain drop-shadow-lg"
            loading="lazy"
          />
        </div>

        <div className="flex gap-4 sm:gap-0 sm:flex-col items-center justify-between h-full w-full">
          <div className="flex flex-col gap-1.5 w-full flex-1">
            {/* <div className="flex items-center justify-between"> */}
              <h3 className="text-sm font-bold text-base-content sm:text-center">VIP {currentVip}</h3>
              {/* <div className="flex items-center gap-1">
                {
                  !isClaimAvailable && (
                    <Iconify icon="custom:bonus-lock" className="text-primary" />
                  )
                }
                <p className="text-primary text-xs font-bold">{formattedBonus.formatted}</p>
              </div> */}
            {/* </div> */}

            {/* <div className="h-2 w-full overflow-hidden rounded-full bg-base-content/10">
              <div className="h-full rounded-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
            </div> */}
            <div className="flex items-center sm:justify-between gap-2">
              <div className="text-xs text-base-content/50 font-semibold">{t("bonus:claimable")}: </div>
              <div className="text-xs font-semibold text-primary">{formattedBonus.formatted}</div>
            </div>
          </div>

          <div className="flex flex-col items-end justify-end self-stretch">
            {isClaimAvailable ? (
              <button
                className="btn btn-primary h-10 min-h-10 w-full min-w-20 font-bold sm:btn-md px-3"
                onClick={handleClaimBonus}
                disabled={isClaimPending}
              >
                {isClaimPending ? <span className="loading loading-spinner loading-xs"></span> : t('bonus:claim')}
              </button>
            ) : (
              <Link to="/vip-club" className="btn btn-primary btn-soft h-10 min-h-10 min-w-20 w-full font-bold sm:btn-md">
                {t("bonus:go")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
