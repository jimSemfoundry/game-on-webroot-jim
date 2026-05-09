import { memo } from "react";
import { useTranslation } from "react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import Copy from "@/components/ui/Copy";
import Iconify from "@/components/iconify";
import { cn } from "@/utils/cn";
import type { BetHistoryRecord } from "@/types/bet-history";
import { parseAmount, resolveFirstString, resolveTimestamp } from "./utils";

import type { BetHistoryTableProps } from "./BetHistoryTable";

interface SportsCompetitorEntry {
  competitor_name?: string;
  tournament_name?: string;
  sport_name?: string;
}

const normalizeCompetitorEntry = (entry: unknown): SportsCompetitorEntry | undefined => {
  if (!entry || typeof entry !== "object") return undefined;
  const node = entry as Record<string, unknown>;
  const competitor = resolveFirstString(node.competitor_name, node.name, node.display_name);
  const tournament = resolveFirstString(node.tournament_name, node.league_name, node.tournament);
  const sport = resolveFirstString(node.sport_name, node.category_name, node.sport);

  if (!competitor && !tournament && !sport) {
    return undefined;
  }

  return {
    competitor_name: competitor,
    tournament_name: tournament,
    sport_name: sport,
  };
};

const parseCompetitorEntries = (value: unknown): SportsCompetitorEntry[] => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "string") {
          return {
            competitor_name: entry,
          };
        }
        return normalizeCompetitorEntry(entry);
      })
      .filter((entry): entry is SportsCompetitorEntry => Boolean(entry));
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parseCompetitorEntries(parsed);
      }
    } catch {
      const parts = value
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
      if (parts.length) {
        return parts.map((part) => ({ competitor_name: part }));
      }
    }
  }

  return [];
};

const getCompetitorDisplay = (record: BetHistoryRecord, t: ReturnType<typeof useTranslation>["t"]): string => {
  const entries = parseCompetitorEntries(record.competitor_name);
  if (entries.length === 1 && entries[0].competitor_name) {
    return entries[0].competitor_name;
  }
  if (entries.length > 1) {
    return t("transaction:betHistory.parlay", "Parlay");
  }

  const raw = resolveFirstString(record.competitor_name, record.game_name);
  if (raw) {
    const parts = raw
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    if (parts.length === 1) {
      return parts[0];
    }
    if (parts.length > 1) {
      return t("transaction:betHistory.parlay", "Parlay");
    }
  }

  return resolveFirstString(record.game_name, record.bet_id, record.order_id) ?? "--";
};

const getTournamentOrSportDisplay = (record: BetHistoryRecord): string | undefined => {
  const entries = parseCompetitorEntries(record.competitor_name);
  const tournaments = Array.from(
    new Set(
      entries
        .map((entry) => entry.tournament_name)
        .filter((value): value is string => typeof value === "string" && value.length > 0),
    ),
  );

  if (tournaments.length) {
    return tournaments.join(", ");
  }

  const sports = Array.from(
    new Set(
      entries
        .map((entry) => entry.sport_name)
        .filter((value): value is string => typeof value === "string" && value.length > 0),
    ),
  );

  if (sports.length) {
    return sports.join(", ");
  }

  return resolveFirstString(record.tournament_name, record.sport_name);
};

