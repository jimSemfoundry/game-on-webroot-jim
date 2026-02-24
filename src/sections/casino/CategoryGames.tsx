import Iconify from "@/components/iconify";
import { GameCarousel } from "@/components/ui/GameCarousel";
import { GameImage } from "@/components/ui/GameImage";
import { isMobile } from "@/utils/browser";
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
    } else if (category === "fishing") {
      // fishing 是一级分类，没有二级分类
      gameType = "fishing";
      secondaryCategory = ""; // 不需要 category
    } else if (category === "hot") {
      // hot 是 casino 下的二级分类
      gameType = "casino";
      secondaryCategory = category;
    }
    
    // 导航到 explore 页面
    const searchParams: any = {
      type: gameType,
    };
    
    // fishing 不需要 category 参数
    if (gameType !== "fishing" && secondaryCategory) {
      searchParams.category = secondaryCategory;
    }
    
    navigate({
      to: "/explore",
      search: searchParams,
    });
  }, [category, navigate]);

  const lazyOnMobile = isMobile();

  return (
    <GameCarousel className="gap-2 animate-fade-in">
      <GameCarousel.Header onTitleClick={handleAllClick} onAllClick={handleAllClick} allLabel={t("transaction:filters.all")}>
        <Iconify icon={`custom:${category}`} />
        <p className="text-md sm:text-lg font-semibold">
          {t(`explore:${categoryKey}`)}
        </p>
      </GameCarousel.Header>
      <GameCarousel.Content>
        <GameCarousel.Track>
          {validGames.map((game: any) => (
            <GameCarousel.Item
              key={game.id}
              className="flex flex-col items-center w-32 sm:w-36"
              lazy={lazyOnMobile}
              placeholder={<div className="w-full aspect-[3/4] rounded-field bg-base-200" />}
            >
              <GameImage
                data={game}
                game={{
                  inner_game_id: game.inner_game_id,
                  game_provider: game.game_provider,
                  game_name: game.display_game_name,
                  image: game.image
                }}
                enabledBanGameList
                showHoverEffects={true}
                lazy={!lazyOnMobile}
                className="object-fill origin-center"
                containerClassName="rounded-field"
                onError={() => handleImageError(game.id)}
              />
            </GameCarousel.Item>
          ))}
        </GameCarousel.Track>
        <GameCarousel.Fade />
      </GameCarousel.Content>
    </GameCarousel>
  );
};
