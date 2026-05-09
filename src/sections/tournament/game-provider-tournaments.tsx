import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Iconify from "@/components/iconify";
import { useAuth } from "@/contexts/AuthContext";
import { useTournamentList, useTournamentPoolPrize } from "@/hooks/api/useAuth";
import {
  TournamentBanner,
  TournamentLeaderboard,
  TournamentMyProgress,
  TournamentRulesSection,
  TournamentMyProgressV2,
  TournamentRulesSectionV3,
  TournamentLeaderboardV2
} from "@/sections/tournament";
import { cn } from "@/utils/cn";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { getTournamentVisual, hasProviderConfig } from "@/sections/tournament/tournament-visuals";
import { Countdown } from "@/components/ui/Countdown";
import { useVibrantColor } from "@/hooks/useVibrantColor";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TournamentRulesSectionV2 } from "@/sections/tournament/tournament-rules-section-v2.tsx";

interface GameProviderTournamentsProps {
  provider?: string;
  withContainer?: boolean;
  showHeading?: boolean;
}

const buildProviderAliases = (provider?: string) => {
  if (!provider) return [] as string[];

  const base_provider = ["rakerace"];
  const normalized = provider.toLowerCase();

  if (normalized === "pragmatic" || normalized === "pragmaticplay" || normalized === "pp") {
    return ["pragmatic", "pragmaticplay", "pp", ...base_provider];
  }

  if (normalized === "fachai" || normalized === "fc") {
    return ["fachai", "fc", ...base_provider];
  }

  if (normalized === "newbie" || normalized === "0") {
    return ["newbie", "0", ...base_provider];
  }

  return [normalized, ...base_provider];
};

/**
 * TODO: 只保持一种 锦标赛 代码未做删减
 * @param provider
 * @param withContainer
 * @param showHeading
 * @constructor
 */
