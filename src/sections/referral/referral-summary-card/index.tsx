import { useAuth } from "@/contexts/AuthContext";
import {
  InnerLiquidGlassEffect,
  InnerNotAuthenticated, InnerReferralShareLink
} from "@/sections/referral/referral-summary-card/InnerComponents.tsx";
import { InnerCommissionRewards } from "@/sections/referral/referral-summary-card/InnerCommissionRewards.tsx";
import { InnerReferralRewards } from "@/sections/referral/referral-summary-card/InnerReferralRewards.tsx";

export const ReferralSummaryCard = () => {
  const { isAuthenticated } = useAuth();
  return (
    !isAuthenticated
      ? <InnerNotAuthenticated />
      : <div
        className="relative min-h-[252px] z-0 mx-5 sm:mx-0 sm:absolute sm:w-[600px] sm:right-4 sm:rtl:right-auto sm:rtl:left-4 sm:top-4 sm:bottom-2 sm:h-[calc(100%-2rem)] sm:bg-base-300 sm:rounded-box">
        <InnerLiquidGlassEffect />
        <div className="w-full h-full flex flex-col p-4 justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 h-full sm:max-h-[224px]">
            <InnerCommissionRewards />
            <InnerReferralRewards />
          </div>
          <InnerReferralShareLink />
        </div>
      </div>
  );
};
