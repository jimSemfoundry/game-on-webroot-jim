import { Carousel, CarouselDotButtons, useCarousel } from "@/components/carousel";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Autoplay from "embla-carousel-autoplay";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";

export const HeroBanner = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const carousel = useCarousel(
    {
      slidesToShow: isMobile ? 1 : 3,
      startIndex: 0,
      dragFree: false,
      slideSpacing: "12px",
      align: "start",
      loop: true,
      containScroll: "trimSnaps",
      duration: 20,
    },
    [Autoplay({ delay: 4000 })],
  );

  const { formatWithConversion } = useDisplayCurrencyFormatter();

  // 缓存effect以避免重新创建，这是性能优化的关键
  const effect = useMemo(
    () => (
      <>
        <div
          className="absolute -top-[109px] ltr:left-[182px] w-[135px] h-[411px] bg-primary/20 skew-x-[12deg] rotate-[36deg] translate-x-4 rtl:-translate-x-4 sm:translate-x-16 sm:left-auto sm:right-[159px] sm:-top-[57px] sm:w-[148px] sm:h-[652px] transform-gpu"
          style={{ 
            mixBlendMode: "normal",
            willChange: "transform",
            backfaceVisibility: "hidden" 
          }}
        />
        <div
          className="absolute -top-[60px] ltr:-right-[90px] w-[162px] h-[513px] skew-x-[12deg] rotate-[36deg] bg-primary/10 border-primary/20 ltr:border-l-[26px] rtl:border-r-[26px] translate-x-2 rtl:-translate-x-2 sm:right-[-84px] sm:-top-[60px] sm:w-[230px] sm:h-[732px] sm:border-l-[38px] transform-gpu"
          style={{ 
            mixBlendMode: "normal",
            willChange: "transform",
            backfaceVisibility: "hidden"
          }}
        />
        <div className="absolute top-[111px] ltr:left-[142px] w-[426px] h-[244px] rounded-full bg-primary/80 blur-[38px] z-0 sm:-left-[63px] sm:top-[215px] sm:w-[600px] sm:h-[348px] sm:blur-[80px] transform-gpu" />
        <div className="absolute -top-[299px] ltr:left-[82px] w-[420px] h-[420px] rounded-full bg-base-300 blur-[38px] z-10 sm:left-[102px] sm:-top-[369px] sm:w-[600px] sm:h-[600px] sm:blur-[80px] transform-gpu" />
      </>
    ),
    [],
  );

  return (
    <div className="select-none text-lg sm:text-xl leading-5.5 sm:leading-6 font-black relative">
      <Carousel carousel={carousel}>
        <div className="w-full rounded-box px-4 py-8 relative h-[209px] sm:h-[258px] overflow-hidden rtl:rotate-y-180" style={{ isolation: "isolate" }}>
          <div className="flex flex-col justify-between h-full relative z-40 rtl:rotate-y-180">
            <p className=" flex flex-col whitespace-pre-line font-black">
              <span className="text-base-content ">{t("casino:banner.twoDescription")}</span>
              <span className="text-primary">
                <Trans i18nKey="casino:banner.twoDescriptionTwo" values={{ commission: "1200%" }} />
              </span>
            </p>

            <button className="btn btn-primary max-w-32 flex items-center gap-4">
              {t("common:common.deposit")}
              <ChevronRight size={16} className="rtl:rotate-y-180" />
            </button>
          </div>

          {/** Illustration */}
          <img
            src="/images/illustrations/b12dd722cafd02781363b2dbaaf5c18afa9be2d3.png"
            alt="Hero Banner Illustration"
            className="absolute top-0 z-20 right-[-62px] sm:bottom-0 rounded-box bg-cover bg-center bg-no-repeat w-[290px] sm:w-[370px]"
          />
          {/* Background Image Layer */}
          <div
            className="absolute inset-0 z-0 rounded-box bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url(/images/illustrations/75a2f479bdb1a69ccf2140854ec9033038e744a5.png)",
              backgroundPosition: !isMobile ? "0px 20%" : "-1% 50%",
            }}
          />
          {/* Gradient Overlay Layers */}
          <div
            className="absolute inset-0 z-0 rounded-box"
            style={{
              background: "linear-gradient(45deg, transparent 18.45%, color-mix(in oklch, var(--color-base-300), transparent 10%) 100%)",
            }}
          />
          <div
            className="absolute inset-0 z-0 rounded-box"
            style={{
              background: "linear-gradient(270deg, transparent 1.67%, color-mix(in oklch, var(--color-base-300), transparent 10%) 100%)",
            }}
          />
          <div
            className="absolute inset-0 z-0 rounded-box"
            style={{
              background: "linear-gradient(0deg, transparent 0.33%, color-mix(in oklch, var(--color-base-300), transparent 0%) 100%)",
            }}
          />
          <div
            className="absolute inset-0 z-0 rounded-box"
            style={{
              background: "linear-gradient(180deg, transparent 0%, color-mix(in oklch, var(--color-base-300), transparent 20%) 100%)",
            }}
          />

          {effect}
        </div>

        <div className="w-full rounded-box px-4 py-8 relative h-[209px] sm:h-[258px] overflow-hidden rtl:rotate-y-180" style={{ isolation: "isolate" }}>
          <div className="flex flex-col justify-between h-full relative z-40 rtl:rotate-y-180">
            <p className=" flex flex-col whitespace-pre-line">
              <span className="text-base-content">{t("casino:banner.beTheFirst")}</span>
              <span className="text-primary">
                <Trans i18nKey="casino:banner.challengeEverything" values={{ commission: "1200%" }} />
              </span>
            </p>

            <button className="btn btn-primary max-w-32 flex items-center gap-4">
              {t("common:common.deposit")}
              <ChevronRight size={16} className="rtl:rotate-y-180" />
            </button>
          </div>

          {/** Illustration */}
          <img
            src="/images/illustrations/d4e43016f111393f13035dec78c262fcd55ee1ed.png"
            alt="Hero Banner Illustration"
            className="absolute top-0 z-20 right-[-13%] rounded-box w-[270px] h-[270px] sm:w-[330px] sm:h-[330px] rtl:rotate-y-180"
          />
          {/* Background Image Layer */}
          <div
            className="absolute inset-0 z-0 rounded-box bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url(/images/illustrations/75a2f479bdb1a69ccf2140854ec9033038e744a5.png)",
              backgroundPosition: !isMobile ? "0px 20%" : "-1% 50%",
            }}
          />
          {/* Gradient Overlay Layers */}
          <div
            className="absolute inset-0 z-0 rounded-box"
            style={{
              background: "linear-gradient(45deg, transparent 18.45%, color-mix(in oklch, var(--color-base-300), transparent 10%) 100%)",
            }}
          />
          <div
            className="absolute inset-0 z-0 rounded-box"
            style={{
              background: "linear-gradient(270deg, transparent 1.67%, color-mix(in oklch, var(--color-base-300), transparent 10%) 100%)",
            }}
          />
          <div
            className="absolute inset-0 z-0 rounded-box"
            style={{
              background: "linear-gradient(0deg, transparent 0.33%, color-mix(in oklch, var(--color-base-300), transparent 0%) 100%)",
            }}
          />
          <div
            className="absolute inset-0 z-0 rounded-box"
            style={{
              background: "linear-gradient(180deg, transparent 0%, color-mix(in oklch, var(--color-base-300), transparent 20%) 100%)",
            }}
          />

          {effect}
        </div>

        <div className="w-full rounded-box px-4 py-8 relative h-[209px] sm:h-[258px] overflow-hidden rtl:rotate-y-180" style={{ isolation: "isolate" }}>
          <div className="flex flex-col justify-between h-full relative z-40 rtl:rotate-y-180">
            <p className=" flex flex-col whitespace-pre-line font-black">
              <span className="text-base-content">{t("casino:banner.threeDescription")}</span>
              <span className="text-primary">
                <Trans
                  i18nKey="casino:banner.threeDescriptionTwo"
                  values={{ amount: formatWithConversion(1200, "USD", { compact: false, showCode: false }).formatted, commission: "50%" }}
                />
              </span>
            </p>

            <button className="btn btn-primary max-w-32 flex items-center gap-4">
              {t("common:common.deposit")}
              <ChevronRight size={16} className="rtl:rotate-y-180" />
            </button>
          </div>

          {/** Illustration */}
          <img
            src="/images/illustrations/d929de0cb5c0f7c3aedb8f8e3245846644e68a31.png"
            alt="Hero Banner Illustration"
            className="absolute drop-shadow-[0_35px_35px_rgba(32,59,74,1)] w-[210px] h-[210px] sm:w-[261px] sm:h-[261px] top-0 z-20 right-[-5%] sm:right-0 rounded-box bg-cover bg-center bg-no-repeat"
          />
          {/* Background Image Layer */}
          <div
            className="absolute inset-0 z-0 rounded-box bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url(/images/illustrations/75a2f479bdb1a69ccf2140854ec9033038e744a5.png)",
              backgroundPosition: !isMobile ? "0px 20%" : "-1% 50%",
            }}
          />
          {/* Gradient Overlay Layers */}
          <div
            className="absolute inset-0 z-0 rounded-box"
            style={{
              background: "linear-gradient(45deg, transparent 18.45%, color-mix(in oklch, var(--color-base-300), transparent 10%) 100%)",
            }}
          />
          <div
            className="absolute inset-0 z-0 rounded-box"
            style={{
              background: "linear-gradient(270deg, transparent 1.67%, color-mix(in oklch, var(--color-base-300), transparent 10%) 100%)",
            }}
          />
          <div
            className="absolute inset-0 z-0 rounded-box"
            style={{
              background: "linear-gradient(0deg, transparent 0.33%, color-mix(in oklch, var(--color-base-300), transparent 0%) 100%)",
            }}
          />
          <div
            className="absolute inset-0 z-0 rounded-box"
            style={{
              background: "linear-gradient(180deg, transparent 0%, color-mix(in oklch, var(--color-base-300), transparent 20%) 100%)",
            }}
          />

          {effect}
        </div>

        <div className="w-full rounded-box px-4 py-8 relative h-[209px] sm:h-[258px] overflow-hidden rtl:rotate-y-180" style={{ isolation: "isolate" }}>
          <div className="flex flex-col justify-between h-full relative z-40 rtl:rotate-y-180">
            <p className=" flex flex-col whitespace-pre-line font-black">
              <span className="text-base-content ">{t("casino:banner.fiveDescription")}</span>
              <span className="text-primary">
                <Trans i18nKey="casino:banner.fiveDescriptionTwo" />
              </span>
            </p>

            <button className="btn btn-primary max-w-[115px] flex items-center gap-4">
              {t("common:common.deposit")}
              <ChevronRight size={16} className="rtl:rotate-y-180" />
            </button>
          </div>

          {/** Illustration */}
          <img
            src="/images/illustrations/Default_4K_STYLE_CASINO_CHARACTER_on_white_background_1-depositphotos-bgremover 1 1 .png"
            alt="Hero Banner Illustration"
            className="absolute drop-shadow-[0_35px_35px_rgba(32,59,74,1)] w-[304px] h-[224px] sm:w-[373px] sm:h-[276px] top-0 sm:-top-[18px] z-20 right-1.5 sm:right-1 rounded-box "
          />
          {/* Background Image Layer */}
          <div
            className="absolute inset-0 z-0 rounded-box bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url(/images/illustrations/75a2f479bdb1a69ccf2140854ec9033038e744a5.png)",
              backgroundPosition: !isMobile ? "0px 20%" : "-1% 50%",
            }}
          />
          {/* Gradient Overlay Layers */}
          <div
            className="absolute inset-0 z-0 rounded-box"
            style={{
              background: "linear-gradient(45deg, transparent 18.45%, color-mix(in oklch, var(--color-base-300), transparent 10%) 100%)",
            }}
          />
          <div
            className="absolute inset-0 z-0 rounded-box"
            style={{
              background: "linear-gradient(270deg, transparent 1.67%, color-mix(in oklch, var(--color-base-300), transparent 10%) 100%)",
            }}
          />
          <div
            className="absolute inset-0 z-0 rounded-box"
            style={{
              background: "linear-gradient(0deg, transparent 0.33%, color-mix(in oklch, var(--color-base-300), transparent 0%) 100%)",
            }}
          />
          <div
            className="absolute inset-0 z-0 rounded-box"
            style={{
              background: "linear-gradient(180deg, transparent 0%, color-mix(in oklch, var(--color-base-300), transparent 20%) 100%)",
            }}
          />

          {effect}
        </div>

        <div className="w-full rounded-box px-4 py-8 relative h-[209px] sm:h-[258px] overflow-hidden rtl:rotate-y-180" style={{ isolation: "isolate" }}>
          <div className="flex flex-col justify-between h-full relative z-40 rtl:rotate-y-180">
            <p className=" flex flex-col whitespace-pre-line font-black">
              <span className="text-base-content ">{t("casino:banner.sevenDescription")}</span>
              <span className="text-primary">
                <Trans i18nKey="casino:banner.sevenDescriptionTwo" />
              </span>
            </p>

            <button className="btn btn-primary max-w-[115px] flex items-center gap-4">
              {t("common:common.deposit")}
              <ChevronRight size={16} className="rtl:rotate-y-180" />
            </button>
          </div>

          {/** Illustration */}
          <img
            src="/images/illustrations/Default_4k_Brazilian_style_casino_character_on_white_backgroun_1-depositphotos-bgremover.png"
            alt="Hero Banner Illustration"
            className="absolute drop-shadow-[0_35px_35px_rgba(32,59,74,1)] w-[201px] h-[201px] sm:w-[247px] sm:h-[247px] -bottom-2 sm:bottom-0 z-20 -right-1 sm:right-2 rounded-box bg-cover bg-center bg-no-repeat"
          />
          {/* Background Image Layer */}
          <div
            className="absolute inset-0 z-0 rounded-box bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url(/images/illustrations/75a2f479bdb1a69ccf2140854ec9033038e744a5.png)",
              backgroundPosition: !isMobile ? "0px 20%" : "-1% 50%",
            }}
          />
          {/* Gradient Overlay Layers */}
          <div
            className="absolute inset-0 z-0 rounded-box"
            style={{
              background: "linear-gradient(45deg, transparent 18.45%, color-mix(in oklch, var(--color-base-300), transparent 10%) 100%)",
            }}
          />
          <div
            className="absolute inset-0 z-0 rounded-box"
            style={{
              background: "linear-gradient(270deg, transparent 1.67%, color-mix(in oklch, var(--color-base-300), transparent 10%) 100%)",
            }}
          />
          <div
            className="absolute inset-0 z-0 rounded-box"
            style={{
              background: "linear-gradient(0deg, transparent 0.33%, color-mix(in oklch, var(--color-base-300), transparent 0%) 100%)",
            }}
          />
          <div
            className="absolute inset-0 z-0 rounded-box"
            style={{
              background: "linear-gradient(180deg, transparent 0%, color-mix(in oklch, var(--color-base-300), transparent 20%) 100%)",
            }}
          />

          {effect}
        </div>
      </Carousel>
      <CarouselDotButtons
        className="absolute bottom-0 left-1/2 -translate-x-1/2 sm:hidden"
        scrollSnaps={carousel.dots.scrollSnaps}
        selectedIndex={carousel.dots.selectedIndex}
        onClickDot={carousel.dots.onClickDot}
      />
    </div>
  );
};
