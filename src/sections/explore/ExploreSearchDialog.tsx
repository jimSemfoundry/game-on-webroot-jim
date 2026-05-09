import { Carousel, useCarousel } from "@/components/carousel";
import Iconify from "@/components/iconify";
import { GameImage } from "@/components/ui/GameImage";
import { LiquidGlassEffect } from "@/components/ui/LiquidGlassEffect";
import { Modal } from "@/components/ui/Modal";
import { useCasinoGameList, useCasinoGameListInfinite } from "@/hooks/api/usePublic";
import { useDebounce } from "@/hooks/useDebounce";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBannedGameForceCheck } from "@/hooks/useBannedGameCheck.ts";

const MIN_SEARCH_LENGTH = 3;
const PAGE_SIZE = 24;

export interface ExploreSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  baseFilters: Record<string, any>;
}

export function ExploreSearchDialog({ isOpen, onClose, baseFilters }: ExploreSearchDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState("");
  const debouncedValue = useDebounce(inputValue, 300);
  const trimmedDebouncedQuery = debouncedValue.trim();

  // 使用自定义 hook 检查游戏是否被禁止
  const isGameBanned = useBannedGameForceCheck();

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = window.setTimeout(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setInputValue("");
    }
  }, [isOpen]);

  const trimmedInputQuery = inputValue.trim();
  const meetsMinLength = trimmedDebouncedQuery.length >= MIN_SEARCH_LENGTH;

  const searchParams = useMemo(() => {
    if (!meetsMinLength) return null;
    return {
      ...baseFilters,
      keyword: trimmedDebouncedQuery,
      limit: PAGE_SIZE,
    };
  }, [baseFilters, trimmedDebouncedQuery, meetsMinLength]);

  // 获取 Hot Games 数据
  const hotGamesParams = useMemo(() => ({
    ...baseFilters,
    category: 'hot',
    page: 1,
    limit: 12,
  }), [baseFilters]);

  const { data: hotGamesData } = useCasinoGameList(hotGamesParams, {
    enabled: isOpen,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });

  const hotGames = useMemo(() => {
    const list = Array.isArray((hotGamesData as any)?.data) ? (hotGamesData as any).data : [];
    return list.filter((game: Record<string, any>) => !isGameBanned(game)).slice(0, 12);
  }, [hotGamesData, isGameBanned]);

  const {
    data: searchGameListData,
    isFetching: isSearchFetching,
    isFetched: isSearchFetched,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCasinoGameListInfinite(searchParams, {
    enabled: Boolean(searchParams),
    refetchOnMount: false,
  });

  const displayResults = useMemo(() => {
    if (!meetsMinLength || !searchGameListData?.pages) return [];
    return searchGameListData.pages.flatMap((page: any) => page?.data || [])?.filter((game: Record<string, any>) => !isGameBanned(game));
  }, [meetsMinLength, searchGameListData, isGameBanned]);

  // 只在首次加载时显示 loading（没有任何数据时）
  const isInitialLoading = meetsMinLength && isSearchFetching && displayResults.length === 0;
  const showLoading = isInitialLoading;
  const showNoResults = meetsMinLength && isSearchFetched && !isSearchFetching && displayResults.length === 0;
  // 只要有数据就显示 Carousel，即使正在加载更多
  const showCarousel = meetsMinLength && displayResults.length > 0;

  const resultsCarousel = useCarousel({
    slidesToShow: "auto",
    slideSpacing: "8px",
    align: "start",
    dragFree: true,
    containScroll: "keepSnaps",
  });

  // 监听 Carousel 滚动，接近末尾时加载更多
  const handleScrollEnd = useCallback(() => {
    if (!resultsCarousel.mainApi || !hasNextPage || isFetchingNextPage) return;
    
    const scrollProgress = resultsCarousel.mainApi.scrollProgress();
    
    // 当滚动进度超过 70% 时加载更多
    if (scrollProgress > 0.7) {
      fetchNextPage();
    }
  }, [resultsCarousel.mainApi, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const api = resultsCarousel.mainApi;
    if (!api) return;

    api.on("scroll", handleScrollEnd);
    return () => {
      api.off("scroll", handleScrollEnd);
    };
  }, [resultsCarousel.mainApi, handleScrollEnd]);

  const hotGamesCarousel = useCarousel({
    slidesToShow: "auto",
    slideSpacing: "8px",
    align: "start",
    dragFree: true,
    containScroll: "keepSnaps",
  });

  useEffect(() => {
    if (!isOpen) return;
    const rafId = window.requestAnimationFrame(() => {
      resultsCarousel.mainApi?.reInit();
      hotGamesCarousel.mainApi?.reInit();
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [isOpen, displayResults.length, hotGames.length, resultsCarousel.mainApi, hotGamesCarousel.mainApi]);

  const handleClear = () => {
    setInputValue("");
    searchInputRef.current?.focus();
  };

  const handleResultNavigate = (game: any) => {
    const provider = game?.game_provider ?? game?.provider;
    const innerId = game?.inner_game_id ?? game?.innerGameId ?? game?.id;
    const navigationId = provider && innerId ? `${provider}:${innerId}` : innerId;

    if (!navigationId) return;

    onClose();
    navigate({ to: "/games/$gameId", params: { gameId: navigationId }, search: {} });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideTitle
      closeButtonClassName="hidden"
      className="bg-transparent shadow-none border-none p-0 max-w-4xl w-[95vw]"
      position="modal-middle"
    >
      <LiquidGlassEffect
        className="!flex w-full min-h-[560px] max-h-[85dvh] flex-col gap-6 rounded-3xl bg-base-300/55 backdrop-blur-lg !p-6 md:min-h-[640px] md:max-h-[90dvh] md:p-10"
        backgroundElements={<div className="absolute inset-0" />}
      >
        <div className="flex items-start justify-between">
          <p className="text-lg font-semibold text-base-content">{t("common:common.search")}</p>
          <button type="button" className="btn btn-sm btn-square btn-ghost" onClick={onClose} aria-label={t("common:common.close")}>
            <X size={16} className="text-base-content" />
          </button>
        </div>

        <div className="flex flex-col gap-4 mt-4 flex-1 min-h-0">
          <label className="input input-lg bg-base-300 input-ghost focus-within:bg-base-300 w-full rounded-field text-base-content">
            <Search className="text-base-content/60 w-5 h-5" />
            <input
              ref={searchInputRef}
              type="search"
              placeholder={t("explore:searchPlaceholder")}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              className="grow bg-transparent sm:text-base text-sm font-semibold placeholder:text-base-content/40 focus:outline-none"
            />
            {inputValue && (
              <button type="button" className="btn btn-xs btn-square btn-ghost" onClick={handleClear} aria-label={t("common:common.clear")}>
                <Trash2 size={14} />
              </button>
            )}
          </label>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden touch-pan-y">
            <div className="h-full w-full flex flex-col gap-4">
              <div className="flex items-center justify-center text-sm text-base-content/50 text-center touch-pan-x">
                {trimmedInputQuery.length === 0 || !meetsMinLength ? (
                  t("explore:searchInstructions")
                ) : showLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-base-content/70" />
                ) : showNoResults ? (
                  t("explore:noResultsFound")
                ) : showCarousel ? (
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-2">
                      <Iconify icon="custom:explore" className="w-4 h-4 text-primary" />
                      <p className="text-base-content font-semibold text-sm">{t("gameDetail:result")}</p>
                    </div>
                    <Carousel carousel={resultsCarousel} className="w-full will-change-transform">
                      {displayResults.map((game: any, index: number) => {
                        const key = game?.id ?? `${game?.game_provider ?? "provider"}-${game?.inner_game_id ?? index}`;
                        return (
                          <div key={key} className="w-[120px]">
                            <GameImage
                              data={game}
                              game={{
                                inner_game_id: game?.inner_game_id ?? game?.id,
                                game_provider: game?.game_provider ?? game?.provider,
                                game_name: game?.display_game_name ?? game?.name ?? game?.title,
                                image: game?.image || game?.imageUrl || undefined,
                              }}
                              showHoverEffects
                              onClick={() => handleResultNavigate(game)}
                            />
                          </div>
                        );
                      })}
                      {/* 加载更多指示器 */}
                      {isFetchingNextPage && (
                        <div className="flex items-center justify-center min-w-[100px]">
                          <Loader2 className="w-5 h-5 animate-spin text-base-content/50" />
                        </div>
                      )}
                    </Carousel>
                  </div>
                ) : null}
              </div>

              {/* Hot Games Section */}
              {hotGames.length > 0 && (
                <div className="flex flex-col gap-2 w-full touch-pan-x">
                  <div className="flex items-center gap-2">
                    <Iconify icon="custom:heart" className="w-4 h-4 text-primary" />
                    <p className="text-base-content font-semibold text-sm">{t("explore:gamesYouShouldTry")}</p>
                  </div>
                  <Carousel carousel={hotGamesCarousel} className="w-full will-change-transform">
                    {hotGames.map((game: any, index: number) => {
                      const key = game?.id ?? `${game?.game_provider ?? "provider"}-${game?.inner_game_id ?? index}`;
                      return (
                        <div key={key} className="w-[120px]">
                          <GameImage
                            data={game}
                            game={{
                              inner_game_id: game?.inner_game_id ?? game?.id,
                              game_provider: game?.game_provider ?? game?.provider,
                              game_name: game?.display_game_name ?? game?.name ?? game?.title,
                              image: game?.image || game?.imageUrl || undefined,
                            }}
                            showHoverEffects
                            onClick={() => handleResultNavigate(game)}
                          />
                        </div>
                      );
                    })}
                  </Carousel>
                </div>
              )}
            </div>
          </div>
        </div>
      </LiquidGlassEffect>
    </Modal>
  );
}
