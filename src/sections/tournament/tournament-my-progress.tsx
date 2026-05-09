import { useTranslation } from "react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import Iconify from "@/components/iconify";
import type { ITournamentInfo } from "@/types/tournament";
import { ReactNode } from "react";

interface TournamentMyProgressProps {
  data: ITournamentInfo;
  children?: ReactNode
}

export function TournamentMyProgress({ data, children }: TournamentMyProgressProps) {
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

  return (
    <div className="bg-base-200 rounded-field p-3 sm:p-4">
      {/* Header + Inline summary on desktop */}
      <div className="flex items-center gap-2">
        <Iconify icon="custom:chart" className="w-4 h-4 text-primary" />
        <h3 className="text-sm sm:text-lg font-bold text-base-content">
          {t("tournament:myProgress", "My Progress")}
        </h3>

        {/* Inline summary (desktop and up) */}
        <div className="hidden sm:flex items-center gap-3 ml-auto pr-1">
          {/* Position */}
          <span className="bg-base-content/20 text-base-content rounded-field px-2 h-6 min-w-[36px] flex items-center justify-center text-xs font-semibold">
            {position <= 0 && t('tournament:unranked')}
            {position > 0 && position <= 1000 && position}
            {position > 1000 && t('tournament:unranked')}
          </span>
          <span className="text-sm font-semibold text-base-content/90">
            {t("tournament:myPosition", "Position")}
          </span>

          {/* Wagered */}
          <span className="bg-primary text-primary-content px-2 rounded-field h-6 flex items-center text-sm font-semibold">
            {formattedWagered.formatted}
          </span>
          <span className="text-sm font-semibold text-base-content/90">
            {t("tournament:wagered", "Wagered")}
          </span>

          {/* Prize */}
          <span className="bg-primary text-primary-content px-2 rounded-field h-6 flex items-center text-sm font-semibold">
            {formattedPrize.formatted}
          </span>
          <span className="text-sm font-semibold text-base-content/90">
            {t("tournament:prize", "Prize")}
          </span>
        </div>
      </div>

      {/* Stacked summary for mobile */}
      <div className="space-y-2 mt-3 sm:hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs text-base-content/50 font-semibold">
            {t("tournament:myPosition", "Position")}
          </span>
          <span className="bg-base-content/20 text-base-content rounded-sm text-xs font-semibold p-1 text-center">
            {position <= 0 && t('tournament:unranked')}
            {position > 0 && position <= 1000 && position}
            {position > 1000 && t('tournament:unranked')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-base-content/50 font-semibold">
            {t("tournament:wagered", "Wagered")}
          </span>
          <span className="bg-primary text-primary-content p-1 rounded-sm text-xs font-semibold">
            {formattedWagered.formatted}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-base-content/50 font-semibold">
            {t("tournament:prize", "Prize")}
          </span>
          <span className="bg-primary text-primary-content p-1 rounded-sm text-xs font-semibold">
            {formattedPrize.formatted}
          </span>
        </div>
      </div>

      {children}
    </div>
  );
}