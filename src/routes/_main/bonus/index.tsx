import Iconify from "@/components/iconify";
import { useAuth } from "@/contexts/AuthContext";
import { useBonusSwitch } from "@/hooks/api/useAuth";
import { useUserFreeGameRecords } from "@/hooks/api/useAuth.ts";
import {
  BonusAchievementsCard,
  // BonusCannonCard,
  // BonusCollectorCard,
  // BonusConquestsSection,
  BonusConquestsSection,
  BonusDepositCard,
  BonusFreeSpinsCard,
  // BonusJesterCard,
  BonusLuckyNumberCard,
  // BonusPromoCodeCard,
  BonusRakebackCard,
  BonusVipMondayCard,
  BonusVipProgressCard,
  Hero,
  MysteryBoxCard,
  Tabs
} from "@/sections/bonus";
import { BonusCashbackCard } from "@/sections/bonus/cashback/bonus-cashback-card.tsx";
import { BonusTournamentCard } from "@/sections/bonus/tournament/bonus-tournament-card.tsx";
import { AlliancePartnerships } from "@/sections/casino/AlliancePartnerships.tsx";
import { Footer } from "@/sections/casino/Footer.tsx";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { VIP_REQUIREMENTS } from "@/sections/bonus/shared/config";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";

export const Route = createFileRoute("/_main/bonus/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: (search.tab as string) || undefined,
    };
  },
});

