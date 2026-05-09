import { TournamentCard, TournamentCardData } from "./tournament-card";
import { TournamentDetailsModal } from "./tournament-details-modal";
import { TournamentMyProgress } from "./tournament-my-progress";
import { TournamentLeaderboard } from "./tournament-leaderboard";
import { TournamentParticipatingGames } from "./tournament-participating-games";
import { useState, useMemo } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTournamentList } from "@/hooks/api/useAuth";
import { useNavigate } from "@tanstack/react-router";
import type { ITournament } from "@/types/tournament";
import { getTournamentVisual } from "./tournament-visuals";

export const TournamentList = () => {
  const { tournamentList, isLoading } = useTournamentList();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [openId, setOpenId] = useState<string | null>(null);

  const mapTournamentToCard = (item: ITournament): TournamentCardData => {
    // const provider = (item.game_provider || "").toLowerCase();
    const userInfo = (item.user_info || {}) as any;
    const visual = getTournamentVisual(item.game_provider || "");

    return {
      id: (item as any).id ?? `${item.game_provider}-${item.end_time}`,
      titleHighlight: visual.titleHighlight,
      title: visual.title,
      endTime: new Date((item.end_time || 0) * 1000),
      prizePool: Number(userInfo?.prize ?? 0),
      image: visual.images.mobile,
      provider: item.game_provider,
      tournamentId: userInfo?.tournament_id ?? (item as any).id,
      tournamentLevel: userInfo?.tournament_level ?? "bronze",
    };
  };

  const tournaments: TournamentCardData[] = useMemo(() => 
    (tournamentList || [])
      .filter(item => (item.game_provider || "").toLowerCase() !== "newbie")
      .map(mapTournamentToCard), 
    [tournamentList]
  );

  const selectedTournament = useMemo(() => {
    if (!openId) return null as any;
    return (tournamentList || []).find((t) => String((t as any).id ?? t.game_provider + "-" + t.end_time) === String(openId)) || null;
  }, [openId, tournamentList]);

  const handleCardClick = (tournament: TournamentCardData) => {
    // 以点击时的实时窗口宽度为准，避免 mediaQuery 初始状态不准确导致误导航
    const desktopMatch = typeof window !== "undefined" && (window.matchMedia?.("(min-width: 1024px)").matches || document.documentElement.clientWidth >= 1024);
    if (desktopMatch) {
      // setOpenId(String(tournament.id));
      // return;
    }
    const cleanIdNum = Number(String(tournament.id).replace(/^"+|"+$/g, ""));
    const idStr = Number.isNaN(cleanIdNum) ? String(tournament.id) : String(cleanIdNum);
    navigate({ to: "/tournament/arena", search: { id: idStr, provider: undefined } });
  };

  if (isLoading && tournaments.length === 0) {
    return (
      <div className="relative grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 min-h-[240px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="loading loading-spinner loading-xl text-primary" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {tournaments.map((tournament) => (
          <TournamentCard
            key={tournament.id}
            data={tournament}
            onClick={() => handleCardClick(tournament)}
          />
        ))}
      </div>

      {/* Desktop details modal */}
      {isDesktop && (
        <TournamentDetailsModal
          isOpen={Boolean(openId)}
          onClose={() => setOpenId(null)}
          tournament={selectedTournament}
        >
          {selectedTournament?.user_info && (
            <div className="mb-3">
              <TournamentMyProgress data={selectedTournament.user_info as any} />
            </div>
          )}
          <div className="mb-3">
            <TournamentLeaderboard tournament={selectedTournament as any} />
          </div>
          <TournamentParticipatingGames tournament={selectedTournament as any} />
        </TournamentDetailsModal>
      )}
    </>
  );
};

