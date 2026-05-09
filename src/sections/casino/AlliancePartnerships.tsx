import Iconify from "@/components/iconify";
import { GameCarousel } from "@/components/ui/GameCarousel";
import { LiquidGlassEffect } from "@/components/ui/LiquidGlassEffect";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";

export const AlliancePartnerships = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <GameCarousel className="overflow-visible">
      <GameCarousel.Header showArrows={false}>
        <img src="/icons/ui/okvip.svg" alt="okvip" loading="lazy" decoding="async" />
        <p className="text-md sm:text-lg font-semibold">{t(`casino:alliancePartnerships`)}</p>
      </GameCarousel.Header>

      <GameCarousel.Content className="mt-6 overflow-visible">
        <GameCarousel.Track className="gap-3 sm:gap-4 rounded-none pt-5 sm:pt-7 pb-2 px-2 -mt-5 sm:-mt-7">
          <GameCarousel.Item className="w-[83.333%] sm:w-[calc((100%-2rem)/3)]">
            <LiquidGlassEffect
              className="sm:h-[184px] h-[120px] w-full relative overflow-visible"
              backgroundElements={
                <img
                  src="/images/illustrations/mask1.png"
                  alt=""
                  className="absolute inset-0 w-full h-full rtl:rotate-y-180 opacity-50 object-cover" loading="lazy" decoding="async" />
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
                src="/images/illustrations/suarez1st.png"
                className="object-cover absolute sm:right-4 right-2 rtl:left-0 rtl:right-auto bottom-[1px] w-[138px] h-[138px] sm:w-[211px] sm:h-[211px]" loading="lazy" decoding="async" />
            </LiquidGlassEffect>
          </GameCarousel.Item>

          <GameCarousel.Item className="w-[83.333%] sm:w-[calc((100%-2rem)/3)]">
            <LiquidGlassEffect
              className="sm:h-[184px] h-[120px] w-full overflow-visible"
              backgroundElements={
                <img
                  src="/images/illustrations/mask1.png"
                  alt=""
                  className="absolute inset-0 w-full h-full rtl:rotate-y-180 opacity-50 object-cover" loading="lazy" decoding="async" />
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
                  <img src="/images/illustrations/114b3fd4af98414026a304a943a3ffaeb47d0c11.png" className="sm:w-[61px] w-[40px]" loading="lazy" decoding="async" />
                </div>
              </div>

              <img
                src="/images/illustrations/afa1st.png"
                className="object-cover absolute -right-2 rtl:left-0 rtl:right-auto bottom-[1px] w-[192px] h-[138px] sm:w-[293px] sm:h-[211px]" loading="lazy" decoding="async" />
            </LiquidGlassEffect>
          </GameCarousel.Item>

          <GameCarousel.Item className="w-[83.333%] sm:w-[calc((100%-2rem)/3)]">
            <LiquidGlassEffect
              className="sm:h-[184px] h-[120px] w-full overflow-visible"
              backgroundElements={
                <img
                  src="/images/illustrations/mask1.png"
                  alt=""
                  className="absolute inset-0 w-full h-full rtl:rotate-y-180 opacity-50 object-cover" loading="lazy" decoding="async" />
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
                  <img src="/images/illustrations/vfc1.png" className="w-[52px] sm:w-[61px]" loading="lazy" decoding="async" />
                </div>
              </div>

              <img
                src="/images/illustrations/vfc1st.png"
                className="object-cover absolute sm:right-3 right-2 rtl:left-0 rtl:right-auto bottom-[1px] w-[166px] h-[138px] sm:w-[253px] sm:h-[211px]" loading="lazy" decoding="async" />
            </LiquidGlassEffect>
          </GameCarousel.Item>
        </GameCarousel.Track>
      </GameCarousel.Content>
    </GameCarousel>
  );
};
