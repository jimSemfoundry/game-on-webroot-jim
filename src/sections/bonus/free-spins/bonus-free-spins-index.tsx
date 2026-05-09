import { useUserFreeGameRecords } from "@/hooks/api/useAuth.ts";
import { useSidebar } from "@/contexts/SidebarContext";
import { BonusListHeader } from "../bonus-components/header.tsx";
import { useTranslation } from "react-i18next";
import Iconify from "@/components/iconify";
import { useNavigate } from "@tanstack/react-router";
import { UnAuthCard } from "../bonus-components/unAuth-card.tsx";
import { BonusFreeSpinsCardV2 } from "./bonus-free-spins-card-v2.tsx";
import { useAuth } from "@/contexts/AuthContext";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";

export const BonusFreeSpinsIndex = () => {
  const { data: freeSpinsData } = useUserFreeGameRecords();
  const { t } = useTranslation();
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const freeSpinsImg = useBonusDetailsImage("free_spins", 96);

  const hasFreeSpins = Array.isArray(freeSpinsData?.data?.games) && freeSpinsData.data.games.length > 0;

  return (
    (!isAuthenticated || hasFreeSpins) && (
      <BonusListHeader
        title={t("bonus:freeSpins")}
        icon={
          <Iconify icon="custom:free-spin" width={20} height={20} className="text-primary" />
        }
        hasArrow={isMobile}
        jumpTo={() => {
          navigate({ to: "/profile", search: (prev) => ({ ...prev, tab: "free-spin" }) })
        }}
        hasHistory
        childrenClassName="grid grid-cols-1 gap-3 min-[1150px]:grid-cols-2 min-[1550px]:grid-cols-3"
      >
        {hasFreeSpins && (
          <>
            {(freeSpinsData?.data?.games ?? []).map((g: any) => {
              const r = g?.free_spin_record ?? {};
              const total = Number(r?.bet_count ?? 0);
              const used = Number(r?.current_bet_count ?? 0);
              const remaining = r?.remaining_bets != null ? Number(r.remaining_bets) : Math.max(0, total - used);
              const maxWin = parseFloat(r?.win_amount ?? r?.win_bucks_amount ?? "0");
              const turnoverLimit = parseFloat(r?.turnover_limit_usdt ?? "0");
              const currentTurnover = parseFloat(r?.current_turnover_limit_usdt ?? "0");
              return (
                <BonusFreeSpinsCardV2
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
          </>
        )}
        {!isAuthenticated && (
          <UnAuthCard
            bgcolor="radial-gradient(80% 300% at 0% 46.47%, rgba(15, 20, 26, 0) 0%, rgba(123, 18, 228, 0.5) 100%)"
            titleDom={
              <div className="text-base-content text-lg font-bold leading-5 text-left">
                {t("casino:freeSpins")}
                <br />
                <span className="text-primary uppercase">{t("bonus:bonus")}</span>
              </div>
            }
            imgSrc={freeSpinsImg}
          />
        )}
      </BonusListHeader>
    )
  );
};