import { useState } from "react";
import { useTranslation } from "react-i18next";
import Iconify from "@/components/iconify";
import { cn } from "@/utils/cn";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { formatDateTime } from "@/utils/formatDateTime";
import type { StatusClassMap } from "./types";
import { FreeSpinStatus, IFreeSpinBonus, resolveFreeSpinStatus } from "@/types/freeSpins";
import { useCancelFreeSpinRecord } from "@/query/free-spins";

interface SpinHistoryListProps {
  rows: any[];
  isLoading?: boolean;
  isEmpty?: boolean;
  statusClass: StatusClassMap;
  formatStatus: (status?: number) => string;
}

export const SpinHistoryList = ({ rows, isLoading, isEmpty, statusClass, formatStatus }: SpinHistoryListProps) => {
  const { t } = useTranslation();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const cancelFreeSpinRecord = useCancelFreeSpinRecord();
  const [cancelTarget, setCancelTarget] = useState<IFreeSpinBonus | null>(null);

  const renderRowData = (item: any) => {
    const status = resolveFreeSpinStatus(item);
    const totalSpins = Number(item?.bet_count ?? 0);
    const usedSpins = Number(item?.current_bet_count ?? 0);
    const remainingSpins =
      item?.remaining_bets != null ? Number(item.remaining_bets) : Math.max(0, totalSpins - usedSpins);

    const currentTurnover = parseFloat(item?.current_turnover_limit_usdt ?? "0");
    const turnoverTotal = parseFloat(item?.turnover_limit_usdt ?? item?.max_win_limit ?? "0");
    const progressPercent = turnoverTotal > 0 ? Math.min((currentTurnover / turnoverTotal) * 100, 100) : 0;

    const maxWin = parseFloat(item?.win_amount ?? item?.win_bucks_amount ?? "0");
    const maxWinFormatted = formatWithConversion(maxWin, item?.currency || "USDT", {
      showSymbol: true,
      showCode: false,
    }).formatted;

    const turnoverCurrency = "USDT";

    const formattedTurnoverTotal = formatWithConversion(turnoverTotal, turnoverCurrency, {
      showSymbol: true,
      showCode: false,
    }).formatted;

    const formattedTurnoverCurrent = formatWithConversion(currentTurnover, turnoverCurrency, {
      showSymbol: true,
      showCode: false,
    }).formatted;

    const turnoverDisplay =
      status === FreeSpinStatus.NOT_STARTED || turnoverTotal <= 0
        ? formattedTurnoverTotal
        : `${formattedTurnoverCurrent} / ${formattedTurnoverTotal}`;

    const showProgress =
      status === FreeSpinStatus.NOT_STARTED || status === FreeSpinStatus.ONGOING || status === FreeSpinStatus.CLAIM;

    return {
      status,
      totalSpins,
      remainingSpins,
      progressPercent,
      maxWinFormatted,
      turnoverDisplay,
      showProgress,
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="text-center text-base-content/50 py-10">
        {t("profile:noSpinHistory", "No spins history yet")}
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block flex-1 overflow-y-auto">
        <table className="w-full table-fixed text-sm text-base-content border-separate border-spacing-y-1">
          <colgroup>
            <col className="w-[30%]" />
            <col className="w-[16%]" />
            <col className="w-[24%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
          </colgroup>
          <thead className="sticky top-0 z-10 text-[11px] font-semibold uppercase text-base-content/60 tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">{t("bonus:freeSpins", "Free Spin")}</th>
              <th className="px-4 py-3 text-left">{t("bonus:bonusWins", "Bonus Amount")}</th>
              <th className="px-4 py-3 text-left">{t("bonus:progress", "Progress")}</th>
              <th className="px-4 py-3 text-left">{t("bonus:goal", "Goal")}</th>
              <th className="px-4 py-3 text-right">{t("common:status", "State")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item: any) => {
              const {
                status,
                progressPercent,
                maxWinFormatted,
                turnoverDisplay,
                showProgress,
              } = renderRowData(item);

              return (
                <tr
                  key={item?.id ?? item?.free_spin_code}
                  className="rounded-lg transition-colors border border-transparent bg-base-300/80 hover:bg-base-300"
                >
                  <td className="px-4 py-4 rounded-l-lg align-middle">
                    <span className="text-sm font-semibold text-base-content">
                      {t("bonus:freeSpin", "Free Spin")} {item?.free_spin_code || item?.template_key || `#${item?.id ?? "-"}`}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <span className="text-lg font-bold text-success">{maxWinFormatted}</span>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    {showProgress ? (
                      <div className="flex flex-col gap-1">
                        <div className="h-2 rounded-full bg-base-200/60 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${progressPercent}%`,
                              background: status === FreeSpinStatus.ONGOING
                                ? "linear-gradient(90deg, #9EFF00 0%, #7CC70C 100%)"
                                : status === FreeSpinStatus.CLAIM
                                ? "linear-gradient(90deg, #B9F227 0%, #8CF20F 100%)"
                                : "linear-gradient(90deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)",
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-base-content/50 font-semibold">{turnoverDisplay}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-base-content/50">{t("bonus:progressComplete", "Requirement Met")}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <span className="text-sm font-semibold text-base-content">{turnoverDisplay}</span>
                  </td>
                  <td className="px-4 py-4 rounded-r-lg align-middle text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold min-w-[80px] justify-center border",
                          statusClass[status] || "border-base-400 text-base-content/60",
                        )}
                      >
                        {formatStatus(status)}
                      </span>
                      {(status === FreeSpinStatus.NOT_STARTED || status === FreeSpinStatus.ONGOING) && (
                        <button
                          className="btn btn-ghost btn-xs px-2 h-7 text-base-content/60 hover:text-error"
                          onClick={() => setCancelTarget(item as IFreeSpinBonus)}
                          aria-label={t("transaction:bonusRewards.cancel_anyway", "Cancel free spins")}
                        >
                          <Iconify icon="lucide:x" className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden flex flex-col gap-3">
        {rows.length > 0 && (
          <div className="flex items-center justify-between px-2 text-[11px] font-semibold uppercase text-base-content/50">
            <span>{t("bonus:detail", "Detail")} | {t("bonus:progress", "Progress")}</span>
            <span>{t("transaction:filters.status", "Status")} | {t("transaction:tableHeaders.amount", "Amount")}</span>
          </div>
        )}
        {rows.map((item: any, index: number) => {
          const {
            status,
            progressPercent,
            maxWinFormatted,
            turnoverDisplay,
            showProgress,
          } = renderRowData(item);

          return (
            <div
              key={item?.id ?? item?.free_spin_code ?? index}
              className="rounded-field bg-base-300/80 p-3 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <p className="font-semibold text-base-content/50 text-xs">
                    {t("bonus:freeSpin")} {item?.free_spin_code || item?.template_key || `#${item?.id ?? "-"}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">

          
                <span
                  className={cn(
                    "px-2 rounded-full text-[11px] font-semibold border",
                    statusClass[status] || "border-base-400 text-base-content/50",
                  )}
                >
                  {formatStatus(status)}
                </span>
                {(status === FreeSpinStatus.NOT_STARTED || status === FreeSpinStatus.ONGOING) && (
                  <button
                    className="btn btn-ghost btn-2xs px-1 h-5 text-base-content/60 hover:text-error"
                    onClick={() => setCancelTarget(item as IFreeSpinBonus)}
                    aria-label={t("transaction:bonusRewards.cancel_anyway", "Cancel free spins")}
                  >
                    <Iconify icon="lucide:x" className="w-3 h-3" />
                  </button>
                )}
                      </div>
              </div>

              {showProgress && (
                <div className="h-2 rounded-full bg-base-200/80 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${progressPercent}%`,
                      background: status === FreeSpinStatus.ONGOING
                        ? "linear-gradient(90deg, #C4E02C 0%, #A0C526 45%, #7EA020 100%)"
                        : status === FreeSpinStatus.CLAIM
                        ? "linear-gradient(90deg, #34C759 0%, #2E865F 45%, #2E865F 100%)"
                        : "linear-gradient(90deg, #C4E02C 0%, #A0C526 45%, #7EA020 100%)",
                    }}
                  ></div>
                </div>
              )}

              <div className="flex flex-col gap-1 text-sm text-base-content/50">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-base-content/50">{t("bonus:bonusWins", "Bonus Wins")}</span>
                  <span className="font-semibold text-success">{maxWinFormatted}</span>
                </div>
                {showProgress ? (
                  <div className="flex items-center justify-between text-xs text-base-content/50 font-semibold">
                    <span>{t("transaction:rollover.wagerRequirement", "Wager Requirement")}</span>
                    <span>{turnoverDisplay}</span>
                  </div>
                ) : status === FreeSpinStatus.CLAIMED ? (
                  <div className="flex items-center justify-between text-xs text-base-content/50 font-semibold">
                    <span>{t("bonus:claimed", "Claimed")}</span>
                    <span>{item?.claimed_at ? formatDateTime(item.claimed_at * 1000, "YYYY/MM/DD HH:mm") : "--"}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-base-content/50 font-semibold">
                    <span>{t("bonus:expires", "Expires")}</span>
                    <span>{item?.expired_at ? formatDateTime(item.expired_at * 1000, "YYYY/MM/DD HH:mm") : "--"}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {cancelTarget && (
        <dialog open className="modal" onClose={() => setCancelTarget(null)}>
          <div className="modal-box space-y-4 bg-base-300">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-base-content">
                {t("transaction:bonusRewards.are_you_sure", "Are you sure?")}
              </p>
              <button className="btn btn-ghost btn-sm" onClick={() => setCancelTarget(null)}>
                <Iconify icon="lucide:x" className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-base-content/70">
              {t("transaction:bonusRewards.you_will_lose_your", "You will lose your")} {" "}
              <span className="text-primary font-semibold">{formatWithConversion(cancelTarget.win_amount, cancelTarget.currency, {showCode: false}).formatted}</span>
              {" "}
              {t("transaction:bonusRewards.in_unclaimed_rewards", "in unclaimed rewards")}
            </p>
            <div className="flex gap-3">
              <button className="btn btn-primary flex-1" onClick={() => setCancelTarget(null)}>
                {t("transaction:bonusRewards.go_back", "Go back")}
              </button>
              <button
                className="btn btn-primary btn-soft flex-1"
                onClick={() => {
                  if (!cancelTarget?.id) return;
                  cancelFreeSpinRecord.mutate(String(cancelTarget.id), {
                    onSuccess: () => setCancelTarget(null),
                    onError: () => setCancelTarget(null),
                  });
                }}
                disabled={cancelFreeSpinRecord.isPending}
              >
                {cancelFreeSpinRecord.isPending ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  t("transaction:bonusRewards.cancel_anyway", "Cancel anyway")
                )}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setCancelTarget(null)}>close</button>
          </form>
        </dialog>
      )}
    </>
  );
};
