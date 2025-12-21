import { useUserGameList } from "@/hooks/api/useAuth.ts";
import { useCasinoGameList } from "@/hooks/api/usePublic.ts";
import { ExploreGameGrid, ExploreSearchBar, ExploreTabs } from "@/sections/explore";
import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getPrimaryApiCategory, getSecondaryApiCategory, getDefaultSecondaryValue } from "@/config/exploreMenuConfig.ts";
import { useSidebar } from "@/contexts/SidebarContext.tsx";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_main/explore/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    const type = (search.type as string) || 'casino';
    const result: any = {
      type,
    };

    // fishing 不需要 category 参数
    if (type !== 'fishing' && search.category) {
      result.category = search.category as string;
    }

    if (typeof search.providers !== "undefined") {
      result.providers = search.providers as string;
    }

    return result;
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
  const isUserTab = value === "recent" || value === "favorites";

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

  const sortParam = useMemo(() => getSortParam(sortValue), [sortValue]);

  const gameLimit = typeof window !== 'undefined' && window.innerWidth >= 768 ? 90 : 30;
  const providersParam = selectedProviders.length > 0 ? selectedProviders.join(",") : "";

  const { user } = useAuth();
  const { i18n } = useTranslation();

  // 将菜单值映射到API参数
  const filterParams = useMemo(() => {
    return {
      sort: sortParam,
      lang: user?.language_code.toUpperCase() || i18n.language.toUpperCase() || "EN",
      keyword: "",
      providers: providersParam,
      game_category_1: getPrimaryApiCategory(gameType),
      game_category_2: getSecondaryApiCategory(value),
      type: "",
    };
  }, [sortParam, providersParam, gameType, value, user?.language_code, i18n.language]);

  const baseParams = useMemo(() => {
    return {
      ...filterParams,
      limit: gameLimit,
      page: currentPage,
    };
  }, [filterParams, gameLimit, currentPage]);

  const userGameParams = useMemo(() => {
    return {
      type: value,
      keyword: "",
      providers: providersParam,
      sort: sortParam,
      lang: "zh-CN",
      limit: 500,
      page: 1,
    };
  }, [value, providersParam, sortParam]);

  const {
    data: casinoGameListData,
    isLoading: isCasinoLoading,
    isError: isCasinoError,
  } = useCasinoGameList(baseParams, { enabled: !isUserTab });

  const casinoData = !isUserTab ? ((casinoGameListData as any) ?? {}) : {};

  const {
    data: userGameListData,
    isLoading: isUserGameListLoading,
    isError: isUserGameListError,
  } = useUserGameList(userGameParams, { enabled: isUserTab });

  const crossNavigationTabs = useMemo(() => new Set(["casino", "slots", "liveCasino", "fast", "fishing"]), []);

  const changeExploreTab = (newValue: string) => {
    // 如果当前是 fishing，点击的是一级菜单切换
    if (gameType === "fishing" && crossNavigationTabs.has(newValue)) {
      const targetType = newValue;
      const defaultCategory = getDefaultSecondaryValue(targetType);

      // fishing 没有 category，其他类型需要 category
      const nextSearch: any = {
        type: targetType,
      };

      if (targetType !== "fishing") {
        nextSearch.category = defaultCategory || "hot";
      }

      navigate({
        to: "/explore",
        search: nextSearch,
      });
      return;
    }

    if (gameType === "casino") {
      if (crossNavigationTabs.has(newValue)) {
        const targetType = newValue;
        const defaultCategory = getDefaultSecondaryValue(targetType);

        // fishing 没有 category，其他类型需要 category
        const nextSearch: any = {
          type: targetType,
        };

        if (targetType !== "fishing") {
          nextSearch.category = defaultCategory || "hot";
        }

        navigate({
          to: "/explore",
          search: nextSearch,
        });
        return;
      }

      setValue(newValue);
      const nextSearch: { type: string; category: string; providers?: string } = {
        type: "casino",
        category: newValue,
      };
      if (providersParam) {
        nextSearch.providers = providersParam;
      }
      navigate({
        to: "/explore",
        search: nextSearch,
      });
      return;
    }

    setValue(newValue);
    const nextSearch: { type: string; category: string; providers?: string } = {
      type: gameType,
      category: newValue,
    };
    if (providersParam) {
      nextSearch.providers = providersParam;
    }
    navigate({
      to: "/explore",
      search: nextSearch,
    });
  };

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

  // Sync sort value with specific tabs (Hot/New)
  useEffect(() => {
    if (value === "new") {
      setSortValue("newest");
    } else if (value === "hot") {
      setSortValue("popular");
    }
  }, [value]);

  // Accumulate games when new data arrives
  useEffect(() => {
    if (isUserTab) {
      return;
    }
    if (casinoData?.data) {
      if (currentPage === 1) {
        setAllGames(casinoData.data);
      } else {
        setAllGames((prevGames) => [...prevGames, ...casinoData.data]);
      }
    } else if (currentPage === 1) {
      setAllGames([]);
    }
  }, [casinoData?.data, currentPage, isUserTab]);

  const handleLoadMore = useCallback(() => {
    if (isUserTab) return;
    setCurrentPage((prevPage) => prevPage + 1);
  }, [isUserTab]);

  const userGames = useMemo(() => {
    if (userGameListData?.code === 0 && Array.isArray(userGameListData.data)) {
      return userGameListData.data;
    }
    return [];
  }, [userGameListData]);

  const displayedGames = isUserTab ? userGames : allGames;
  const userGamesErrorState = isUserTab && (isUserGameListError || (userGameListData !== undefined && userGameListData.code !== 0));
  const isGridLoading = isUserTab ? isUserGameListLoading : isCasinoLoading;
  const isGridError = isUserTab ? Boolean(userGamesErrorState) : isCasinoError;
  const hasMoreCasinoGames = !isUserTab && casinoData?.data?.length === gameLimit;
  const totalCount = isUserTab ? (userGameListData?.count ?? userGames.length) : casinoData?.count ?? 0;
  const currentCount = displayedGames?.length ?? 0;
  const isLoadingMoreGames = !isUserTab && isCasinoLoading && currentPage > 1;
  const loadMoreHandler = !isUserTab ? handleLoadMore : undefined;
  const initialLoading = isGridLoading && currentCount === 0;

  return (
    <div className="fixed inset-0 top-16 bottom-[72px] md:relative md:inset-auto md:top-0 md:bottom-0 md:h-[calc(100vh-72px)] flex flex-col overflow-hidden">
      {/** Fixed Header - Tabs and Search */}
      <div className="shrink-0 bg-base-300 px-5 py-2" style={{ touchAction: "none" }}>
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
            <div className="shrink-0">
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
          isLoading={initialLoading}
          isError={isGridError}
          totalCount={totalCount}
          currentCount={currentCount}
          casinoGameList={{ data: displayedGames }}
          hasMoreGames={hasMoreCasinoGames}
          isLoadingMore={isLoadingMoreGames}
          onLoadMore={loadMoreHandler}
        />
      </div>
    </div>
  );
}
