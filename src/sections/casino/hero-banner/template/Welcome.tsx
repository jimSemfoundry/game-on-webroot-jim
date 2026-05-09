import { useMemo } from "react";
import { parser } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";
import {
  InnerBannerButtonV2,
  InnerBannerContent, InnerBannerTitleV2,
  InnerBannerWrapper, useNavigateGuard
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import {
  InnerBannerPerson
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n.ts";
import { useNavigate } from "@tanstack/react-router";

export const Welcome = ({ content, extra_content }: {
  content: string
  extra_content: string
}) => {
  const navigate = useNavigate();

  const { t } = useTranslation(["common", "banner", "bonus"]);

  const { navigateCallback } = useNavigateGuard();

  const banner = useMemo(() => parser(content), [content]);

  // 根据用户的语言匹配相应的模版内容
  const banner_extra_content = useMemo(() => {
    const keys = JSON.parse(extra_content)
    return keys.find((l: Record<string, any>) => l?.language === i18n.language) ?? (keys[0] || "en");
  }, [i18n.language]);

  return (
    <InnerBannerWrapper>
      <InnerBannerContent>
        <InnerBannerTitleV2 banner={banner_extra_content} percent={(banner?.percent || 0) * 100 + "%"} />

        <InnerBannerButtonV2 text={t(`banner:DEPOSIT_NOW`)} onClick={() => {
          navigateCallback(() => {
            // 打开存款窗口
            void navigate({ to: "/finance" });
          }, true);
        }} />
      </InnerBannerContent>

      {/* 人物 */}
      <InnerBannerPerson src={banner_extra_content?.picture} />
    </InnerBannerWrapper>
  );
};



