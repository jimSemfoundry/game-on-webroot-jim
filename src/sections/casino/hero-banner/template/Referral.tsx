import { parser } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";
import {
  InnerBannerButtonV2,
  InnerBannerContent,
  InnerBannerWrapper, InnerDataTranslation, useNavigateGuard
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { InnerBannerPerson } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useNavigate } from "@tanstack/react-router";

export const Referral = ({ content }: {
  content: string
}) => {
  const navigate = useNavigate();

  const { t } = useTranslation(["common", "banner", "bonus"]);

  const { navigateCallback } = useNavigateGuard();

  const banner = parser(content)

  return (
    <InnerBannerWrapper>
      <InnerBannerContent>
        <div className="flex flex-col whitespace-pre-line font-black leading-5">
          <p className={clsx("text-base-content rtl:ml-auto")}>
            <InnerDataTranslation
              text={`${banner?.title}`}
              value={banner?.value || 0}
              percent={((banner?.percent || 0) * 100) + "%"} />
          </p>
        </div>

        <InnerBannerButtonV2 text={t(`banner:MORE_INFO`)} onClick={() => {
          navigateCallback(() => {
            // 解析path为路径和查询参数
            const url = new URL(decodeURIComponent("/referral"), window.location.origin);
            const pathname = url.pathname;
            const searchParams = Object.fromEntries(url.searchParams?.entries() || []);

            void navigate({
              to: pathname || "/",
              search: searchParams
            });
          }, true);
        }} className={'btn-outline'} />
      </InnerBannerContent>

      {/* 人物 */}
      <InnerBannerPerson src={banner?.picture} />
    </InnerBannerWrapper>
  );
};



