import Iconify from "@/components/iconify";
import { useTipsModal } from "@/contexts/ModalsProvider";
import { Trans, useTranslation } from "react-i18next";
import { gradientStyles } from "../styles";
import { VIP_REQUIREMENTS } from "../shared/config";
import { VipButton } from "../shared/VipButton";

export function BonusJesterCard() {
  const { t } = useTranslation('bonus');
  const { openTipsModal } = useTipsModal();
  
  const requiredVipLevel = VIP_REQUIREMENTS.jester.requiredLevel;

  const handleOpenTips = () => {
    openTipsModal("jester");
  };

  return (
    <div
      className="flex flex-col p-4 gap-2 rounded-field sm:h-[128px] w-full relative overflow-hidden border border-base-200 h-[140px]"
      style={{
        background: gradientStyles.red,
      }}
    >
      <button className="btn btn-square btn-xs bg-base-200 absolute right-4 rtl:right-auto rtl:left-4 top-4" onClick={handleOpenTips}>
        <Iconify icon="custom:info" className="text-base-content/50" />
      </button>
      <div className="flex items-center gap-4">
        <img src="/images/illustrations/jester.svg" alt={t("bonus:the_jester")} className="w-15 h-15" />
        <div className="flex flex-col justify-between h-full w-full gap-1">
          <p className="text-sm font-bold sm:text-base">{t("bonus:the_jester")}</p>
          <div className="text-xs text-base-content/50 flex items-center justify-between gap-2">
            <Trans i18nKey="bonus:every_tap_on_the_jester_drops_a_reward_but_hurry_this_trickster_won_t_stick_around_forever" values={{ vip: requiredVipLevel }} />
            <VipButton requiredLevel={requiredVipLevel} />
          </div>
        </div>
      </div>
    </div>
  );
}
