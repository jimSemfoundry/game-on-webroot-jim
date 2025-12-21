import { useTranslation } from "react-i18next";
import { Carousel, useCarousel } from "@/components/carousel";
import { useCallback, useEffect, useRef } from "react";
import type { EmblaCarouselType, EmblaEventType } from "embla-carousel";
import { cn } from "@/utils/cn";
import { AlliancePartnerships } from "../casino/AlliancePartnerships";
import { Footer } from "../casino/Footer";

const TWEEN_FACTOR_BASE = 0.8; // 增大因子，让缩放效果更明显

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

export const AlliancePartnershipLuisSuarez = () => {
  const { t } = useTranslation();
  const tweenFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);
  const slideNodes = useRef<HTMLElement[]>([]);

  // 轮播图配置
  const carousel = useCarousel({
    slidesToShow: "auto",
    startIndex: 0,
    dragFree: false, // 改为 false 以获得更好的对齐效果
    slideSpacing: "0px", // 使用 0，由子项通过负 margin 实现重叠
    align: "center", // 居中聚焦
    loop: true,
    containScroll: "trimSnaps", // 修剪首尾越界，避免 loop 首尾空隙
    breakpoints: {
      '(min-width: 640px)': { slideSpacing: '0px' },
      '(min-width: 768px)': { slideSpacing: '0px' },
      '(min-width: 1024px)': { slideSpacing: '0px' },
    },
  });

  // Luis Suarez 相关图片数据
  const suarezImages = [
    {
      id: 1,
      src: "/images/alliance/suarez-banner-1.png",
      alt: "Luis Suarez 1",
    },
    {
      id: 2,
      src: "/images/alliance/suarez-banner-2.png",
      alt: "Luis Suarez 2",
    },
    {
      id: 3,
      src: "/images/alliance/suarez-banner-3.png",
      alt: "Luis Suarez 3",
    },
  ];

  // 设置需要缩放的节点
  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    const nodes = emblaApi.slideNodes() as HTMLElement[];
    slideNodes.current = nodes;
    tweenNodes.current = nodes.map((slideNode) => {
      return slideNode.querySelector(".alliance-carousel-scale") as HTMLElement;
    });
  }, []);

  // 设置缩放因子
  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
  }, []);

  // 缩放动画和 z-index 控制
  const tweenScale = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();
      const isScrollEvent = eventName === "scroll";

      emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target();

              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target);

                if (sign === -1) {
                  diffToTarget = scrollSnap - (1 + scrollProgress);
                }
                if (sign === 1) {
                  diffToTarget = scrollSnap + (1 - scrollProgress);
                }
              }
            });
          }

          const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
          // 限制缩放范围在 0.7 到 1 之间，让效果更明显
          const scale = numberWithinRange(tweenValue, 0.7, 1);
          const tweenNode = tweenNodes.current[slideIndex];
          const parentSlide = slideNodes.current[slideIndex];
          
          if (tweenNode) {
            // 应用缩放
            tweenNode.style.transform = `scale(${scale})`;
            // 根据缩放值设置 z-index，越大的 scale 越在上层
            // 使用更大的倍数确保层级清晰
            const zIndex = Math.round(scale * 1000);
            tweenNode.style.zIndex = zIndex.toString();
            // 添加透明度效果，让层次更明显
            tweenNode.style.opacity = (0.5 + scale * 0.5).toString();
          }
          if (parentSlide) {
            // 需要在父级 li 上也设置 z-index，确保跨 slide 层级正确
            parentSlide.style.zIndex = Math.round(scale * 1000).toString();
          }
        });
      });
    },
    []
  );

  // 监听 Embla 事件
  useEffect(() => {
    const emblaApi = carousel.mainApi;
    if (!emblaApi) return;

    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenScale(emblaApi);

    emblaApi
      .on("reInit", setTweenNodes)
      .on("reInit", setTweenFactor)
      .on("reInit", tweenScale)
      .on("scroll", tweenScale)
      .on("slideFocus", tweenScale);

    return () => {
      emblaApi
        .off("reInit", setTweenNodes)
        .off("reInit", setTweenFactor)
        .off("reInit", tweenScale)
        .off("scroll", tweenScale)
        .off("slideFocus", tweenScale);
    };
  }, [carousel.mainApi, setTweenNodes, setTweenFactor, tweenScale]);

  return (
    <div className="p-4 flex flex-col gap-3 sm:gap-6">
      <div className="relative h-[209px] overflow-hidden xs:h-[209px] sm:h-[420px] rounded-box w-full rtl:rotate-y-180">
        {/** Title */}
        <div className="font-bold text-xl sm:text-7xl leading-6 sm:leading-18 whitespace-pre-line absolute top-1/2 -translate-y-1/2 left-8 sm:p-6 z-50 rtl:rotate-y-180">
          <p className="text-base-content">{t("aliancePartnerships:luis")}</p>
          <p className="text-base-content">{t("aliancePartnerships:suarez")}</p>
          <p className="text-primary">{t("aliancePartnerships:is_back")}</p>
        </div>
        {/** Illustration */}
        <img
          src="/images/alliance/suarez-mobile.png"
          alt="suarez mobile"
          className="absolute right-0 z-20 bottom-0 w-[231px] object-cover sm:hidden"
        />
        <img
          src="/images/alliance/suarez-desktop.png"
          alt="suarez desktop"
          className="absolute right-13 z-20 top-0 w-[603px] object-cover hidden sm:block"
        />
        {/** Background */}
        <div
          className="absolute inset-0 z-0 rounded-t-box"
          style={{
            background:
              "linear-gradient(90deg, transparent 28.45%, color-mix(in oklch, var(--color-base-300), transparent 30%) 99.82%), linear-gradient(270deg, transparent 21.67%, color-mix(in oklch, var(--color-base-300), transparent 10%) 100%), linear-gradient(0deg, transparent 40.33%, color-mix(in oklch, var(--color-base-300), transparent 10%) 85.41%), linear-gradient(180deg, transparent 0%, color-mix(in oklch, var(--color-base-300), transparent 10%) 59.51%), url(/images/illustrations/75a2f479bdb1a69ccf2140854ec9033038e744a5.png) lightgray center / cover no-repeat",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
            WebkitTransform: "translateZ(0)",
            transform: "translateZ(0)",
          }}
        />
        {/** Ellipse 5 */}
        <div className="hidden sm:block absolute -left-[100px] sm:right-0 sm:translate-y-14 sm:left-auto top-[405px] w-[479px] sm:w-[677px]  h-[98px] sm:h-[510px] bg-primary/80 rounded-full blur-[46px] z-30" />
        {/** Ellipse 4 */}
        <div className="absolute -top-[230px] left-[112px] w-[286px] h-[286px] sm:w-[877px] sm:h-[877px] rounded-full bg-base-300 blur-[38px] z-10 sm:left-auto sm:right-12 sm:-top-[560px] sm:blur-[80px]" />
        {/**Ellipse 3 */}
        <div className="absolute top-[50px] left-[153px] w-[286px] h-[166px] rounded-full bg-primary/50 blur-[38px] z-0 sm:left-auto sm:right-[-100px] sm:top-[225px] sm:w-[870px] sm:h-[518px] sm:blur-[118px]" />
        {/**Rectangle 2 */}
        <div className="absolute -top-[45px] left-[152px] w-[71px] h-[311px] bg-primary/10 skew-x-[12deg] rotate-[36deg] sm:rotate-[45deg] translate-x-4 sm:translate-x-22 sm:right-[370px] sm:left-auto sm:-top-[257px] sm:w-[281px] sm:h-[952px]" />
        {/**Rectangle 3 */}
        <div className="absolute -top-[60px] left-[218px] w-[110px] h-[350px] skew-x-[12deg] rotate-[36deg] sm:rotate-[45deg] bg-primary/10 border-primary/40 border-l-[28px] translate-x-2 sm:left-auto sm:right-[-220px] sm:-top-[2px] sm:w-[230px] sm:h-[732px] sm:border-l-[48px]" />
      </div>

      <p className="text-primary font-bold text-base sm:text-4xl sm:text-center sm:px-32">{t("aliancePartnerships:brand_ambassador_title")}</p>

      <p className="text-base-content/50 text-sm sm:text-lg sm:px-32 sm:text-center">{t("aliancePartnerships:intro_text_1")}</p>
      <p className="text-base-content/50 text-sm sm:text-lg sm:px-32 sm:text-center">{t("aliancePartnerships:intro_text_2")}</p>

      {/* Luis Suarez 图片轮播 */}
      <div className="mt-4 w-full relative">
        {/* 左右渐隐阴影（桌面端加宽） */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-16 md:w-1/2 z-[1100] bg-gradient-to-r from-base-300 to-transparent"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16 md:w-1/2 z-[1100] bg-gradient-to-l from-base-300 to-transparent"></div>

        <Carousel carousel={carousel} className="pl-[60px] pr-[60px] sm:pl-[80px] sm:pr-[80px] md:pl-[120px] md:pr-[120px]">
          {suarezImages.map((image, index) => (
            <div
              key={image.id}
              className="w-[240px] h-[180px] sm:w-[360px] sm:h-[240px] md:w-[480px] md:h-[300px] lg:w-[560px] lg:h-[340px] flex items-center justify-center rounded-box"
              style={{ position: 'relative', marginLeft: -60, marginRight: -60 }}
            >
              <div 
                className={cn(
                  "alliance-carousel-scale w-full h-full rounded-box overflow-hidden shadow-lg",
                  carousel.dots.selectedIndex === index && "border border-primary"
                )}
                style={{ 
                  position: 'relative',
                  willChange: 'transform, z-index, opacity',
                  transition: 'transform 0.3s ease-out, opacity 0.3s ease-out'
                }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 如果图片加载失败，使用占位图
                    (e.target as HTMLImageElement).src = "/images/alliance/suarez-mobile.png";
                  }}
                />
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* 额外内容部分 */}
      <div className="mt-6 flex flex-col gap-3">
        <p className="text-primary font-bold text-base sm:text-3xl sm:text-center sm:px-32">{t("aliancePartnerships:unstoppable_title")}</p>
        <p className="text-base-content/50 text-sm sm:text-lg sm:px-32 sm:text-center">{t("aliancePartnerships:unstoppable_text_1")}</p>
        <p className="text-base-content/50 text-sm sm:text-lg sm:px-32 sm:text-center">{t("aliancePartnerships:unstoppable_text_2")}</p>
        
        <p className="text-primary font-bold text-base mt-4 sm:text-2xl sm:text-center sm:px-32">{t("aliancePartnerships:suarez_okvip_title")}</p>
        <p className="text-base-content/50 sm:text-base-content sm:font-bold sm:-mt-2 text-sm sm:text-2xl sm:px-32 sm:text-center">{t("aliancePartnerships:suarez_okvip_subtitle")}</p>
      </div>

      <AlliancePartnerships />

      <Footer />
    </div>
  );
};
