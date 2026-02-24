import { parser } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";
import {
  InnerBannerContent,
  InnerBannerWrapper, InnerDataTranslation
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import {
  InnerBannerPerson
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import clsx from "clsx";

export const BettingPartner = ({ content }: {
  content: string
}) => {
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



