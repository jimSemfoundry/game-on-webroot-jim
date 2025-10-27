import Iconify from "@/components/iconify";
import Copy from "@/components/ui/Copy";
import { LiquidGlassEffect } from "@/components/ui/LiquidGlassEffect";
import { useReferralRewards } from "@/hooks/useReferralRewards";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import { useDefaultAdTag } from "@/hooks/api/useAuth";
import { ReferralShareModal } from "./referral-share-modal";

export const ReferralSummaryCard = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { data: adTagData } = useDefaultAdTag();
  
  const {
    availableCommission,
    availableReferral,
    totalReceivedCommission,
    totalReceivedReferral,
    lockedReferral,
    isLoading,
  } = useReferralRewards();

  const referralLink = useMemo(
    () => (adTagData?.data?.code ? `${location.origin}?startapp=${adTagData.data.code}` : ""),
    [adTagData]
  );
  const stripedBackground = `repeating-linear-gradient(
    -45deg,
    var(--color-base-200) 0px,
    var(--color-base-200) 12px,
    oklch(from var(--color-base-200) l c h / 0.8) 12px,
    oklch(from var(--color-base-200) l c h / 0.8) 24px
  )`;

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-[252px] z-0 mx-5 sm:mx-0 sm:absolute sm:w-[600px] sm:right-4 sm:rtl:right-auto sm:rtl:left-4 sm:top-4 sm:bottom-2 sm:h-[calc(100%-2rem)] sm:bg-base-300 sm:rounded-box">
        <LiquidGlassEffect className="absolute inset-0 pointer-events-none min-h-full w-full -z-10">
          <div className="w-full h-full"></div>
        </LiquidGlassEffect>

        <div className="w-full h-full flex flex-col p-4 sm:p-6 justify-between gap-4">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-base-content">
              {t("referral:assembleYourCrewCashIn")}
            </h2>
            <div className="flex flex-col gap-3 text-sm sm:text-base text-base-content/70">
              <p className="leading-relaxed">
                {t("referral:guestView.description1")}
              </p>
              <p className="leading-relaxed">
                {t("referral:guestView.description2")}
              </p>
            </div>
          </div>
        
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[252px] z-0 mx-5 sm:mx-0 sm:absolute sm:w-[600px] sm:right-4 sm:rtl:right-auto sm:rtl:left-4 sm:top-4 sm:bottom-2 sm:h-[calc(100%-2rem)] sm:bg-base-300 sm:rounded-box">
      <LiquidGlassEffect className="absolute inset-0 pointer-events-none min-h-full w-full -z-10">
        <div className="w-full h-full"></div>
      </LiquidGlassEffect>

      <div className="w-full h-full flex flex-col p-4 justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 h-full sm:max-h-[224px]">
          <div
            className="w-full p-4 rounded-box flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-4 h-[90px] sm:h-full"
            style={{ backgroundImage: stripedBackground }}
          >
            <div className="flex flex-1 flex-col gap-0 sm:gap-3 sm:justify-between">
              <div className="flex flex-col gap-0 sm:gap-2">
                <h3 className="text-base sm:text-xl font-semibold text-base-content leading-5 whitespace-nowrap">
                  <span className="inline sm:block">{t("bonus:item.group")}{' '}</span>
                  <span className="inline sm:block">{t("bonus:rewards")}</span>
                </h3>
                <h1 className="text-primary text-xl sm:text-3xl font-bold">
                  {isLoading ? (
                    <span className="loading loading-dots loading-sm"></span>
                  ) : (
                    availableCommission.formatted
                  )}
                </h1>
              </div>
              <p className="text-base-content/50 font-semibold text-xs sm:text-sm mt-0 sm:mt-auto">
                <span>{t("referral:totalReceived")}:&nbsp;</span>
                <span>
                  {isLoading ? "..." : totalReceivedCommission.formatted}
                </span>
              </p>
            </div>
            <button className="btn btn-primary btn-sm sm:btn-lg ml-auto sm:ml-0 sm:mt-auto shrink-0 sm:w-full">
              {t("bonus:claim")}
            </button>
          </div>
          <div
            className="w-full p-4 rounded-box flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-3 h-full sm:h-full"
            style={{ backgroundImage: stripedBackground }}
          >
            <div className="flex flex-1 flex-col gap-0 sm:justify-between">
              <div className="flex flex-col gap-0 sm:gap-2">
                <h3 className="text-base sm:text-xl font-semibold text-base-content leading-5 whitespace-nowrap">
                  <span className="inline sm:block">{t("common:common.referral")}{' '}</span>
                  <span className="inline sm:block">{t("bonus:rewards")}</span>
                </h3>
                <h1 className="text-primary text-xl sm:text-3xl font-bold">
                  {isLoading ? (
                    <span className="loading loading-dots loading-sm"></span>
                  ) : (
                    availableReferral.formatted
                  )}
                </h1>
              </div>
              <div className="flex flex-col text-xs sm:text-sm font-semibold text-base-content/50 mt-0 sm:mt-auto">
                <p className="mt-2">
                  <span>{t("referral:totalReceived")}:&nbsp;</span>
                  <span>
                    {isLoading ? "..." : totalReceivedReferral.formatted}
                  </span>
                </p>
                <p>
                  <span>{t("finance:locked")}:&nbsp;</span>
                  <span>
                    {isLoading ? "..." : lockedReferral.formatted}
                  </span>
                </p>
              </div>
            </div>
            <button className="btn btn-primary btn-sm sm:btn-lg ml-auto sm:ml-0 sm:mt-auto shrink-0 sm:w-full">
              {t("bonus:claim")}
            </button>
          </div>
        </div>

        <div className="w-full flex flex-row items-center sm:h-12 gap-2 sm:gap-3">
          <div className="rounded-field flex-1 min-w-0 h-10 sm:h-full bg-base-400 flex items-center px-2 sm:px-4 gap-2 sm:gap-3">
            <div className="flex-1 min-w-0 overflow-x-auto hide-scrollbar">
              <span className="text-base-content/50 text-xs sm:text-base font-semibold whitespace-nowrap">
                {referralLink || t("referral:loadingLink", "Loading link...")}
              </span>
            </div>
            <Copy
              text={referralLink}
              trigger={
                <button className="btn btn-primary btn-soft btn-square btn-xs sm:btn-sm shrink-0">
                  <Iconify icon="custom:copied" />
                </button>
              }
            />
          </div>
          <button
            className="btn btn-primary btn-soft btn-sm sm:btn-lg shrink-0 justify-center"
            onClick={() => setIsShareModalOpen(true)}
          >
            <Iconify icon="custom:share" />
            <span>{t("bonus:share")}</span>
          </button>
        </div>
      </div>

      <ReferralShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        referralLink={referralLink}
      />
    </div>
  );
};
