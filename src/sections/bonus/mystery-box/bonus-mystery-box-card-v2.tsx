/**
 * Bonus page Mystery Box card, used to open the actual content of Mystery Box.
 */
import { useTipsModal } from "@/contexts/ModalsProvider";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { VIP_REQUIREMENTS } from "../shared/config";
import { VipButton } from "../shared/VipButton";
import { useNavigate } from "@tanstack/react-router";
import { useHasMysteryBox } from "@/query/bouns";
import { MysteryBoxModal } from "./bonus-mystery-box-modal";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";


export function MysteryBoxCardV2() {
  const { t } = useTranslation('bonus');
  const { openTipsModal } = useTipsModal();
  const { data: conquestsReward } = useHasMysteryBox();
  const [isOpenMysteryBoxModal, setIsOpenMysteryBoxModal] = useState(false);
  const ILLUSTRATION_URL = useBonusDetailsImage("mystery_box", 96);

  // const { status } = useAuth();
  const navigate = useNavigate();

  // const userVipLevel = status?.vip || 0;
  const requiredVipLevel = VIP_REQUIREMENTS.mysteryBox.requiredLevel;
  // const isUnlocked = checkVipAccess(userVipLevel, requiredVipLevel);

  // 可领取状态
  const isClaimable = conquestsReward?.data?.has_mystery_box ?? false;

  const handleOpenTips = () => {
    openTipsModal("mysteryBox");
  };

  const handleButtonClick = () => {
    if (conquestsReward?.data?.has_mystery_box ?? false) {
      setIsOpenMysteryBoxModal(true);
    } else {
      navigate({ to: "/explore", search: { tab: "freespins" } });
    }
  };

  return (
    <>
      <div
        className={`relative flex w-full items-center gap-4 overflow-hidden rounded-xl border ${isClaimable ? "border-warning" : "border-base-200/60"} bg-base-200 p-4 shadow-md transition-transform duration-200 hover:-translate-y-1 h-[104px] sm:h-[214px] sm:flex-col sm:items-center`}
      >
        <Info className="absolute right-4 rtl:right-auto rtl:left-4 top-4" onClick={handleOpenTips} />
        <div className="flex w-full h-full items-center gap-4 sm:flex-1 sm:flex-col sm:items-center sm:gap-3 sm:text-center sm:pt-8 ">
          <div className="w-12 h-12">
            <img src={ILLUSTRATION_URL} alt={t("bonus:mystery_box")} className="w-full h-full object-contain" loading="lazy" decoding="async" />
          </div>
          <div className="flex flex-1 flex-col gap-2 sm:gap-2 sm:items-center sm:w-full justify-between">
            <p className="text-sm font-bold sm:text-base text-left w-full sm:text-center">{t("bonus:mystery_box")}</p>
            {/* <p className="text-xs text-base-content/60 leading-5 sm:flex-1 text-left w-full">
              <Trans i18nKey="bonus:mystery_box_description2" values={{ vip: requiredVipLevel }} />
            </p> */}
            <div className="hidden sm:flex sm:w-full sm:justify-center">
              <VipButton
                requiredLevel={requiredVipLevel}
                onClick={handleButtonClick}
                claimable={isClaimable}
                useClaimStateWhenUnlocked
              />
            </div>
          </div>
          <div className="flex sm:hidden flex-col items-end justify-end self-stretch">
            <VipButton
              requiredLevel={requiredVipLevel}
              onClick={handleButtonClick}
              claimable={isClaimable}
              useClaimStateWhenUnlocked
            />
          </div>
        </div>
      </div>

      <MysteryBoxModal
        isOpen={isOpenMysteryBoxModal}
        onClose={() => {
          setIsOpenMysteryBoxModal(false)
        }} />
    </>
  );
}
