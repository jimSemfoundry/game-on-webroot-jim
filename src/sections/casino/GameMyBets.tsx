import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { normalizeBetHistoryResponse, useUserBetHistory } from "@/query/bet-history";
import { BetHistoryRecord } from "@/types/bet-history";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Copy from "@/components/ui/Copy";
import Decimal from "decimal.js";

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

export const GameMyBets = ({ game_id }: { game_id: string }) => {
  const { t } = useTranslation(['gameDetail', 'common']);
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const [desiredPage, setDesiredPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Params for useUserBetHistory (time_range is fixed for now, can be made dynamic)
  const queryParams = useMemo(
    () => ({
      time_range: 90, // Defaulted to 90 days as in original code
      // game_id, etc., can be added here if needed for filtering by specific game
      inner_game_id: game_id,
    }),
    [game_id],
  );

  const {
    data: betHistoryData, // This is InfiniteData<BetHistoryResponse>
    isLoading,
    isPending,
    fetchNextPage,
    hasNextPage, // This is from useInfiniteQuery
    isFetchingNextPage,
    refetch,
  } = useUserBetHistory(queryParams);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const betHistoryPages = useMemo(() => betHistoryData?.pages ?? [], [betHistoryData]);
  const normalizedPages = useMemo(() => betHistoryPages.map((page) => normalizeBetHistoryResponse(page)), [betHistoryPages]);
  const firstPage = normalizedPages[0];
  const firstPagination = firstPage?.pagination ?? null;

  const derivedTotalPages =
    firstPagination?.last_page ??
    (firstPagination?.total && firstPagination?.page_size ? Math.ceil(firstPagination.total / firstPagination.page_size) : undefined);

  const totalPagesEstimate = derivedTotalPages ?? (hasNextPage ? normalizedPages.length + 1 : Math.max(normalizedPages.length, 1));
  const safeTotalPages = Math.max(totalPagesEstimate, 1);
  const recordsForPage = normalizedPages[currentPage - 1]?.records ?? [];
  const pageNumbers = useMemo(() => getPageNumbers(currentPage, safeTotalPages), [currentPage, safeTotalPages]);

  const isInitialLoading = (isLoading || isPending) && betHistoryPages.length === 0;
  const isAwaitingDesiredPage = desiredPage > normalizedPages.length;
  const showEmptyState = !isInitialLoading && !recordsForPage.length && !isAwaitingDesiredPage;

  useEffect(() => {
    setDesiredPage(1);
    setCurrentPage(1);
  }, [queryParams]);

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

  const handlePageChange = (page: number) => {
    if (page < 1 || page > safeTotalPages) return;
    setDesiredPage(page);
  };

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < safeTotalPages;

  const parseX = (item: BetHistoryRecord) => {
    const betAmount = new Decimal(item.bet_amount || 0);
    if (betAmount.isZero()) {
      return "0";
    }
    return new Decimal(item.win_amount || 0).div(betAmount).toFixed(2);
  };

  const renderTableRows = () => {
    return recordsForPage.map((betItem) => {
      const betAmountInfo = formatWithConversion(betItem.bet_amount || 0, betItem.currency || "USD", { minimizeDecimals: true, showCode: false });
      const winAmountInfo = formatWithConversion(betItem.win_amount || 0, betItem.currency || "USD", { minimizeDecimals: true, showCode: false });
      const key = betItem.bet_id ?? betItem.id ?? `${betItem.order_id}-${betItem.bet_amount}`;

      return (
        <tr
          key={key}
          className="text-xs sm:text-base text-base-content/50 transition-colors odd:bg-base-200 even:bg-base-200/50"
        >
          <td className="sm:flex items-center px-3 py-3 text-left font-semibold sm:w-[50%] w-[30%]">
            <span className="block truncate sm:ml-5 flex-1" title={betItem.bet_id}>
              {betItem.bet_id}
            </span>
            <Copy text={betItem.bet_id ?? ""} className="w-3.5 h-3.5 sm:block hidden" />
          </td>
          <td className="py-3 sm:w-[15%] w-[20%] px-0 sm:px-2">
            <div className="flex items-center gap-2 font-semibold justify-center tabular-nums">
              {/* <CurrencyIcon className="h-4 w-4" currency={betItem.real_currency ?? "USD"} /> */}
              <span className="block" title={betAmountInfo.formatted}>
                {betAmountInfo.formatted}
              </span>
            </div>
          </td>
          <td className="px-2 py-3 text-center font-semibold sm:w-[15%] w-[20%]">
            <span className="inline-block w-full tabular-nums" title={parseX(betItem)}>
              {parseX(betItem)}
            </span>
          </td>
          <td className="pr-2 pl-0 sm:px-2 py-3 text-right sm:w-[20%] w-[30%]">
            <div className="flex items-center justify-end gap-2 font-semibold sm:mr-5 tabular-nums">
              <span className="truncate block" title={winAmountInfo.formatted}>
                {winAmountInfo.formatted}
              </span>
              <CurrencyIcon className="h-4 w-4" currency={betItem.real_currency ?? "USD"} />
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="rounded-field border-base-200 border">
      <div className="relative rounded-t-field overflow-hidden min-h-[360px] md:min-h-[420px]">
        <table className="w-full table-fixed text-sm text-base-content">
          <thead className="bg-base-300 text-xs font-semibold uppercase tracking-widest text-base-content border-b border-base-200">
            <tr className="sm:text-sm text-xs">
              <th className="px-4 py-4 text-left sm:w-[50%] w-[30%]">{t("gameDetail:betId")}</th>
              <th className="px-4 py-4 text-center sm:w-[15%] w-[20%]">{t("gameDetail:bet")}</th>
              <th className="px-2 py-4 text-center sm:w-[15%] w-[20%]">{t("gameDetail:x")}</th>
              <th className="px-4 py-4 text-right sm:w-[20%] w-[30%]">{t("gameDetail:profit")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-300/60">
            {isInitialLoading ? (
              <tr>
                <td colSpan={4} className="py-10">
                  <div className="flex items-center justify-center">
                    <span className="loading loading-spinner loading-sm text-base-content"></span>
                  </div>
                </td>
              </tr>
            ) : showEmptyState ? (
              <tr>
                <td colSpan={4} className="py-10">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <img
                      src="/images/illustrations/no-data.svg"
                      alt="mybets"
                      className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 opacity-70"
                    />
                    <div className="text-xs sm:text-sm md:text-base font-semibold text-base-content/60">
                      {t("gameDetail:noRecordsFound")}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              renderTableRows()
            )}
          </tbody>
        </table>

        {isAwaitingDesiredPage && (
          <div className="absolute inset-0 flex items-center justify-center bg-base-200/50">
            <span className="loading loading-spinner loading-sm text-base-content"></span>
          </div>
        )}
      </div>

      {isFetchingNextPage && !isAwaitingDesiredPage && (
        <div className="flex items-center justify-center py-4">
          <span className="loading loading-spinner loading-sm text-base-content"></span>
        </div>
      )}

      {safeTotalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-3 py-5 sm:py-3 px-3 sm:px-6 w-full bg-base-300 rounded-b-field">
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
              className={`btn btn-sm btn-square rounded-field ${
                page === currentPage ? "btn-primary text-black" : ""
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => canGoNext && handlePageChange(Math.min(safeTotalPages, currentPage + 1))}
            disabled={!canGoNext || isFetchingNextPage}
            className="btn btn-sm btn-square disabled:opacity-30"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
