import { useCarousel } from "@/components/carousel/hooks/use-carousel";
import { Carousel } from "@/components/carousel";
import { CarouselArrowFloatButtons } from "@/components/carousel/components/carousel-arrow-buttons";
import { TournamentCard, TournamentCardData } from "./tournament-card";
import type { ITournament } from "@/types/tournament";
import { useEffect } from "react";
import clsx from "clsx";
import { TournamentCardV2 } from "./tournament-card-v2";
import { getTournamentImage, getTournamentVisual } from "./tournament-visuals";

interface TournamentBannerProps {
  tournaments: ITournament[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  searchParams?: { id?: string; provider?: string };
}

export function TournamentBanner({ tournaments, selectedIndex, onIndexChange }: TournamentBannerProps) {

  const mapTournamentToCard = (item: ITournament): TournamentCardData => {
    const provider = (item.game_provider || "").toLowerCase();
    const userInfo = (item.user_info || {}) as any;

    const visual = getTournamentVisual(provider);

    const titleHighlight: string | undefined = visual.titleHighlight;
    const title: string = visual.title || item.name  ;
    const image = getTournamentImage(provider, "desktop");

    return {
      id: (item as any).id ?? `${item.game_provider}-${item.end_time}`,
      titleHighlight,
      title,
      endTime: new Date((item.end_time || 0) * 1000),
      prizePool: Number(userInfo?.prize ?? 0),
      image,
      provider: item.game_provider,
      tournamentId: userInfo?.tournament_id ?? (item as any).id,
      tournamentLevel: userInfo?.tournament_level ?? "bronze",
    };
  };

  const carousel = useCarousel({
    slidesToShow: 1,
    slideSpacing: "0px",
    loop: true,
  });

  // 监听轮播变化，同步到父组件
  useEffect(() => {
    if (!carousel.mainApi) return;

    const onSelect = () => {
      const idx = carousel.mainApi?.selectedScrollSnap() ?? 0;
      onIndexChange(idx);
    };

    carousel.mainApi.on("select", onSelect);
    return () => {
      carousel.mainApi?.off("select", onSelect);
    };
  }, [carousel.mainApi, onIndexChange]);

  // 当外部 selectedIndex 变化时，同步到轮播
  useEffect(() => {
    if (carousel.mainApi && selectedIndex !== carousel.mainApi.selectedScrollSnap()) {
      carousel.mainApi.scrollTo(selectedIndex);
    }
  }, [selectedIndex, carousel.mainApi]);

  return (
    <div className="relative">
      <Carousel carousel={carousel} className="w-full">
        {tournaments.map((tournament, index) => {
          const cardData = mapTournamentToCard(tournament);
          return (
            cardData.provider?.toLowerCase() !== 'rakerace' ? (
              <TournamentCard
                key={cardData.id}
                data={cardData}
                hover={false}
                onClick={() => onIndexChange(index)}
                className={clsx("rounded-2xl")}
                contentClsx={'sm:flex-row sm:items-center sm:justify-start'}
                bannerHeight={"340"}
              />
            ) : (
              <TournamentCardV2
                key={cardData.id}
                data={cardData}
                hover={false}
                onClick={() => onIndexChange(index)}
                className={clsx("rounded-2xl")}
                contentClsx={'sm:flex-row sm:items-center sm:justify-between'}
                bannerHeight={"340"}
              />
            )
          );
        })}
      </Carousel>

      {/* 箭头按钮 */}
      {tournaments.length > 1 && (
        <CarouselArrowFloatButtons
          options={carousel.options}
          onClickPrev={carousel.arrows.onClickPrev}
          onClickNext={carousel.arrows.onClickNext}
          disablePrev={carousel.arrows.disablePrev}
          disableNext={carousel.arrows.disableNext}
        />
      )}

    </div>
  );
}
