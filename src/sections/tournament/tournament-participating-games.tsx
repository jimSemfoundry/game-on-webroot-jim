import { forwardRef, useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { VirtuosoGrid } from "react-virtuoso";
import { GameImage } from "@/components/ui/GameImage";
import Iconify from "@/components/iconify";
import type { ITournament } from "@/types/tournament";
import { useNavigate } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { publicService } from "@/services/publicService";
import { useBannedGameCheck } from "@/hooks/useBannedGameCheck.ts";

interface TournamentParticipatingGamesProps {
  tournament: ITournament | null;
}

export function TournamentParticipatingGames({ tournament }: TournamentParticipatingGamesProps) {
  const { t } = useTranslation(['tournament', 'casino']);
  const navigate = useNavigate();

  // 使用自定义 hook 检查游戏是否被禁止
  const isGameBanned = useBannedGameCheck(true);

  const provider = tournament?.game_provider;

  const { data, fetchNextPage, isFetching } = useInfiniteQuery({
    queryKey: ["TournamentGameList", provider],
    queryFn: async ({ pageParam = 1 }) => {
      // 复用现有公共服务：按提供商与赛事过滤（后端需支持 is_tournament）
      return publicService.getCasinoGameList({
        limit: 30,
        page: pageParam,
        providers: provider === "RakeRace" ? "" : provider,
        is_tournament: "1",
        lang: i18n.language?.toUpperCase?.() || "EN",
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      if (!lastPage || lastPage.code !== 0) return undefined;
      return 30 * lastPage.page > lastPage.count ? undefined : lastPage.page + 1;
    },
    enabled: !!provider,
    placeholderData: (prev) => prev,
  });

  const allItems = useMemo(() => {
    return (
      data?.pages?.filter((p: any) => p?.code === 0 && Array.isArray(p?.data)).flatMap((p: any) => p.data || [])?.filter((game:Record<string, any>) => !isGameBanned(game)) || []
    );
  }, [data, isGameBanned]);

  const totalCount = data?.pages?.[0]?.count ?? 0;
  const loadedCount = allItems.length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Iconify icon="custom:gameboy" className="w-4 h-4 text-primary" />
          <div className="font-bold text-base-content text-sm">
            {t("tournament:participatingGames", "Participating Games")}
          </div>
        </div>
        <button className="btn btn-sm btn-primary rounded-field px-4"
        onClick={() => {
          void navigate({
            to: "/explore",
            search: {
              type: "casino",
              sort: "popular",
              category: "hot"
            },
          });
        }}>{t("casino:all", "All")}</button>
      </div>

      <div className={`${allItems.length > 0 ? "h-110" : "h-1"} mt-3 bg-base-300 rounded-field`}>
        <div className="h-full flex-1 pb-3 relative">
          <VirtuosoGrid
            style={{ height: "100%" }}
            data={allItems}
            components={gridComponents}
            endReached={() => fetchNextPage()}
            itemContent={(_, item: any) => (
              <ItemWrapper>
                <div
                  key={item.id}
                  className="relative h-full w-full"
                  onClick={() => navigate({ to: "/games/$gameId", params: { gameId: item.game_provider ? `${item.game_provider}:${item.inner_game_id}` : item.inner_game_id }, search: {} })}
                >
                  <GameImage
                    data={item}
                    game={{
                      image: item.image || "",
                      inner_game_id: item.inner_game_id,
                      game_provider: item.game_provider,
                      title: item.game_name,
                    }}
                    showHoverEffects
                  />

                </div>
              </ItemWrapper>
            )}
          />

          {isFetching && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="loading loading-spinner loading-xl text-primary" />
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-base-content/60 text-sm mt-2">
        <Trans i18nKey="common:of_games" values={{ totalCount, loadedCount }} />
      </div>
    </div>
  );
}

const gridComponents = {
  List: forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { style?: React.CSSProperties; children?: React.ReactNode }
  >(({ style, children, ...props }, ref) => (
    <div
      ref={ref}
      {...props}
      style={{
        ...style,
      }}
      className="grid grid-cols-3 sm:grid-cols-7 gap-2"
    >
      {children}
    </div>
  )),
  Item: ({ children, ...props }: { children?: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props} className="aspect-[3/4]">
      {children}
    </div>
  ),
};

const ItemWrapper = ({ children, ...props }: { children?: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className="h-full w-full">
    {children}
  </div>
);


