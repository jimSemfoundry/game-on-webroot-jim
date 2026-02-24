import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { cn } from "@/utils/cn";

export const BetRowSkeleton = () => (
  <div className="px-3 sm:px-6 py-3 sm:py-3 bg-base-200 rounded-field mb-1">
    <div className="grid grid-cols-3 sm:grid-cols-5 sm:grid-cols-[1.8fr_1.5fr_1fr_0.5fr_1fr] gap-4 items-center">
      <div className="skeleton h-4 w-full rounded-sm"></div>
      <div className="skeleton h-4 w-full rounded-sm"></div>
      <div className="hidden sm:block skeleton h-4 w-full rounded-sm"></div>
      <div className="hidden sm:block skeleton h-4 w-full rounded-sm"></div>
      <div className="flex justify-end">
        <div className="skeleton h-4 w-full rounded-sm"></div>
      </div>
    </div>
  </div>
);

interface BetRowProps {
  bet: any;
  index: number;
  format: (amount: number, currency: string, opts: any) => { formatted: string };
  onClick: (bet: any) => void;
}

export const BetRow = ({ bet, index, format, onClick }: BetRowProps) => {
  const betAmount = bet.real_bet_amount || bet.bet_amount || 0;
  const winAmount = bet.real_win_amount || bet.win_amount || 0;
  const currency = bet.real_currency || bet.currency || "USD";
  // const gameCategory = bet.game_category_1 || bet.game_category || "slots";

  return (
    <div
      key={bet._uniqueKey || `fallback-${bet.id || index}-${bet.nickname}`}
      className="px-3 sm:px-6 py-3 sm:py-3 hover:bg-base-200/90 transition-colors cursor-pointer bg-base-200 rounded-field mb-1"
      onClick={() => onClick(bet)}
    >
      <div className="grid grid-cols-3 sm:grid-cols-5 sm:grid-cols-[1.8fr_1.5fr_1fr_0.5fr_1fr] gap-4 items-center">
        {/* Game */}
        <div className="font-semibold text-base-content text-xs sm:text-base min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 min-w-0 w-full overflow-hidden">
            {/*<Iconify icon={`custom:${gameCategory}`} className="min-w-4 min-h-4" />*/}
            <p className="truncate font-bold min-w-0 w-full">{bet.game_name}</p>
          </div>
        </div>

        {/* User */}
        <div className="text-base-content/70 text-xs sm:text-base font-semibold">
          <div className="flex items-center gap-2">
            <p className="truncate font-bold">{bet.nickname}</p>
          </div>
        </div>

        {/* Bet Amount - Hidden on mobile */}
        <div className="hidden sm:block text-base-content/70 text-xs sm:text-base font-semibold">
          <div className="flex items-center gap-1">
            <CurrencyIcon currency={currency} />
            <span className="text-xs sm:text-sm">
              {format(betAmount, currency, {
                compact: false,
                showCode: false,
                minimizeDecimals: true
              }).formatted}
            </span>
          </div>
        </div>

        {/* Multiplier - Hidden on mobile */}
        <div className="hidden sm:block text-base-content/70 text-xs sm:text-base font-semibold">
          <span className="text-xs sm:text-sm">
            {betAmount && Number(betAmount) !== 0 ? Number((winAmount / betAmount).toFixed(1)) : "0.0"}x
          </span>
        </div>

        {/* Profit */}
        <div className="text-end text-xs sm:text-base">
          <div className="flex items-center gap-1 justify-end">
            <span
              className={cn("truncate text-xs sm:text-sm font-bold", winAmount > 0 ? "text-primary" : "text-base-content/50")}>
              {winAmount > 0 ? "+" : ""}
              {format(winAmount, currency, {
                compact: false,
                showCode: false,
                minimizeDecimals: true
              }).formatted}
            </span>
            <CurrencyIcon currency={currency} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const getBetOrderRowKey = (bet: Record<string, any>, index: number) => {
  const betId = bet?.id;
  const betCreatedAt = bet?.created_at;
  const keyParts = [
    String(betId),
    String(betCreatedAt ?? ""),
    String(bet?.nickname ?? ""),
    String(bet?.game_name ?? ""),
    String(index)
  ].join("|");
  return `bet-${keyParts}`;
};

export const ROW_LIMIT = 10