import {
  InnerBannerButtonV2,
  InnerBannerContent, InnerBannerTitleV2,
  InnerBannerWrapper, useNavigateGuard
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import {
  InnerBannerPerson
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import i18n from "@/i18n.ts";

export const SlotsTournament = ({ content }: {
  content: string
}) => {
  const navigate = useNavigate();

  const { t } = useTranslation(["common", "banner", "bonus"]);

  const { navigateCallback } = useNavigateGuard();

  // 根据用户的语言匹配相应的模版内容
  const banner = useMemo(() => {
    const keys = JSON.parse(content)
    return keys.find((l: Record<string, any>) => l?.language === i18n.language) ?? (keys[0] || "en");
  }, [i18n.language]);

  return (
    <InnerBannerWrapper>
      <InnerBannerContent>
        <InnerBannerTitleV2 banner={banner} />

        <InnerBannerButtonV2 text={t(`banner:PLAY_NOW`)} onClick={() => {
          navigateCallback(() => {
            // 解析path为路径和查询参数
            const url = new URL(decodeURIComponent("/tournament"), window.location.origin);
            const pathname = url.pathname;
            const searchParams = Object.fromEntries(url.searchParams?.entries() || []);

            void navigate({
              to: pathname || "/",
              search: searchParams
            });
          }, true);
        }} />
      </InnerBannerContent>

      {/* 人物 */}
      <InnerBannerPerson src={banner?.picture} />
    </InnerBannerWrapper>
  );
};



