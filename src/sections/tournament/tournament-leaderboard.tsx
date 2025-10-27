import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import Iconify from "@/components/iconify";
import type { ITournament, ITournamentTable } from "@/types/tournament";
import { authService } from "@/services/authService";
import { cn } from "@/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TournamentLeaderboardProps {
  tournament: ITournament | null;
}

export function TournamentLeaderboard({ tournament }: TournamentLeaderboardProps) {
  const { t } = useTranslation();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const [tableData, setTableData] = useState<ITournamentTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 10;
  const [lastIds, setLastIds] = useState<string[]>([""]);
  const [lastWagereds, setLastWagereds] = useState<string[]>([""]);

  const tournamentLevel = tournament?.user_info?.tournament_level || "bronze";
  const levelLabel = tournamentLevel.charAt(0).toUpperCase() + tournamentLevel.slice(1);

  useEffect(() => {
    if (tournament && tournament.user_info) {
      setLoading(true);
      authService
        .getTournamentLeaderboard({
          tournament_id: tournament.user_info.tournament_id,
          tournament_level: tournamentLevel,
          limit: pageSize,
          page: currentPage,
          last_id: lastIds[currentPage - 1] || undefined,
          last_wagered: lastWagereds[currentPage - 1] || undefined,
        })
        .then((res) => {
          if (res.code === 0 && res.data) {
            setTableData(res.data);
            const total = Number(res.total || res.count || 0);
            const pages = total > 0 ? Math.ceil(total / pageSize) : (res.has_more ? currentPage + 1 : currentPage);
            setTotalPages(Math.max(1, pages));
            setHasMore(Boolean(res.has_more));

            const next = res.next_page_params || {};
            const nextLastId = String(next.last_id || "");
            const nextLastWagered = String(next.last_wagered || "");
            // 记录下一页指针
            if (nextLastId || nextLastWagered) {
              setLastIds((prev) => {
                const arr = [...prev];
                arr[currentPage] = nextLastId;
                return arr;
              });
              setLastWagereds((prev) => {
                const arr = [...prev];
                arr[currentPage] = nextLastWagered;
                return arr;
              });
            }
          }
        })
        .catch((error) => {
          console.error("Failed to fetch leaderboard:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [tournament, tournamentLevel, currentPage]);

  if (!tournament) return null;

  const getRankIconByRank = (rank?: number) => {
    if (rank === 1) return "/icons/isometric/gold-cup.svg";
    if (rank === 2) return "/icons/isometric/silver-cup.svg";
    if (rank === 3) return "/icons/isometric/bronze-cup.svg";
    return null;
  };

  // medal mapping from API: 'bronze' | 'silver' | 'gold'
  // fallback: numeric ranges if backend returns level numbers
  const getMedalIconByLevel = (medal?: number | string) => {
    const m = String(medal || "").toLowerCase();
    if (m === "gold") return "/images/vip/levels/41.png";
    if (m === "silver") return "/images/vip/levels/21.png";
    if (m === "bronze") return "/images/vip/levels/1.png";

    const level = Number(m);
    if (!Number.isNaN(level)) {
      if (level >= 41) return "/images/vip/levels/41.png";
      if (level >= 21) return "/images/vip/levels/21.png";
      if (level >= 1) return "/images/vip/levels/1.png";
    }
    return null;
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // numeric page clicks are no longer used (cursor-based pagination with prev/next only)

  // 生成分页器页码
  // page number list removed; only prev/next retained to preserve cursor (last_id)

  return (
    <div className="bg-base-200 rounded-field overflow-hidden">
      {/* Header */}
      <div className="p-3">
        <div className="flex items-center gap-3">
          <Iconify 
            icon="custom:leaderboard" 
            className="w-4 h-4 text-primary" 
          />
          <h3 className="text-sm font-bold text-base-content">
            {levelLabel} League Leaderboard
          </h3>
        </div>
      </div>

      {/* Header row */}
      <div className="relative min-h-[500px]">
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 py-3 text-base-content/50 text-xs font-bold uppercase">
          <div>{t("tournament:player", "Player")}</div>
          <div className="text-center">{t("tournament:wagered", "Wagered")}</div>
          <div className="text-center">{t("tournament:prize", "Prize")}</div>
        </div>

        <div className="px-2 pb-4 space-y-3">
          {tableData.map((item, index) => {
            // 前端自行管理排名顺序：按分页计算全局名次
            const baseRank = (currentPage - 1) * pageSize;
            const rank = baseRank + (index + 1);
            const rankIcon = getRankIconByRank(Number.isNaN(rank) ? undefined : rank);
            const formattedWagered = formatWithConversion(
              Number(item.wagered || 0),
              "USD",
              { showCode: false, showSymbol: true }
            );
            const formattedPrize = formatWithConversion(
              Number(item.prize || 0),
              "USD",
              { showCode: false, showSymbol: true }
            );
            const prizeRate = Number(item.prize_rate || 0) * 100;

            return (
              <div
                key={index}
                className={cn("rounded-field bg-base-200 px-2 py-3", index % 2 === 0 ? "bg-base-300" : "bg-base-200")}
              >
                <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                  {/* Player */}
                  <div className="flex items-center gap-2 min-w-0">
                    {rankIcon ? (
                      <img src={rankIcon} alt={`Rank ${rank}`} className="w-6 h-6" />
                    ) : (
                      <span className="badge w-6 h-6 font-semibold text-xs text-base-content/50">
                        {rank}
                      </span>
                    )}
                    {(() => {
                      const icon = getMedalIconByLevel(item.medal);
                      return icon ? (
                        <img src={icon} alt="medal" className="w-4 h-4" />
                      ) : (
                        <Iconify icon="solar:medal-star-bold" className="w-5 h-5 text-warning flex-shrink-0" />
                      );
                    })()}
                    <span className="font-semibold text-base-content/50 truncate text-xs -ml-1">
                      {item.first_name && item.last_name
                        ? `${item.first_name} ${item.last_name}`
                        : item.username || `User ${item.user_id}`}
                    </span>
                  </div>

                  {/* Wagered */}
                  <div className="text-center font-semibold text-base-content/50 text-xs">
                    {formattedWagered.formatted}
                  </div>

                  {/* Prize */}
                  <div className="text-center font-semibold text-xs">
                    <span className="text-primary">{formattedPrize.formatted}</span>
                    <span className="text-base-content/50 text-xs"> ({prizeRate.toFixed(0)}%)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-base-300/50">
            <span className="loading loading-spinner loading-xl text-primary" />
          </div>
        )}

        {!loading && tableData.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-base-content/70">No leaderboard data available</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {(currentPage > 1 || hasMore) && (
        <div className="p-6 border-t border-base-content/10">
          <div className="w-full max-w-[340px] mx-auto flex items-center justify-between">
            <button
              className="btn btn-sm bg-base-100 btn-square rounded-field disabled:opacity-30"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-xs text-base-content/50 select-none rounded-field badge badge-soft font-semibold w-8 h-8 ">
              {currentPage}
            </div>

            <button
              className="btn btn-sm bg-base-100 btn-square rounded-field disabled:opacity-30"
              onClick={handleNextPage}
              disabled={!hasMore}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
