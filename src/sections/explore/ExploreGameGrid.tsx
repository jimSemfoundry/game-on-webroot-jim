import { GameImage } from "@/components/ui/GameImage";
import { ChevronDown, Loader2 } from "lucide-react";

interface ExploreGameGridProps {
  isLoading: boolean;
  isError: boolean;
  casinoGameList?: {
    data?: Array<{
      id: string;
      name: string;
      image: string;
    }>;
  };
  hasMoreGames?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  totalCount?: number;
  currentCount?: number;
}

export function ExploreGameGrid({
  isLoading,
  isError,
  casinoGameList,
  hasMoreGames = false,
  isLoadingMore = false,
  onLoadMore,
  totalCount = 0,
  currentCount = 0,
}: ExploreGameGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-red-500">Error loading game list</span>
      </div>
    );
  }

  // Check if there are no games
  const hasGames = casinoGameList?.data && casinoGameList.data.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Game Grid */}
      {hasGames && (
        <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
          {casinoGameList?.data?.map((game: any) => (
            <GameImage 
              key={game.id ?? `${game.game_provider}:${game.inner_game_id}`}
              data={game}
              game={{
                inner_game_id: game.inner_game_id,
                game_provider: game.game_provider,
                game_name: game.display_game_name || game.name,
                image: game.image
              }}
              showHoverEffects={true} 
            />
          ))}
        </div>
      )}

      {/* Show More Button and Game Count - only show when there are games */}
      {hasGames && (
        <div className="flex flex-col items-center py-4 gap-3">
          {hasMoreGames && totalCount > 0 && currentCount > 0 && (
            <button className="btn btn-primary w-full sm:w-auto btn-md sm:btn-lg" onClick={onLoadMore} disabled={isLoadingMore}>
              {isLoadingMore ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                </>
              ) : (
                "Show More"
              )}
              <ChevronDown className="w-4 h-4" />
            </button>
          )}

          {/* Game Count Display */}
          {totalCount > 0 && currentCount > 0 && (
            <div className="text-sm text-base-content/50 font-medium">
              {currentCount} of {totalCount} Games
            </div>
          )}
        </div>
      )}
    </div>
  );
}
