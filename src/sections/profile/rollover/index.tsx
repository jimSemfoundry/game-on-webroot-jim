import Iconify from "@/components/iconify";
import { ROLLOVER_PAGE_SIZE, useRolloverRecords } from "@/query/rollover";
import { cn } from "@/utils/cn";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "../c/Card";
import { RolloverFilters } from "./RolloverFilters";
import { RolloverList } from "./RolloverList";
import type { EnrichedRolloverRecord, RolloverRecord, RolloverStatusKey, RolloverTypeKey } from "./types";

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

const extractRolloverPayload = (rawData: any) => {
  const payload = rawData?.data && !Array.isArray(rawData.data) ? rawData.data : (rawData?.data ?? rawData);

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
        : typeof rawData?.has_next === "boolean"
          ? rawData.has_next
          : typeof rawData?.has_more === "boolean";

  const totalPages =
    typeof payload?.total_pages === "number"
      ? payload.total_pages
      : typeof rawData?.total_pages === "number"
        ? rawData.total_pages
        : undefined;

  const totalCount = typeof payload?.total === "number" ? payload.total : typeof rawData?.total === "number" ? rawData.total : undefined;

  return {
    records,
    hasNext: Boolean(hasNext),
    totalPages,
    totalCount,
  };
};

const parseAmount = (value: string | number | undefined | null) => {
  if (value === undefined || value === null) return 0;
  const parsed = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const calculateStatusKey = (record: RolloverRecord) => {
  const goal = parseAmount(record.max_wager ?? record.amount);
  const remaining = parseAmount(record.wager);

  if (goal <= 0) {
    return "Done";
  }

  if (remaining <= 0) {
    return "Done";
  }

  if (remaining >= goal) {
    return "Not Started";
  }

  return "Ongoing";
};

const enrichRecords = (records: RolloverRecord[]): EnrichedRolloverRecord[] => {
  return records.map((record) => {
    const goalAmount = parseAmount(record.max_wager ?? record.amount);
    const remaining = parseAmount(record.wager);
    const progressAmount = Math.min(goalAmount, Math.max(0, goalAmount - remaining));
    const denominator = goalAmount > 0 ? goalAmount : Math.max(progressAmount, 1);
    const statusKey = calculateStatusKey(record);

    return {
      ...record,
      goalAmount: goalAmount > 0 ? goalAmount : progressAmount,
      progressAmount,
      progressPercent: denominator > 0 ? progressAmount / denominator : 0,
      statusKey,
    };
  });
};

export function Index() {
  const { t } = useTranslation();

  const [selectedType, setSelectedType] = useState<RolloverTypeKey>("All");
  const [selectedStatus, setSelectedStatus] = useState<RolloverStatusKey>("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastIdsMap, setLastIdsMap] = useState<Record<string, Record<number, number | string>>>({});

  const baseParams = useMemo(
    () => ({
      type: selectedType === "All" ? undefined : selectedType.toLowerCase(),
      statuses: selectedStatus === "All Statuses" ? undefined : selectedStatus,
    }),
    [selectedType, selectedStatus],
  );

  const paginationKey = useMemo(
    () =>
      JSON.stringify({
        type: baseParams.type ?? null,
        statuses: baseParams.statuses ?? null,
      }),
    [baseParams.type, baseParams.statuses],
  );

  const lastIdsForKey = lastIdsMap[paginationKey] ?? {};
  const lastIdForCurrentPage = currentPage > 1 ? (lastIdsForKey[currentPage - 1] ?? 0) : 0;

  const rolloverQuery = useRolloverRecords(
    {
      ...baseParams,
      limit: ROLLOVER_PAGE_SIZE,
      last_id: lastIdForCurrentPage,
    },
    { enabled: true },
  );

  const { data, isLoading, isFetching } = rolloverQuery;
  const { records, hasNext, totalPages: apiTotalPages, totalCount } = extractRolloverPayload(data);

  const enrichedRecords = useMemo(() => enrichRecords(records), [records]);

  const derivedTotalPages = apiTotalPages ?? (typeof totalCount === "number" ? Math.ceil(totalCount / ROLLOVER_PAGE_SIZE) : undefined);
  const totalPages = derivedTotalPages ?? (hasNext ? currentPage + 1 : currentPage);
  const safeTotalPages = Math.max(totalPages, 1);
  const pageNumbers = useMemo(() => getPageNumbers(currentPage, safeTotalPages), [currentPage, safeTotalPages]);
  const canGoPrev = currentPage > 1;
  const hasKnownTotal = derivedTotalPages !== undefined;
  const canGoNext = hasKnownTotal ? currentPage < safeTotalPages : hasNext && enrichedRecords.length > 0;

  useEffect(() => {
    if (!paginationKey) return;
    if (enrichedRecords.length === 0) return;
    const lastRecord = enrichedRecords[enrichedRecords.length - 1];
    if (lastRecord?.id === undefined) return;

    setLastIdsMap((prev) => {
      const existing = prev[paginationKey] ?? {};
      if (existing[currentPage] === lastRecord.id) {
        return prev;
      }
      return {
        ...prev,
        [paginationKey]: {
          ...existing,
          [currentPage]: lastRecord.id as number | string,
        } as Record<number, number | string>,
      };
    });
  }, [paginationKey, enrichedRecords, currentPage]);

  const handleTypeChange = (value: RolloverTypeKey) => {
    setSelectedType(value);
    setCurrentPage(1);
    setLastIdsMap({});
  };

  const handleStatusChange = (value: RolloverStatusKey) => {
    setSelectedStatus(value);
    setCurrentPage(1);
    setLastIdsMap({});
  };

  return (
    <div className="bg-base-300 flex flex-col rounded-field overflow-visible">
      <Card
        icon={<Iconify icon="custom:rollover" className="text-primary w-4 h-4 sm:w-5 sm:h-5" />}
        title={t("transaction:tabs.rollover", "Rollover")}
      >
        <RolloverFilters
          selectedType={selectedType}
          selectedStatus={selectedStatus}
          onTypeChange={handleTypeChange}
          onStatusChange={handleStatusChange}
        />

        <div className="bg-base-200 flex flex-col relative">
          <RolloverList records={enrichedRecords} isLoading={isLoading} isFetching={isFetching} />

          {(safeTotalPages > 1 || canGoNext) && (
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
                  className={cn(
                    "btn btn-sm min-w-[2.5rem] rounded-2xl",
                    page === currentPage ? "btn-primary text-black" : "btn-ghost bg-base-300/60 hover:bg-base-300",
                    page === "..." && "cursor-default hover:bg-transparent",
                  )}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => canGoNext && setCurrentPage((page) => page + 1)}
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
    </div>
  );
}
