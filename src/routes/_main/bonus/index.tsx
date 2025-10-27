import Iconify from "@/components/iconify";
import { useUserFreeGameRecords } from "@/hooks/api/useAuth.ts";
import { requireAuth } from "@/lib/auth-guards.ts";
import {
  BonusAchievementsCard,
  BonusCannonCard,
  BonusCollectorCard,
  BonusConquestsSection,
  BonusCashbackCard,
  BonusDepositCard,
  BonusFreeSpinsCard,
  Hero,
  BonusJesterCard,
  BonusLuckyNumberCard,
  MysteryBoxCard,
  BonusPromoCodeCard,
  BonusRakebackCard,
  Tabs,
} from "@/sections/bonus";
import { BonusTournamentCard } from "@/sections/bonus/tournament/bonus-tournament-card.tsx";
import { AlliancePartnerships } from "@/sections/casino/AlliancePartnerships.tsx";
import { Footer } from "@/sections/casino/Footer.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_main/bonus/")({
  beforeLoad: requireAuth,
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const [value, setValue] = useState("dashboard");

  // 当用户登录时，获取用户的Free Spins
  const { data: freeSpinsData } = useUserFreeGameRecords();

  const formatRemainingTime = (totalSeconds?: number) => {
    if (!totalSeconds || totalSeconds <= 0) return "0m";
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const d = days > 0 ? `${days}d ` : "";
    const h = `${hours}h `;
    const m = `${minutes}m`;
    return `${d}${h}${m}`.trim();
  };

  const hasFreeSpins = Array.isArray(freeSpinsData?.data?.games) && freeSpinsData.data.games.length > 0;

  return (
    <div className="flex flex-col gap-3 pb-26">
      <div className="relative">
        <Hero />
        <BonusDepositCard maxBonusAmount={100} />
      </div>


            {/* Collector Card - appears only on mobile */}
            <div className="sm:hidden flex flex-col gap-3 px-5">
              <BonusCollectorCard />
            </div>
            
      <Tabs value={value} onChange={setValue} className="gap-2 bg-base-300 px-5 sm:px-0" />

      <div className="px-5 sm:px-0">
        {value === "dashboard" && (
          <div className="flex flex-col gap-2">
            {hasFreeSpins && (
              <>
                <div className="flex items-center gap-2">
                  <Iconify icon="custom:free-spin" width={20} height={20} className="text-primary" />
                  <p className="text-sm font-semibold">{t("bonus:freeSpins")}</p>
                  <p className="ml-auto text-sm sm:text-base font-semibold text-base-content/50 underline">History</p>
                </div>
                <div className="sm:grid sm:grid-cols-3 sm:gap-3 flex flex-col gap-3">
                  {(freeSpinsData?.data?.games ?? []).map((g: any) => {
                    const r = g?.free_spin_record ?? {};
                    const total = Number(r?.bet_count ?? 0);
                    const used = Number(r?.current_bet_count ?? 0);
                    const remaining = r?.remaining_bets != null ? Number(r.remaining_bets) : Math.max(0, total - used);
                    const maxWin = parseFloat(r?.turnover_limit_usdt ?? r?.max_win_limit ?? "0");
                    const expiration = formatRemainingTime(Number(r?.remaining_time ?? 0));
                    return (
                      <BonusFreeSpinsCard
                        key={g?.id ?? r?.id}
                        gameTitle={g?.display_game_name}
                        gameIcon={g?.image}
                        available={remaining}
                        total={total}
                        maxWin={isNaN(maxWin) ? 0 : maxWin}
                        expiration={expiration}
                        gameId={g?.game_provider && g?.inner_game_id ? `${g.game_provider}:${g.inner_game_id}` : g?.inner_game_id}
                        isAvailable={remaining > 0}
                      />
                    );
                  })}
                </div>
              </>
            )}

            {/* Conquests Section - now displayed directly in dashboard */}
            <div className="flex items-center gap-2">
              <Iconify icon="custom:target" width={20} height={20} className="text-primary" />
              <p className="text-sm font-semibold">{t("bonus:conquests")}</p>
            </div>
            <BonusConquestsSection />

            <div className="flex items-center gap-2">
              <Iconify icon="custom:bonus" width={20} height={20} className="text-primary" />
              <p className="text-sm font-semibold">{t("bonus:general_bonus")}</p>
            </div>
            <div className="sm:grid sm:grid-cols-3 sm:gap-3 flex flex-col gap-3">
              <BonusRakebackCard />
              <BonusCashbackCard />
              {/* <BonusCalendarCard /> */}
              <BonusTournamentCard />
            </div>

            <div className="flex items-center gap-2">
              <Iconify icon="custom:vip" width={20} height={20} className="text-primary" />
              <p className="text-sm font-semibold">{t("bonus:vip_bonus")}</p>
            </div>
            <div className="sm:grid sm:grid-cols-3 sm:gap-3 flex flex-col gap-3">
              <BonusPromoCodeCard />
              <BonusAchievementsCard />
              <MysteryBoxCard />
              <BonusLuckyNumberCard />
              <BonusJesterCard />
              <BonusCannonCard />
            </div>
          </div>
        )}
      </div>
      <div className="sm:block hidden">
        <AlliancePartnerships />
      </div>
      <div className="sm:block hidden">
        <Footer />
      </div>
    </div>
  );
}
