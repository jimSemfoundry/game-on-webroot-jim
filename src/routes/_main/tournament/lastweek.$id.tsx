import { createFileRoute, redirect } from "@tanstack/react-router";
import { publicService } from "@/services/publicService";
import { useTournamentList } from "@/hooks/api/useAuth";
import {
  TournamentMyProgressV2,
  TournamentLeaderboardLastWeek
} from "@/sections/tournament";
import { requireAuth } from "@/lib/auth-guards";
import { useTranslation } from "react-i18next";
import { useLastTournamentInfo } from "@/query/transactions";

export const Route = createFileRoute("/_main/tournament/lastweek/$id")({
  async beforeLoad({ context, location }) {
    // 1. 首先检查用户是否已登录
    requireAuth({ context, location });

    // 2. 检查 is_league 配置
    const baseConfig = await context.queryClient.fetchQuery({
      queryKey: ["baseConfig"],
      queryFn: () => publicService.getBaseConfig(),
      staleTime: 60 * 1000
    });

    const isLeagueEnabled = baseConfig?.data?.is_league === 1;
    if (!isLeagueEnabled) {
      throw redirect({
        to: "/casino",
        search: {
          openLogin: undefined,
          openSignUp: undefined,
          redirect: undefined,
          startapp: undefined,
          openFinance: undefined
        }
      });
    }
  },
  component: TournamentArenaPage
});

function TournamentArenaPage() {
  const { tournamentList, isLoading } = useTournamentList();
  const params = Route.useParams();
  const { t } = useTranslation();

  const { data: lastTournamentInfo } = useLastTournamentInfo(params.id || "");

  // 详情弹窗仅在列表页使用；此处不再弹窗
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 pb-26">
        <div className="h-[300px] bg-base-300 rounded-2xl animate-pulse" />
        <div className="px-5 sm:px-0 flex flex-col gap-3">
          <div className="h-4 bg-base-300 rounded animate-pulse w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[200px] bg-base-300 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tournamentList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="text-6xl">🏆</div>
        <h2 className="text-xl font-bold">{t("bonus.no_tournaments_available")}</h2>
        <p className="text-base-content/70 text-center max-w-md">
          {t("bonus.tournaments_available_desc")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 pb-26 px-5 sm:px-0 mt-4">

        <h4 className="text-base font-semibold sm:text-3xl sm:font-bold text-base-content">{t("tournament:lastWeeksLeaderboard")}</h4> 

        {/* Tournament Details */}
           {/* My Progress */}
          {(() => {
            const userInfo = lastTournamentInfo?.data;

            if (!userInfo) return null;

            return <TournamentMyProgressV2 data={userInfo} showPastLeaderboard={false} />;
          })()}

          {/* Leaderboard */}
          {(() => {
            const tournamentId = params.id;

            if (tournamentId == null) return null;

            return <TournamentLeaderboardLastWeek tournament_id={tournamentId} />;
          })()}
       
      </div>
    </>
  );
}
