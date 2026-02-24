import { useAuth } from "@/contexts/AuthContext";
import {
  InnerLiquidGlassEffect,
  InnerNotAuthenticated, InnerReferralShareLink
} from "@/sections/referral/referral-summary-card/InnerComponents.tsx";
import { InnerCommissionRewards } from "@/sections/referral/referral-summary-card/InnerCommissionRewards.tsx";
import { InnerReferralRewards } from "@/sections/referral/referral-summary-card/InnerReferralRewards.tsx";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import { Trans, useTranslation } from "react-i18next";
import { ReactNode } from "react";
import clsx from "clsx";

export const ReferralSummaryCard = ({ referralEnable }: { referralEnable: boolean }) => {
  const { t } = useTranslation();

  const { isAuthenticated } = useAuth();

  return (
    !isAuthenticated
      ? <InnerNotAuthenticated />
      : <div
        className={clsx(
          `
        relative xl:absolute
        xl:right-4
        min-h-[252px] z-0 mx-5 sm:mx-0 xl:w-[600px] 
        xl:rtl:right-auto xl:rtl:left-4
        sm:top-4 sm:bottom-2 sm:h-[calc(100%-2rem)] 
        sm:bg-base-300 sm:rounded-box
        `, { "mb-30": !referralEnable })}>
        <InnerLiquidGlassEffect />
        <div className="w-full h-full flex flex-col p-4 justify-between gap-3">
          <InnerDisplayContent show={referralEnable}>
            <div className="flex flex-col sm:flex-row items-center gap-3 h-full sm:max-h-[224px]">
              <InnerCommissionRewards />
              <InnerReferralRewards />
            </div>
            <InnerReferralShareLink />
          </InnerDisplayContent>
          <InnerDisplayContent show={!referralEnable}>
            <div className={"overflow-y-auto hide-scrollbar flex flex-col gap-3"}>
              <h1 className={"text-primary font-bold md:text-xl"}>{t("referral:programAccessUpdate")}</h1>
              <InnerText text={t("referral:referralProgramPrivileges")} />
              <InnerText text={<Trans i18nKey={"referral:referralRewardsPrivileges"}
                                      components={[<span className={"text-primary"} />]} />} />
              <InnerText text={t("referral:understandDisappointing")} />
            </div>
          </InnerDisplayContent>
        </div>
      </div>
  );
};

const InnerText = ({ text }: { text: ReactNode }) => {
  return (<p className={"text-base-content/50 text-xs leading-4.5 md:text-sm"}>{text}</p>);
};