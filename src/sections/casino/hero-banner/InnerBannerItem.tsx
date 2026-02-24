import { useMemo } from "react";
import { parser } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";
import { InnerContentVisible } from "@/components/header/message-v2/c/InnerComponents.tsx";
import {
  InnerBannerButton,
  InnerBannerContent,
  InnerBannerWrapper,
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import {
  InnerBannerPerson,
  InnerBannerBrands,
  InnerBannerTitle
} from "@/sections/casino/hero-banner/InnerComponents.tsx";

export const InnerBannerItem = ({ data, type, content }: {
  data: Record<string, any>,
  type: string,
  content: string
}) => {
  const banner = useMemo(() => parser(content), [content]);

  return (
    <InnerBannerWrapper>
      <InnerBannerContent>
        <InnerBannerTitle list={banner?.text_list ?? []} data={data} banner={banner} />

        <InnerContentVisible
          className={"flex flex-wrap gap-2"}
          show={banner?.button_list && banner?.button_list?.length > 0}>
          <InnerBannerButton banner={{ ...banner, name: data?.name }} />
        </InnerContentVisible>
      </InnerBannerContent>

      {/* 人物 */}
      <InnerBannerPerson src={banner?.float_image_list[0]?.mobile_image} />

      {/* 品牌 */}
      <InnerBannerBrands type={type} banner={banner} />
    </InnerBannerWrapper>
  );
};



