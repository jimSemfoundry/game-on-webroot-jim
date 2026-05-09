import {
  InnerBannerButtonV2,
  InnerBannerContent, InnerBannerTitleV2,
  InnerBannerWrapper, useNavigateGuard
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { InnerBannerPerson } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { useMemo } from "react";
import i18n from "@/i18n.ts";

export const CommonBanner = ({ content }: {
  content: string
}) => {
  const { navigate } = useNavigateGuard();

  // 根据用户的语言匹配相应的模版内容
  const banner = useMemo(() => {
    const keys = JSON.parse(content)
    return keys.find((l: Record<string, any>) => l?.language === i18n.language) ?? (keys[0] || "en");
  }, [i18n.language]);

  return (
    <InnerBannerWrapper>
      <InnerBannerContent>
        <InnerBannerTitleV2 banner={banner} />

        <InnerBannerButtonV2 text={banner?.btn_text} onClick={() => {
          navigate(banner?.btn_url, true);
        }} />
      </InnerBannerContent>

      {/* 人物 */}
      <InnerBannerPerson src={banner?.picture} />
    </InnerBannerWrapper>
  );
};