export const GameProviderTournaments = ({
  provider,
  withContainer = true,
  showHeading = true
}: GameProviderTournamentsProps) => {
  const { t } = useTranslation("tournament");
  const { isAuthenticated } = useAuth();
  const { tournamentList, isLoading } = useTournamentList();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const aliases = useMemo(() => buildProviderAliases(provider), [provider]);
  const aliasSignature = useMemo(() => aliases.join("|"), [aliases]);

  const providerTournaments = useMemo(
    () =>
      (tournamentList || []).filter((item) => {
        const value = (item.game_provider || "").toLowerCase();
        return aliases.includes(value);
      }),
    [aliases, tournamentList]
  );

  const sectionClasses = cn(
    "flex flex-col gap-3 sm:gap-4",
    withContainer ? "container mx-auto px-5 sm:px-0" : "w-full"
  );

  const headingClasses = cn("flex items-center gap-2", withContainer && "px-1");

  useEffect(() => {
    setSelectedIndex(0);
  }, [aliasSignature]);

  useEffect(() => {
    if (selectedIndex > 0 && selectedIndex >= providerTournaments.length) {
      setSelectedIndex(0);
    }
  }, [providerTournaments.length, selectedIndex]);

  const selectedTournament = providerTournaments[selectedIndex] ?? null;

  const selectedVisual = getTournamentVisual(selectedTournament?.game_provider);

  // const getTournamentDisplayName = () => {
  //   const provider = selectedTournament?.game_provider;
  //   if (provider === "jili") return t("casino:jiliTournament");
  //   if (provider === "pg") return t("casino:pgTournament");
  //   return selectedTournament?.name ?? "";
  // };

  const desktopImage = selectedVisual.images.desktop;

  const { rgb: vibrantRgb } = useVibrantColor(desktopImage, {
    fallbackGradient: "var(--color-base-300)",
    colorTypes: ["DarkVibrant", "Vibrant", "Muted"],
    opacity: 0.6
  });

  const dynamicDropShadow = vibrantRgb
    ? `drop-shadow(0 0 60px rgba(${vibrantRgb[0]}, ${vibrantRgb[1]}, ${vibrantRgb[2]}, 0.35))`
    : "drop-shadow(0 0 60px rgba(0,0,0,0.25))";

  const endTime = new Date(((selectedTournament?.end_time || 0) as number) * 1000);
  const tournamentId = selectedTournament?.user_info?.tournament_id ?? selectedTournament?.id;
  const tournamentLevel = selectedTournament?.user_info?.tournament_level ?? "bronze";
  const { data: livePrize } = useTournamentPoolPrize(tournamentId, tournamentLevel);
  const fallbackPrize = Number((selectedTournament?.user_info as any)?.prize ?? 0);
  const prizeNum = livePrize ?? fallbackPrize;
  const formattedPrize = formatWithConversion(prizeNum, "USD", { showCode: false, showSymbol: true });

  const showHero = providerTournaments.length > 0;

  const handlePrevTournament = () => {
    setSelectedIndex((prev) => {
      if (providerTournaments.length === 0) return 0;
      const next = (prev - 1 + providerTournaments.length) % providerTournaments.length;
      return next;
    });
  };

  const handleNextTournament = () => {
    setSelectedIndex((prev) => {
      if (providerTournaments.length === 0) return 0;
      const next = (prev + 1) % providerTournaments.length;
      return next;
    });
  };

  const hasVisual = hasProviderConfig(selectedTournament?.game_provider);

  if (!isAuthenticated || aliases.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <section className={sectionClasses}>
        {showHeading && (
          <div className={headingClasses}>
            <Iconify icon="custom:tournament" className="w-4 h-4 text-primary" />
            <p className="text-md sm:text-lg font-bold text-base-content/80">
              {t("tournament:providerTournaments", "Provider Tournaments")}
            </p>
          </div>
        )}
        <div className="h-[300px] bg-base-200 rounded-2xl skeleton" />
      </section>
    );
  }

  if (providerTournaments.length === 0) {
    return null;
  }

  return (
    <section className={sectionClasses}>
      {showHeading && (
        <div className={headingClasses}>
          <Iconify icon="custom:tournament" className="w-4 h-4 text-primary" />
          <p className="text-md sm:text-lg font-bold text-base-content/80">
            {t("tournament:providerTournaments", "Provider Tournaments")}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:gap-4">
        {showHero ? (
          <>
            {/* Desktop hero + rules */}
            <div className="hidden flex-col">
              <div className={cn("relative rounded-2xl overflow-hidden", !hasVisual && "bg-base-300")}>
                <div
                  className="relative mx-auto px-8 py-6 h-[320px]"
                  style={{
                    backgroundImage: `repeating-linear-gradient(-45deg,
                      oklch(from var(--color-base-100) l c h / 0.2) 0px,
                    oklch(from var(--color-base-100) l c h / 0.2) 6px,
                    oklch(from var(--color-base-300) l c h / 0.3) 6px,
                    oklch(from var(--color-base-300) l c h / 0.3) 12px,
                    oklch(from var(--color-base-100) l c h / 0.2) 12px,
                    oklch(from var(--color-base-100) l c h / 0.2) 18px
                  )`
                  }}
                >
                  {desktopImage && (
                    <img
                      src={desktopImage}
                      alt="tournament"
                      className="absolute inset-0 w-full h-full select-none pointer-events-none object-contain"
                      loading="lazy"
                      style={{
                        filter: dynamicDropShadow,
                        clipPath: "inset(0 round 1rem)"
                      }}
                    />
                  )}

                  {providerTournaments.length > 1 && (
                    <>
                      <button
                        className="btn btn-circle btn-sm btn-primary absolute top-1/2 left-4 -translate-y-1/2 z-20"
                        onClick={handlePrevTournament}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        className="btn btn-circle btn-sm btn-primary absolute top-1/2 right-4 -translate-y-1/2 z-20"
                        onClick={handleNextTournament}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <div className="relative z-10 flex flex-row items-center h-full">
                    <div className="w-[30%] flex flex-col justify-center gap-2">
                      {/*<span className="text-base-content/70 text-sm font-semibold tracking-wide uppercase">*/}
                      {/*  {getTournamentDisplayName()}*/}
                      {/*</span>*/}
                      <h1 className="text-[40px] font-black text-base-content uppercase leading-[1.05]">
                        <span
                          className="text-primary block">{t(selectedVisual.titleHighlight, selectedVisual.titleHighlight)}</span>
                        <span className="text-primary">{t(selectedVisual.title, selectedVisual.title)}</span>
                      </h1>
                    </div>

                    <div className="flex-1" />

                    <div className="w-[32%]">
                      <div
                        className="bg-gradient-to-br from-base-content/20 to-transparent rounded-field p-4 mx-auto max-w-sm">
                        <span
                          className="badge badge-success rounded-sm rounded-bl-none badge-xs h-3 text-[9px] font-bold">
                          {t("tournament:endingIn", "ENDING IN")}
                        </span>
                        <div className="mt-2">
                          <Countdown
                            target={endTime}
                            renderCustom={(time) => (
                              <div className="grid grid-cols-4 gap-2">
                                {[
                                  { v: time.days, k: t("tournament:day", "day") },
                                  { v: time.hours, k: t("tournament:hours", "hours") },
                                  { v: time.minutes, k: t("tournament:minutes", "minutes") },
                                  { v: time.seconds, k: t("tournament:seconds", "seconds") }
                                ].map((item, i) => (
                                  <div
                                    key={i}
                                    className="bg-base-400/50 rounded-field px-3 py-2 h-16 flex flex-col items-center justify-center"
                                  >
                                    <span className="countdown text-2xl font-bold leading-none">
                                      <span style={{ "--value": item.v } as React.CSSProperties}></span>
                                    </span>
                                    <p className="text-[11px] text-base-content/70 leading-none uppercase">{item.k}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          />
                        </div>

                        <div className="bg-base-400/50 rounded-field px-4 py-3 mt-3 text-center">
                          <p
                            className="text-xs text-base-content/70 leading-none">{t("tournament:progressivePrizePool")}</p>
                          <p
                            className="text-2xl font-bold text-primary leading-tight mt-1">{formattedPrize.formatted}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile hero + rules */}
            <div className="flex flex-col">
              <TournamentBanner
                tournaments={providerTournaments}
                selectedIndex={selectedIndex}
                onIndexChange={setSelectedIndex}
              />
            </div>
          </>
        ) : (
          <TournamentRulesSection tournament={selectedTournament} />
        )}

        {/* {selectedTournament?.user_info && (
          <TournamentMyProgress data={selectedTournament.user_info} children={
            <TournamentRulesSectionV2 data={selectedTournament} />
          } />
        )} */}
        {selectedTournament?.user_info && selectedTournament.id && (
          selectedTournament.game_provider === "RakeRace" ? (
            <TournamentMyProgressV2 id={selectedTournament.id} data={selectedTournament.user_info}>
              <TournamentRulesSectionV3 data={selectedTournament} />
            </TournamentMyProgressV2>
          ) : (
            <TournamentMyProgress data={selectedTournament.user_info}>
              <TournamentRulesSectionV2 data={selectedTournament} />
            </TournamentMyProgress>
          )
        )}
        {/* <TournamentLeaderboard tournament={selectedTournament} /> */}
        {selectedTournament?.game_provider === "RakeRace" ? (
          <TournamentLeaderboardV2 tournament={selectedTournament} />
        ) : (
          <TournamentLeaderboard tournament={selectedTournament} />
        )}
      </div>
    </section>
  );
};
