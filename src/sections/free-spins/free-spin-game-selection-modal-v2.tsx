import Iconify from "@/components/iconify";
import { GameImage } from "@/components/ui/GameImage";
import { useEnableRecord, useSupportedGamesInfinite } from "@/query/free-spins";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Virtuoso } from 'react-virtuoso';
import { GameItem } from './types';
import { useBannedGameCheck } from "@/hooks/useBannedGameCheck.ts";
import { FreeSpinData } from "./types";


export const FreeSpinGameSelectionV2 = (
    { freeSpinData, giveUp, onClaimSuccess }:
    { freeSpinData: FreeSpinData, giveUp: () => void, onClaimSuccess?: () => void }
) => {
  const { t } = useTranslation('popup');


  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const enableRecordMutation = useEnableRecord();

  // 使用自定义 hook 检查游戏是否被禁止
  const isGameBanned = useBannedGameCheck(true);

  const freeSpinsCount = freeSpinData?.bet_count || ''

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useSupportedGamesInfinite({
    record_id: freeSpinData?.id || '',
  });

  // Flatten all pages of games data
  const allGames = useMemo(() => {
    if (!infiniteData?.pages) return [];
    return infiniteData.pages.flatMap((page: any) =>
      page.code === 0 ? page.data.games || [] : []
    )?.filter((game: Record<string, any>) => !isGameBanned(game));
  }, [infiniteData, isGameBanned]);

  // Get total count from the first page
  const totalGames = useMemo(() => {
    if (infiniteData?.pages?.[0]?.code === 0) {
      return infiniteData.pages[0].data.total || 0;
    }
  }, [infiniteData]);

  // Chunk games into rows of 3 for grid layout
  const chunkedGames = useMemo(() => {
    const result = [];
    for (let i = 0; i < allGames.length; i += 3) {
      result.push(allGames.slice(i, i + 3));
    }
    return result;
  }, [allGames]);

  // 处理游戏卡片点击
  const handleGameClick = (item: GameItem) => {
    if (enableRecordMutation.isPending) {
      return
    }
    if (selectedGame?.id === item.id) {
      // 如果已经选中，则取消选择
      setSelectedGame(null);
    } else {
      // 选择新的游戏
      setSelectedGame(item);
    }
  };

  // 处理确认领取
  const handleClaim = (item: GameItem) => {
    if (!freeSpinData?.id || !item?.inner_game_id) {
      console.error("Missing required data for enabling free spin record");
      return;
    }

    enableRecordMutation.mutate({
      game_id: item.id,
      record_id: freeSpinData.id,
      inner_game_id: item.inner_game_id,
    }, {
      onSuccess: () => {
        // API 成功后重置状态并调用成功回调
        setSelectedGame(null);
        console.log("Free spin enabled successfully for game:", item.display_game_name);

        // 调用成功回调，直接关闭所有modal
        if (onClaimSuccess) {
          onClaimSuccess();
        }
      },
      onError: (error) => {
        console.error("Failed to enable free spin record:", error);
        setSelectedGame(null);
      }
    });
  };

  const handleContinueClick = () => {
    if (!selectedGame || enableRecordMutation.isPending) {
      return;
    }

    handleClaim(selectedGame);
  };



  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex flex-col gap-4 h-full px-5 sm:px-0">
          <div className="text-base-content font-semibold text-base sm:text-lg">{t('popup:freeSpins.claim_free_spins')}</div>

          <div className="text-base-content/50 font-normal text-sm sm:text-base font-montserrat">
            {t('popup:freeSpins.eligible_games_desc', {
              freeSpinsCount: freeSpinsCount,
            })}
          </div>
          <div className="flex items-center gap-2">
            <Iconify icon='custom:bonus' className="w-4 h-4 sm:w-5 sm:h-5 text-base-content/50" />
            <div className="text-[14px] font-montserrat text-base-content">{t('popup:freeSpins.eligible_games')}</div>
            <div className="badge badge-primary badge-soft font-semibold">{totalGames}</div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {
              chunkedGames.length > 0 && (
                <Virtuoso
                  data={chunkedGames}
                  totalCount={chunkedGames.length}
                  endReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                      fetchNextPage();
                    }
                  }}
                  itemContent={(index: number, row: any) => (
                    <div className="grid grid-cols-3 gap-2 py-1">
                      {row.map((item: any, itemIndex: number) => {
                        const gameKey = `${index}-${itemIndex}`;
                        const isSelected = selectedGame?.id === item.id;

                        return (
                          <div
                            key={gameKey}
                            className={`relative cursor-pointer rounded-field 
                            ${isSelected ? 'border-[2px] border-primary' : ''
                              }`
                            }
                            onClick={() => handleGameClick(item)}
                          >
                            {
                              isSelected && (
                                <div className="bg-primary rounded-bl-md absolute top-0 right-0 w-5 h-5 flex items-center justify-center z-10">
                                  <Iconify icon="custom:check_in" width={13} height={11} className="text-primary-content" />
                                </div>
                              )
                            }

                            <GameImage
                              data={item}
                              game={{
                                game_provider: item.game_provider,
                                image: item.image,
                              }}
                              containerClassName="bg-transparent border-none"
                              className="object-fill"
                              disableNavigation={true}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                  components={{
                    Footer: () => {
                      if (isFetchingNextPage) {
                        return (
                          <div className="flex justify-center py-4">
                            <div className="loading loading-spinner loading-sm"></div>
                          </div>
                        );
                      }
                      return null;
                    },
                  }}
                />
              )
            }

            {
              (!isPending && chunkedGames.length === 0) && (
                <div className="flex flex-col items-center justify-center">
                  <img src="/images/bonus/free-spins_empty.png" alt="" className="w-50 h-50 object-cover" />
                  <div className="mt-4 w-[256px] text-center text-lg font-bold text-base-content">{t("bonus:no_games_available")}</div>
                </div>
              )
            }

            {
              isPending && (
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="loading loading-spinner loading-xl text-primary" />
                </div>
              )
            }
          </div>
        </div>
        <div className="bg-base-300 h-20 flex items-center justify-between gap-2 px-3">
          <button className="btn btn-ghost btn-outline text-primary flex-1 h-12" onClick={giveUp}>
            {t("bonus:giveUp")}
          </button>
          {
            chunkedGames.length > 0 && (
              <button
                onClick={handleContinueClick}
                disabled={!selectedGame}
                className={`${selectedGame ? "text-primary-content" : ""} btn btn-primary flex-1 h-12 font-bold`}
              >
                {enableRecordMutation.isPending ? <span className="loading loading-spinner loading-md" /> : t("bonus:continue")}
              </button>
            )
          }
        </div>
      </div>
    </>
  );
};
