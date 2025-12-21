import { useTranslation } from "react-i18next";
import { Card } from "@/sections/profile/c/Card.tsx";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext.tsx";
import { GameImage } from "@/components/ui/GameImage.tsx";
import { useTopWageredGames } from "@/hooks/api/useAuth.ts";
import Iconify from "@/components/iconify";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

export function Top3Games() {
  const { t } = useTranslation();
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const { data: games, isLoading } = useTopWageredGames();

  return (
    <DisplayContent status={!isLoading && (games?.data ?? [])?.length > 0}>
      <Card
        icon={<Iconify icon="custom:recent-top" className="text-primary" />}
        title={t("common.top3Games")}
      >
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 ">
          {(games?.data ?? []).map((game: Record<string, any>) => (
            <div key={game.id} className="flex flex-col items-center sm:gap-4 text-xs text-base-content/50 sm:bg-base-300 sm:p-4 sm:rounded-field sm:flex-row">
              <GameImage
                data={game}
                game={{
                  inner_game_id: game.inner_game_id,
                  game_provider: game.game_provider,
                  game_name: game.display_game_name,
                  image: game.image
                }}
                showHoverEffects={true}
                className="object-fill origin-center"
                containerClassName="rounded-field sm:h-[134px] sm:w-[98px]"
              />
              <div className="flex flex-col sm:gap-2 min-w-0 sm:flex-1 sm:items-start w-full">
                <span className="truncate text-xs text-base-content/50 text-center sm:text-left leading-[18px] sm:text-base sm:leading-6 w-full">{game?.display_game_name}</span>
                <span className="font-bold text-xs leading-3 text-center sm:text-left sm:text-lg sm:leading-5 w-full">
                  {formatWithConversion(game?.wagered_usdt || 0, "USDT", {
                    showSymbol: true,
                    showCode: false
                  }).formatted}
                </span>
              </div>

            </div>
          ))}
        </div>
      </Card>
    </DisplayContent>
  );
}
