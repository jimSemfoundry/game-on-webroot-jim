import { useCarousel } from "@/components/carousel/hooks/use-carousel";
import { Carousel } from "@/components/carousel";
import { CarouselArrowFloatButtons } from "@/components/carousel/components/carousel-arrow-buttons";
import { TournamentCard, TournamentCardData } from "./tournament-card";
import { useTranslation } from "react-i18next";
import type { ITournament } from "@/types/tournament";
import { useEffect } from "react";

interface TournamentBannerProps {
  tournaments: ITournament[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
}

export function TournamentBanner({ tournaments, selectedIndex, onIndexChange }: TournamentBannerProps) {
  const { t } = useTranslation();

  const mapTournamentToCard = (item: ITournament): TournamentCardData => {
    const provider = (item.game_provider || "").toLowerCase();

    let titleHighlight: string | undefined;
    let title: string = item.name || t("tournament:tournaments", "TOURNAMENTS");
    let image = "";

    if (provider === "jili") {
      titleHighlight = t("tournament:jiliSlots.highlight", "JILI SLOTS");
      title = t("tournament:jiliSlots.title", "MEGA BONANZA");
      image = "/images/illustrations/b86472b94bfc1f088505f51d6f75ba056fc9a941.png";
    } else if (provider === "pg") {
      titleHighlight = t("tournament:pgSoft.highlight", "PG SOFT");
      title = t("tournament:pgSoft.title", "RACES");
      image = "/images/illustrations/d3ce708b54cb1aabdb69a027f29a744e4713e26c.png";
    } else if (provider === "pp") {
      titleHighlight = t("tournament:pragmatic.highlight", "PRAGMATIC");
      title = t("tournament:pragmatic.title", "CHALLENGE");
      image = "/images/illustrations/abb5d0ea3c88e4d91831509b2c26c42a3640d29c.png";
    } else if (provider === "newbie") {
      titleHighlight = t("tournament:beginnersLuck.highlight", "BEGINNER'S");
      title = t("tournament:beginnersLuck.title", "LUCK");
      image = "/images/illustrations/7c071064d635fd1324952f1ec987cc948da6fe4a.png";
    }

    return {
      id: (item as any).id ?? `${item.game_provider}-${item.end_time}`,
      titleHighlight,
      title,
      endTime: new Date((item.end_time || 0) * 1000),
      prizePool: (item.user_info as any)?.prize ?? 0,
      image,
      provider: item.game_provider,
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

  if (tournaments.length === 0) {
    return (
      <div className="h-[300px] bg-base-300 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">No Tournaments</div>
          <div className="text-base-content/70">No active tournaments available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Carousel carousel={carousel} className="w-full">
        {tournaments.map((tournament, index) => {
          const cardData = mapTournamentToCard(tournament);
          return (
            <TournamentCard
              key={cardData.id}
              data={cardData}
              onClick={() => onIndexChange(index)}
            />
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
