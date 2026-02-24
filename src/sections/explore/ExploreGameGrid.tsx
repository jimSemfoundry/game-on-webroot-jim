import { GameImage } from "@/components/ui/GameImage";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { VirtuosoGrid } from "react-virtuoso";

interface ExploreGameGridProps {
  isLoading: boolean;
  isError: boolean;
  casinoGameList?: {
    data?: Array<{
      id: string;
      name: string;
      image: string;
    }>;
  };
  hasMoreGames?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  currentCount?: number;
  scrollParentSelector?: string;
}

export function ExploreGameGrid({
  isLoading,
  isError,
  casinoGameList,
  hasMoreGames = false,
  isLoadingMore = false,
  onLoadMore,
  currentCount = 0,
  scrollParentSelector = "main",
}: ExploreGameGridProps) {
  const { t } = useTranslation();

  // 防止重复触发加载的标记
  const isLoadingRef = useRef(false);
  const lastLoadTimeRef = useRef(0);

  // 获取滚动父容器
  const [scrollParent, setScrollParent] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const parent = document.querySelector(scrollParentSelector) as HTMLElement;
    if (parent) {
      setScrollParent(parent);
    }
  }, [scrollParentSelector]);

  // 安全的加载更多处理函数
  const handleEndReached = useCallback(() => {
    const now = Date.now();
    // 防抖：300ms 内不重复触发
    if (now - lastLoadTimeRef.current < 300) {
      return;
    }
    // 检查是否正在加载
    if (isLoadingRef.current || isLoadingMore) {
      return;
    }
    // 检查是否还有更多数据
    if (!hasMoreGames) {
      return;
    }
    // 检查回调是否存在
    if (!onLoadMore) {
      return;
    }

    isLoadingRef.current = true;
    lastLoadTimeRef.current = now;
    onLoadMore();
  }, [hasMoreGames, isLoadingMore, onLoadMore]);

  // 同步 loading 状态到 ref
  if (!isLoadingMore) {
    isLoadingRef.current = false;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full bg-base-200 py-10 rounded-lg">
        <span className="text-base-content/50 text-xs">{t('explore:noResultsFound')}</span>
      </div>
    );
  }

  const games = casinoGameList?.data ?? [];
  const hasGames = games.length > 0;

  // 先等待 scrollParent 准备好，避免首次加载时闪现 noResultsFound
  if (!scrollParent) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!hasGames) {
    return (
      <div className="bg-base-300 rounded-field flex items-center justify-center min-h-[50vh] py-20">
        <div className="flex flex-col items-center gap-4">
          <img src="/images/illustrations/no-data.svg" alt="No data" className="w-32 h-32 sm:w-40 sm:h-40 opacity-50" />
          <div className="text-base-content/50 text-sm font-semibold">{t("common:common.noData")}</div>
        </div>
      </div>
    );
  }

  return (
    <VirtuosoGrid
      customScrollParent={scrollParent}
      data={games}
      endReached={handleEndReached}
      overscan={200}
      listClassName="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8 gap-2"
      itemClassName="w-full"
      itemContent={(_, game: any) => (
        <GameImage
          key={game.id ?? `${game.game_provider}:${game.inner_game_id}`}
          data={game}
          game={{
            inner_game_id: game.inner_game_id,
            game_provider: game.game_provider,
            game_name: game.display_game_name || game.name,
            image: game.image,
          }}
          showHoverEffects={true}
          lazy={false}
          enabledBanGameList
        />
      )}
      components={{
        Footer: () => (
          <div className="flex flex-col items-center py-4 gap-3 pb-[calc(5rem+var(--safe-area-inset-bottom))] md:pb-4">
            {/* 加载中指示器 */}
            {isLoadingMore && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="animate-spin w-6 h-6" />
              </div>
            )}
            {/* 已加载全部 */}
            {!hasMoreGames && !isLoadingMore && currentCount > 0 && (
              <div className="text-sm text-base-content/30">
                {t('explore:allGamesLoaded', 'All games loaded')}
              </div>
            )}
          </div>
        ),
      }}
    />
  );
}
