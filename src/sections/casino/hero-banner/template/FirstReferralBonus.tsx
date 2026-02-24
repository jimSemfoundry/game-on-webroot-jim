import { parser } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";
import {
  InnerBannerButtonV2,
  InnerBannerContent,
  InnerBannerWrapper, InnerDataTranslation, useNavigateGuard
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import {
  InnerBannerPerson
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { useTranslation } from "react-i18next";
import { useBoundStore } from "@/store";
import clsx from "clsx";

export const FirstReferralBonus = ({ content }: {
  content: string
}) => {
  const { t } = useTranslation("bonus");

  const { navigateCallback } = useNavigateGuard();

  const setSyncAction = useBoundStore((state) => state.setSyncAction);

  const banner = parser(content);

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

        <InnerBannerButtonV2 text={t(`banner:MORE_INFO`)} onClick={() => {
          navigateCallback(() => {
            setSyncAction("OPEN_EXTRA_REFERRAL_BONUS_MODAL");
          }, true);
        }} className={'btn-outline'} />
      </InnerBannerContent>

      {/* 人物 */}
      <InnerBannerPerson src={banner?.picture} />
    </InnerBannerWrapper>
  );
};



