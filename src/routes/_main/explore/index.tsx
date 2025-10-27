import { useCasinoGameList } from "@/hooks/api/usePublic.ts";
import { ExploreGameGrid, ExploreSearchBar, ExploreTabs } from "@/sections/explore";
import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getPrimaryApiCategory, getSecondaryApiCategory, getDefaultSecondaryValue } from "@/config/exploreMenuConfig.ts";
import { useSidebar } from "@/contexts/SidebarContext.tsx";
export const Route = createFileRoute("/_main/explore/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      type: (search.type as string) || 'casino',
      category: search.category as string,
      ...(typeof search.providers !== "undefined" ? { providers: search.providers as string } : {}),
    }
  },
});

function RouteComponent() {
  const search = useSearch({ from: "/_main/explore/" });
  const gameType = search.type;
  const initialCategory = search.category;
  const providers = search.providers;
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  
  const [value, setValue] = useState(initialCategory || "hot");
  const [sortValue, setSortValue] = useState("popular");
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allGames, setAllGames] = useState<any[]>([]);

  // Prevent scroll on header area
  const handleHeaderTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
  }, []);

  // Map frontend sort values to API format
  const getSortParam = (sortValue: string) => {
    switch (sortValue) {
      case "popular":
        return "popular";
      case "az":
        return "a-z";
      case "za":
        return "z-a";
      case "newest":
        return "newest";
      default:
        return "popular";
    }
  };

  const gameLimit = typeof window !== 'undefined' && window.innerWidth >= 768 ? 90 : 30;
  
  // 将菜单值映射到API参数
  const filterParams = useMemo(() => {
    return {
      sort: getSortParam(sortValue),
      lang: "zh-CN",
      keyword: "",
      providers: selectedProviders.length > 0 ? selectedProviders.join(",") : "",
      game_category_1: getPrimaryApiCategory(gameType),
      game_category_2: getSecondaryApiCategory(value),
      type: "",
    };
  }, [sortValue, selectedProviders, gameType, value]);

  const baseParams = useMemo(() => {
    return {
      ...filterParams,
      limit: gameLimit,
      page: currentPage,
    };
  }, [filterParams, gameLimit, currentPage]);

  const {
    data: casinoGameListData,
    isLoading,
    isError,
  } = useCasinoGameList(baseParams);

  const casinoData = (casinoGameListData as any) ?? {};

  const changeExploreTab = (value: string) => {
    if (gameType === "casino" || gameType === "fishing") {
      if (value === 'hot') {
        setValue('hot');
      } else {
        navigate({
          to: "/explore?type=" + value,
        });
      }
    } else {
      setValue(value);
    }
  }

  // Reset page and games when filters change
  useEffect(() => {
    setCurrentPage(1);
    if (providers?.includes('all')) {
      navigate({
        to: "/explore",
        search: {
          type: gameType,
          category: "hot",
          providers: "",
        },
        replace: true,
      });
    }
  }, [sortValue, value, selectedProviders.length, gameType]);

  // Reset tab value when game type changes, but prioritize initial category from URL
  useEffect(() => {
    if (initialCategory) {
      setValue(initialCategory);
    } else {
      const defaultValue = getDefaultSecondaryValue(gameType);
      setValue(defaultValue);
    }
  }, [gameType, initialCategory]);

  // Accumulate games when new data arrives
  useEffect(() => {
    if (casinoData?.data) {
      if (currentPage === 1) {
        // First page: replace all games
        setAllGames(casinoData.data);
      } else {
        // Subsequent pages: append to existing games
        setAllGames((prevGames) => [...prevGames, ...casinoData.data]);
      }
    }
  }, [casinoData?.data, currentPage]);

  const handleLoadMore = useCallback(() => {
    setCurrentPage((prevPage) => prevPage + 1);
  }, []);

  const hasMoreGames = casinoData?.data?.length === gameLimit;
  const isLoadingMoreGames = isLoading && currentPage > 1;

  return (
    <div className="fixed inset-0 top-16 bottom-[72px] md:relative md:inset-auto md:top-0 md:bottom-0 md:h-[calc(100vh-72px)] flex flex-col overflow-hidden">
      {/** Fixed Header - Tabs and Search */}
      <div className="flex-shrink-0 bg-base-300 px-5 py-2" onTouchMove={handleHeaderTouchMove} style={{ touchAction: "none" }}>
        {/** Mobile: Stack vertically */}
        <div className="md:hidden space-y-2">
          <ExploreTabs value={value} onChange={changeExploreTab} gameType={gameType} />
          <ExploreSearchBar
            sortValue={sortValue}
            setSortValue={setSortValue}
            selectedProviders={selectedProviders}
            setSelectedProviders={setSelectedProviders}
            isSearchOpen={isSearchDialogOpen}
            setIsSearchOpen={setIsSearchDialogOpen}
            filterParams={filterParams}
            providers={providers}
          />
        </div>

        {/** Desktop: Same row */}
        {!isMobile && (
          <div className="hidden md:flex md:items-center md:gap-4">
            <div className="flex-1 min-w-0">
              <ExploreTabs value={value} onChange={changeExploreTab} gameType={gameType} />
            </div>
            <div className="flex-shrink-0">
              <ExploreSearchBar
                sortValue={sortValue}
                setSortValue={setSortValue}
                selectedProviders={selectedProviders}
                setSelectedProviders={setSelectedProviders}
                isSearchOpen={isSearchDialogOpen}
                setIsSearchOpen={setIsSearchDialogOpen}
                filterParams={filterParams}
                providers={providers}
              />
            </div>
          </div>
        )}
      </div>

      {/** Scrollable Game list */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-2">
        <ExploreGameGrid
          isLoading={isLoading && currentPage === 1}
          isError={isError}
          totalCount={casinoData?.count ?? 0}
          currentCount={allGames?.length ?? 0}
          casinoGameList={{ data: allGames }}
          hasMoreGames={hasMoreGames}
          isLoadingMore={isLoadingMoreGames}
          onLoadMore={handleLoadMore}
        />
      </div>
    </div>
  );
}
