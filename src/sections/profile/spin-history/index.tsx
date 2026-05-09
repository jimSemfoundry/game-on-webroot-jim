import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Iconify from "@/components/iconify";
import { cn } from "@/utils/cn";
import { useActiveRecords } from "@/query/free-spins";
import { SpinHistoryFilters } from "./SpinHistoryFilters";
import { SpinHistoryList } from "./SpinHistoryList";
import type { StatusClassMap, StatusFilter, StatusOption } from "./types";
import {
  FREE_SPIN_STATUS_LABELS,
  FREE_SPIN_STATUS_CLASSES,
  FREE_SPIN_STATUS_I18N_KEYS,
  FreeSpinStatus,
  resolveFreeSpinStatus,
} from "@/types/freeSpins";

const statusLabel: Record<number, string> = FREE_SPIN_STATUS_LABELS;

const statusClass: StatusClassMap = FREE_SPIN_STATUS_CLASSES;

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

export const Index = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data, isLoading, isFetching } = useActiveRecords({ page, page_size: 10 });

  const rows = useMemo(() => {
    const list = data?.list || [];
    if (statusFilter === "all") return list;
    return list.filter((item: any) => resolveFreeSpinStatus(item) === statusFilter);
  }, [data?.list, statusFilter]);

  const totalPages = Math.max(data?.total_pages || 1, 1);
  const pageNumbers = getPageNumbers(page, totalPages);
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  const statusOptions: StatusOption[] = useMemo(
    () => [
      { value: "all", label: t("transaction:filters.all", "All") },
      ...Object.entries(statusLabel).map(([k, labelValue]) => {
        const statusValue = Number(k) as FreeSpinStatus;
        const i18nKey = FREE_SPIN_STATUS_I18N_KEYS[statusValue];
        return {
          value: statusValue as StatusFilter,
          label: i18nKey ? t(i18nKey, labelValue) : labelValue,
        };
      }),
    ],
    [t],
  );

  const formatStatus = (status?: number) => {
    if (status === undefined || status === null) return t("common:unknown", "Unknown");
    const normalizedStatus = Number(status) as FreeSpinStatus;
    const label = statusLabel[normalizedStatus];
    const i18nKey = FREE_SPIN_STATUS_I18N_KEYS[normalizedStatus];
    if (label && i18nKey) {
      return t(i18nKey, label);
    }
    return label || status.toString();
  };

  return (
    <div className="relative flex flex-col bg-base-200 rounded-field p-3 sm:p-6 gap-4">
      {isFetching && (
        <div className="absolute inset-0 bg-base-200 backdrop-blur-sm z-20 flex items-center justify-center rounded-box">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      <div className="flex items-center gap-2 text-base-content/80 font-semibold text-sm md:text-lg h-8">
        <Iconify icon="custom:free-spin" className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        <div>
          <p>{t("transaction:freeSpinRewards")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SpinHistoryFilters
          statusFilter={statusFilter}
          statusOptions={statusOptions}
          onStatusChange={(value) => {
            setPage(1);
            setStatusFilter(value);
          }}
        />
      </div>

      <SpinHistoryList
        rows={rows}
        isLoading={isLoading}
        isEmpty={rows.length === 0 && !isLoading}
        statusClass={statusClass}
        formatStatus={formatStatus}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 sm:gap-2 py-4">
          <button
            onClick={() => canGoPrev && setPage((prev) => Math.max(1, prev - 1))}
            disabled={!canGoPrev || isFetching}
            className="btn btn-sm btn-ghost btn-square rounded-2xl disabled:opacity-30"
            aria-label={t("common:prev", "Previous page")}
          >
            <svg className="rtl:rotate-180" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {pageNumbers.map((pageNumber, index) => (
            <button
              key={`${pageNumber}-${index}`}
              onClick={() => typeof pageNumber === "number" && setPage(pageNumber)}
              disabled={pageNumber === "..." || isFetching}
              className={cn(
                "btn btn-sm min-w-10 rounded-2xl",
                pageNumber === page
                  ? "btn-primary text-black"
                  : "btn-ghost bg-base-300/60 hover:bg-base-300",
                pageNumber === "..." && "cursor-default hover:bg-transparent",
              )}
            >
              {pageNumber}
            </button>
          ))}

          <button
            onClick={() => canGoNext && setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={!canGoNext || isFetching}
            className="btn btn-sm btn-ghost btn-square rounded-2xl disabled:opacity-30"
            aria-label={t("common:next", "Next page")}
          >
            <svg className="rtl:rotate-180" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
