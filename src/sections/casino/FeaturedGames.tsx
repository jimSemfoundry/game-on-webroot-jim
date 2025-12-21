import { Carousel, useCarousel } from "@/components/carousel";
import Iconify from "@/components/iconify";
import { CountryIcon } from "@/components/ui/CountryIcon";
import { GameImage } from "@/components/ui/GameImage";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";

type FeaturedGamesProps = {
  country_code?: string;
  games: any[];
};

export const FeaturedGames = ({ games, country_code }: FeaturedGamesProps) => {
  const { t } = useTranslation();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const navigate = useNavigate();
  const carousel = useCarousel({
    slidesToShow: "auto",
    startIndex: 0, // 从第一个开始
    dragFree: true,
    slideSpacing: "8px",
    align: "start",
    loop: true, // 保持循环功能
    containScroll: "trimSnaps", // 防止滚动超出边界
  });

  // 使用 useCallback 优化错误处理函数
  const handleImageError = useCallback((gameId: string) => {
    setFailedImages((prev) => new Set(prev).add(gameId));
  }, []);

  const handleAllClick = useCallback(() => {
    
    // 确定一级分类（game type）
    let gameType = "casino"; // 默认 casino
    let secondaryCategory = 'hot'; // 默认使用原始 category
    
    // 导航到 explore 页面
    navigate({
      to: "/explore",
      search: {
        type: gameType,
        category: secondaryCategory,
      },
    });
  }, [navigate]);

  // 过滤掉加载失败的游戏
  const validGames = games?.filter((game) => !failedImages.has(game.id));

  return (
    <div className="flex flex-col gap-1 w-full animate-fade-in">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2 px-1 cursor-pointer" onClick={handleAllClick}>
          {country_code === "Default" ? (
            <Iconify icon="custom:hot" />
          ) : (
            <CountryIcon code={country_code ?? null} />
          )}
          <p className="text-md sm:text-lg font-semibold">{t("casino:hot")}</p>
        </div>
        <button
          className="btn btn-sm btn-primary"
          onClick={handleAllClick}
        >
          {t("transaction:filters.all")}
        </button>
      </div>
      <div className="relative">
        <Carousel carousel={carousel}>
          {validGames?.map((game: any) => (
            <div
              key={game.id}
              className="flex flex-col items-center gap-0.5 select-none w-26 sm:w-33"
            >
              <GameImage
                data={game}
                game={{
                  inner_game_id: game.inner_game_id,
                  game_provider: game.game_provider,
                  game_name: game.display_game_name,
                  image: game.image
                }}
                showHoverEffects={true}
                className="object-fill origin-center"
                containerClassName="rounded-field"
                onError={() => handleImageError(game.id)}
              />
            </div>
          ))}
        </Carousel>
        <div className="absolute w-18 sm:w-36 rtl:left-0 ltr:right-0 top-0 bottom-0 ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-transparent to-base-300 z-20 pointer-events-none" />
      </div>
    </div>
  );
};
