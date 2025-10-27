import { memo } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import Copy from "@/components/ui/Copy";
import { cn } from "@/utils/cn";
import type { BetHistoryRecord } from "@/types/bet-history";

interface BetHistoryTableProps {
  records: BetHistoryRecord[];
  isLoading?: boolean;
  isFetchingMore?: boolean;
  showNoMore?: boolean;
  emptyMessage?: string;
}

const parseAmount = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "");
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const resolveFirstString = (...candidates: unknown[]): string | undefined => {
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
    if (typeof candidate === "number") {
      return String(candidate);
    }
  }
  return undefined;
};

const resolveTimestamp = (...candidates: unknown[]): string | undefined => {
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;

    if (typeof candidate === "number") {
      const normalized = candidate > 1_000_000_000_000 ? candidate : candidate * 1000;
      return dayjs(normalized).isValid() ? dayjs(normalized).format("YYYY/MM/DD HH:mm:ss") : undefined;
    }

    if (typeof candidate === "string") {
      const numeric = Number(candidate);
      if (!Number.isNaN(numeric)) {
        const normalized = numeric > 1_000_000_000_000 ? numeric : numeric * 1000;
        if (dayjs(normalized).isValid()) {
          return dayjs(normalized).format("YYYY/MM/DD HH:mm:ss");
        }
      }

      const parsed = dayjs(candidate);
      if (parsed.isValid()) {
        return parsed.format("YYYY/MM/DD HH:mm:ss");
      }
    }
  }

  return undefined;
};

const BetHistoryTableComponent = ({ records, isLoading, isFetchingMore, showNoMore, emptyMessage }: BetHistoryTableProps) => {
  const { t } = useTranslation();
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const renderAmount = (amount: number | undefined, currency?: string, forceNegative?: boolean, prefixPlus?: boolean) => {
    if (amount === undefined || !currency) {
      return "--";
    }

    const value = forceNegative ? -Math.abs(amount) : amount;
    const result = formatWithConversion(value, currency, {
      showSymbol: true,
      showCode: false,
      minimizeDecimals: true,
    });

    if (prefixPlus && value > 0 && !result.formatted.trim().startsWith("+")) {
      return `+${result.formatted}`;
    }

    return result.formatted;
  };

  const renderRows = () => {
    return records.map((record, index) => {
      const gameName = resolveFirstString(record.game_name, record.game, record.game_title, record.gameName) ?? "--";
      const provider =
        resolveFirstString(record.game_provider, record.provider, record.publisher, record.vendor, record.brand) ?? "--";
      const primaryBetId = resolveFirstString(record.bet_id, record.game_order_id, record.order_id, record.id);
      const betId = primaryBetId ?? "--";
      const currency = resolveFirstString(record.currency, record.asset, record.account_currency, record.real_currency);
      const accountCurrency = resolveFirstString(record.real_currency, record.account_currency, record.currency);
      const betAmount = parseAmount(
        record.bet_amount ?? record.amount_in ?? record.amountIn ?? record.betIn ?? record.stake ?? record.amount,
      );
      const winAmount = parseAmount(
        record.win_amount ?? record.bet_out ?? record.amount_out ?? record.reward ?? record.payout ?? record.winAmount,
      );
      const timestamp = resolveTimestamp(
        record.order_time,
        record.created_at,
        record.updated_at,
        record.bet_time,
        record.createdAt,
        record.timestamp,
      );

      const rowKey = primaryBetId ?? `${index}-${gameName}`;

      return (
        <tr
          key={rowKey}
          className="border-b border-base-300/70 bg-base-200/40 hover:bg-base-200 transition-colors text-sm"
        >
          <td className="px-3 sm:px-4 py-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base-content truncate">{gameName}</span>
                <span className="rounded-md bg-base-300 px-2 py-[2px] text-[11px] font-semibold uppercase tracking-wide text-base-content/70">
                  {provider}
                </span>
              </div>
            </div>
          </td>
          <td className="px-3 sm:px-4 py-3 text-xs text-base-content/70 whitespace-nowrap">{timestamp ?? "--"}</td>
          <td className="px-3 sm:px-4 py-3 text-xs text-base-content/80 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs">{betId}</span>
              {primaryBetId && <Copy text={primaryBetId} className="w-4 h-4" />}
            </div>
          </td>
          <td className="px-3 sm:px-4 py-3 text-right font-semibold text-error">
            {renderAmount(betAmount, currency, true)}
          </td>
          <td className="px-3 sm:px-4 py-3 text-right font-semibold">
            <span
              className={cn(
                "inline-flex items-center justify-end text-sm font-semibold",
                winAmount && winAmount > 0 ? "text-success" : winAmount && winAmount < 0 ? "text-error" : "text-base-content/70",
              )}
            >
              {renderAmount(winAmount, currency, false, true)}
            </span>
          </td>
          <td className="px-3 sm:px-4 py-3 text-right">
            {accountCurrency ? (
              <div className="ml-auto flex items-center gap-2 text-xs font-semibold text-base-content/70">
                <CurrencyIcon currency={accountCurrency} className="h-4 w-4" />
                <span className="hidden sm:inline">{accountCurrency}</span>
              </div>
            ) : (
              "--"
            )}
          </td>
        </tr>
      );
    });
  };

  if (isLoading && records.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <span className="loading loading-spinner loading-xl text-primary" />
      </div>
    );
  }

  if (!isLoading && records.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/images/illustrations/no-data.svg"
            alt="No data"
            className="w-32 h-32 sm:w-40 sm:h-40 opacity-50"
          />
          <div className="text-base-content/50 text-sm font-semibold">
            {emptyMessage ?? t("transaction:common.noTransactionRecords", "No bet history yet")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full table-fixed">
        <thead>
          <tr className="bg-base-200 text-[11px] sm:text-xs uppercase tracking-wide text-base-content/60">
            <th className="px-3 sm:px-4 py-3 text-left font-semibold">
              {t("profile:betHistory.headers.game", "Game | Provider")}
            </th>
            <th className="px-3 sm:px-4 py-3 text-left font-semibold">
              {t("profile:betHistory.headers.date", "Date")}
            </th>
            <th className="px-3 sm:px-4 py-3 text-left font-semibold">
              {t("profile:betHistory.headers.betId", "Bet ID")}
            </th>
            <th className="px-3 sm:px-4 py-3 text-right font-semibold">
              {t("profile:betHistory.headers.betIn", "Bet In")}
            </th>
            <th className="px-3 sm:px-4 py-3 text-right font-semibold">
              {t("profile:betHistory.headers.betOut", "Bet Out")}
            </th>
            <th className="px-3 sm:px-4 py-3 text-right font-semibold">
              {t("profile:betHistory.headers.account", "Account")}
            </th>
          </tr>
        </thead>
        <tbody>{renderRows()}</tbody>
      </table>
      {isFetchingMore && (
        <div className="flex items-center justify-center gap-2 py-3 text-sm text-base-content/60">
          <span className="loading loading-spinner loading-sm text-primary" />
          {t("common:loadingMore", "Loading more...")}
        </div>
      )}
      {showNoMore && !isFetchingMore && (
        <div className="py-3 text-center text-xs font-semibold text-base-content/50">
          {t("common:noMoreData", "No more data")}
        </div>
      )}
    </div>
  );
};

export const BetHistoryTable = memo(BetHistoryTableComponent);