function RouteComponent() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [value, setValue] = useState("dashboard");
  const { switchData, isLoading: bonusSwitchLoading } = useBonusSwitch();
  const { status } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/_main/bonus/" });
  const shouldHideAlliancePartnerships = import.meta.env.VITE_HIDE_ALLIANCE_PARTNERSHIPS === "true";

  const unlockedVipBonuses = useMemo(() => {
    if (!status?.vip) return 0;

    let count = 0;
    const vipLevel = status.vip;

    // Check Achievements
    if (vipLevel >= VIP_REQUIREMENTS.achievements.requiredLevel) count++;

    // Check Mystery Box
    if (vipLevel >= VIP_REQUIREMENTS.mysteryBox.requiredLevel) count++;

    // Check Lucky Number
    if (vipLevel >= VIP_REQUIREMENTS.luckyNumber.requiredLevel) count++;

    // Check VIP Monday (only if enabled)
    if (switchData?.bonus_switch?.monday_vip_bonus === 1 && vipLevel >= VIP_REQUIREMENTS.vipMonday.requiredLevel) {
      count++;
    }

    return count;
  }, [status?.vip, switchData?.bonus_switch?.monday_vip_bonus]);

  // 当用户登录时，获取用户的Free Spins
  const { data: freeSpinsData } = useUserFreeGameRecords();

  // const formatRemainingTime = (totalSeconds?: number) => {
  //   if (!totalSeconds || totalSeconds <= 0) return "0m";
  //   const days = Math.floor(totalSeconds / (24 * 3600));
  //   const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  //   const minutes = Math.floor((totalSeconds % 3600) / 60);
  //   const d = days > 0 ? `${days}d ` : "";
  //   const h = `${hours}h `;
  //   const m = `${minutes}m`;
  //   return `${d}${h}${m}`.trim();
  // };

  const hasFreeSpins = Array.isArray(freeSpinsData?.data?.games) && freeSpinsData.data.games.length > 0;

  return (
    <div className="flex flex-col gap-3 pb-26">
      <div className="relative">
        <Hero />
        <BonusDepositCard />
      </div>

      {/* Collector Card - appears only on mobile */}
      {/* <div className="sm:hidden flex flex-col gap-3 px-5">
        <BonusCollectorCard />
      </div> */}

      <Tabs value={value} onChange={setValue} className="gap-2 bg-base-300 px-5 sm:px-0" urlTab={search.tab} />

      <div className="px-5 sm:px-0">
        {value === "dashboard" && (
          <div className="flex flex-col gap-2">
            {hasFreeSpins && (
              <>
                <div className="flex items-center gap-2">
                  <Iconify icon="custom:free-spin" width={20} height={20} className="text-primary" />
                  <p className="text-sm font-semibold">{t("bonus:freeSpins")}</p>
                  <button
                    type="button"
                    className="ml-auto text-sm sm:text-base font-semibold text-base-content/50 underline"
                    onClick={() =>
                      navigate({ to: "/profile", search: (prev) => ({ ...prev, tab: "free-spin" }) })
                    }
                  >
                    {t("bonus:spinHistory")}
                  </button>
                </div>
                <div className="sm:grid sm:grid-cols-3 sm:gap-3 flex flex-col gap-3">
                  {(freeSpinsData?.data?.games ?? []).map((g: any) => {
                    const r = g?.free_spin_record ?? {};
                    const total = Number(r?.bet_count ?? 0);
                    const used = Number(r?.current_bet_count ?? 0);
                    const remaining = r?.remaining_bets != null ? Number(r.remaining_bets) : Math.max(0, total - used);
                    const maxWin = parseFloat(r?.turnover_limit_usdt ?? r?.max_win_limit ?? r?.win_amount ?? "0");
                    const turnoverLimit = parseFloat(r?.turnover_limit_usdt ?? "0");
                    const currentTurnover = parseFloat(r?.current_turnover_limit_usdt ?? "0");
                    return (
                      <BonusFreeSpinsCard
                        key={g?.id ?? r?.id}
                        gameTitle={g?.display_game_name}
                        gameIcon={g?.image}
                        available={remaining}
                        total={total}
                        maxWin={isNaN(maxWin) ? 0 : maxWin}
                        expiration={r?.expired_at || 0}
                        gameId={g?.game_provider && g?.inner_game_id ? `${g.game_provider}:${g.inner_game_id}` : g?.inner_game_id}
                        isAvailable={remaining > 0 && !r?.is_expired}
                        handleStatus={r?.handle_status}
                        freeSpinCode={r?.free_spin_code || r?.template_key}
                        turnoverLimit={isNaN(turnoverLimit) ? 0 : turnoverLimit}
                        currentTurnover={isNaN(currentTurnover) ? 0 : currentTurnover}
                        winAmount={parseFloat(r?.win_amount ?? r?.win_bucks_amount ?? "0")}
                        currency={r?.currency || g?.currency || "USDT"}
                        isExpired={Boolean(r?.is_expired)}
                        recordId={r?.id}
                        isTurnoverMet={r?.is_turnover_requirement_met}
                      />
                    );
                  })}
                </div>
              </>
            )}

            {!isAuthenticated && (
              <>
                <div className="flex items-center gap-2">
                  <Iconify icon="custom:free-spin" width={20} height={20} className="text-primary" />
                  <p className="text-sm font-semibold">{t("bonus:freeSpins")}</p>
                </div>
                <div className="sm:grid sm:grid-cols-3 sm:gap-3 flex flex-col gap-3">
                  <BonusFreeSpinsCard
                    gameTitle=""
                    gameIcon=""
                    available={0}
                    total={0}
                    maxWin={0}
                    expiration={0}
                    gameId=""
                    isAvailable={false}
                  />
                </div>
              </>
            )}

            <InnerDisplayContent show={isAuthenticated && !bonusSwitchLoading && switchData?.bonus_switch?.conquest !== 0}>
              {/* Conquests Section - now displayed directly in dashboard */}
              <div className="flex items-center gap-2">
                <Iconify icon="custom:target" width={20} height={20} className="text-primary" />
                <p className="text-sm font-semibold">{t("bonus:conquests")}</p>
              </div>
              <BonusConquestsSection />
            </InnerDisplayContent>

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
              {unlockedVipBonuses > 0 && (
                <div className="badge badge-primary badge-soft font-bold">
                  {unlockedVipBonuses}
                </div>
              )}
            </div>
            <div className="sm:grid sm:grid-cols-5 sm:gap-3 flex flex-col gap-3">
              {isAuthenticated && <BonusVipProgressCard />}
              {/* <BonusPromoCodeCard /> */}
              <BonusAchievementsCard />
              <MysteryBoxCard />
              <BonusLuckyNumberCard />
              {/* <BonusJesterCard /> */}
              {/* <BonusCannonCard /> */}

              {switchData?.bonus_switch?.monday_vip_bonus === 1 && <BonusVipMondayCard />}
            </div>
          </div>
        )}
      </div>
      {!shouldHideAlliancePartnerships && (
        <div className="sm:block hidden">
          <AlliancePartnerships />
        </div>
      )}
      <div className="sm:block hidden">
        <Footer />
      </div>
    </div>
  );
}
