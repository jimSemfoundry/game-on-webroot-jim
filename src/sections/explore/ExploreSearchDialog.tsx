import { Carousel, useCarousel } from "@/components/carousel";
import { Modal } from "@/components/ui/Modal";
import { LiquidGlassEffect } from "@/components/ui/LiquidGlassEffect";
import { GameImage } from "@/components/ui/GameImage";
import { useSidebar } from "@/contexts/SidebarContext";
import { useCasinoGameList } from "@/hooks/api/usePublic";
import { useDebounce } from "@/hooks/useDebounce";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const MIN_SEARCH_LENGTH = 3;
const RESULTS_LIMIT = 6;

export interface ExploreSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  baseFilters: Record<string, any>;
}

export function ExploreSearchDialog({
  isOpen,
  onClose,
  baseFilters,
}: ExploreSearchDialogProps) {
  const { t } = useTranslation();
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState("");
  const debouncedValue = useDebounce(inputValue, 300);
  const trimmedDebouncedQuery = debouncedValue.trim();

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
      page: 1,
      limit: 24,
    };
  }, [baseFilters, trimmedDebouncedQuery, meetsMinLength]);

  const {
    data: searchGameListData,
    isFetching: isSearchFetching,
    isFetched: isSearchFetched,
  } = useCasinoGameList(searchParams, {
    enabled: Boolean(searchParams),
    refetchOnMount: false,
    keepPreviousData: true,
  });
  const searchData = (searchGameListData as any) ?? {};

  const displayResults = useMemo(() => {
    if (!meetsMinLength) return [];
    const list = Array.isArray(searchData?.data) ? searchData.data : [];
    return list.slice(0, RESULTS_LIMIT);
  }, [meetsMinLength, searchData]);

  const showLoading = meetsMinLength && (!isSearchFetched || isSearchFetching);
  const showNoResults = meetsMinLength && isSearchFetched && !isSearchFetching && displayResults.length === 0;
  const showCarousel = meetsMinLength && isSearchFetched && displayResults.length > 0;

  const resultsCarousel = useCarousel({
    slidesToShow: isMobile ? 4 : 6,
    slideSpacing: "12px",
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

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
    navigate({ to: "/games/$gameId", params: { gameId: navigationId } });
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
        className="!flex w-full min-h-[420px] flex-col gap-6 rounded-3xl bg-base-300/40 !p-6 backdrop-blur-lg md:min-h-[480px] md:p-10"
        backgroundElements={<div className="absolute inset-0" />}
      >
        <div className="flex items-start justify-between">
          <p className="text-lg font-semibold text-base-content">
            {t("common:common.search")}
          </p>
          <button
            type="button"
            className="btn btn-sm btn-square btn-ghost"
            onClick={onClose}
            aria-label={t("common:common.close")}
          >
            <X size={16} />
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
              className="grow bg-transparent text-base font-semibold placeholder:text-base-content/40 focus:outline-none"
            />
            {inputValue && (
              <button
                type="button"
                className="btn btn-xs btn-square btn-ghost"
                onClick={handleClear}
                aria-label={t("common:common.clear")}
              >
                <Trash2 size={14} />
              </button>
            )}
          </label>

          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full w-full rounded-field p-3 flex flex-col">
              <div className="flex h-full items-center justify-center text-sm text-base-content/50 text-center">
                {trimmedInputQuery.length === 0 || !meetsMinLength ? (
                  t("explore:searchInstructions")
                ) : showLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-base-content/70" />
                ) : showNoResults ? (
                  t("explore:noResultsFound")
                ) : showCarousel ? (
                  <Carousel carousel={resultsCarousel} className="w-full overflow-visible">
                    {displayResults.map((game: any, index: number) => {
                      const key = game?.id ?? `${game?.game_provider ?? "provider"}-${game?.inner_game_id ?? index}`;
                      return (
                        <div key={key} className="w-[128px] px-1">
                          <GameImage
                            game={{
                              inner_game_id: game?.inner_game_id ?? game?.id,
                              game_provider: game?.game_provider ?? game?.provider,
                              game_name: game?.display_game_name ?? game?.name ?? game?.title,
                              image: game?.image ?? game?.imageUrl,
                            }}
                            containerClassName="w-[128px]"
                            showHoverEffects
                            onClick={() => handleResultNavigate(game)}
                          />
                        </div>
                      );
                    })}
                  </Carousel>
                ) : (
                  null
                )}
              </div>
            </div>
          </div>
        </div>
      </LiquidGlassEffect>
    </Modal>
  );
}
