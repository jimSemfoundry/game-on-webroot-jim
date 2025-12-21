import { Carousel, useCarousel } from "@/components/carousel";
import Iconify from "@/components/iconify";

import { LiquidGlassEffect } from "@/components/ui/LiquidGlassEffect";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";

export const AlliancePartnerships = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();
  const carousel = useCarousel({
    slidesToShow: isMobile ? 1.2 : 3,
    startIndex: 0, // 从第一个开始
    dragFree: false,
    slideSpacing: "12px",
    align: "start",
    loop: true, // 保持循环功能
    containScroll: "trimSnaps", // 防止滚动超出边界
  });

  return (
    <div className="flex flex-col gap-1 w-full overflow-hidden">
      <div className="flex items-center gap-2 px-1">
        <img src="/icons/ui/okvip.svg" alt="okvip" />
        <p className="text-md sm:text-lg font-semibold">{t(`casino:alliancePartnerships`)}</p>
      </div>

      <Carousel carousel={carousel} className="mt-6 w-full overflow-visible">
        <LiquidGlassEffect
          className="sm:h-[184px] h-[120px] w-full relative"
          backgroundElements={
            <img
              src="/images/illustrations/grid-mask.svg"
              alt=""
              className="absolute inset-0 w-full h-full rtl:rotate-y-180 opacity-50 object-cover"
            />
          }
          onClick={() => {
            navigate({
              to: "/partnerships/$partnershipId",
              params: { partnershipId: "luis-suarez" },
            });
          }}
        >
          <div className="absolute left-0 rtl:left-auto rtl:right-0 rtl:sm:right-0 top-4 sm:top-8 bottom-0 right-0 z-10 flex items-start">
            <div className="flex items-center sm:gap-4 gap-2 flex-col">
              <Iconify
                icon="custom:suarez-signature"
                viewBox="0 0 65 85"
                width={65}
                height={85}
                className="min-w-[42px] min-h-[55px] sm:min-w-[64px] sm:min-h-[84px] text-base-content"
              />
              <p className="text-base-content font-bold text-lg">{t("casino:luisSuarez")}</p>
            </div>
          </div>

          <img
            src="/images/illustrations/Suarez 3.png"
            className="object-cover absolute sm:right-4 right-2 rtl:left-0 rtl:right-auto bottom-[1px] w-[138px] h-[138px] sm:w-[211px] sm:h-[211px]"
          />
        </LiquidGlassEffect>
        <LiquidGlassEffect
          className="sm:h-[184px] h-[120px] w-full"
          backgroundElements={
            <img
              src="/images/illustrations/grid-mask.svg"
              alt=""
              className="absolute inset-0 w-full h-full rtl:rotate-y-180 opacity-50 object-cover"
            />
          }
          onClick={() => {
            navigate({
              to: "/partnerships/$partnershipId",
              params: { partnershipId: "afa" },
            });
          }}
        >
          <div className="absolute left-0 rtl:left-auto rtl:right-0 rtl:sm:right-0 top-7 sm:top-11 bottom-0 right-0 z-10 flex items-start gap-4">
            <div className="flex items-center gap-4 flex-col">
              <img src="/images/illustrations/114b3fd4af98414026a304a943a3ffaeb47d0c11.png" className="sm:w-[61px] w-[40px]" />
            </div>
          </div>

          <img
            src="/images/illustrations/AFA.png"
            className="object-cover absolute -right-2 rtl:left-0 rtl:right-auto bottom-[1px] w-[192px] h-[138px] sm:w-[293px] sm:h-[211px]"
          />
        </LiquidGlassEffect>
        <LiquidGlassEffect
          className="sm:h-[184px] h-[120px] w-full"
          backgroundElements={
            <img
              src="/images/illustrations/grid-mask.svg"
              alt=""
              className="absolute inset-0 w-full h-full rtl:rotate-y-180 opacity-50 object-cover"
            />
          }
          onClick={() => {
            navigate({
              to: "/partnerships/$partnershipId",
              params: { partnershipId: "vfc" },
            });
          }}
        >
          <div className="absolute left-0 rtl:left-auto rtl:right-0 rtl:sm:right-0 top-7 sm:top-11 bottom-0 right-0 z-10 flex items-start gap-4">
            <div className="flex items-center gap-4 flex-col">
              <img src="/images/illustrations/d1a00a5ff5d6d81c9752ff77179ece315822276f.png" className="w-[52px] sm:w-[61px]" />
            </div>
          </div>

          <img
            src="/images/illustrations/VFC.png"
            className="object-cover absolute sm:right-3 right-2 rtl:left-0 rtl:right-auto bottom-[1px] w-[166px] h-[138px] sm:w-[253px] sm:h-[211px]"
          />
        </LiquidGlassEffect>
      </Carousel>
    </div>
  );
};
