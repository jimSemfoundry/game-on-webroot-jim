import { TournamentCard, TournamentCardData } from "./tournament-card";
import { useTranslation } from "react-i18next";
import { useTournamentList } from "@/hooks/api/useAuth";
import { useNavigate } from "@tanstack/react-router";
import type { ITournament } from "@/types/tournament";

export const TournamentList = () => {
  const { t } = useTranslation();
  const { tournamentList, isLoading } = useTournamentList();
  const navigate = useNavigate();

  const mapTournamentToCard = (item: ITournament): TournamentCardData => {
    const provider = (item.game_provider || "").toLowerCase();

    let titleHighlight: string | undefined;
    let title: string = item.name || t("tournament:tournaments", "TOURNAMENTS");
    let image = "";

    if (provider === "jili") {
      titleHighlight = t("tournament:jiliSlots.highlight", "JILI SLOTS");
      title = t("tournament:jiliSlots.title", "MEGA BONANZA");
      image = "/images/illustrations/b86472b94bfc1f088505f51d6f75ba056fc9a941.png";
    } else if (provider === "pg") {
      titleHighlight = t("tournament:pgSoft.highlight", "PG SOFT");
      title = t("tournament:pgSoft.title", "RACES");
      image = "/images/illustrations/d3ce708b54cb1aabdb69a027f29a744e4713e26c.png";
    } else if (provider === "pp") {
      titleHighlight = t("tournament:pragmatic.highlight", "PRAGMATIC");
      title = t("tournament:pragmatic.title", "CHALLENGE");
      image = "/images/illustrations/abb5d0ea3c88e4d91831509b2c26c42a3640d29c.png";
    } else if (provider === "newbie") {
      titleHighlight = t("tournament:beginnersLuck.highlight", "BEGINNER'S");
      title = t("tournament:beginnersLuck.title", "LUCK");
      image = "/images/illustrations/7c071064d635fd1324952f1ec987cc948da6fe4a.png";
    }

    return {
      id: (item as any).id ?? `${item.game_provider}-${item.end_time}`,
      titleHighlight,
      title,
      endTime: new Date((item.end_time || 0) * 1000),
      prizePool: (item.user_info as any)?.prize ?? 0,
      image,
      provider: item.game_provider,
    };
  };

  const tournaments: TournamentCardData[] = (tournamentList || []).map(mapTournamentToCard);

  const handleCardClick = (tournament: TournamentCardData) => {
    // 使用 TanStack Router 导航到详情页
    const cleanIdNum = Number(String(tournament.id).replace(/^"+|"+$/g, ""));
    const idStr = Number.isNaN(cleanIdNum) ? String(tournament.id) : String(cleanIdNum);
    navigate({
      to: "/tournament/arena",
      search: { 
        id: idStr,
        provider: undefined,
      },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
      {(isLoading && tournaments.length === 0) && (
        <>
          <TournamentCard data={{ id: "sk1", title: "", endTime: new Date(), prizePool: 0, image: "" }} />
          <TournamentCard data={{ id: "sk2", title: "", endTime: new Date(), prizePool: 0, image: "" }} />
          <TournamentCard data={{ id: "sk3", title: "", endTime: new Date(), prizePool: 0, image: "" }} />
        </>
      )}
      {tournaments.map((tournament) => (
        <TournamentCard
          key={tournament.id}
          data={tournament}
          onClick={() => handleCardClick(tournament)}
        />
      ))}
    </div>
  );
};

