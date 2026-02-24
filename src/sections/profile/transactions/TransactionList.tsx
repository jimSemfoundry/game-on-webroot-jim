import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { cn } from "@/utils/cn";
import dayjs from "dayjs";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { Transaction } from "./types";
import { getTransactionStatus } from "@/sections/profile/transactions/helper.ts";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  isFetching?: boolean;
  transactionType: string;
  onTransactionClick?: (transaction: Transaction, meta: { transactionType: string }) => void;
}

const normalizeStatus = (status: string | number | undefined | null): string | undefined => {
  if (status === null || status === undefined) return undefined;

  if (typeof status === "number") {
    switch (status) {
      case 0:
      case 3:
        return "PROCESSING";
      case 1:
        return "SUCCESS";
      case 2:
      case 4:
      case 8:
        return "FAILED";
      default:
        return String(status).toUpperCase();
    }
  }

  const numeric = Number(status);
  if (!Number.isNaN(numeric)) {
    return normalizeStatus(numeric);
  }

  return String(status).toUpperCase();
};

const getDisplayTimestamp = (item: Transaction) => {
  const candidate =
    typeof item.created_at === "number"
      ? item.created_at
      : typeof item.updated_at === "number"
        ? item.updated_at
        : typeof item.date === "string"
          ? dayjs(item.date).unix()
          : undefined;

  if (typeof candidate === "number") {
    return dayjs.unix(candidate).format("YYYY/MM/DD HH:mm:ss");
  }

  return "";
};


const resolveAmountValue = (item: Transaction, type: string) => {
  if (type === "Bonus") {
    return (
      item.bonus ??
      item.amount ??
      item.amount_real ??
      item.amountReal ??
      0
    );
  }

  if (type === "Referral") {
    return (
      item.reward ??
      item.amount ??
      item.amount_real ??
      item.amountReal ??
      0
    );
  }

  if (type === "Commission") {
    return (
      item.commission_amount ??
      item.reward ??
      item.amount ??
      item.amount_real ??
      item.amountReal ??
      0
    );
  }

  return (
    item.amount ??
    item.amount_real ??
    item.amountReal ??
    item.reward ??
    item.commission_amount ??
    item.commissionAmount ??
    item.bonus ??
    item.to_amount ??
    item.from_amount ??
    item.toAmount ??
    item.fromAmount ??
    0
  );
};


const getStatusColor = (status: string | number | undefined | null) => {
  const normalized = normalizeStatus(status);
  if (!normalized) return "bg-base-300 text-base-content";

  switch (normalized) {
    case "PROCESSING":
    case "PENDING":
      return "bg-warning text-warning-content";
    case "SUCCESS":
    case "COMPLETED":
      return "bg-success text-success-content";
    case "FAILED":
    case "EXPIRED":
    case "CANCELLED":
      return "bg-error text-error-content";
    default:
      return "bg-base-300 text-base-content";
  }
};

const getStatusLabel = (status: string | number | undefined | null, t: ReturnType<typeof useTranslation>["t"]) => {
  const normalized = normalizeStatus(status);
  if (!normalized) {
    return t("transaction:transactionStatus.unknown", "Unknown");
  }

  switch (normalized) {
    case "PROCESSING":
    case "PENDING":
      return t("transaction:transactionStatus.pending");
    case "SUCCESS":
    case "COMPLETED":
      return t("transaction:transactionStatus.completed");
    case "FAILED":
    case "EXPIRED":
    case "CANCELLED":
      return t("transaction:transactionStatus.failed");
    default:
      return normalized;
  }
};

const getTransactionTypeLabel = (transactionType: string, item: Transaction, t: ReturnType<typeof useTranslation>["t"]) => {
  switch (transactionType) {
    case "Deposit": {
      const type = (item.deposit_type ?? item.network)?.toString().toLowerCase();
      return type === "fiat"
        ? t("transaction:transactionTypes.fiatDeposit")
        : t("transaction:transactionTypes.cryptoDeposit");
    }
    case "Withdraw": {
      const type = (item.withdraw_type ?? item.network)?.toString().toLowerCase();
      return type === "fiat"
        ? t("transaction:transactionTypes.fiatWithdraw")
        : t("transaction:transactionTypes.cryptoWithdraw");
    }
    case "Bonus":
      // return t("transaction:transactionTypes.bonus");
      return t(`bonus:item.${item?.note?.toLowerCase()}`, 'BONUS')
    case "Swap":
      return t("finance:swap", "Swap");
    case "Referral":
      return t("transaction:transactionTypes.referral");
    case "Commission":
      return t("transaction:transactionTypes.commission");
    default:
      return transactionType;
  }
};

