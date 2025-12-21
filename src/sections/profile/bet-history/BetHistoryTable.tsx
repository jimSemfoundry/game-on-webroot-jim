import Iconify from "@/components/iconify";
import Copy from "@/components/ui/Copy";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import type { BetHistoryRecord } from "@/types/bet-history";
import { cn } from "@/utils/cn";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { parseAmount, resolveFirstString, resolveTimestamp } from "./utils";

export interface BetHistoryTableProps {
  records: BetHistoryRecord[];
  isLoading?: boolean;
  isFetchingMore?: boolean;
  showNoMore?: boolean;
  emptyMessage?: string;
}

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
      const provider = resolveFirstString(record.game_provider, record.provider, record.publisher, record.vendor, record.brand) ?? "--";
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
        <tr key={rowKey} className="border-b border-base-300/70 bg-base-200/40 hover:bg-base-200 transition-colors text-sm">
          <td className="px-4 py-3 rounded-l-lg align-middle">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base-content truncate">{gameName}</span>
                <span className="rounded-md bg-base-300 px-2 py-[2px] text-[11px] font-semibold uppercase tracking-wide text-base-content/70">
                  {provider}
                </span>
              </div>
            </div>
          </td>
          <td className="px-4 py-3 align-middle text-xs text-base-content/70 whitespace-nowrap">{timestamp ?? "--"}</td>
          <td className="px-4 py-3 align-middle text-xs text-base-content/80 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs">{betId}</span>
              {primaryBetId && <Copy text={primaryBetId} className="w-4 h-4" />}
            </div>
          </td>
          <td className="px-4 py-3 align-middle text-right font-semibold text-error">{renderAmount(betAmount, currency, true)}</td>
          <td className="px-4 py-3 align-middle text-right font-semibold">
            <span
              className={cn(
                "inline-flex items-center justify-end text-sm font-semibold",
                winAmount && winAmount > 0 ? "text-success" : winAmount && winAmount < 0 ? "text-error" : "text-base-content/70",
              )}
            >
              {renderAmount(winAmount, currency, false, true)}
            </span>
          </td>
          <td className="px-4 py-3 rounded-r-lg align-middle text-right">
            {accountCurrency ? (
              <div className="flex items-center justify-end gap-2 text-xs font-semibold text-base-content/70">
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

  const renderEmptyState = () => (
    <div className="bg-base-300 rounded-field flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <img src="/images/illustrations/no-data.svg" alt="No data" className="w-32 h-32 sm:w-40 sm:h-40 opacity-50" />
        <div className="text-base-content/50 text-sm font-semibold">
          {emptyMessage ?? t("common:common.noData")}
        </div>
      </div>
    </div>
  );

  const renderMobileCards = () => {
    return records.map((record, index) => {
      const gameName = resolveFirstString(record.game_name, record.game, record.game_title, record.gameName) ?? "--";
      const provider = resolveFirstString(record.game_provider, record.provider, record.publisher, record.vendor, record.brand) ?? "--";
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
      const profitAmount = winAmount !== undefined && betAmount !== undefined ? winAmount - betAmount : winAmount;
      const profitColor =
        profitAmount && profitAmount > 0 ? "text-success" : profitAmount && profitAmount < 0 ? "text-error" : "text-base-content/70";

      return (
        <div key={rowKey} className={cn("rounded-2xl px-4 py-3 flex flex-col gap-1 bg-base-300 w-full overflow-hidden")}>
          {/* Row 1: game name | provider name */}
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-1 min-w-0">
              <Iconify icon={`custom:${record.game_category_2?.toLowerCase()}`} className="h-4 w-4 text-base-content/50" />
              <span className="text-xs font-semibold text-base-content truncate">{gameName}</span>
            </div>
            <div className="badge badge-ghost">
              <span className="text-xs text-base-content truncate uppercase font-semibold">{provider}</span>
            </div>
          </div>

          {/* Row 2 & 3: (bet datetime + order id) | (bet out + bet in + ICON) */}
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-xs text-base-content/50 font-semibold">{timestamp ?? "--"}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-base-content/50 font-semibold break-all">{betId}</span>
                {primaryBetId && <Copy text={primaryBetId} className="w-3 h-3" />}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex flex-col items-end gap-1">
                <span className={cn("text-xs font-semibold", profitColor)}>
                  {profitAmount !== undefined && profitAmount > 0 && "+"}
                  {renderAmount(profitAmount, currency, false, false)}
                </span>
                <span className="text-xs text-base-content/50 font-semibold">{renderAmount(betAmount, currency, true)}</span>
              </div>
              {accountCurrency && <CurrencyIcon currency={accountCurrency} className="h-4 w-4" />}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="relative flex flex-col">
      {/* Desktop Table */}
      <div className="hidden sm:block flex-1 overflow-y-auto">
        <table className="w-full table-fixed text-sm text-base-content border-separate border-spacing-y-1">
          <thead className="sticky top-0 z-10 bg-base-200 text-xs font-semibold uppercase text-base-content/60 tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">{t("profile:betHistory.headers.game", "Game | Provider")}</th>
              <th className="px-4 py-3 text-left">{t("profile:betHistory.headers.date", "Date")}</th>
              <th className="px-4 py-3 text-left">{t("profile:betHistory.headers.betId", "Bet ID")}</th>
              <th className="px-4 py-3 text-right">{t("profile:betHistory.headers.betIn", "Bet In")}</th>
              <th className="px-4 py-3 text-right">{t("profile:betHistory.headers.betOut", "Bet Out")}</th>
              <th className="px-4 py-3 text-right">{t("profile:betHistory.headers.account", "Account")}</th>
            </tr>
          </thead>
          <tbody>{!isLoading && records.length === 0 ? null : renderRows()}</tbody>
        </table>
        {!isLoading && records.length === 0 && renderEmptyState()}
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden flex-1 overflow-y-auto space-y-2">
        {records.length > 0 && (
          <>
            <div className="flex items-center justify-between px-2 text-[11px] font-semibold uppercase text-base-content/40">
              <span>{t("profile:betHistory.headers.game", "Game")} | {t("profile:betHistory.headers.date", "Date")}</span>
              <span>{t("common:amount", "Amount")} | {t("common:provider", "Provider")}</span>
            </div>
            {renderMobileCards()}
          </>
        )}
        {!isLoading && records.length === 0 && renderEmptyState()}
      </div>

      {isFetchingMore && (
        <div className="flex items-center justify-center gap-2 py-3 text-sm text-base-content/60">
          <span className="loading loading-spinner loading-sm text-primary" />
          {t("common:loading", "Loading")}
        </div>
      )}
      {showNoMore && !isFetchingMore && (
        <div className="py-3 text-center text-xs font-semibold text-base-content/50">{t("common:noMoreData", "No more data")}</div>
      )}
    </div>
  );
};

export const BetHistoryTable = memo(BetHistoryTableComponent);
