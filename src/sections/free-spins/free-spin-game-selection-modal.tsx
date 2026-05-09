import { varFade } from "@/components/animate";
import Iconify from "@/components/iconify";
import { GameImage } from "@/components/ui/GameImage";
import { Modal } from "@/components/ui/Modal";
import { useEnableRecord, useSupportedGamesInfinite } from "@/query/free-spins";
import { AnimatePresence, m } from "motion/react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Virtuoso } from 'react-virtuoso';

import { FreeSpinGameSelectionProps, GameItem } from './types';
import { useBannedGameCheck } from "@/hooks/useBannedGameCheck.ts";

export const FreeSpinGameSelection = ({
  open,
  onExit,
  freeSpinData,
  onSelectGame: _onSelectGame,
  onClaimSuccess,
}: FreeSpinGameSelectionProps) => {

  const { t } = useTranslation(['popup', 'common']);
  const [selectedGameIndex, setSelectedGameIndex] = useState<string | null>(null);
  const enableRecordMutation = useEnableRecord();

  // 使用自定义 hook 检查游戏是否被禁止
  const isGameBanned = useBannedGameCheck(true);

  const freeSpinsCount = freeSpinData?.bet_count || ''

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSupportedGamesInfinite({
    record_id: freeSpinData?.id || '',
  });

  // Flatten all pages of games data
  const allGames = useMemo(() => {
    if (!infiniteData?.pages) return [];
    return infiniteData.pages.flatMap((page: any) =>
      page.code === 0 ? page.data.games || [] : []
    )?.filter((game:Record<string, any>) => !isGameBanned(game));
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
  const handleGameClick = (_item: GameItem, index: number, rowIndex: number) => {
    const gameKey = rowIndex === -1 ? `fallback-${index}` : `${rowIndex}-${index}`;
    if (selectedGameIndex === gameKey) {
      // 如果已经选中，则取消选择
      setSelectedGameIndex(null);
    } else {
      // 选择新的游戏
      setSelectedGameIndex(gameKey);
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
        setSelectedGameIndex(null);
        console.log("Free spin enabled successfully for game:", item.display_game_name);

        // 调用成功回调，直接关闭所有modal
        if (onClaimSuccess) {
          onClaimSuccess();
        }
      },
      onError: (error) => {
        console.error("Failed to enable free spin record:", error);
        setSelectedGameIndex(null);
      }
    });
  };

  return (
    <Modal
      isOpen={open}
      onClose={onExit}
      title={<div className="text-base-content font-semibold text-base sm:text-lg">{t('popup:freeSpins.claim_free_spins')}</div>}
      className="md:w-[600px] max-w-2xl bg-base-400"
    >
      <div className="h-[70vh] flex flex-col gap-4">
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
          {allGames.length === 0 ? (
            // 空状态
            <div className="flex items-center justify-center py-20 h-full">
              <div className="flex flex-col items-center gap-4">
                <img
                  src="/images/illustrations/no-data.svg"
                  alt="No data"
                  className="w-32 h-32 sm:w-40 sm:h-40 opacity-50"
                />
                <div className="text-base-content/50 text-sm font-semibold">
                  {t("common:common.noData")}
                </div>
              </div>
            </div>
          ) : chunkedGames.length > 0 ? (
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
                    const isSelected = selectedGameIndex === gameKey;
                    const isLoading = enableRecordMutation.isPending && isSelected;

                    return (
                      <div
                        key={gameKey}
                        className={`relative cursor-pointer transition-all duration-300 ${
                          isSelected ? 'z-10' : 'z-0'
                          }`}
                        onClick={() => handleGameClick(item, itemIndex, index)}
                      >
                        <GameImage
                          data={item}
                          game={{
                            game_provider: item.game_provider,
                            image: item.image,
                          }}
                          containerClassName="bg-transparent"
                          className="rounded-field object-fill"
                          disableNavigation={true}
                        />

                        {/* 确认覆盖层 */}
                        <AnimatePresence>
                          {isSelected && (
                            <m.div
                              className="absolute inset-0 flex flex-col items-center justify-center rounded-field backdrop-blur-[2px]"
                              variants={varFade('in')}
                              initial="initial"
                              animate="animate"
                              exit="exit"
                            >
                              <m.div
                                className="text-center text-white font-bold text-xs mb-6 px-2 bg-base-400/40 py-2"
                                variants={varFade('inDown', { distance: 20 })}
                                initial="initial"
                                animate="animate"
                                transition={{ delay: 0.1 }}
                              >
                                {t('popup:freeSpins.redeem_count_free_spins', {
                                  freeSpinsCount: freeSpinsCount,
                                })}
                              </m.div>
                              <m.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClaim(item);
                                }}
                                disabled={isLoading}
                                className="btn btn-primary btn-sm sm:btn-md px-4"
                                variants={varFade('inUp', { distance: 20 })}
                                initial="initial"
                                animate="animate"
                                transition={{ delay: 0.2 }}
                              >
                                {isLoading ? (
                                  <span className="loading loading-spinner loading-xs" />
                                ) : (
                                  t("bonus:claim")
                                )}
                              </m.button>
                            </m.div>
                          )}
                        </AnimatePresence>
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
          ) : (
            // Fallback to original grid when no infinite data
            <div className="grid grid-cols-3 gap-2">
              {allGames?.map((item: any, index: number) => {
                const gameKey = `fallback-${index}`;
                const isSelected = selectedGameIndex === gameKey;
                const isLoading = enableRecordMutation.isPending && isSelected;

                return (
                  <div
                    key={index}
                    className={`relative cursor-pointer transition-all duration-300 ${
                      isSelected ? 'z-10' : 'z-0'
                      }`}
                    onClick={() => handleGameClick(item, index, -1)}
                  >
                    <GameImage
                      data={item}
                      game={{
                        game_provider: item.game_provider,
                        image: item.image,
                      }}
                      className="rounded-field object-fill"
                      disableNavigation={true}
                    />

                    {/* 确认覆盖层 */}
                    <AnimatePresence>
                      {isSelected && (
                        <m.div
                          className="absolute inset-0 flex flex-col items-center justify-center rounded-field backdrop-blur-[2px]"
                          variants={varFade('in')}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                        >
                          <m.div
                            className="text-center text-base-content font-bold text-xs mb-3 px-2"
                            variants={varFade('inDown', { distance: 20 })}
                            initial="initial"
                            animate="animate"
                            transition={{ delay: 0.1 }}
                          >
                            {t('popup:freeSpins.redeem_count_free_spins', {
                              freeSpinsCount: freeSpinsCount,
                            })}
                          </m.div>
                          <m.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClaim(item);
                            }}
                            disabled={isLoading}
                            className="btn btn-primary btn-sm sm:btn-md px-4"
                            variants={varFade('inUp', { distance: 20 })}
                            initial="initial"
                            animate="animate"
                            transition={{ delay: 0.2 }}
                          >
                            {isLoading ? (
                              <span className="loading loading-spinner loading-xs" />
                            ) : (
                              t("bonus:claim")
                            )}
                          </m.button>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
