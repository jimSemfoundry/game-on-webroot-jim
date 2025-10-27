import Iconify from "@/components/iconify";
import { useTipsModal } from "@/contexts/ModalsProvider";
import { Trans, useTranslation } from "react-i18next";
import { gradientStyles } from "../styles";
import { VIP_REQUIREMENTS } from "../shared/config";
import { VipButton } from "../shared/VipButton";

export function BonusCannonCard() {
  const { t } = useTranslation();
  const { openTipsModal } = useTipsModal();
  
  const requiredVipLevel = VIP_REQUIREMENTS.cannon.requiredLevel;

  const handleOpenTips = () => {
    openTipsModal("cannon");
  };

  return (
    <div
      className="flex flex-col p-4 gap-2 rounded-field h-full sm:h-[128px] w-full relative overflow-hidden border border-base-200"
      style={{
        background: gradientStyles.purple,
      }}
    >
      <button className="btn btn-square btn-xs bg-base-200 absolute right-4 rtl:right-auto rtl:left-4 top-4" onClick={handleOpenTips}>
        <Iconify icon="custom:info" className="text-base-content/50" />
      </button>
      <div className="flex items-center gap-4">
        <img
          src="/images/illustrations/isometric3.svg"
          alt={t("bonus:the_cannon")}
          className="w-15 h-15"
        />
        <div className="flex flex-col justify-between h-full w-full gap-1">
          <p className="text-sm font-bold sm:text-base">{t("bonus:the_cannon")}</p>
          <div className="text-xs text-base-content/50 flex items-center justify-between gap-2">
            <Trans i18nKey="bonus:the_cannon_description" values={{ vip: requiredVipLevel }} />
            <VipButton requiredLevel={requiredVipLevel} />
          </div>
        </div>
      </div>
    </div>
  );
}
