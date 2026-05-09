import Iconify from "@/components/iconify";
import { CountryIcon } from "@/components/ui/CountryIcon";
import { GameCarousel } from "@/components/ui/GameCarousel";
import { GameImage } from "@/components/ui/GameImage";
import { isMobile } from "@/utils/browser";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { useBannedGameCheck } from "@/hooks/useBannedGameCheck.ts";

type FeaturedGamesProps = {
  country_code?: string;
  games: any[];
};

export const FeaturedGames = ({ games, country_code }: FeaturedGamesProps) => {
  const { t } = useTranslation();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // 使用自定义 hook 检查游戏是否被禁止
  const isGameBanned = useBannedGameCheck(true);

  const navigate = useNavigate();

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
  const validGames = (games ?? []).filter((game) => !isGameBanned(game) && !failedImages.has(game.id));

  const lazyOnMobile = isMobile();

  return (
    <GameCarousel className="animate-fade-in">
      <GameCarousel.Header onTitleClick={handleAllClick} onAllClick={handleAllClick} allLabel={t("transaction:filters.all")}>
        {country_code === "Default" ? (
          <Iconify icon="custom:hot" />
        ) : (
          <CountryIcon code={country_code ?? null} />
        )}
        <p className="text-md sm:text-lg font-semibold">{t("casino:hot")}</p>
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
