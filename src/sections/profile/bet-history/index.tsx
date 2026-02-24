import Iconify from "@/components/iconify";
import { SmoothTabs } from "@/components/ui/SmoothTabs";
import { normalizeBetHistoryResponse, useSportsBetHistory } from "@/query/bet-history";
import { useUserBalance } from "@/query/transactions";
import type { BetHistoryResponse } from "@/types/bet-history";
import type { InfiniteData } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "../c/Card";
import { BetHistoryFilters } from "./BetHistoryFilters";
import { BetHistoryTable } from "./BetHistoryTable";
import { SportsBetHistoryTable } from "./SportsBetHistoryTable";
import type { BetHistoryFiltersState } from "./types";

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
  const MAX_VISIBLE = 5;
  if (totalPages <= MAX_VISIBLE) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const halfWindow = Math.floor(MAX_VISIBLE / 2);
  let start = currentPage - halfWindow;
  let end = currentPage + halfWindow;

  if (start < 1) {
    start = 1;
    end = MAX_VISIBLE;
  }

  if (end > totalPages) {
    end = totalPages;
    start = totalPages - MAX_VISIBLE + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const extractBalanceCurrencies = (balanceData: unknown): string[] => {
  type BalanceItem = { currency?: string | null };
  type BalancePage = { data?: BalanceItem[] | null };
  const balancePages = (balanceData as { pages?: BalancePage[] } | undefined)?.pages ?? [];
  const balances = balancePages[0]?.data ?? [];
  if (!Array.isArray(balances)) return [];

  return balances
    .map((item) => (item?.currency ? String(item.currency) : undefined))
    .filter((currency): currency is string => typeof currency === "string" && currency.length > 0);
};

interface BetHistorySectionProps {
  balanceData: unknown;
}

function CasinoBetHistorySection({ balanceData }: BetHistorySectionProps) {
  const { t } = useTranslation('profile');
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

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useSportsBetHistory(queryParams);

  const betHistoryPages = useMemo(() => (data as InfiniteData<BetHistoryResponse> | undefined)?.pages ?? [], [data]);

  const normalizedPages = useMemo(() => betHistoryPages.map((page) => normalizeBetHistoryResponse(page)), [betHistoryPages]);

  const firstPage = normalizedPages[0];
  const firstPagination = firstPage?.pagination ?? null;

  const derivedTotalPages =
    firstPagination?.last_page ??
    (firstPagination?.total && firstPagination?.page_size ? Math.ceil(firstPagination.total / firstPagination.page_size) : undefined);

  const totalPagesEstimate = derivedTotalPages ?? (hasNextPage ? normalizedPages.length + 1 : Math.max(normalizedPages.length, 1));
  const safeTotalPages = Math.max(totalPagesEstimate, 1);

  const recordsForPage = normalizedPages[currentPage - 1]?.records ?? [];
  const filterGroup = firstPage?.filters;

  const balanceCurrencies = useMemo(() => extractBalanceCurrencies(balanceData), [balanceData]);

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
    <>
      <div className="bg-base-200">
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
          showNoMore={false}
          emptyMessage={t("profile:betHistory.empty", "No bet history found")}
        />

        {safeTotalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 py-5 px-3 sm:px-6 w-full">
            <button
              type="button"
              onClick={() => canGoPrev && handlePageChange(Math.max(1, currentPage - 1))}
              disabled={!canGoPrev || isFetchingNextPage}
              className="btn btn-sm btn-ghost btn-square rounded-2xl disabled:opacity-30"
            >
              <svg className="rtl:rotate-180" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {pageNumbers.map((page, index) => (
              <button
                key={`${page}-${index}`}
                type="button"
                onClick={() => handlePageChange(page)}
                disabled={isFetchingNextPage}
                className={`btn btn-sm min-w-[2.5rem] rounded-lg ${
                  page === currentPage ? "btn-primary text-black" : "btn-ghost bg-base-300/60 hover:bg-base-300"
                }`}
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
              <svg className="rtl:rotate-180" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function SportsBetHistorySection({ balanceData }: BetHistorySectionProps) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<BetHistoryFiltersState>(DEFAULT_FILTERS);
  const [desiredPage, setDesiredPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      game_type: "betby",
      asset: filters.asset === "all" ? undefined : filters.asset,
      time_range: PERIOD_TO_RANGE[filters.period] ?? PERIOD_TO_RANGE["Past 7 Days"],
    }),
    [filters],
  );

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useSportsBetHistory(queryParams);

  const betHistoryPages = useMemo(() => (data as InfiniteData<BetHistoryResponse> | undefined)?.pages ?? [], [data]);

  const normalizedPages = useMemo(() => betHistoryPages.map((page) => normalizeBetHistoryResponse(page)), [betHistoryPages]);

  const firstPage = normalizedPages[0];
  const firstPagination = firstPage?.pagination ?? null;

  const derivedTotalPages =
    firstPagination?.last_page ??
    (firstPagination?.total && firstPagination?.page_size ? Math.ceil(firstPagination.total / firstPagination.page_size) : undefined);

  const totalPagesEstimate = derivedTotalPages ?? (hasNextPage ? normalizedPages.length + 1 : Math.max(normalizedPages.length, 1));
  const safeTotalPages = Math.max(totalPagesEstimate, 1);

  const recordsForPage = normalizedPages[currentPage - 1]?.records ?? [];
  const filterGroup = firstPage?.filters;

  const balanceCurrencies = useMemo(() => extractBalanceCurrencies(balanceData), [balanceData]);

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
    <>
      <div className="bg-base-200">
        <BetHistoryFilters
          filters={filters}
          onChange={handleFiltersChange}
          filterGroup={filterGroup}
          availableAssets={combinedAssets}
          isDisabled={isInitialLoading && !normalizedPages.length}
          showGameFilter={false}
        />
      </div>

      <div className="bg-base-200 flex flex-col">
        <SportsBetHistoryTable
          records={recordsForPage}
          isLoading={isInitialLoading}
          isFetchingMore={isFetchingNextPage}
          showNoMore={false}
          emptyMessage={t("transaction:common.noBettingRecords", "No betting records found")}
        />

        {safeTotalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 py-5 px-3 sm:px-6 w-full">
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
                onClick={() => handlePageChange(page)}
                disabled={isFetchingNextPage}
                className={`btn btn-sm min-w-[2.5rem] rounded-2xl ${
                  page === currentPage ? "btn-primary text-black" : "btn-ghost bg-base-300/60 hover:bg-base-300"
                }`}
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
    </>
  );
}

export function Index() {
  const { t } = useTranslation('profile');
  const [activeTab, setActiveTab] = useState<"casino" | "sports">("casino");
  const { data: balanceData } = useUserBalance();

  const tabItems = useMemo(
    () => [
      { id: "casino", label: t("common:common.casino", "Casino") },
      { id: "sports", label: t("common:common.sports", "Sports") },
    ],
    [t],
  );

  return (
    <div className="bg-base-300 flex flex-col rounded-field overflow-visible">
      <Card
        icon={<Iconify icon="custom:bet-history" className="text-primary w-4 h-4 sm:w-5 sm:h-5" />}
        title={
          <div className="flex items-center justify-between w-full">
            {t("profile:betHistory.title", "Bet History")}{" "}
            <SmoothTabs
              items={tabItems}
              value={activeTab}
              size="xs"
              onChange={(value) => setActiveTab(value as "casino" | "sports")}
              className="bg-base-300"
              layoutId="bet-history-tabs"
            />
          </div>
        }
      >
        {activeTab === "casino" ? (
          <CasinoBetHistorySection balanceData={balanceData} />
        ) : (
          <SportsBetHistorySection balanceData={balanceData} />
        )}
      </Card>
    </div>
  );
}
