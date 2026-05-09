import Iconify from "@/components/iconify";
import { useTipsModal } from "@/contexts/ModalsProvider";
import { useVibrantColor } from "@/hooks/useVibrantColor";
import { useMemo, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { VIP_REQUIREMENTS } from "../shared/config";
import { VipButton } from "../shared/VipButton";
import { useMediaQuery } from "@/hooks/useMediaQuery";
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


const BASE_SCRIM = "color-mix(in oklch, var(--color-base-300) 60%, transparent)";
const DEFAULT_ACCENT = "rgba(255, 0, 102, 0.8)";

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

export function BonusLuckyNumberCard() {
  const { t } = useTranslation();
  const { openTipsModal } = useTipsModal();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const navigate = useNavigate();
  const { status, user } = useAuth();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { setSyncAction } = useBoundStore();
  const ILLUSTRATION_URL = useBonusDetailsImage("lucky_number_seven", 96);

  const requiredVipLevel = VIP_REQUIREMENTS.luckyNumber.requiredLevel;

  const accentStopFallback = useMemo(() => `color-mix(in oklch, ${DEFAULT_ACCENT} 40%, transparent)`, []);
  const fallbackGradient = useMemo(() => buildBackground(accentStopFallback, isMobile), [accentStopFallback, isMobile]);
  const { hex } = useVibrantColor(ILLUSTRATION_URL, {
    fallbackGradient,
    colorTypes: ["DarkMuted"],
    opacity: 0.45,
  });

  const background = useMemo(() => {
    const accentStop = `color-mix(in oklch, ${DEFAULT_ACCENT || hex} 40%, transparent)`;
    return buildBackground(accentStop, isMobile);
  }, [hex, isMobile]);

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
      className={`relative flex w-full gap-3 overflow-hidden rounded-field border ${isClaimable ? "border-warning" : "border-base-200/60"} bg-base-300/30 p-4 shadow-md transition-transform duration-200 hover:-translate-y-1 min-h-[145px] sm:min-h-[290px] flex-col justify-center items-center sm:gap-3 sm:p-5`}
      style={{
        background,
      }}
    >
      <Info className="absolute right-4 rtl:right-auto rtl:left-4 top-4" onClick={handleOpenTips} />
      <div className="flex w-full items-center gap-4 sm:flex-1 sm:flex-col sm:items-center sm:gap-3 sm:text-center">
        <div className="w-16 h-16 sm:size-[82px] grid place-items-center rounded-xl">
          <img src={ILLUSTRATION_URL} alt={t("bonus:lucky_number")} className="w-full h-full object-contain" loading="lazy" decoding="async" />
        </div>
        <div className="flex flex-1 flex-col gap-2 sm:gap-2 sm:items-center">
          <p className="text-sm font-bold sm:text-base text-left w-full">{t("bonus:lucky_number_seven")}</p>
          <p className="text-xs text-base-content/60 leading-5 sm:flex-1 text-left w-full">
            <Trans i18nKey="bonus:lucky_number_seven_description" values={{ number: "7'" }} />
          </p>
          {!(Number(objVipBonusClaim?.value ?? 0) > 0) &&
            <div className="hidden sm:flex sm:w-full sm:justify-center sm:mt-auto">
              <VipButton requiredLevel={requiredVipLevel} onClick={handleButtonClick} />
            </div>
          }
        </div>
        {!(Number(objVipBonusClaim?.value ?? 0) > 0) &&
          <div className="flex sm:hidden">
            <VipButton requiredLevel={requiredVipLevel} onClick={handleButtonClick} />
          </div>
        }
      </div>
      {(status?.vip ?? 0) >= 7 && Number(objVipBonusClaim?.value ?? 0) > 0 && (
        <div className="flex w-full items-center gap-4 sm:flex-col sm:items-center sm:gap-3">
          <label className="input input-md disabled:bg-base-300 bg-base-300 border-none flex-1">
            <Iconify icon="custom:cash" />
            <input
              type="text"
              className="grow border-none outline-none h-10 font-semibold"
              readOnly
              value={formatWithConversion(objVipBonusClaim?.value ?? 0, 'USD', { showCode: false }).formatted}
            />
          </label>
          <button className="btn btn-primary h-10 min-h-10 w-auto min-w-17 px-3 font-bold sm:btn-md sm:w-full sm:min-w-24 sm:max-w-none sm:px-6"
            onClick={handleOpenBox}
            disabled={isLoading}
          >
            {isLoading ? <span className="loading loading-spinner loading-xs" ></span> : t("bonus:claim")}
          </button>
        </div>
      )}
    </div>
  );
}
