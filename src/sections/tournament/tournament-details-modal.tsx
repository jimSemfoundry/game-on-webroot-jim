import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "react-i18next";
import type { ITournament } from "@/types/tournament";
import { Countdown } from "@/components/ui/Countdown";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useEffect, useRef, useState } from "react";
import { useVibrantColor } from "@/hooks/useVibrantColor";
import { getTournamentVisual } from "./tournament-visuals";
import { cn } from "@/utils/cn";
import { useTournamentPoolPrize } from "@/hooks/api/useAuth";

type TournamentDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tournament: ITournament | null;
  children?: React.ReactNode;
};

export function TournamentDetailsModal({ isOpen, onClose, tournament, children }: TournamentDetailsModalProps) {
  const { t } = useTranslation();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);

  // 关闭动效过程中保持上一次有效的赛事，避免标题瞬间回退为默认
  const lastTournamentRef = useRef<ITournament | null>(null);
  useEffect(() => {
    if (tournament) lastTournamentRef.current = tournament;
  }, [tournament]);
  const safeTournament = tournament ?? lastTournamentRef.current;

  // 获取视觉配置和桌面端图片
  const visual = getTournamentVisual(safeTournament?.game_provider);
  const desktopImage = visual.images.desktop;
  
  const endTime = new Date(((safeTournament?.end_time || 0) as number) * 1000);
  const tournamentId = safeTournament?.user_info?.tournament_id ?? safeTournament?.id;
  const tournamentLevel = safeTournament?.user_info?.tournament_level ?? "bronze";
  const { data: livePrize } = useTournamentPoolPrize(tournamentId, tournamentLevel);
  const fallbackPrize = Number((safeTournament?.user_info as any)?.prize ?? 0);
  const prizeNum = livePrize ?? fallbackPrize;
  const formattedPrize = formatWithConversion(prizeNum, "USD", { showCode: false, showSymbol: true });

  // Extract dominant color from illustration to build a dynamic drop shadow
  const { rgb: vibrantRgb } = useVibrantColor(desktopImage, {
    fallbackGradient: "var(--color-base-300)",
    colorTypes: ["Vibrant", "Muted", "DarkVibrant"],
    opacity: 0.6,
  });
  const dynamicDropShadow = vibrantRgb
    ? `drop-shadow(0 0 60px rgba(${vibrantRgb[0]}, ${vibrantRgb[1]}, ${vibrantRgb[2]}, 0.35))`
    : "drop-shadow(0 0 60px rgba(0,0,0,0.25))";

  // 获取规则内容
  const provider = (safeTournament?.game_provider || "").toLowerCase();
  let titleKey = "";
  let descriptionKey = "";
  let contentKey = "";
  
  if (provider === "jili") {
    titleKey = "tournament:jiliTitle";
    descriptionKey = "tournament:jiliDescription";
    contentKey = "tournament:jiliContent";
  } else if (provider === "pg") {
    titleKey = "tournament:pgTitle";
    descriptionKey = "tournament:pgDescription";
    contentKey = "tournament:pgContent";
  } else if (provider === "pp" || provider === "pragmatic") {
    titleKey = "tournament:pragmaticTitle";
    descriptionKey = "tournament:pragmaticDescription";
    contentKey = "tournament:pragmaticContent";
  } else if (provider === "0" || provider === "newbie") {
    titleKey = "tournament:beginnerTitle";
    descriptionKey = "tournament:beginnerDescription";
    contentKey = "tournament:beginnerContent";
  } else {
    titleKey = "tournament:tournament";
    descriptionKey = "tournament:rulesAndTerms";
    contentKey = "";
  }

  const rulesTitle = String(t(titleKey, safeTournament?.name || "Tournament"));
  const rulesDescription = String(t(descriptionKey, "Rules & Terms"));
  const rulesContent = contentKey ? String(t(contentKey, "")) : "";

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideTitle className="bg-base-400 p-0 sm:min-w-[1280px] max-h-[80vh] overflow-hidden">
      <div className="flex flex-col max-h-[80vh]">
        {/* 固定标题 */}
        <div className="px-6 pt-6 pb-4 shrink-0">
          <p className="text-xl font-bold text-base-content">
          {rulesTitle}
          </p>
        </div>
        
        {/* 可滚动内容区域 */}
        <div className="flex-1 overflow-y-auto">{/* 这里包裹可滚动内容 */}
        {/* Top hero with stripes background: title | image | countdown */}
        <div
          className="relative mx-6 px-5 sm:px-8 py-4 sm:py-0 sm:h-[340px] select-none rounded-t-box overflow-hidden"
          style={{
            backgroundImage: `repeating-linear-gradient(-45deg,
              oklch(from var(--color-base-100) l c h / 0.2) 0px,
              oklch(from var(--color-base-100) l c h / 0.2) 6px,
              oklch(from var(--color-base-300) l c h / 0.3) 6px,
              oklch(from var(--color-base-300) l c h / 0.3) 12px,
              oklch(from var(--color-base-100) l c h / 0.2) 12px,
              oklch(from var(--color-base-100) l c h / 0.2) 18px
            )`,
            overflow: 'visible', // 允许阴影延伸
          }}
        >
          {/* Illustration - absolute positioned across entire container */}
          {desktopImage && (
            <img
              src={desktopImage}
              alt="tournament"
              className="absolute inset-0 w-full h-full select-none pointer-events-none object-contain"
              loading="lazy"
              style={{
                filter: dynamicDropShadow,
                maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) calc(100% - 16px), rgba(0,0,0,0) 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) calc(100% - 16px), rgba(0,0,0,0) 100%)",
              }}
            />
          )}

          {/* Content layer - above the image */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-stretch gap-4 h-full">
            {/* Left: Title */}
            <div className="w-full sm:w-[28%] flex items-center justify-center sm:justify-start px-0 sm:px-2">
              <h1 className="text-2xl sm:text-[40px] font-black text-base-content uppercase leading-7 sm:leading-[44px]">
                <span className="text-primary">{visual.titleHighlight}</span>
                <br />
                {visual.title}
              </h1>
            </div>

            {/* Middle: Spacer for layout */}
            <div className="w-full sm:flex-1 h-[200px] sm:h-full" />

            {/* Right: Countdown and prize */}
            <div className="w-full sm:w-[32%] flex items-center sm:items-center">
              <div className="bg-base-300/40 rounded-field p-3 sm:p-4 mx-auto">
                <span className="badge badge-success rounded-sm rounded-bl-none badge-xs h-3 text-[9px] sm:text-[10px] font-bold">
                  {t("tournament:endingIn", "ENDING IN")}
                </span>
                <div className="mt-2">
                  <Countdown
                    target={endTime}
                    renderCustom={(time) => (
                      <div className="grid grid-cols-4 gap-1 sm:gap-2">
                        {[
                          { v: time.days, k: t("tournament:day", "day") },
                          { v: time.hours, k: t("tournament:hours", "hours") },
                          { v: time.minutes, k: t("tournament:minutes", "minutes") },
                          { v: time.seconds, k: t("tournament:seconds", "seconds") },
                        ].map((item, i) => (
                          <div key={i} className="bg-base-400/50 rounded-field px-2 sm:px-3 py-1 h-12 sm:h-16 flex flex-col items-center justify-center">
                            <span className="countdown text-lg sm:text-2xl font-bold leading-none">
                              <span style={{ "--value": item.v } as React.CSSProperties}></span>
                            </span>
                            <p className="text-[9px] sm:text-[11px] text-base-content/70 leading-none">{item.k}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </div>

                <div className="bg-base-400/50 rounded-field px-4 py-3 mt-2 text-center">
                  <p className="text-[10px] sm:text-xs text-base-content/70 leading-none">{t("tournament:progressivePrizePool")}</p>
                  <p className="text-xl sm:text-2xl font-bold text-primary leading-tight mt-1">{formattedPrize.formatted}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Rules Section - 衔接在banner下方 */}
        <div className="mx-6 bg-base-200 rounded-b-box overflow-hidden">
          {/* Header - Clickable */}
          <button
            onClick={() => setIsRulesExpanded(!isRulesExpanded)}
            className="w-full px-5 sm:px-8 py-4 flex items-center justify-between transition-colors"
          >
            <div className="text-left">
              <h2 className="text-base sm:text-lg leading-6 font-bold text-base-content mb-0.5">
                {rulesTitle}
              </h2>
              <p className="text-sm leading-5 text-base-content/70">
                {rulesDescription}
              </p>
            </div>
            <div
              className={cn(
                "transition-transform duration-200 shrink-0 ml-2",
                isRulesExpanded && "rotate-180"
              )}
            >
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.184136 0.767599C0.422999 0.537923 0.802824 0.54537 1.0325 0.784233L4 3.93443L6.9675 0.784233C7.19718 0.54537 7.577 0.537923 7.81587 0.767599C8.05473 0.997275 8.06218 1.3771 7.8325 1.61596L4.4325 5.21596C4.31938 5.33361 4.16321 5.4001 4 5.4001C3.83679 5.4001 3.68062 5.33361 3.5675 5.21596L0.167501 1.61596C-0.0621751 1.3771 -0.0547276 0.997275 0.184136 0.767599Z"
                  fill="currentColor"
                  className="text-base-content/50"
                />
              </svg>
            </div>
          </button>

          {/* Expandable Content */}
          <div
            className={cn(
              "grid transition-all duration-300 ease-in-out",
              isRulesExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <div className="overflow-hidden">
              {rulesContent ? (
                <div 
                  className="px-5 sm:px-8 pb-4 text-sm sm:text-base text-base-content/80"
                  dangerouslySetInnerHTML={{ __html: rulesContent }}
                />
              ) : (
                <div className="px-5 sm:px-8 pb-4 space-y-3 text-sm text-base-content/80">
                  {/* 默认规则内容 */}
                  <div>
                    <h3 className="font-bold text-base-content mb-2">
                      {t("tournament:howToParticipate", "How to Participate")}
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>{t("tournament:rule1", "Play any participating game during the tournament period")}</li>
                      <li>{t("tournament:rule2", "Each bet contributes to your total wagered amount")}</li>
                      <li>{t("tournament:rule3", "Climb the leaderboard by wagering more")}</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-base-content mb-2">
                      {t("tournament:prizeDistribution", "Prize Distribution")}
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>{t("tournament:prize1", "Prizes are distributed based on your final rank")}</li>
                      <li>{t("tournament:prize2", "Winners will be notified after the tournament ends")}</li>
                      <li>{t("tournament:prize3", "Prize pool is progressive and increases with participation")}</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-base-content mb-2">
                      {t("tournament:termsAndConditions", "Terms and Conditions")}
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>{t("tournament:term1", "Only real money bets count towards the tournament")}</li>
                      <li>{t("tournament:term2", "Management reserves the right to modify or cancel the tournament")}</li>
                      <li>{t("tournament:term3", "General terms and conditions apply")}</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body slot - the parent renders the rest below the rules */}
        <div className="px-6 py-4 pb-6">
          {children}
        </div>
        
        </div>{/* 结束可滚动内容区域 */}
      </div>
    </Modal>
  );
}
