import {
  InnerBannerButtonV2,
  InnerBannerContent, InnerBannerTitleV2,
  InnerBannerWrapper, useNavigateGuard
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import {
  InnerBannerPerson
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { useTranslation } from "react-i18next";
import { useBoundStore } from "@/store";
import { useMemo } from "react";
import i18n from "@/i18n.ts";

export const FirstReferralBonus = ({ content }: {
  content: string
}) => {
  const { t } = useTranslation("bonus");

  const { navigateCallback } = useNavigateGuard();

  const setSyncAction = useBoundStore((state) => state.setSyncAction);

  // 根据用户的语言匹配相应的模版内容
  const banner = useMemo(() => {
    const keys = JSON.parse(content)
    return keys.find((l: Record<string, any>) => l?.language === i18n.language) ?? (keys[0] || "en");
  }, [i18n.language]);

  return (
    <InnerBannerWrapper>
      <InnerBannerContent>
        <InnerBannerTitleV2 banner={banner} />

        <InnerBannerButtonV2 text={t(`banner:MORE_INFO`)} onClick={() => {
          navigateCallback(() => {
            setSyncAction("OPEN_EXTRA_REFERRAL_BONUS_MODAL");
          }, true);
        }} className={"btn-outline"} />
      </InnerBannerContent>

      {/* 人物 */}
      <InnerBannerPerson src={banner?.picture} />
    </InnerBannerWrapper>
  );
};



