import { useTranslation } from "react-i18next";
import { useState, useCallback, useMemo } from "react";
import { LuckyCardCarousel } from "@/components/ui/LuckyCardCarousel";
import Iconify from "@/components/iconify";
import { m } from "motion/react";
import { useNavigate } from "@tanstack/react-router";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { useLikeGameMutation } from "@/hooks/api/useAuth";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Game {
  id: string;
  inner_game_id?: string;
  game_provider?: string;
  display_game_name: string;
  image: string;
  provider?: string;
}

interface QuickActionsProps {
  games?: Game[];
}

export const QuickActions = ({ games = [] }: QuickActionsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isShuffling, setIsShuffling] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [activeGame, setActiveGame] = useState<Game | null>(games[0] || null);
  const { setStatus, status, isAuthenticated } = useAuth();
  const { mutate: likeGame } = useLikeGameMutation();

  // const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isFavoriteDisabled = !isAuthenticated || isShuffling;

  const handleShuffleClick = useCallback(() => {
    if (games.length === 0) return;

    // 直接设置isShuffling=true触发新动画
    setIsShuffling(true);
    setIsButtonDisabled(true);
  }, [games.length]);

  const handleGameSelected = useCallback((game: Game) => {
    // console.log('Selected game:', game)
    setSelectedGame(game);
    setActiveGame(game);
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setIsShuffling(false);
    // 动画完成后恢复按钮状态
    setIsButtonDisabled(false);
  }, []);

  // 检查当前选中的游戏是否已收藏
  const currentGame = selectedGame || activeGame;
  const isGameFavorite = useMemo(() => {
    if (!currentGame?.inner_game_id || !status?.favorites_game) return false;
    const favoritesList = status.favorites_game
      .split(",")
      .filter(item => item.trim().length > 0);
    return favoritesList.includes(currentGame.inner_game_id);
  }, [currentGame?.inner_game_id, status?.favorites_game]);

  // 处理收藏切换
  const handleToggleFavorite = useCallback(async () => {
    const gameToToggle = selectedGame || activeGame;
    if (!gameToToggle?.inner_game_id) {
      toast.error(t("common:noGameSelected", "No game selected"));
      return Promise.reject(new Error("No game selected"));
    }

    return new Promise<void>((resolve, reject) => {
      likeGame(gameToToggle.inner_game_id!, {
        onSuccess: (response) => {
          if (response.code === 0) {
            // 使用服务器返回的状态作为最终状态
            const nextIsFavorite = response.data.is_favorite;

            // 更新全局收藏状态
            setStatus((prev) => {
              if (!prev) return prev;

              const favorites = new Set(
                prev.favorites_game?.split(",").filter(item => item.trim().length > 0)
              );

              if (nextIsFavorite) {
                favorites.add(gameToToggle.inner_game_id!);
              } else {
                favorites.delete(gameToToggle.inner_game_id!);
              }

              return {
                ...prev,
                favorites_game: Array.from(favorites).join(",")
              };
            });

            resolve();
          } else {
            toast.error(response.msg || t("common:operationFailed", "Operation failed"));
            reject(new Error(response.msg));
          }
        },
        onError: (error) => {
          toast.error(t("common:operationFailed", "Operation failed, please try again"));
          reject(error);
        }
      });
    });
  }, [selectedGame, activeGame, likeGame, setStatus, t]);

  return (
    <div className="h-100 sm:h-[465px] w-full relative overflow-hidden z-20 rounded-box bg-base-200">
      {/* Performance optimizations */}
      <div
        className="absolute inset-0 z-30 rounded-box pointer-events-none"
        style={{
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
          WebkitTransform: "translateZ(0)",
          transform: "translateZ(0)"
        }}
      />
      <div className="absolute top-7 left-6 sm:top-[95px] sm:left-[64px] flex flex-col z-40 relative sm:pb-16 pointer-events-auto">
        {/* 桌面端：长语言限制行数，避免挤压按钮 */}
        <div className="hidden sm:block text-5xl font-bold leading-[1.05] line-clamp-2 max-w-[340px]">
          {t("casino:needHelpChoosingGame")}
        </div>
        {/* 移动端：一行显示 */}
        <p className="block sm:hidden text-3xl font-bold">{t("casino:needHelpChoosingGame")}</p>
        <span className="text-base-content/50 leading-5 text-md sm:text-lg font-bold mt-4 sm:mt-10 max-w-[340px] line-clamp-2">
          {t("casino:scrollThroughAndWeWillMatchYouWithAGame")}
        </span>
        <div className="sm:mt-0 mt-4 hidden sm:block sm:absolute sm:bottom-0 sm:left-0 z-40 pointer-events-auto">
          <button
            className={`min-w-32 max-w-[220px] h-12 px-3 font-semibold rounded-field cursor-pointer transition-all duration-200 flex items-center gap-1 justify-center ${isButtonDisabled ? "bg-base-300 text-base-content/50 cursor-not-allowed" : "bg-primary/20 text-primary hover:bg-primary/30"
            }`}
            onClick={handleShuffleClick}
            disabled={isButtonDisabled || games.length === 0}
          >
            <span className="min-w-0 truncate">{t("casino:shuffle")}</span>
            {isButtonDisabled ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Iconify icon="custom:refresh" className="w-5 h-5 shrink-0" />
            )}
          </button>
        </div>
      </div>

      <div className="flex sm:hidden left-8 right-8 absolute bottom-4 z-50 items-center justify-between">
        {/* 收藏按钮 - 显示当前游戏（选中的或初始中心的），未登录时禁用 */}
          {currentGame?.inner_game_id ? (
          <FavoriteButton
            initialLiked={isGameFavorite}
            onToggle={handleToggleFavorite}
            size="md"
            className={`bg-primary/10 ${isFavoriteDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
            disabled={isFavoriteDisabled}
          />
        ) : (
          <div className="w-10 h-10" /> // 占位符保持布局
        )}
        {!isButtonDisabled && currentGame && (
          <m.button
            className="btn btn-accent w-30 btn-md font-bold"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            onClick={() => {
              if (currentGame?.inner_game_id) {
                const gameId = currentGame.game_provider
                  ? `${currentGame.game_provider}:${currentGame.inner_game_id}`
                  : currentGame.inner_game_id;
                void navigate({ to: '/games/$gameId', params: { gameId }, search: {} })
              }
            }}
          >
            {t("bonus:play")?.toUpperCase()}
          </m.button>
        )}
        <button
          className={`w-10 h-10 rounded-field cursor-pointer transition-all duration-200 ${isButtonDisabled ? "bg-base-300 text-base-content/50 cursor-not-allowed" : "bg-primary/10 text-primary"
          }`}
          onClick={handleShuffleClick}
          disabled={isButtonDisabled || games.length === 0}
        >
          {isButtonDisabled ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <Iconify icon="custom:refresh" className="w-5 h-5" />
          )}
        </button>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-[280px] z-30 sm:top-0 sm:bottom-0 sm:left-[40%] sm:h-auto flex items-center justify-center">
        <LuckyCardCarousel
          games={games.slice(0, 15)}
          isShuffling={isShuffling}
          onGameSelected={handleGameSelected}
          onAnimationComplete={handleAnimationComplete}
        />
      </div>
    </div>
  );
};
