import Iconify from "@/components/iconify";
import {
  TRANSACTION_PAGE_SIZE,
  useBonusRecords, useBonusWalletRecords,
  useBountyClaimRecords,
  useCommissionRecords,
  useDepositRecords,
  useReferralRecords,
  useSportsBonusWalletRecords,
  useSwapRecords,
  useUserBalance,
  useWithdrawRecords
} from "@/query/transactions";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "../c/Card";
import { useTransactionDetailMapper } from "./TransactionDetailMapper";
import { TransactionDetailsDialog } from "./TransactionDetailsDialog";
import { TransactionFilters } from "./TransactionFilters";
import { TransactionList } from "./TransactionList";
import type { TransactionFilters as TFilters, Transaction, TransactionType } from "./types";

const extractTransactionPayload = (rawData: any, extra?: string) => {
  const payload = rawData?.data && !Array.isArray(rawData.data) ? rawData.data : (rawData?.data ?? rawData);
  const pagination = payload?.pagination ?? rawData?.pagination;
  const last_created_at = rawData?.last_created_at ?? 0;

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

  const chunkPaired = extra === 'BonusStore' || extra === 'SportsBonusStore';
  // 按 (note, source_id) 分组而不是盲目 chunk(2)：
  // 旧的 purchase / bonus_claim 写入是成对（2 行同 source_id+同 note）；
  // 新的 b03_sports_bonus_wallet_promo_grant 是单行；
  // 直接 chunk(2) 在出现单行时会错配到下一对里，render 端解构 b 时 crash。
  const groupedRecords = chunkPaired
    ? (() => {
        const groups: Record<string, Transaction[]> = {};
        const order: string[] = [];
        for (const r of records as Transaction[]) {
          const key = `${r.note ?? ''}::${r.source_id ?? r.source ?? r.id ?? ''}`;
          if (!groups[key]) {
            groups[key] = [];
            order.push(key);
          }
          groups[key].push(r);
        }
        return order.map(k => groups[k]);
      })()
    : records;
  return { records: groupedRecords, hasNext, totalPages, totalCount, last_created_at };
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
  const { t } = useTranslation('profile');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<TFilters>({
    type: "Bonus",
    status: "All",
    asset: "all",
    period: "Past 30 Days",
  });
  const [lastCtdMap, setLastCtdMap] = useState<Record<string, Record<number, number | undefined>>>({});
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

  const baseQueryParams = useMemo(
    () => ({
      status: filters.status === "All" ? undefined : filters.status,
      end_timestamp: getPeriodTimestamp(filters.period),
      currency: filters.asset === "all" ? undefined : filters.asset,
    }),
    [filters],
  );

  const paginationKey = useMemo(
    () =>
      JSON.stringify({
        type: filters.type,
        status: baseQueryParams.status ?? null,
        end_timestamp: baseQueryParams.end_timestamp ?? null,
        currency: baseQueryParams.currency ?? null,
      }),
    [filters.type, baseQueryParams.status, baseQueryParams.end_timestamp, baseQueryParams.currency],
  );

  const lastIdsForKey = lastIdsMap[paginationKey] ?? {};
  const lastIdForCurrentPage = currentPage > 1 ? (lastIdsForKey[currentPage - 1] ?? 0) : 0;

  const paginatedParams = useMemo(
    () => ({
      ...baseQueryParams,
      limit: TRANSACTION_PAGE_SIZE,
      last_id: lastIdForCurrentPage,
    }),
    [baseQueryParams, lastIdForCurrentPage],
  );

  const referralParams = useMemo(
    () => ({
      end_timestamp: baseQueryParams.end_timestamp,
      currency: baseQueryParams.currency,
      limit: TRANSACTION_PAGE_SIZE,
      page: currentPage,
    }),
    [baseQueryParams.end_timestamp, baseQueryParams.currency, currentPage],
  );

  const commissionParams = useMemo(
    () => ({
      end_timestamp: baseQueryParams.end_timestamp,
      currency: baseQueryParams.currency,
      limit: TRANSACTION_PAGE_SIZE,
      page: currentPage,
    }),
    [baseQueryParams.end_timestamp, baseQueryParams.currency, currentPage],
  );

  const lastCtdForKey = lastCtdMap[paginationKey] ?? {};
  const lastCtdForCurrentPage = currentPage > 1 ? (lastCtdForKey[currentPage - 1] ?? 0) : 0;

  const dollarsParams = useMemo(
    () => ({
      end_timestamp: baseQueryParams.end_timestamp,
      currency: "",
      limit: TRANSACTION_PAGE_SIZE,
      last_created_at: lastCtdForCurrentPage,
    }),
    [baseQueryParams.end_timestamp, baseQueryParams.currency, currentPage],
  );

  const activeType = filters.type;

  const bountyParams = useMemo(
    () => ({
      page: currentPage,
      limit: TRANSACTION_PAGE_SIZE,
    }),
    [currentPage],
  );

  const depositQuery = useDepositRecords(paginatedParams, { enabled: activeType === "Deposit" });
  const withdrawQuery = useWithdrawRecords(paginatedParams, { enabled: activeType === "Withdraw" });
  const bonusQuery = useBonusRecords(paginatedParams, { enabled: activeType === "Bonus" });
  const bountyQuery = useBountyClaimRecords(bountyParams, { enabled: activeType === "Bounty" });
  const swapQuery = useSwapRecords(paginatedParams, { enabled: activeType === "Swap" });
  const referralQuery = useReferralRecords(referralParams, { enabled: activeType === "Referral" });
  const commissionQuery = useCommissionRecords(commissionParams, { enabled: activeType === "Commission" });
  const dollarsQuery = useBonusWalletRecords(dollarsParams, { enabled: activeType === "BonusStore" });
  const sportsDollarsQuery = useSportsBonusWalletRecords(dollarsParams, { enabled: activeType === "SportsBonusStore" });

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
      case "Bounty":
        return bountyQuery;
      case "BonusStore":
        return dollarsQuery;
      case "SportsBonusStore":
        return sportsDollarsQuery;
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
  const { records: transactions, hasNext: hasNextPage, totalPages: totalPagesFromApi, totalCount, last_created_at } = extractTransactionPayload(data, filters.type);
  const derivedTotalPages =
    totalPagesFromApi ?? (typeof totalCount === "number" ? Math.ceil(totalCount / TRANSACTION_PAGE_SIZE) : undefined);
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

  useEffect(() => {
    if (!last_created_at) return;

    setLastCtdMap((prev) => {
      const existingForKey = prev[paginationKey] ?? {};
      if (existingForKey[currentPage] === last_created_at) {
        return prev;
      }
      return {
        ...prev,
        [paginationKey]: {
          ...existingForKey,
          [currentPage]: last_created_at,
        },
      };
    });
  }, [last_created_at]);

  return (
    <div className="bg-base-300 flex flex-col rounded-field overflow-visible">
      <div className={`flex flex-col gap-4 flex-1 pb-5 md:p-0`}>
        <Card
          icon={<Iconify icon="custom:transactions" className="text-primary w-4 h-4 sm:w-5 sm:h-5" />}
          title={t("profile:transactions")}
        >
          <TransactionFilters filters={filters} onFiltersChange={handleFiltersChange} userBalance={userBalance} />

          <div className="bg-base-200 flex flex-col relative">
            <TransactionList
              transactions={transactions}
              isLoading={isLoading}
              isFetching={isFetching}
              transactionType={filters.type}
              onTransactionClick={handleTransactionClick}
            />

            {safeTotalPages > 1 && (
              <div className="flex items-center justify-center gap-1 sm:gap-2 py-5 px-3 sm:px-6">
                <button
                  onClick={() => canGoPrev && setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={!canGoPrev || isFetching}
                  className="btn btn-sm btn-ghost btn-square rounded-2xl disabled:opacity-30"
                >
                  <svg className="rtl:rotate-180" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                  <svg className="rtl:rotate-180" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </Card>
        <TransactionDetailsDialog
          isOpen={isDetailsOpen && !!selectedDetail}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedDetail(null);
          }}
          detail={selectedDetail}
        />
      </div>
    </div>
  );
}
