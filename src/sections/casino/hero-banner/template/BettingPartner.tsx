import {
  InnerBannerContent, InnerBannerTitleV2,
  InnerBannerWrapper
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import {
  InnerBannerPerson
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { useMemo } from "react";
import i18n from "@/i18n.ts";

export const BettingPartner = ({ content }: {
  content: string
}) => {
  // 根据用户的语言匹配相应的模版内容
  const banner = useMemo(() => {
    const keys = JSON.parse(content)
    return keys.find((l: Record<string, any>) => l?.language === i18n.language) ?? (keys[0] || "en");
  }, [i18n.language]);

  return (
    <InnerBannerWrapper>
      <InnerBannerContent>
        <InnerBannerTitleV2 banner={banner} />
      </InnerBannerContent>

      {/* 人物 */}
      <InnerBannerPerson src={banner?.picture} />

      {/* 品牌 */}
      <div className="absolute z-20 top-[90px] max-w-40 flex flex-col items-center gap-4 rtl:left-4">
        <img src={banner?.teamIcon} alt="" loading="lazy" decoding="async"
             className="max-w-[30px]" />
        <img src={banner?.partner} alt="" loading="lazy" decoding="async"
             className="max-h-[30px]" />
      </div>
    </InnerBannerWrapper>
  );
};



