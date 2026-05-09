import { useTipsModal } from "@/contexts/ModalsProvider";
import { useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { VIP_REQUIREMENTS } from "../shared/config";
import { VipButton } from "../shared/VipButton";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { authService } from "@/services/authService";
import { IVipBonusClaim } from "@/types/bonus";
import { toast } from 'sonner';
import { useClaimBonusMutation } from "@/hooks/api/useAuth";
import { useBoundStore } from "@/store";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";

export function BonusLuckyNumberCardV2() {
  const { t } = useTranslation();
  const { openTipsModal } = useTipsModal();
  const navigate = useNavigate();
  const { status, user } = useAuth();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { setSyncAction } = useBoundStore();
  const ILLUSTRATION_URL = useBonusDetailsImage("lucky_number_seven", 96);

  const requiredVipLevel = VIP_REQUIREMENTS.luckyNumber.requiredLevel;

  const handleOpenTips = () => {
    openTipsModal("luckyNumber");
  };
  const [objVipBonusClaim, setObjVipBonusClaim] = useState<IVipBonusClaim | null>(null);

  // 可领取状态
  const isClaimable = useMemo(() => {
    return (status?.vip ?? 0) >= 7 && Number(objVipBonusClaim?.value ?? 0) > 0;
  }, [objVipBonusClaim?.value, status?.vip]);

  const handleButtonClick = () => {
    navigate({ to: "/explore", search: { tab: "freespins" } });
  };

  const handleGetVipBonusClaim = () => {
    if (!user) return
    authService.getClaimBonus('vip_bonus_lucky_number_seven').then((res) => {
      if (res.code === 0 && res.data) {
        setObjVipBonusClaim(res.data.data);
      }
    }).catch((error) => {
      console.info(error);
    });
  };

  useEffect(() => {
    handleGetVipBonusClaim();
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const claimBonusMutation = useClaimBonusMutation();

  const handleOpenBox = async () => {

    setIsLoading(true);
    claimBonusMutation.mutateAsync({
      item: "vip_bonus_lucky_number_seven"
    }).then((res) => {
      if (res.code === 200 || res.code === 0) {

        handleGetVipBonusClaim();
      } else {
        if (res.code === 4001) {
          toast.error(t('bonus:not_in_claim_time_range'));
        } else if (res.code === 4002) {
          toast.error(t('bonus:bonus_already_claimed'));
        } else if (res.code === 4003) {
          toast.error(t('bonus:wager_requirement_not_met'));
        } else {
          toast.error(t('bonus:claim_failed'));
        }
        setSyncAction("OPEN_BONUS_CLAIM_RESPONSE_MODAL", {
          code: res.code,
          tryAgain: handleOpenBox
        });
      }
    }).finally(() => {
      setIsLoading(false);
    })
  };

  return (
    <div
      className={`relative flex w-full items-center gap-4 overflow-hidden rounded-xl border ${isClaimable ? "border-warning" : "border-base-200/60"} bg-base-200 p-4 shadow-md transition-transform duration-200 hover:-translate-y-1 h-[104px] sm:h-[214px] sm:flex-col sm:items-center`}
    >
      <Info className="absolute right-4 rtl:right-auto rtl:left-4 top-4" onClick={handleOpenTips} />
      <div className="flex w-full h-full items-center gap-4 sm:flex-1 sm:flex-col sm:items-center sm:gap-3 sm:text-center sm:pt-8 ">
        <div className="w-12 h-12">
          <img src={ILLUSTRATION_URL} alt={t("bonus:lucky_number")} className="w-full h-full object-contain" loading="lazy" decoding="async" />
        </div>
        <div className="flex flex-1 flex-col gap-2 sm:gap-2 sm:items-center sm:w-full justify-between">
          <div>
            <p className="text-sm font-bold sm:text-base text-left w-full sm:text-center leading-5">{t("bonus:lucky_number_seven")}</p>
            {/* <p className="text-xs text-base-content/60 leading-5 sm:flex-1 text-left w-full">
            <Trans i18nKey="bonus:lucky_number_seven_description" values={{ number: "7'" }} />
          </p> */}
            {(status?.vip ?? 0) >= 7 && Number(objVipBonusClaim?.value ?? 0) > 0 && (
              <div className="text-xs font-semibold text-primary">
                {formatWithConversion(1, 'USD', { showCode: false }).formatted}
              </div>
            )}
          </div>
          {!(Number(objVipBonusClaim?.value ?? 0) > 0) &&
            <div className="hidden sm:flex sm:w-full sm:justify-center">
              <VipButton requiredLevel={requiredVipLevel} onClick={handleButtonClick} />
            </div>
          }
        </div>
        {!(Number(objVipBonusClaim?.value ?? 0) > 0) &&
          <div className="flex sm:hidden flex-col items-end justify-end self-stretch">
            <VipButton requiredLevel={requiredVipLevel} onClick={handleButtonClick} />
          </div>
        }
        {(status?.vip ?? 0) >= 7 && Number(objVipBonusClaim?.value ?? 0) > 0 && (
          <div className="flex flex-col items-end justify-end self-stretch">
            <button className="btn btn-primary h-10 min-h-10 w-auto min-w-20 px-3 font-bold sm:btn-md sm:w-full sm:min-w-24 sm:max-w-none sm:px-6"
              onClick={handleOpenBox}
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner loading-xs" ></span> : t("bonus:claim")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