const SportsBetHistoryTableComponent = ({ records, isLoading, isFetchingMore, showNoMore, emptyMessage }: BetHistoryTableProps) => {
  const { t } = useTranslation('profile');
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
      const competitorDisplay = getCompetitorDisplay(record, t);
      const tournamentDisplay = getTournamentOrSportDisplay(record) ?? "--";
      const primaryId = resolveFirstString(record.order_id, record.bet_id, record.game_order_id, record.id);
      const betId = primaryId ?? "--";

      const currency = resolveFirstString(
        record.game_currency,
        record.settlement_currency,
        record.currency,
        record.account_currency,
      );

      const accountCurrency = resolveFirstString(
        record.settlement_currency,
        record.account_currency,
        record.real_currency,
        record.game_currency,
        record.currency,
      );

      const betAmount = parseAmount(
        record.game_bet_amount ??
          record.settlement_bet_amount ??
          record.bet_amount ??
          record.amount ??
          record.amount_in ??
          record.amountIn,
      );

      const winAmount = parseAmount(
        record.game_win_amount ??
          record.settlement_win_amount ??
          record.win_amount ??
          record.amount_out ??
          record.reward ??
          record.payout,
      );

      const timestamp = resolveTimestamp(
        record.order_time,
        record.created_at,
        record.updated_at,
        record.bet_time,
        record.createdAt,
        record.timestamp,
      );

      const isPending = record.status === 1 || record.status === "1";
      const profitAmount = !isPending && winAmount !== undefined && betAmount !== undefined ? winAmount - betAmount : winAmount;
      const profitColor =
        isPending
          ? "text-warning"
          : profitAmount && profitAmount > 0
          ? "text-success"
          : profitAmount && profitAmount < 0
          ? "text-error"
          : "text-base-content/70";

      const rowKey = primaryId ?? `${index}-${competitorDisplay}`;

      return (
        <tr
          key={rowKey}
          className="bg-base-300 hover:bg-base-300/80 transition-colors text-sm"
        >
          <td className="px-4 py-3 rounded-l-lg align-middle rtl:rounded-l-none rtl:rounded-r-lg">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-base-content truncate">{competitorDisplay}</span>
              <span className="text-xs text-base-content/70 truncate">{tournamentDisplay}</span>
            </div>
          </td>
          <td className="px-4 py-3 align-middle text-xs text-base-content/70 whitespace-nowrap rtl:text-right">{timestamp ?? "--"}</td>
          <td className="px-4 py-3 align-middle text-xs text-base-content/80 rtl:text-right min-w-0">
            <div className="flex items-center gap-2 rtl:flex-row-reverse min-w-0 w-full">
              <div className="min-w-0 flex-1">
                <span className="text-xs truncate max-w-full sm:hidden" dir="ltr">{betId}</span>
                <span className="text-xs truncate max-w-full hidden sm:block" dir="ltr" title={betId}>
                  {betId}
                </span>
              </div>
              {primaryId && <Copy text={String(primaryId)} className="w-4 h-4 shrink-0" />}
            </div>
          </td>
          <td className="px-4 py-3 align-middle text-right font-semibold text-error rtl:text-left">
            <span dir="ltr">{renderAmount(betAmount, currency, true)}</span>
          </td>
          <td className="px-4 py-3 align-middle text-right font-semibold rtl:text-left">
            <span
              dir="ltr"
              className={cn(
                "inline-flex items-center justify-end text-sm font-semibold",
                "rtl:justify-start",
                profitColor,
              )}
            >
              {isPending
                ? t("transaction:transactionStatus.pending", "Pending")
                : renderAmount(profitAmount, currency, false, true)}
            </span>
          </td>
          <td className="px-4 py-3 rounded-r-lg align-middle text-right rtl:text-left rtl:rounded-r-none rtl:rounded-l-lg">
            {accountCurrency ? (
              <div className="flex items-center justify-end gap-2 text-xs font-semibold text-base-content/70 rtl:justify-start rtl:flex-row-reverse">
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
        <img
          src="/images/illustrations/no-data.svg"
          alt="No data"
          className="w-32 h-32 sm:w-40 sm:h-40 opacity-50"
        />
        <div className="text-base-content/50 text-sm font-semibold">
          {emptyMessage ?? t("common:common.noData", "No data")}
        </div>
      </div>
    </div>
  );

  const renderMobileCards = () => {
    return records.map((record, index) => {
      const competitorDisplay = getCompetitorDisplay(record, t);
      const tournamentDisplay = getTournamentOrSportDisplay(record) ?? "--";
      const primaryId = resolveFirstString(record.order_id, record.bet_id, record.game_order_id, record.id);
      const betId = primaryId ?? "--";

      const currency = resolveFirstString(
        record.game_currency,
        record.settlement_currency,
        record.currency,
        record.account_currency,
      );

      const accountCurrency = resolveFirstString(
        record.settlement_currency,
        record.account_currency,
        record.real_currency,
        record.game_currency,
        record.currency,
      );

      const betAmount = parseAmount(
        record.game_bet_amount ??
          record.settlement_bet_amount ??
          record.bet_amount ??
          record.amount ??
          record.amount_in ??
          record.amountIn,
      );

      const winAmount = parseAmount(
        record.game_win_amount ??
          record.settlement_win_amount ??
          record.win_amount ??
          record.amount_out ??
          record.reward ??
          record.payout,
      );

      const timestamp = resolveTimestamp(
        record.order_time,
        record.created_at,
        record.updated_at,
        record.bet_time,
        record.createdAt,
        record.timestamp,
      );

      const isPending = record.status === 1 || record.status === "1";
      const rowKey = primaryId ?? `${index}-${competitorDisplay}`;
      const profitAmount = !isPending && winAmount !== undefined && betAmount !== undefined ? winAmount - betAmount : winAmount;
      const profitColor =
        isPending
          ? "text-warning"
          : profitAmount && profitAmount > 0
          ? "text-success"
          : profitAmount && profitAmount < 0
          ? "text-error"
          : "text-base-content/70";

      return (
        <div key={rowKey} className={cn("rounded-field px-4 py-3 flex flex-col gap-2 bg-base-300")}>
          {/* Row 1-2: (match name + tournament) | (bet out + bet in + icon) */}
          <div className="flex justify-between gap-4">
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="flex items-center gap-1 min-w-0">
                <Iconify icon="custom:sports" className="h-4 w-4 shrink-0 text-base-content/50" />
                <span className="text-xs font-semibold text-base-content truncate">{competitorDisplay}</span>
              </div>
              <div className="badge badge-ghost max-w-full">
                <span className="text-xs text-base-content truncate uppercase font-semibold">{tournamentDisplay}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex flex-col items-end gap-1">
                <span className={cn("text-xs font-semibold", profitColor)}>
                  {isPending
                    ? t("transaction:transactionStatus.pending", "Pending")
                    : (
                      <>
                        {profitAmount !== undefined && profitAmount > 0 && "+"}
                        {renderAmount(profitAmount, currency, false, false)}
                      </>
                    )}
                </span>
                <span className="text-xs text-base-content/50 font-semibold">{renderAmount(betAmount, currency, true)}</span>
              </div>
              {accountCurrency && <CurrencyIcon currency={accountCurrency} className="h-4 w-4" />}
            </div>
          </div>

          {/* Row 3: time | bet id */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-base-content/50 font-semibold">{timestamp ?? "--"}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-base-content/50 font-semibold">{betId}</span>
              {primaryId && <Copy text={String(primaryId)} className="w-3 h-3" />}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="relative flex flex-col h-[450px]">
      {/* Desktop Table */}
      <div className="hidden sm:block flex-1 overflow-y-auto">
        <table className="w-full table-fixed text-sm text-base-content border-separate border-spacing-y-1">
          <colgroup>
            <col className="w-[36%]" />
            <col className="w-[16%]" />
            <col className="w-[18%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-base-200 text-xs font-semibold uppercase text-base-content/60 tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left rtl:text-right">
                {t("profile:betHistory.headers.match", "Match | Tournament")}
              </th>
              <th className="px-4 py-3 text-left rtl:text-right">
                {t("profile:betHistory.headers.date", "Date")}
              </th>
              <th className="px-4 py-3 text-left rtl:text-right">
                {t("profile:betHistory.headers.betId", "Bet ID")}
              </th>
              <th className="px-4 py-3 text-right rtl:text-left">
                {t("profile:betHistory.headers.betIn", "Bet In")}
              </th>
              <th className="px-4 py-3 text-right rtl:text-left">
                {t("profile:betHistory.headers.betOut", "Bet Out")}
              </th>
              <th className="px-4 py-3 text-right rtl:text-left">
                {t("profile:betHistory.headers.account", "Account")}
              </th>
            </tr>
          </thead>
          <tbody>{!isLoading && records.length === 0 ? null : renderRows()}</tbody>
        </table>
        {!isLoading && records.length === 0 && renderEmptyState()}
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden flex-1 overflow-y-auto space-y-2 pb-5">
        {records.length > 0 && (
          <>
            <div className="flex items-center justify-between px-2 text-[11px] font-semibold uppercase text-base-content/50 text-xs">
              <span>{t("profile:betHistory.headers.match", "Match")} | {t("profile:betHistory.headers.date", "Date")}</span>
              <span>{t("common:amount", "Amount")} | {t("profile:betHistory.headers.account", "Account")}</span>
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
        <div className="py-3 text-center text-xs font-semibold text-base-content/50">
          {t("common:noMoreData", "No more data")}
        </div>
      )}
    </div>
  );
};

export const SportsBetHistoryTable = memo(SportsBetHistoryTableComponent);
