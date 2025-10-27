import { Carousel, useCarousel } from "@/components/carousel";
import Iconify from "@/components/iconify";
import { GameImage } from "@/components/ui/GameImage";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";

type CategoryGamesProps = {
  games: any[];
  category: string;
};

export const CategoryGames = ({ games, category }: CategoryGamesProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // 因为后端返回的字符串格式与翻译key不匹配，需要将 kebab-case 格式转换为 camelCase 格式
  const categoryKey = category.replace(/-([a-z])/g, (_, letter) =>
    letter.toUpperCase(),
  );

  const carousel = useCarousel({
    slidesToShow: "auto",
    startIndex: 0, // 从第一个开始
    dragFree: true,
    slideSpacing: "8px",
    align: "start",
    loop: true, // 保持循环功能
    containScroll: "trimSnaps", // 防止滚动超出边界
    inViewThreshold: 0.5, // 提高可见性阈值
    skipSnaps: false, // 确保精确对齐
  });

  // 使用 useCallback 优化错误处理函数
  const handleImageError = useCallback((gameId: string) => {
    setFailedImages((prev) => new Set(prev).add(gameId));
  }, []);

  // 过滤掉加载失败的游戏
  const validGames = games.filter((game) => !failedImages.has(game.id));

  // 处理 All 按钮点击 - 导航到 explore 页面并设置正确的过滤器
  const handleAllClick = useCallback(() => {
    // 根据 category 映射到正确的一级和二级分类
    // category 格式可能是: "hot", "slots", "live-casino", "fishing", "crash" 等
    
    // 确定一级分类（game type）
    let gameType = "casino"; // 默认 casino
    let secondaryCategory = category; // 默认使用原始 category
    
    // 特殊处理某些分类
    if (category === "live-casino" || category === "live") {
      gameType = "liveCasino";
      secondaryCategory = "all";
    } else if (category === "slots") {
      gameType = "slots";
      secondaryCategory = "all";
    } else if (["feature-buy", "enhanced-rtp", "jackpot", "megaways", "table-game", "video-poker", "arcade"].includes(category)) {
      // 这些是 slots 下的二级分类
      gameType = "slots";
      secondaryCategory = category;
    } else if (["baccarat", "blackjack", "roulette", "poker"].includes(category)) {
      // 这些是 liveCasino 下的二级分类
      gameType = "liveCasino";
      secondaryCategory = category;
    } else if (category === "fast") {
      gameType = "fast";
      secondaryCategory = "all";
    } else if (["crash", "plinko", "mines", "scratch", "bingo", "keno"].includes(category)) {
      gameType = "fast";
      secondaryCategory = category;
    } else if (["hot", "fishing"].includes(category)) {
      // 这些是 casino 下的二级分类
      gameType = "casino";
      secondaryCategory = category;
    }
    
    // 导航到 explore 页面
    navigate({
      to: "/explore",
      search: {
        type: gameType,
        category: secondaryCategory,
      },
    });
  }, [category, navigate]);

  return (
    <div className="flex flex-col gap-2 w-full animate-fade-in">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleAllClick}>
          <Iconify icon={`custom:${category}`} />
          <p className="text-md sm:text-lg font-semibold">
            {t(`explore:${categoryKey}`)}
          </p>
        </div>
        <button 
          className="btn btn-sm btn-primary"
          onClick={handleAllClick}
        >
          All
        </button>
      </div>
      <div className="relative">
        <Carousel carousel={carousel}>
          {validGames.map((game: any) => (
            <div
              key={game.id}
              className="flex flex-col items-center gap-0.5 select-none w-26 sm:w-33"
            >
              <GameImage
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
        {/* 轮播图的遮罩层 */}
        <div className="absolute w-18 sm:w-36 rtl:left-0 ltr:right-0 top-0 bottom-0 ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-transparent to-base-300 z-20 pointer-events-none" />
      </div>
    </div>
  );
};
