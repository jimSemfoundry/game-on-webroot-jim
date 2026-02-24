import { useMemo } from "react";
import { parser } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";
import {
  InnerBannerButtonV2,
  InnerBannerContent,
  InnerBannerWrapper, InnerDataTranslation, useNavigateGuard
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import {
  InnerBannerPerson
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useFinanceModal } from "@/contexts/ModalsProvider.tsx";
import { randomString } from "@/components/modal/UserFinanceModal/helper.ts";

export const BeTheFirst = ({ content }: {
  content: string
}) => {
  const { t } = useTranslation(["common", "banner", "bonus"]);

  const { navigateCallback } = useNavigateGuard();

  const { openUserFinanceModalWithTab } = useFinanceModal();

  const banner = useMemo(() => parser(content), [content]);

  return (
    <InnerBannerWrapper>
      <InnerBannerContent>
        <div className="flex flex-col whitespace-pre-line font-black leading-5">
          <p className={clsx("text-base-content rtl:ml-auto")}>
            <InnerDataTranslation
              text={`${banner?.title}`}
              value=""
              percent="" />
          </p>
        </div>

        <InnerBannerButtonV2 text={t(`banner:DEPOSIT_NOW`)} onClick={() => {
          navigateCallback(() => {
            // 打开存款窗口
            openUserFinanceModalWithTab(`deposit_${randomString()}`);
          }, true);
        }} />
      </InnerBannerContent>

      {/* 人物 */}
      <InnerBannerPerson src={banner?.picture} />
    </InnerBannerWrapper>
  );
};



