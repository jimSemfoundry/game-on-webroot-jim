import { type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import Iconify from "@/components/iconify";
import { Decimal } from "decimal.js";
import clsx from "clsx";
import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
 
export function TournamentLeaderboardTable({
  data,
  page,
  limit,
  isFetching,
  total,
  onPaginate,
}: {
  data: Record<string, any>[];
  page: number;
  limit: number;
  isFetching: boolean;
  total: number;
  onPaginate: Dispatch<SetStateAction<Record<string, any>>>;
}) {
  const { t } = useTranslation(["tournament"]);
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  return (
    <div className="bg-base-200 rounded-field overflow-hidden pb-6">
      {/* Header */}
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <Iconify
            icon="custom:leaderboard"
            className="w-4 h-4 text-primary"
          />
          <h3 className="text-sm sm:text-lg font-bold text-base-content">
            {t("tournament:leagueLeaderboard")}
          </h3>
        </div>
      </div>

      {/* Header row */}
      <div className="relative min-h-[300px]">
        {/* PC端的展开模式 */}
        <div className="hidden sm:block">
          <div
            className="grid grid-cols-[1fr_30%_30%] sm:grid-cols-[1fr_auto_20%] gap-2 px-4 sm:px-6 py-3 text-base-content/50 text-xs font-bold uppercase">
            <div>{t("tournament:player", "Player")}</div>
            <div className="text-right">{t("tournament:wagered", "Wagered")}</div>
            <div className="text-center">{t("tournament:prize", "Prize")}</div>
          </div>
        </div>

        {/* 移动端时候的卡片模式 */}
        <div className="block sm:hidden gap-2 px-4 sm:px-6 py-3 text-base-content/50 text-xs font-bold uppercase">
          <div className="flex justify-between">
            <span>{t("tournament:player", "Player")}</span>
            <span>{t("tournament:prize", "Prize")} | {t("tournament:wagered", "Wagered")}</span>
          </div>
        </div>

        <div className="px-2 sm:px-4 pb-4 space-y-1 sm:space-y-3">
          {data.map((item: Record<string, any>, index: number) => {
            // 前端自行管理排名顺序：按分页计算全局名次
            const baseRank = (page - 1) * limit;
            const rank = baseRank + (index + 1);
            const rankIcon = getRankIconByRank(Number.isNaN(rank) ? undefined : rank);
            const rankLabel = getRankLabelByRank(Number.isNaN(rank) ? undefined : rank);
            const formattedWagered = formatWithConversion(
              Number(item.wagered || 0),
              "USD",
              { showCode: false, showSymbol: true, displayDecimal: 0 }
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
                className={clsx("rounded-field px-2 py-2 sm:py-1 hover:bg-base-100 sm:mb-0", index % 2 === 0 ? "sm:bg-base-200 bg-base-300" : "")}
              >
                {/* PC端的展开模式 */}
                <div className="hidden sm:block">
                  <div
                    className="grid grid-cols-[1fr_30%_30%] sm:grid-cols-[1fr_auto_20%] items-center gap-2 font-semibold h-10">
                    {/* Player */}
                    <div className="flex items-center gap-2 min-w-0">
                      {/* 用户排名 */}
                      <InnerRankValue rank={rank} icon={rankIcon ?? ""} text={rankLabel ?? ""} className={"min-w-30"} />

                      {/* 奖牌匹配 */}
                      {/*<InnerMedalLabel item={item} />*/}

                      {/* 用户昵称 */}
                      <InnerUserName username={item?.username ?? ""} />
                    </div>

                    {/* Wagered */}
                    <div className="text-right text-base-content/50 text-xs sm:text-sm">
                      {formattedWagered.formatted}
                    </div>

                    {/* Prize */}
                    <InnerPrizeValue
                      rate={Decimal(prizeRate).toDP(8).toString()}
                      prize={formattedPrize.formatted}
                    />
                  </div>
                </div>

                {/* 移动端时候的卡片模式 */}
                <div className="block sm:hidden font-semibold">
                  <div className="flex justify-between">
                    {/* Player */}
                    <div className="flex items-center gap-2">
                      {/* 用户排名 */}
                      <InnerRankValue rank={rank} icon={rankIcon ?? ""} text={rankLabel ?? ""} />

                      {/* 奖牌匹配 */}
                      {/*<InnerMedalLabel item={item} />*/}

                      {/* 用户昵称 */}
                      <InnerUserName className="text-xs" username={item?.username ?? ""} />
                    </div>

                    <div className={"max-w-[50%] overflow-hidden flex flex-col items-end"}>
                      {/* Prize */}
                      <InnerPrizeValue
                        rate={Decimal(prizeRate).toDP(8).toString()}
                        prize={formattedPrize.formatted}
                        className="text-xs" />

                      {/* Wagered */}
                      <div className="text-base-content/50 text-xs">
                        {formattedWagered.formatted}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isFetching && (
          <div className="absolute inset-0 flex items-center justify-center bg-base-300/50">
            <span className="loading loading-spinner loading-xl text-primary" />
          </div>
        )}
      </div>

      {/* Pagination */}
      <Paginate
        page={page}
        limit={limit}
        disabled={isFetching} 
        pageCount={Math.ceil((total || 0) / limit)}
        onJumpPage={(page) => {
          onPaginate((v) => ({
            ...v,
            page,
            last_id: "",
            last_wagered: "",
            is_jump_page: true,
          }));
        }}
        onPaginate={(page) => {
          onPaginate((v) => ({ ...v, page, is_jump_page: false }));
        }} />
    </div>
  );
}
 
const InnerUserName = ({ username, className }: { username: string, className?: string }) => {
  return <div className={clsx("font-semibold text-base-content/50 truncate text-sm", className)}>
    {username}
  </div>;
};

export const InnerMedalLabel = ({ item }: { item: Record<string, any> }) => {
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

  const icon = getMedalIconByLevel(item.medal);
  return icon
    ? (<img src={icon} alt="medal" className="w-4 h-4" />)
    : (<Iconify icon="solar:medal-star-bold" className="w-5 h-5 text-warning flex-shrink-0" />);
};

const InnerPrizeValue = ({ prize, rate, className }: { prize: string, rate: string, className?: string }) => {
  return <div className={clsx("text-center text-sm", className)}>
    <div className="text-success">{prize} ({rate}%)</div>
    {/* <div className={clsx("text-[12px] text-base-content/50")}>
      {rate}%
    </div> */}
  </div>;
};

const InnerRankValue = ({ icon, text, rank, className }: {
  icon: string,
  text: string,
  rank: string | number,
  className?: string
}) => {
  return <div>
    {icon ? (
      <div className={clsx("flex items-center gap-2", className)}>
        <img src={icon} className="w-5 h-5" />
        <div className="text-xs sm:text-sm font-semibold hidden sm:block text-base-content/50">
          {text}
        </div>
      </div>
    ) : (
      <div className={className}>
        <div
          className="bg-base-100 flex items-center justify-center rounded-sm min-w-5 h-5 px-1 font-bold text-xs text-base-content/60 inline-flex">
          {rank}
        </div>
      </div>
    )}
  </div>;
};

const getRankIconByRank = (rank?: number) => {
  if (rank === 1) return "/icons/isometric/gold-cup.svg";
  if (rank === 2) return "/icons/isometric/silver-cup.svg";
  if (rank === 3) return "/icons/isometric/bronze-cup.svg";
  return null;
};

const getRankLabelByRank = (rank?: number) => {
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  if (rank === 3) return "3rd";
  return null;
};