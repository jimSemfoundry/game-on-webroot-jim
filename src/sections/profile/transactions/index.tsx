import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Iconify from "@/components/iconify";
import { TransactionFilters } from "./TransactionFilters";
import { TransactionList } from "./TransactionList";
import { TransactionDetailsDialog } from "./TransactionDetailsDialog";
import type { TransactionFilters as TFilters, Transaction, TransactionType } from "./types";
import { useTransactionDetailMapper } from "./TransactionDetailMapper";
import dayjs from "dayjs";
import {
  useDepositRecords, 
  useWithdrawRecords, 
  useBonusRecords, 
  useSwapRecords,
  useReferralRecords,
  useCommissionRecords,
  useUserBalance,
  TRANSACTION_PAGE_SIZE
} from "@/query/transactions";

const extractTransactionPayload = (rawData: any) => {
  const payload = rawData?.data && !Array.isArray(rawData.data) ? rawData.data : rawData?.data ?? rawData;
  const pagination = payload?.pagination ?? rawData?.pagination;

  const records = Array.isArray(payload?.records)
    ? payload.records
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.list)
        ? payload.list
        : Array.isArray(rawData?.data)
          ? rawData.data
          : Array.isArray(payload)
            ? payload
            : [];

  const hasNext =
    typeof payload?.has_next === "boolean"
      ? payload.has_next
      : typeof payload?.has_more === "boolean"
        ? payload.has_more
        : typeof pagination?.has_more === "boolean"
          ? pagination.has_more
          : typeof rawData?.has_next === "boolean"
            ? rawData.has_next
            : typeof rawData?.has_more === "boolean"
              ? rawData.has_more
              : false;

  const totalPages =
    typeof payload?.total_pages === "number"
      ? payload.total_pages
      : typeof pagination?.last_page === "number"
        ? pagination.last_page
        : typeof rawData?.total_pages === "number"
          ? rawData.total_pages
          : undefined;

  const totalCount =
    typeof payload?.total === "number"
      ? payload.total
      : typeof pagination?.total === "number"
        ? pagination.total
        : typeof rawData?.total === "number"
          ? rawData.total
          : undefined;

  return { records, hasNext, totalPages, totalCount };
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
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<TFilters>({
    type: "Deposit",
    status: "All",
    asset: "all",
    period: "Past 24 Hours"
  });
  const [lastIdsMap, setLastIdsMap] = useState<Record<string, Record<number, string | number | undefined>>>({});

  const { data: balanceData } = useUserBalance();
  const userBalance = useMemo(() => balanceData?.pages[0]?.data || [], [balanceData]);

  const getPeriodTimestamp = (period: string): number | undefined => {
    const now = dayjs();
    const toUnix = (value: dayjs.Dayjs) => Math.floor(value.unix());
    
    switch (period) {
      case "Past 90 Days":
        return toUnix(now.subtract(90, "day"));
      case "Past 60 Days":
        return toUnix(now.subtract(60, "day"));
      case "Past 30 Days":
        return toUnix(now.subtract(30, "day"));
      case "Past 7 Days":
        return toUnix(now.subtract(7, "day"));
      case "Past 24 Hours":
        return toUnix(now.subtract(24, "hour"));
      default:
        return undefined;
    }
  };

  const baseQueryParams = useMemo(() => ({
    status: filters.status === "All" ? undefined : filters.status,
    end_timestamp: getPeriodTimestamp(filters.period),
    currency: filters.asset === "all" ? undefined : filters.asset,
  }), [filters]);

  const paginationKey = useMemo(() => JSON.stringify({
    type: filters.type,
    status: baseQueryParams.status ?? null,
    end_timestamp: baseQueryParams.end_timestamp ?? null,
    currency: baseQueryParams.currency ?? null,
  }), [filters.type, baseQueryParams.status, baseQueryParams.end_timestamp, baseQueryParams.currency]);

  const lastIdsForKey = lastIdsMap[paginationKey] ?? {};
  const lastIdForCurrentPage = currentPage > 1 ? lastIdsForKey[currentPage - 1] ?? 0 : 0;

  const paginatedParams = useMemo(() => ({
    ...baseQueryParams,
    limit: TRANSACTION_PAGE_SIZE,
    last_id: lastIdForCurrentPage,
  }), [baseQueryParams, lastIdForCurrentPage]);

  const referralParams = useMemo(() => ({
    end_timestamp: baseQueryParams.end_timestamp,
    currency: baseQueryParams.currency,
    limit: TRANSACTION_PAGE_SIZE,
    last_id: lastIdForCurrentPage,
  }), [baseQueryParams.end_timestamp, baseQueryParams.currency, lastIdForCurrentPage]);

  const activeType = filters.type;

  const depositQuery = useDepositRecords(paginatedParams, { enabled: activeType === "Deposit" });
  const withdrawQuery = useWithdrawRecords(paginatedParams, { enabled: activeType === "Withdraw" });
  const bonusQuery = useBonusRecords(paginatedParams, { enabled: activeType === "Bonus" });
  const swapQuery = useSwapRecords(paginatedParams, { enabled: activeType === "Swap" });
  const referralQuery = useReferralRecords(referralParams, { enabled: activeType === "Referral" });
  const commissionQuery = useCommissionRecords(referralParams, { enabled: activeType === "Commission" });
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<ReturnType<ReturnType<typeof useTransactionDetailMapper>> | null>(null);
  const mapTransactionDetail = useTransactionDetailMapper();

  const handleFiltersChange = (nextFilters: TFilters) => {
    setFilters(nextFilters);
    setCurrentPage(1);
    setLastIdsMap({});
  };

  const getCurrentQuery = () => {
    switch (filters.type) {
      case "Deposit":
        return depositQuery;
      case "Withdraw":
        return withdrawQuery;
      case "Bonus":
        return bonusQuery;
      case "Swap":
        return swapQuery;
      case "Referral":
        return referralQuery;
      case "Commission":
        return commissionQuery;
      default:
        return depositQuery;
    }
  };

  const currentQuery = getCurrentQuery();
  const { data, isLoading, isFetching } = currentQuery;
  const { records: transactions, hasNext: hasNextPage, totalPages: totalPagesFromApi, totalCount } = extractTransactionPayload(data);
  const derivedTotalPages = totalPagesFromApi ?? (typeof totalCount === "number" ? Math.ceil(totalCount / TRANSACTION_PAGE_SIZE) : undefined);
  const totalPages = derivedTotalPages ?? (hasNextPage ? currentPage + 1 : currentPage);
  const safeTotalPages = Math.max(totalPages, 1);
  const pageNumbers = useMemo(() => getPageNumbers(currentPage, safeTotalPages), [currentPage, safeTotalPages]);
  const canGoPrev = currentPage > 1;
  const hasKnownTotal = derivedTotalPages !== undefined;
  const hasCursorForNext = !!lastIdsForKey[currentPage];
  const canGoNext = hasKnownTotal ? currentPage < safeTotalPages : hasNextPage && hasCursorForNext;

  const handleTransactionClick = (transaction: Transaction, meta: { transactionType: string }) => {
    const detail = mapTransactionDetail({
      transaction,
      transactionType: meta.transactionType as TransactionType,
      t,
    });
    setSelectedDetail(detail);
    setIsDetailsOpen(true);
  };

  useEffect(() => {
    if (!paginationKey) return;
    if (!Array.isArray(transactions) || transactions.length === 0) return;
    const lastItem = transactions[transactions.length - 1];
    if (!lastItem?.id) return;

    setLastIdsMap((prev) => {
      const existingForKey = prev[paginationKey] ?? {};
      if (existingForKey[currentPage] === lastItem.id) {
        return prev;
      }
      return {
        ...prev,
        [paginationKey]: {
          ...existingForKey,
          [currentPage]: lastItem.id,
        },
      };
    });
  }, [transactions, paginationKey, currentPage]);

  return (
    <div className="bg-base-300 flex flex-col rounded-field overflow-hidden mx-0 sm:mx-5 md:mx-0">
      <div className="bg-base-200 flex items-center gap-2 px-4 sm:px-6 sm:pt-6 sm:pb-4 py-4">
        <Iconify icon="custom:transactions" width={20} height={20} className="text-primary" />
        <h3 className="text-base sm:text-lg font-bold">{t("profile:transactions")}</h3>
      </div>

      <div className="bg-base-200 px-4 sm:px-6">
        <TransactionFilters 
          filters={filters} 
          onFiltersChange={handleFiltersChange}
          userBalance={userBalance}
        />
      </div>

      <div className="bg-base-200 flex flex-col relative">
        <TransactionList 
          transactions={transactions} 
          isLoading={isLoading}
          isFetching={isFetching}
          transactionType={filters.type}
          onTransactionClick={handleTransactionClick}
        />

        {safeTotalPages > 1 && (
          <div className="flex items-center justify-center gap-1 sm:gap-2 py-5 px-4">
            <button
              onClick={() => canGoPrev && setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={!canGoPrev || isFetching}
              className="btn btn-sm btn-ghost btn-square rounded-2xl disabled:opacity-30"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {pageNumbers.map((page, index) => (
              <button
                key={`${page}-${index}`}
                onClick={() => typeof page === "number" && setCurrentPage(page)}
                disabled={page === "..." || isFetching}
                className={`btn btn-sm min-w-[2.5rem] rounded-2xl ${
                  page === currentPage ? "btn-primary text-black" : "btn-ghost bg-base-300/60 hover:bg-base-300"
                } ${page === "..." ? "cursor-default hover:bg-transparent" : ""}`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => canGoNext && setCurrentPage((page) => Math.min(safeTotalPages, page + 1))}
              disabled={!canGoNext || isFetching}
              className="btn btn-sm btn-ghost btn-square rounded-2xl disabled:opacity-30"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <TransactionDetailsDialog
        isOpen={isDetailsOpen && !!selectedDetail}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedDetail(null);
        }}
        detail={selectedDetail}
      />
    </div>
  );
}
