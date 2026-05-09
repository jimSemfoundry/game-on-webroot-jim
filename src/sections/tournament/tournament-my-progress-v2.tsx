import { useTranslation } from "react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import Iconify from "@/components/iconify";
import type { ITournamentInfo } from "@/types/tournament";
import { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

interface TournamentMyProgressProps {
  data: ITournamentInfo;
  children?: ReactNode
  id?: string | number,
  showPastLeaderboard?: boolean
}

export function TournamentMyProgressV2({ data, children, id, showPastLeaderboard = true }: TournamentMyProgressProps) {
  const { t } = useTranslation('tournament');
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const position = data?.rank || 0;
  const wagered = Number(data?.wagered || 0);
  const prize = Number(data?.prize || 0);

  // 格式化金额显示 (假设后端返回的是 USD)
  const formattedWagered = formatWithConversion(
    wagered,
    "USD",
    { showCode: false, showSymbol: true }
  );

  const formattedPrize = formatWithConversion(
    prize,
    "USD",
    { showCode: false, showSymbol: true }
  );

  const navigate = useNavigate();

  return (
    <>
      <div className="hidden lg:block bg-base-200 rounded-field p-3 sm:p-4">
        {/* Header + Inline summary on desktop */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Iconify icon="custom:chart" className="w-4 h-4 text-primary" />
            <h3 className="text-sm sm:text-lg font-bold text-base-content">
              {t("tournament:myProgress", "My Progress")}
            </h3>
          </div>

          {/* Inline summary (desktop and up) */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Position */}
              <span className="bg-base-content/50 text-base-content rounded-field px-2 h-6 min-w-[36px] flex items-center justify-center text-xs font-semibold">
                {position <= 0 && t('tournament:unranked')}
                {position > 0 && position <= 1000 && position}
                {position > 1000 && t('tournament:unranked')}
              </span>
              <span className="text-sm font-semibold text-base-content">
                {t("tournament:myPosition", "Position")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Wagered */}
              <span className="bg-primary text-primary-content px-2 rounded-field h-6 flex items-center text-sm font-semibold">
                {formattedWagered.formatted}
              </span>
              <span className="text-sm font-semibold text-base-content">
                {t("tournament:wagered", "Wagered")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Prize */}
              <span className="bg-success text-base-content px-2 rounded-field h-6 flex items-center text-sm font-semibold">
                {formattedPrize.formatted}
              </span>
              <span className="text-sm font-semibold text-base-content">
                {t("tournament:prize", "Prize")}
              </span>
            </div>
          </div>
          
          {showPastLeaderboard && (
            <button className="btn btn-soft btn-primary" onClick={() => navigate({ to: "/tournament/lastweek/$id", params: { id: String(id) } })}>{t("tournament:pastLeaderboard", "Past Leaderboard")}</button>
          )}
        </div>
      </div>

      <div className="bg-base-200 rounded-field overflow-hidden">
        {/* Stacked summary for mobile */}
        <div className="space-y-2 lg:hidden p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <Iconify icon="custom:chart" className="w-4 h-4 text-primary" />
            <h3 className="text-sm sm:text-lg font-bold text-base-content">
              {t("tournament:myProgress", "My Progress")}
            </h3>
          </div>

          <div className="flex items-center justify-between h-6.5">
            <span className="text-xs text-base-content font-semibold">
              {t("tournament:myPosition", "Position")}
            </span>
            <span className="bg-base-content/50 text-base-content rounded-full text-xs font-semibold px-2 text-center">
              {position <= 0 && t('tournament:unranked')}
              {position > 0 && position <= 1000 && position}
              {position > 1000 && t('tournament:unranked')}
            </span>
          </div>

          <div className="flex items-center justify-between h-6.5">
            <span className="text-xs text-base-content font-semibold">
              {t("tournament:wagered", "Wagered")}
            </span>
            <span className="bg-primary text-primary-content px-2 rounded-full text-xs font-semibold">
              {formattedWagered.formatted}
            </span>
          </div>

          <div className="flex items-center justify-between h-6.5">
            <span className="text-xs text-base-content font-semibold">
              {t("tournament:prize", "Prize")}
            </span>
            <span className="bg-secondary text-secondary-content px-2 rounded-full text-xs font-semibold">
              {formattedPrize.formatted}
            </span>
          </div>
          {
            showPastLeaderboard && (
              <div className="flex justify-center w-full">
                <button className="btn btn-soft btn-primary w-full sm:max-w-[311px]" onClick={() => navigate({ to: "/tournament/lastweek/$id", params: { id: String(id) } })}>{t("tournament:pastLeaderboard", "Past Leaderboard")}</button>
              </div>
            )
          }
        </div>

        {children}
      </div>
    </>
  );
}