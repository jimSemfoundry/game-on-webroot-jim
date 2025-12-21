import { useTranslation } from "react-i18next";
import { ReferralLiveGlobalCommissions } from "./ReferralLiveGlobalCommissions";

export const ReferralGlobal = () => {
  const { t } = useTranslation();

  return (
    <div className="rounded-field bg-base-200 p-4 w-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="inline-grid *:[grid-area:1/1]">
          <div className="status status-primary animate-ping"></div>
          <div className="status status-primary"></div>
        </div>
        <h3 className="text-sm font-semibold sm:text-lg">{t("referral:liveGlobalCommissions")}</h3>
      </div>

      {/* Live Global Commissions 动画表格 */}
      <ReferralLiveGlobalCommissions />
    </div>
  );
};
