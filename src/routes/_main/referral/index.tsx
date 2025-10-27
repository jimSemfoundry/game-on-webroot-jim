import { ReferralGlobal } from "@/sections/referral/referral-global.tsx";
import { ReferralHeroSection } from "@/sections/referral/referral-hero-section.tsx";
import { ReferralRatesAndRules } from "@/sections/referral/referral-rates-and-rules.tsx";
import { ReferralSummaryCard } from "@/sections/referral/referral-summary-card.tsx";
import { ReferralTabs } from "@/sections/referral/referral-tabs.tsx";
import { ReferralFAQ } from "@/sections/referral/referral-faq.tsx";
import { ReferralMyReferrals } from "@/sections/referral/referral-my-referrals.tsx";
import { ReferralCampaigns } from "@/sections/referral/referral-campaigns.tsx";
import { ReferralMyCommissions } from "@/sections/referral/referral-my-commissions.tsx";
import { ReferralRewards } from "@/sections/referral/referral-rewards.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

export const Route = createFileRoute("/_main/referral/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [value, setValue] = useState("global");
  const tabsRef = useRef<HTMLDivElement>(null);

  const handleGoToMyReferrals = () => {
    setValue("myReferrals");
    // 滚动到 Tabs 区域顶部，留出少量间距
    if (typeof window !== "undefined" && tabsRef.current) {
      const rect = tabsRef.current.getBoundingClientRect();
      const top = rect.top + window.scrollY - 12; // 12px 视觉缓冲
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col gap-3 pb-26">
      <div className="relative">
        <ReferralHeroSection onNavigateToMyReferrals={handleGoToMyReferrals} />
        <ReferralSummaryCard />
      </div>

      <div className="px-5 sm:px-0 flex flex-col gap-3">
        <div ref={tabsRef}>
          <ReferralTabs value={value} onChange={setValue} />
        </div>

        {value === "global" && <ReferralGlobal />}
        {value === "ratesAndRules" && <ReferralRatesAndRules />}
        {value === "myReferrals" && <ReferralMyReferrals />}
        {value === "campaigns" && <ReferralCampaigns />}
        {value === "commissions" && <ReferralMyCommissions />}
        {value === "rewards" && <ReferralRewards />}

        <ReferralFAQ />
      </div>
    </div>
  );
}
