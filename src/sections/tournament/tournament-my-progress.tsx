import { useTranslation } from "react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import Iconify from "@/components/iconify";
import type { ITournamentInfo } from "@/types/tournament";

interface TournamentMyProgressProps {
  data: ITournamentInfo;
}

export function TournamentMyProgress({ data }: TournamentMyProgressProps) {
  const { t } = useTranslation();
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
        <h3 className="text-xs sm:text-lg font-bold text-base-content">
          {t("tournament:myProgress", "My Progress")}
        </h3>

        {/* Inline summary (desktop and up) */}
        <div className="hidden sm:flex items-center gap-3 ml-auto pr-1">
          {/* Position */}
          <span className="bg-base-content/20 text-base-content rounded-field px-2 h-6 min-w-[36px] flex items-center justify-center text-xs font-semibold">
            {position > 0 ? position : "N/A"}
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
      <div className="space-y-3 mt-3 sm:hidden">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-base-content font-semibold">
            {t("tournament:myPosition", "Position")}
          </span>
          <span className="bg-base-content/20 text-base-content rounded-full text-xs font-semibold min-w-[60px] text-center">
            {position > 0 ? position : "N/A"}
          </span>
        </div>

        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-base-content font-semibold">
            {t("tournament:wagered", "Wagered")}
          </span>
          <span className="bg-primary text-primary-content px-2 rounded-full text-xs font-semibold">
            {formattedWagered.formatted}
          </span>
        </div>

        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-base-content font-semibold">
            {t("tournament:prize", "Prize")}
          </span>
          <span className="bg-primary text-primary-content px-2 rounded-full text-xs font-semibold">
            {formattedPrize.formatted}
          </span>
        </div>
      </div>
    </div>
  );
}
