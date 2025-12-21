import { useMediaQuery } from "@/hooks/useMediaQuery";
import InnerBannerItem from "@/sections/casino/hero-banner/InnerBannerItem.tsx";
import "swiper/swiper-bundle.css";
import { Carousel, CarouselDotButtons, useCarousel } from "@/components/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { publicService } from "@/services/publicService.ts";
import { useMemo } from "react";

export type IBannerContent = {
  id: string;
  sort: string;
  name: string;
  banner_type: string;
  banner_content: {
    value: number
    percent: number
    background_image_list: {
      pc_image: string;
      mobile_image: string;
      image_link: string;
    }[];
    float_image_list: {
      image_link: string;
      pc_image: string;
      mobile_image: string;
    }[];
    button_list: {
      button_text: string;
      button_link: string;
    }[];
    text_list: {
      text: string;
      text_link: string;
    }[];
  };
  extra_data: Record<string, any>
}

interface IBannerContentQuery {
  data: IBannerContent[],
  code: number
}

const initBannerContentQuery = {data: [] as IBannerContent[], code: 0}

const Index = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { user } = useAuth()

  const {data = initBannerContentQuery, isLoading} = useQuery<IBannerContentQuery>({
    queryKey: ['bannerContentList', user?.id],
    queryFn: () => publicService.getBannerContentList(user?.id),
    refetchOnMount: true
  });

  const carousel = useCarousel(
    {
      slidesToShow: isMobile ? 1 : 3,
      startIndex: 0,
      dragFree: false,
      slideSpacing: "12px",
      align: "start",
      loop: true,
      containScroll: "trimSnaps",
      duration: 20
    },
    [Autoplay({ delay: 4_000 })]
  );

  const banners = useMemo(() => {
    return (data?.data ?? []).filter((item: IBannerContent) => item?.name !== '1st_game_bonus_wallet')
  }, [data])

  return (
    <div className="select-none text-lg sm:text-xl leading-5.5 sm:leading-6 font-black relative">
      {isLoading && <div className={"skeleton bg-base-400 h-[209px] sm:h-[258px] rounded-box"} />}
      {!isLoading && banners.length > 0 && <>
        <Carousel carousel={carousel}>
          {banners.map((item: Record<string, any>) =>
            <InnerBannerItem
              key={item?.id}
              type={item?.name}
              data={item}
              content={item?.banner_content} />
          )}
        </Carousel>
        <CarouselDotButtons
          className="absolute bottom-0 left-1/2 -translate-x-1/2 sm:hidden"
          scrollSnaps={carousel.dots.scrollSnaps}
          selectedIndex={carousel.dots.selectedIndex}
          onClickDot={carousel.dots.onClickDot}
        />
      </>}
    </div>
  );
};

export default Index;
