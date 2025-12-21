import Iconify from "@/components/iconify";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { cn } from "@/utils/cn";
import { memo, useCallback } from "react";

interface LiveBetRowProps {
    bet: any;
    gameName: string;
    gameCategory: string;
    vipLevel: string | number;
    nickname: string;
    betAmountFormatted: string;
    multiplier: string;
    profitFormatted: string;
    isWin: boolean;
    currency: string;
    onRowClick: (bet: any) => void;
}

export const LiveBetRow = memo(({
    bet,
    gameName,
    gameCategory,
    vipLevel,
    nickname,
    betAmountFormatted,
    multiplier,
    profitFormatted,
    isWin,
    currency,
    onRowClick
}: LiveBetRowProps) => {
    const handleClick = useCallback(() => {
        onRowClick(bet);
    }, [bet, onRowClick]);

    return (
        <div
            className="px-3 sm:px-6 py-3 sm:py-3 hover:bg-base-200/90 transition-colors cursor-pointer bg-base-200 rounded-field"
            onClick={handleClick}
        >
            <div className="grid grid-cols-3 sm:grid-cols-5 sm:grid-cols-[1.8fr_1.5fr_1fr_0.5fr_1fr] gap-4 items-center">
                {/* Game */}
                <div className="font-semibold text-base-content text-xs sm:text-base">
                    <div className="flex items-center gap-2">
                        <Iconify icon={`custom:${gameCategory}`} className="min-w-4 min-h-4" />
                        <p className="truncate">{gameName}</p>
                    </div>
                </div>

                {/* User */}
                <div className="text-base-content/70 text-xs sm:text-base font-semibold">
                    <div className="flex items-center gap-2">
                        <img src={`/images/vip/levels/${vipLevel}.png`} alt="VIP" className="w-4 h-4" />
                        <p className="truncate">{nickname}</p>
                    </div>
                </div>

                {/* Bet Amount - Hidden on mobile */}
                <div className="hidden sm:block text-base-content/70 text-xs sm:text-base font-semibold">
                    <div className="flex items-center gap-1">
                        <CurrencyIcon currency={currency} />
                        <span className="text-xs sm:text-sm">
                            {betAmountFormatted}
                        </span>
                    </div>
                </div>

                {/* Multiplier - Hidden on mobile */}
                <div className="hidden sm:block text-base-content/70 text-xs sm:text-base font-semibold">
                    <span className="text-xs sm:text-sm">
                        {multiplier}
                    </span>
                </div>

                {/* Profit */}
                <div className="text-end text-xs sm:text-base">
                    <div className="flex items-center gap-1 justify-end">
                        <span className={cn("text-xs sm:text-sm font-bold", isWin ? "text-primary" : "text-base-content/50")}>
                            {profitFormatted}
                        </span>
                        <CurrencyIcon currency={currency} />
                    </div>
                </div>
            </div>
        </div>
    );
});

LiveBetRow.displayName = 'LiveBetRow';