export function TransactionList({
                                  transactions,
                                  isLoading,
                                  isFetching,
                                  transactionType,
                                  onTransactionClick
                                }: TransactionListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const renderSwapAmount = (item: Transaction, orientation: "row" | "column" = "row") => {
    const fromAmount = Number(item.from_amount ?? item.fromAmount ?? 0);
    const toAmount = Number(item.to_amount_received ?? item.toAmountReceived ?? 0);
    const fromCurrency = String(item.from_currency ?? item.fromCurrency ?? "USD");
    const toCurrency = String(item.to_currency ?? item.toCurrency ?? "USD");

    const fromConverted = formatWithConversion(fromAmount, fromCurrency, {
      showSymbol: true,
      showCode: false,
      minimizeDecimals: true
    });

    const toConverted = formatWithConversion(toAmount, toCurrency, {
      showSymbol: true,
      showCode: false,
      minimizeDecimals: true
    });

    const containerClass =
      orientation === "row"
        ? "flex items-center justify-end rtl:justify-start gap-3"
        : "flex flex-col items-end rtl:items-start gap-1";

    return (
      <div className={containerClass}>
        <div className="flex items-center gap-1.5 text-error font-bold text-base">
          <span>-{fromConverted.formatted}</span>
          {fromCurrency && <CurrencyIcon currency={fromCurrency} className="w-4 h-4" />}
        </div>
        <div className="flex items-center gap-1.5 text-success font-bold text-base">
          <span>+{toConverted.formatted}</span>
          {toCurrency && <CurrencyIcon currency={toCurrency} className="w-4 h-4" />}
        </div>
      </div>
    );
  };

  const renderStandardAmount = (item: Transaction, type: string, orientation: "row" | "column" = "row") => {
    const amount = resolveAmountValue(item, type);
    const currency =
      item.currency ??
      item.reward_currency ??
      item.rewardCurrency ??
      item.currency_code ??
      item.currencyCode ??
      item.to_currency ??
      item.from_currency ??
      item.toCurrency ??
      item.fromCurrency ??
      "USD";

    const converted = formatWithConversion(amount, String(currency), {
      showSymbol: true,
      showCode: false,
      minimizeDecimals: true
    });

    const containerClass =
      orientation === "row"
        ? "flex items-center justify-end rtl:justify-start gap-2 text-primary font-bold text-xs"
        : "flex items-end rtl:items-start gap-1 text-primary font-bold text-xs";

    return (
      <div className={containerClass}>
        <span>{converted.formatted}</span>
        {currency && <CurrencyIcon currency={String(currency)} className="w-4 h-4" />}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <span className="loading loading-spinner loading-xl text-primary"></span>
      </div>
    );
  }

  const renderEmptyState = () => (
    <div className="bg-base-300 rounded-field flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <img
          src="/images/illustrations/no-data.svg"
          alt="No data"
          className="w-32 h-32 sm:w-40 sm:h-40 opacity-50"
        />
        <div className="text-base-content/50 text-sm font-semibold">
          {t("common:common.noData", "No transactions yet")}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-col">
      {isFetching && (
        <div className="absolute inset-0 bg-base-200/50 backdrop-blur-sm z-20 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      <div ref={scrollContainerRef} className="hidden sm:block flex-1 overflow-y-auto">
        <table className="w-full table-fixed text-sm text-base-content border-separate border-spacing-y-1">
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[28%]" />
            <col className="w-[26%]" />
            <col className="w-[18%]" />
          </colgroup>
          <thead
            className="sticky top-0 z-10 bg-base-200 text-xs font-semibold uppercase text-base-content/50 tracking-wide">
          <tr>
            <th className="px-4 py-3 text-left rtl:text-right">
              {t("transaction:tableHeaders.type")}
            </th>
            <th className="px-4 py-3 text-left rtl:text-right">
              {t("transaction:tableHeaders.time")}
            </th>
            <th className="px-4 py-3 text-right rtl:text-left">
              {t("transaction:tableHeaders.amount")}
            </th>
            <th className="px-4 py-3 text-right rtl:text-left">
              {t("transaction:tableHeaders.status")}
            </th>
          </tr>
          </thead>
          <tbody className="relative">
          {transactions.map((item, index) => (
            <tr
              key={item.id ?? `${transactionType}-${index}`}
              className={cn(
                "rounded-lg transition-colors border border-transparent cursor-pointer bg-base-300 hover:bg-base-300/80"
              )}
              onClick={() => onTransactionClick?.(item, { transactionType })}
            >
              <td className="px-4 py-3 rounded-l-lg align-middle rtl:rounded-l-none rtl:rounded-r-lg min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-primary text-xs font-bold uppercase min-w-0 max-w-full truncate sm:hidden">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        className="flex-shrink-0"
                      >
                        <circle cx="6" cy="6" r="6" fill="currentColor" />
                      </svg>
                      {getTransactionTypeLabel(transactionType, item, t)}
                    </span>
                    <div
                      className="tooltip tooltip-top hidden sm:block min-w-0 max-w-full"
                      data-tip={getTransactionTypeLabel(transactionType, item, t)}
                    >
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-primary text-xs font-bold uppercase min-w-0 max-w-full truncate w-full"
                      >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        className="flex-shrink-0"
                      >
                        <circle cx="6" cy="6" r="6" fill="currentColor" />
                      </svg>
                      {getTransactionTypeLabel(transactionType, item, t)}
                      </span>
                    </div>
                </div>
              </td>

              <td className="px-4 py-3 align-middle text-left rtl:text-right">
                  <span className="text-xs text-base-content/50 font-medium">
                    {getDisplayTimestamp(item) || t("transaction:tableHeaders.timePlaceholder", "—")}
                  </span>
              </td>

              <td className="px-4 py-3 text-right align-middle rtl:text-left">
                <span dir="ltr">
                  {transactionType === "Swap" ? renderSwapAmount(item) : renderStandardAmount(item, transactionType)}
                </span>
              </td>

              <td className="px-4 py-3 align-middle text-right rtl:text-left rounded-r-lg rtl:rounded-r-none rtl:rounded-l-lg">
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold min-w-[90px] justify-center",
                      getStatusColor(transactionType === "Referral" || transactionType === "Commission" ? "SUCCESS" : item.status)
                    )}
                  >
                    {transactionType === "Referral" || transactionType === "Commission"
                      ? t("transaction:transactionStatus.completed")
                      : getStatusLabel(item.status, t)}
                  </span>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
        {transactions.length === 0 && renderEmptyState()}
      </div>

      <div className="sm:hidden flex-1 overflow-y-auto space-y-2">
        {transactions.length > 0 && (
          <div
            className="flex items-center justify-between px-2 text-[11px] font-semibold uppercase text-base-content/50 text-xs">
            <span>
              {t("transaction:tableHeaders.type")} | {t("transaction:tableHeaders.time")}
            </span>
            <span>
              {t("transaction:tableHeaders.status")} | {t("transaction:tableHeaders.amount")}
            </span>
          </div>
        )}

        {transactions.length > 0 && transactions.map((item, index) => (
          <div
            key={item.id ?? `${transactionType}-mobile-${index}`}
            className={cn(
              "rounded-field px-4 py-3 flex flex-col gap-2 cursor-pointer bg-base-300"
            )}
            onClick={() => onTransactionClick?.(item, { transactionType })}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2 text-left">
                <span
                  className="inline-flex items-center gap-1.5 text-base-content text-xs font-semibold uppercase w-fit">
                  {getTransactionTypeLabel(transactionType, item, t)}
                </span>
                <span className="text-xs text-base-content/50 font-semibold">
                  {getDisplayTimestamp(item) || t("transaction:tableHeaders.timePlaceholder", "—")}
                </span>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={cn(
                    "inline-flex items-center px-3 h-4 rounded-field text-xs font-bold justify-center",
                    getTransactionStatus(transactionType, item.status).cls
                  )}
                >
                  {transactionType === "Referral" || transactionType === "Commission"
                    ? t("transaction:transactionStatus.completed")
                    : t(getTransactionStatus(transactionType, item.status).trans, String(item.status))}
                </span>

                {transactionType === "Swap"
                  ? renderSwapAmount(item, "column")
                  : renderStandardAmount(item, transactionType, "column")}
              </div>
            </div>
          </div>
        ))}
        {transactions.length === 0 && renderEmptyState()}
      </div>
    </div>
  );
}
