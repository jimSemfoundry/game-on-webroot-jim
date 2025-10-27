import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Iconify from "@/components/iconify";
import { BetHistoryFilters } from "./BetHistoryFilters";
import { BetHistoryTable } from "./BetHistoryTable";
import type { BetHistoryFiltersState } from "./types";
import { normalizeBetHistoryResponse, useUserBetHistory } from "@/query/bet-history";
import { useUserBalance } from "@/query/transactions";
import type { InfiniteData } from "@tanstack/react-query";
import type { BetHistoryResponse } from "@/types/bet-history";

const DEFAULT_FILTERS: BetHistoryFiltersState = {
  game: "all",
  asset: "all",
  period: "Past 7 Days",
};

const PERIOD_TO_RANGE: Record<BetHistoryFiltersState["period"], number> = {
  "Past 24 Hours": 1,
  "Past 7 Days": 7,
  "Past 30 Days": 30,
};

const getPageNumbers = (currentPage: number, totalPages: number) => {
  const pages: (number | string)[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  pages.push(1);

  if (currentPage > 3) {
    pages.push("...");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("...");
  }

  pages.push(totalPages);

  return pages;
};

export function Index() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<BetHistoryFiltersState>(DEFAULT_FILTERS);
  const [desiredPage, setDesiredPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      game_type: filters.game === "all" ? undefined : filters.game,
      asset: filters.asset === "all" ? undefined : filters.asset,
      time_range: PERIOD_TO_RANGE[filters.period] ?? PERIOD_TO_RANGE["Past 7 Days"],
    }),
    [filters],
  );

  const betHistoryQuery = useUserBetHistory(queryParams);
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = betHistoryQuery;

  const betHistoryPages = useMemo(
    () => ((data as InfiniteData<BetHistoryResponse> | undefined)?.pages ?? []),
    [data],
  );

  const normalizedPages = useMemo(() => {
    return betHistoryPages.map((page) => normalizeBetHistoryResponse(page));
  }, [betHistoryPages]);

  const firstPage = normalizedPages[0];
  const firstPagination = firstPage?.pagination ?? null;

  const derivedTotalPages =
    firstPagination?.last_page ??
    (firstPagination?.total && firstPagination?.page_size
      ? Math.ceil(firstPagination.total / firstPagination.page_size)
      : undefined);

  const totalPagesEstimate =
    derivedTotalPages ?? (hasNextPage ? normalizedPages.length + 1 : Math.max(normalizedPages.length, 1));
  const safeTotalPages = Math.max(totalPagesEstimate, 1);

  const recordsForPage = normalizedPages[currentPage - 1]?.records ?? [];
  const filterGroup = firstPage?.filters;

  const { data: balanceData } = useUserBalance();
  const balanceCurrencies = useMemo(() => {
    type BalanceItem = { currency?: string | null };
    type BalancePage = { data?: BalanceItem[] | null };
    const balancePages = (balanceData as { pages?: BalancePage[] } | undefined)?.pages ?? [];
    const balances = balancePages[0]?.data ?? [];
    if (!Array.isArray(balances)) return [];

    return balances
      .map((item) => (item?.currency ? String(item.currency) : undefined))
      .filter((currency): currency is string => typeof currency === "string" && currency.length > 0);
  }, [balanceData]);

  const combinedAssets = useMemo(() => {
    const unique = new Set<string>();
    filterGroup?.assets?.forEach((asset) => {
      if (typeof asset === "string" && asset.length > 0) {
        unique.add(asset);
      }
    });
    balanceCurrencies.forEach((asset) => {
      if (typeof asset === "string" && asset.length > 0) {
        unique.add(asset);
      }
    });
    return Array.from(unique);
  }, [filterGroup?.assets, balanceCurrencies]);

  const pageNumbers = useMemo(() => getPageNumbers(currentPage, safeTotalPages), [currentPage, safeTotalPages]);

  const isInitialLoading = isLoading && betHistoryPages.length === 0;
  const showNoMore = !hasNextPage && normalizedPages.length > 0 && currentPage === normalizedPages.length;

  useEffect(() => {
    setDesiredPage(1);
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    const loadedPages = normalizedPages.length;
    if (desiredPage <= loadedPages && desiredPage !== currentPage) {
      setCurrentPage(desiredPage);
      return;
    }

    if (desiredPage > loadedPages) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      } else if (!hasNextPage && loadedPages > 0) {
        setDesiredPage((prev) => (prev !== loadedPages ? loadedPages : prev));
      }
    }
  }, [desiredPage, normalizedPages.length, hasNextPage, isFetchingNextPage, fetchNextPage, currentPage]);

  const handleFiltersChange = (nextFilters: BetHistoryFiltersState) => {
    setFilters(nextFilters);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > safeTotalPages) return;
    setDesiredPage(page);
  };

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < safeTotalPages;

  return (
    <div className="bg-base-300 flex flex-col rounded-field overflow-hidden mx-0 sm:mx-5 md:mx-0">
      <div className="bg-base-200 flex items-center gap-2 px-4 sm:px-6 sm:pt-6 sm:pb-4 py-4">
        <Iconify icon="custom:bet-history" width={20} height={20} className="text-primary" />
        <h3 className="text-base sm:text-lg font-bold">{t("profile:betHistory.title", "Bet History")}</h3>
      </div>

      <div className="bg-base-200 px-4 sm:px-6">
        <BetHistoryFilters
          filters={filters}
          onChange={handleFiltersChange}
          filterGroup={filterGroup}
          availableAssets={combinedAssets}
          isDisabled={isInitialLoading && !normalizedPages.length}
        />
      </div>

      <div className="bg-base-200 flex flex-col">
        <BetHistoryTable
          records={recordsForPage}
          isLoading={isInitialLoading}
          isFetchingMore={isFetchingNextPage}
          showNoMore={showNoMore}
          emptyMessage={t("profile:betHistory.empty", "No bet history found")}
        />

        {safeTotalPages > 1 && (
          <div className="flex items-center justify-center gap-1 sm:gap-2 py-5 px-4">
            <button
              type="button"
              onClick={() => canGoPrev && handlePageChange(Math.max(1, currentPage - 1))}
              disabled={!canGoPrev || isFetchingNextPage}
              className="btn btn-sm btn-ghost btn-square rounded-2xl disabled:opacity-30"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {pageNumbers.map((page, index) => (
              <button
                key={`${page}-${index}`}
                type="button"
                onClick={() => typeof page === "number" && handlePageChange(page)}
                disabled={page === "..." || isFetchingNextPage}
                className={`btn btn-sm min-w-[2.5rem] rounded-2xl ${
                  page === currentPage ? "btn-primary text-black" : "btn-ghost bg-base-300/60 hover:bg-base-300"
                } ${page === "..." ? "cursor-default hover:bg-transparent" : ""}`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => canGoNext && handlePageChange(Math.min(safeTotalPages, currentPage + 1))}
              disabled={!canGoNext || isFetchingNextPage}
              className="btn btn-sm btn-ghost btn-square rounded-2xl disabled:opacity-30"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
