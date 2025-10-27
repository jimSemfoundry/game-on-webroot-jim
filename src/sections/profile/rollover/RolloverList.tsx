import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { CountryIcon } from "@/components/ui/CountryIcon";
import { cn } from "@/utils/cn";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { EnrichedRolloverRecord } from "./types";
import { RolloverDetailsDialog } from "./RolloverDetailsDialog";
import { useRolloverDetailMapper } from "./RolloverDetailMapper";

interface RolloverListProps {
  records: EnrichedRolloverRecord[];
  isLoading?: boolean;
  isFetching?: boolean;
}

const fiatCurrencies = new Set(["PHP", "USD", "EUR", "GBP", "CNY", "JPY", "KRW"]);

const getCurrencyIcon = (currency: string | undefined) => {
  if (!currency) return null;
  if (fiatCurrencies.has(currency)) {
    return <CountryIcon code={currency} className="w-4 h-4" />;
  }
  return <CurrencyIcon currency={currency} className="w-4 h-4" />;
};

const formatAmount = (value: number) => {
  if (!Number.isFinite(value)) return "0.00";
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const statusVariants: Record<string, string> = {
  "Not Started": "bg-warning text-warning-content",
  Ongoing: "bg-info text-info-content",
  Done: "bg-success text-success-content",
};

export function RolloverList({ records, isLoading, isFetching }: RolloverListProps) {
  const { t } = useTranslation();
  const [selectedRecord, setSelectedRecord] = useState<EnrichedRolloverRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const mapRolloverDetail = useRolloverDetailMapper();

  const handleRowClick = (record: EnrichedRolloverRecord) => {
    setSelectedRecord(record);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedRecord(null);
  };

  const mappedDetail = selectedRecord ? mapRolloverDetail({ record: selectedRecord, t }) : null;

  const renderStatusLabel = (statusKey: string) => {
    const key =
      statusKey === "Done"
        ? "done"
        : statusKey === "Ongoing"
          ? "ongoing"
          : statusKey === "Not Started"
            ? "notStarted"
            : "unknown";

    return t(`transaction:transactionStatus.${key}`, statusKey);
  };

  const renderProgressText = (item: EnrichedRolloverRecord) => {
    if (item.statusKey === "Done") {
      return formatAmount(item.goalAmount);
    }

    if (item.goalAmount <= 0) {
      return formatAmount(item.progressAmount);
    }

    return `${formatAmount(item.progressAmount)} / ${formatAmount(item.goalAmount)}`;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <span className="loading loading-spinner loading-xl text-primary"></span>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/images/illustrations/no-data.svg"
            alt="No data"
            className="w-32 h-32 sm:w-40 sm:h-40 opacity-50"
          />
          <div className="text-base-content/50 text-sm font-semibold">
            {t("transaction:common.noRolloverRecords", "No rollover records found")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-[450px]">
      {isFetching && (
        <div className="absolute inset-0 bg-base-200/50 backdrop-blur-sm z-20 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      <div className="hidden sm:block flex-1 overflow-y-auto px-4">
        <table className="w-full table-fixed text-sm text-base-content border-separate border-spacing-y-1">
          <colgroup>
            <col className="w-[20%]" />
            <col className="w-[24%]" />
            <col className="w-[26%]" />
            <col className="w-[16%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-base-200 text-xs font-semibold uppercase text-base-content/60 tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">
                {t("transaction:tableHeaders.type")}
              </th>
              <th className="px-4 py-3 text-left">
                {t("transaction:tableHeaders.time")}
              </th>
              <th className="px-4 py-3 text-left">
                {t("transaction:rollover.progress", "Progress")}
              </th>
              <th className="px-4 py-3 text-right">
                {t("transaction:rollover.totalWagerRequired", "Goal")}
              </th>
              <th className="px-4 py-3 text-right">
                {t("transaction:tableHeaders.status")}
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((item, index) => (
              <tr
                key={item.id ?? index}
                onClick={() => handleRowClick(item)}
                className={cn(
                  "rounded-lg transition-colors border border-transparent cursor-pointer",
                  index % 2 === 0 ? "bg-base-300 hover:bg-base-300/50" : "bg-base-200 hover:bg-base-300/50"
                )}
              >
                <td className="px-4 py-3 rounded-l-lg align-middle">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase w-fit">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="flex-shrink-0"
                    >
                      <circle cx="6" cy="6" r="6" fill="currentColor" />
                    </svg>
                    {item.network === "bonus"
                      ? t("transaction:transactionTypes.bonus")
                      : t("transaction:transactionTypes.deposit")}
                  </span>
                </td>

                <td className="px-4 py-3 align-middle text-left text-xs text-base-content/60 font-medium">
                  {item.created_at
                    ? dayjs(item.created_at * 1000).format("YYYY/MM/DD HH:mm:ss")
                    : t("transaction:tableHeaders.timePlaceholder", "—")}
                </td>

                <td className="px-4 py-3 align-middle">
                  <div className="flex flex-col gap-2">
                    <div className="h-2 w-full rounded-full bg-base-content/15">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${Math.max(0, Math.min(1, item.progressPercent)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 align-middle text-right">
                  <div className="flex items-center justify-end gap-2 font-semibold text-sm text-primary">
                    <span>
                      {formatAmount(item.progressAmount)} / {formatAmount(item.goalAmount)}
                    </span>
                    {getCurrencyIcon(item.currency)}
                  </div>
                </td>

                <td className="px-4 py-3 rounded-r-lg text-right align-middle">
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase justify-end min-w-[90px]",
                      statusVariants[item.statusKey] ?? "bg-base-300 text-base-content"
                    )}
                  >
                    {renderStatusLabel(item.statusKey)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden flex-1 overflow-y-auto space-y-2 pb-5 px-2">
        <div className="flex items-center justify-between px-2 text-[11px] font-semibold uppercase text-base-content/40">
          <span>{t("transaction:tableHeaders.type")} | {t("transaction:tableHeaders.time")}</span>
          <span>{t("transaction:tableHeaders.status")} | {t("transaction:tableHeaders.amount")}</span>
        </div>
        {records.map((item, index) => (
          <div
            key={item.id ?? index}
            onClick={() => handleRowClick(item)}
            className={cn(
              "rounded-2xl px-4 py-3 flex flex-col gap-3 cursor-pointer",
              index % 2 === 0 ? "bg-base-300/30" : "bg-base-300/50"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1 text-left">
                <span className="text-sm font-semibold uppercase text-base-content">
                  {item.network === "bonus"
                    ? t("transaction:transactionTypes.bonus")
                    : t("transaction:transactionTypes.deposit")}
                </span>
                <span className="text-xs text-base-content/60 font-medium">
                  {item.created_at
                    ? dayjs(item.created_at * 1000).format("YYYY/MM/DD HH:mm:ss")
                    : t("transaction:tableHeaders.timePlaceholder", "—")}
                </span>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase justify-center min-w-[72px]",
                    statusVariants[item.statusKey] ?? "bg-base-300 text-base-content"
                  )}
                >
                  {renderStatusLabel(item.statusKey)}
                </span>

                <span className="flex items-center gap-2 text-primary font-bold text-sm">
                  {renderProgressText(item)}
                  {getCurrencyIcon(item.currency)}
                </span>
              </div>
            </div>

            {item.statusKey !== "Done" && (
              <div className="flex flex-col gap-2">
                <div className="h-2 w-full rounded-full bg-base-content/15">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.max(0, Math.min(1, item.progressPercent)) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <RolloverDetailsDialog 
        isOpen={isDialogOpen} 
        onClose={handleCloseDialog} 
        detail={mappedDetail} 
      />
    </div>
  );
}
