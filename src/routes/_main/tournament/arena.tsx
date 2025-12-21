import { createFileRoute, redirect, useNavigate, useSearch } from "@tanstack/react-router";
import { publicService } from "@/services/publicService";
import { useTournamentList } from "@/hooks/api/useAuth";
import { TournamentBanner, TournamentRulesSection, TournamentMyProgress, TournamentLeaderboard, TournamentParticipatingGames } from "@/sections/tournament";
import { useState, useEffect } from "react";
import { requireAuth } from "@/lib/auth-guards";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_main/tournament/arena")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: (search.id as string) || undefined,
    provider: (search.provider as string) || undefined,
  }),
  async beforeLoad({ context, location }) {
    // 1. 首先检查用户是否已登录
    requireAuth({ context, location });

    // 2. 检查 is_league 配置
    const baseConfig = await context.queryClient.fetchQuery({
      queryKey: ["baseConfig"],
      queryFn: () => publicService.getBaseConfig(),
      staleTime: 60 * 1000,
    });

    const isLeagueEnabled = baseConfig?.data?.is_league === 1;
    if (!isLeagueEnabled) {
      throw redirect({ to: "/casino", search: { openLogin: undefined, openSignUp: undefined, redirect: undefined , startapp: undefined, openFinance: undefined} });
    }
  },
  component: TournamentArenaPage,
});

function TournamentArenaPage() {
  const { tournamentList, isLoading } = useTournamentList();
  const search = useSearch({ from: "/_main/tournament/arena" });
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { t } = useTranslation();

  // 根据查询参数确定初始选中的赛事
  useEffect(() => {
    if (tournamentList.length === 0) return;

    let targetIndex = 0;
    if (search.id !== undefined) {
      const cleanIdNum = Number(String(search.id).replace(/^"+|"+$/g, ""));
      const targetId = Number.isNaN(cleanIdNum) ? String(search.id) : cleanIdNum;
      const foundIndex = tournamentList.findIndex(item => String(item.id) === String(targetId));
      if (foundIndex >= 0) targetIndex = foundIndex;
    } else if (search.provider) {
      const foundIndex = tournamentList.findIndex(item => item.game_provider === search.provider);
      if (foundIndex >= 0) targetIndex = foundIndex;
    }

    setSelectedIndex(targetIndex);
  }, [tournamentList, search.id, search.provider]);

  const selectedTournament = tournamentList[selectedIndex] || null;

  const handleBannerChange = (index: number) => {
    setSelectedIndex(index);
    const tournament = tournamentList[index];
    if (tournament) {
      navigate({
        to: "/tournament/arena",
        search: { id: String(tournament.id), provider: undefined },
        replace: true,
      });
    }
  };

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
      <div className="flex flex-col gap-3 pb-26 px-5 sm:px-0">
        {/* Tournament Banner and Rules - No gap between them */}
        <div className="relative">
          <TournamentBanner
            tournaments={tournamentList}
            selectedIndex={selectedIndex}
            onIndexChange={handleBannerChange}
          />
          <TournamentRulesSection tournament={selectedTournament} />
        </div>

        {/* Tournament Details */}
        <div className="flex flex-col gap-3">
          {/* My Progress */}
          {selectedTournament?.user_info && (
            <TournamentMyProgress data={selectedTournament.user_info} />
          )}

          {/* Leaderboard */}
          <TournamentLeaderboard tournament={selectedTournament} />

          {/* Participating Games */}
          <TournamentParticipatingGames tournament={selectedTournament} />
        </div>
      </div>
    </>
  );
}

// placeholder removed; real component is imported from sections
