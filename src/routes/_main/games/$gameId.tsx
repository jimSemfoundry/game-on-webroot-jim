import { GameIframe } from "@/components/game/GameIframe.tsx";
import Iconify from "@/components/iconify";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon.tsx";
import { CurrencySelector } from "@/components/ui/CurrencySelector.tsx";
import { FavoriteButton } from "@/components/ui/FavoriteButton.tsx";
import { GameImage } from "@/components/ui/GameImage.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useAuthModals } from "@/contexts/ModalsProvider.tsx";
import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext";
import { useGetUserDefaultCurrencyMutation, useLaunchGameMutation } from "@/hooks/api/useAuth.ts";
import { useCasinoHomeGameList } from "@/hooks/api/usePublic.ts";
import { FeaturedGames } from "@/sections/casino";
import { AlliancePartnerships } from "@/sections/casino/AlliancePartnerships.tsx";
import { CategoryGames } from "@/sections/casino/CategoryGames.tsx";
import { GameProviders } from "@/sections/casino/GameProviders.tsx";
import { publicService } from "@/services/publicService.ts";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { SpecialOffer } from "@/sections/special-offer/SpecialOffer";

// Game Detail Component
const GameDetail = () => {
  const { gameId } = Route.useParams();
  const { t } = useTranslation();

  const [game, setGame] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayingGame, setIsPlayingGame] = useState(false);
  const [gameData, setGameData] = useState<{
    launchData: string;
    launchType: "url" | "html";
  } | null>(null);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const [gameCurrency, setGameCurrency] = useState<string>("PHP");
  const { selectedCurrency, setSelectedCurrency } = useSettlementCurrency();
  const { openSignUpModal } = useAuthModals();
  const { isAuthenticated, user } = useAuth();
  const { mutate: launchGame, isPending: isLaunchingGame } = useLaunchGameMutation();
  const { mutate: getUserDefaultCurrency, isPending: isLoadingCurrency } = useGetUserDefaultCurrencyMutation();
  const { data: casinoHomeGameListResponse } = useCasinoHomeGameList();

  const { data: casinoHomeGameList } = casinoHomeGameListResponse ?? {};

  // Fetch game details
  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        setIsLoading(true);

        // Parse gameId to extract inner_game_id and provider
        // Expected format: gameId could be "inner_game_id" or "provider:inner_game_id"
        let inner_game_id = gameId;
        let provider = "";

        if (gameId.includes(":")) {
          const [gameProvider, gameInnerID] = gameId.split(":");
          provider = gameProvider;
          inner_game_id = gameInnerID;
        }

        // Call API to get game details
        const response = await publicService.getGameDetail({
          inner_game_id,
          provider,
          lang: "en", // You can make this dynamic based on user language
        });

        if (response.data) {
          setGame(response.data);
        } else {
          throw new Error("Game not found");
        }
      } catch (err) {
        console.error("Error fetching game:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (gameId) {
      fetchGameDetails();
    }
  }, [gameId]);

  // 获取游戏默认货币
  useEffect(() => {
    if (game?.inner_game_id && user) {
      getUserDefaultCurrency(
        { inner_game_id: game.inner_game_id },
        {
          onSuccess: (currencyResponse) => {
            if (currencyResponse.code === 0) {
              const gameCurrencyValue = currencyResponse.data?.default_currency || game.default_currency || user.currency || "USDT";
              setGameCurrency(gameCurrencyValue);
            }
          },
          onError: (error) => {
            console.error("Failed to get game currency:", error);
            // 使用fallback值
            setGameCurrency(game.default_currency || user.currency || "USDT");
          },
        },
      );
    }
  }, [game?.inner_game_id, user]);

  // Handle currency selection from CurrencySelector
  const handleCurrencySelect = (currency: string) => {
    setSelectedCurrency(currency);
  };

  const handlePlayNow = () => {
    if (!isAuthenticated) {
      openSignUpModal();
      return;
    }

    if (!game || !user) {
      return;
    }

    // 首先获取用户对该游戏的默认货币
    getUserDefaultCurrency(
      { inner_game_id: game.inner_game_id },
      {
        onSuccess: (currencyResponse) => {
          if (currencyResponse.code === 0) {
            // 获取到默认货币后，启动游戏
            const gameCurrencyValue = currencyResponse.data?.default_currency || game.default_currency || user.currency || "USDT";
            setGameCurrency(gameCurrencyValue);

            const origin = window.location.origin;
            const launchParams = {
              inner_game_id: game.inner_game_id,
              game_provider: game.game_provider,
              game_currency: gameCurrencyValue,
              lang: "EN", // 可以根据需要动态设置
              home_url: `${origin}/casino`,
              deposit_url: `${origin}/finance/deposit`,
              close_url: `${origin}/casino`,
            };

            launchGame(launchParams, {
              onSuccess: (response) => {
                if (response.code === 0 && response.data) {
                  setGameData({
                    launchData: response.data,
                    launchType: response.launch_type,
                  });
                  setIsPlayingGame(true);
                  // 移动端使用全屏模式
                  const isMobile = window.innerWidth < 768;
                  if (isMobile) {
                    setIsMobileFullscreen(true);
                  }
                } else {
                  toast.error(response.msg || "Failed to launch game");
                }
              },
              onError: (error) => {
                toast.error("Failed to launch game");
                console.error("Game launch error:", error);
              },
            });
          } else {
            toast.error("Failed to get game currency");
          }
        },
        onError: (error) => {
          toast.error("Failed to get game currency");
          console.error("Get currency error:", error);
        },
      },
    );
  };

  const handleCloseGame = () => {
    setIsPlayingGame(false);
    setGameData(null);
    setIsMobileFullscreen(false);
  };

  const handleGameError = () => {
    toast.error("Game failed to load");
    handleCloseGame();
  };

  const handleDemoPlay = () => {
    if (!game) return;

    // Demo play logic - similar to regular play but without authentication
    const origin = window.location.origin;
    const launchParams = {
      inner_game_id: game.inner_game_id,
      game_provider: game.game_provider,
      game_currency: "DEMO", // Use demo currency
      lang: "EN",
      home_url: `${origin}/casino`,
      deposit_url: `${origin}/finance/deposit`,
      close_url: `${origin}/casino`,
      is_support_demo_game: "1",
    };

    launchGame(launchParams, {
      onSuccess: (response) => {
        if (response.code === 0 && response.data) {
          setGameData({
            launchData: response.data,
            launchType: response.launch_type,
          });
          setIsPlayingGame(true);
          // 移动端使用全屏模式
          const isMobile = window.innerWidth < 768;
          if (isMobile) {
            setIsMobileFullscreen(true);
          }
        } else {
          toast.error(response.msg || "Failed to launch demo game");
        }
      },
      onError: (error) => {
        toast.error("Failed to launch demo game");
        console.error("Demo game launch error:", error);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <div className="absolute inset-0 loading loading-ring loading-lg text-primary/30"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-base-content">Loading game details</p>
            <p className="text-sm text-base-content/60">Preparing your gaming experience...</p>
          </div>
        </div>
      </div>
    );
  }

  // 移动端全屏游戏渲染
  if (isMobileFullscreen && isPlayingGame && gameData) {
    return (
      <div className="fixed inset-0 z-50 bg-black overflow-hidden">
        {/* 移动端游戏顶部栏 */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/90 via-black/70 to-transparent">
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
          >
            <div className="flex items-center gap-3">
              {/* 返回按钮 */}
              <button
                onClick={handleCloseGame}
                className="btn btn-sm btn-square btn-ghost text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-white text-lg font-bold truncate">{game?.display_game_name}</h2>
            </div>
            <div className="flex items-center gap-2">
              {/* 全屏切换按钮 */}
              <button
                onClick={() => {
                  const elem = document.documentElement;
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    elem.requestFullscreen();
                  }
                }}
                className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Loading状态 - 移动端 */}
        {(isLoadingCurrency || isLaunchingGame) && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4 text-white">
              <span className="loading loading-spinner loading-xl text-primary" />
              <p className="text-lg font-medium">{isLoadingCurrency ? "Getting game currency..." : "Loading Game..."}</p>
            </div>
          </div>
        )}

        {/* 游戏iframe区域 - 移动端全屏 */}
        {!isLoadingCurrency && !isLaunchingGame && (
          <div
            className="absolute inset-0"
            style={{
              paddingTop: 'max(4rem, calc(env(safe-area-inset-top) + 4rem))',
              paddingBottom: 'env(safe-area-inset-bottom)',
              paddingLeft: 'env(safe-area-inset-left)',
              paddingRight: 'env(safe-area-inset-right)'
            }}
          >
            <GameIframe
              launchData={gameData.launchData}
              launchType={gameData.launchType}
              isFullScreen={true}
              onError={handleGameError}
              onClose={handleCloseGame}
              gameName={game?.display_game_name}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/** Overlay Blur Image */}
      <div className="absolute inset-0 bg-base-200/50 rounded-box blur-xs w-full h-[260px] sm:hidden">
        <img src={game?.image} alt={game?.display_game_name} className="w-full h-full object-cover " />
        {/** Gradient mask */}
        <div className="absolute inset-0 bg-gradient-to-b from-base-300/60 to-base-300"></div>
      </div>
      <div className="sm:pb-12 px-5 py-4">
        {/* Hero Header with Game Background */}
        <div className="relative overflow-hidden flex flex-col gap-6">
          {/* Game iframe section - shows when playing (desktop only) */}
          {isPlayingGame && gameData && !isMobileFullscreen && (
            <div className="relative z-10 container mx-auto p-6 bg-base-200 rounded-box shadow-xl" style={{ height: "800px" }}>
              <div className="flex flex-col h-full">
                {/* 游戏顶部栏 */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h2 className="text-xl font-bold">{game?.display_game_name}</h2>
                  <button onClick={handleCloseGame} className="btn btn-sm btn-circle btn-ghost">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Loading状态 */}
                {(isLoadingCurrency || isLaunchingGame) && (
                  <div className="flex items-center justify-center flex-1">
                    <div className="flex flex-col items-center gap-4">
                      <span className="loading loading-spinner loading-xl text-primary" />
                      <p className="text-lg font-medium">{isLoadingCurrency ? "Getting game currency..." : "Loading Game..."}</p>
                    </div>
                  </div>
                )}

                {/* 游戏iframe区域 */}
                {!isLoadingCurrency && !isLaunchingGame && (
                  <div className="flex-1 rounded-lg overflow-hidden bg-base-200">
                    <GameIframe
                      launchData={gameData.launchData}
                      launchType={gameData.launchType}
                      isFullScreen={false}
                      onError={handleGameError}
                      onClose={handleCloseGame}
                      gameName={game?.display_game_name}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Game Hero Section - shows when not playing or not in mobile fullscreen */}
          {(!isPlayingGame || !isMobileFullscreen) && (
            <div className="relative z-10 container mx-auto sm:p-12 sm:bg-base-200/50 rounded-box">
              {/* Desktop Layout */}
              <div className="hidden sm:flex items-center sm:gap-8">
                <div className="aspect-3/4 w-[140px] sm:w-[160px] rounded-box overflow-hidden">
                  <GameImage src={game?.image} alt={game?.display_game_name} />
                </div>

                <div className="flex-col sm:gap-3 hidden sm:flex max-w-96">
                  <div className="flex items-center gap-2">
                    <div className="badge badge-xl bg-base-200 text-sm font-semibold">{game?.provider_name}</div>
                    {isAuthenticated && (
                      <FavoriteButton
                        inner_game_id={game?.inner_game_id}
                        initialIsFavorite={game?.is_favorite || false}
                        size="sm"
                        className="bg-base-200"
                      />
                    )}
                  </div>
                  <h1 className="text-4xl font-bold text-base-content">{game?.display_game_name}</h1>
                  <div className="flex flex-wrap gap-2">
                    {game?.tags?.split(",").map((tag: string, index: number) => (
                      <div key={index} className="badge badge-soft badge-primary badge-lg">
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="hidden sm:flex flex-col gap-4 ml-12 w-[200px] items-center">
                  {isAuthenticated ? (
                    /* Play with Balance In - Authenticated Users */
                    (<div className="text-start">
                      <h3 className="text-xs text-base-content/70 mb-1 font-semibold">Play with Balance In</h3>
                      {/* User Balance Button with CurrencySelector */}
                      <div className="mb-4 bg-base-300 rounded-field h-10 flex items-center w-full">
                        <div className=" flex-1 px-2">
                          <CurrencySelector
                            selectedCurrency={selectedCurrency}
                            onCurrencySelect={handleCurrencySelect}
                            showBalance={true}
                            className="w-full"
                          />
                        </div>
                      </div>
                      {/* Game Currency */}
                      <div className="mb-4 text-center flex items-center gap-2 h-17">
                        <p className="text-xs text-base-content/60 mb-2 text-start">The selected currency will be displayed in:</p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg btn btn-soft">
                          <CurrencyIcon currency={gameCurrency} className="w-4 h-4" />
                          <span className="font-semibold">{gameCurrency}</span>
                        </div>
                      </div>
                      {/* Play Button */}
                      <button
                        className="btn btn-primary btn-lg w-full gap-3 text-lg font-bold"
                        onClick={handlePlayNow}
                        disabled={isLoadingCurrency || isLaunchingGame}
                      >
                        <Iconify icon="custom:play" width={24} height={24} />
                        Play
                      </button>
                    </div>)
                  ) : (
                    /* Demo Play Only - Unauthenticated Users */
                    (<div className="text-start w-full">
                      <button
                        className="btn btn-primary btn-soft btn-lg w-full gap-3 text-lg font-bold"
                        onClick={handleDemoPlay}
                        disabled={isLoadingCurrency || isLaunchingGame}
                      >
                        <Iconify icon="custom:play" width={24} height={24} />
                        Demo Play
                      </button>
                    </div>)
                  )}
                </div>
              </div>

              {/* Mobile Layout - Image and Play Section Side by Side */}
              <div className="sm:hidden flex flex-col gap-4">
                <div className="flex gap-4">
                  {/* Game Image - Mobile */}
                  <div className="flex items-center flex-col gap-3">
                    <div className="aspect-3/4 w-[140px] rounded-box overflow-hidden flex-shrink-0">
                      <GameImage src={game?.image} alt={game?.display_game_name} />
                    </div>
                    {isAuthenticated && (
                      <div className="flex gap-2 justify-center items-center">
                        <FavoriteButton
                          inner_game_id={game?.inner_game_id}
                          initialIsFavorite={game?.is_favorite || false}
                          size="sm"
                          className="bg-base-200"
                        />
                        <button className="btn btn-square btn-sm">
                          <Iconify icon="custom:setting-2" className="text-base-content/50 w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Play with Balance In - Mobile Right Side */}
                  <div className="flex-1">
                    {isAuthenticated ? (
                      /* Authenticated User - Full Controls */
                      (<>
                        <h3 className="text-xs sm:text-sm font-semibold text-base-content/60 mb-1 text-start px-1">Play with Balance In</h3>
                        {/* Currency Selector */}
                        <div className="mb-3">
                          <CurrencySelector
                            selectedCurrency={selectedCurrency}
                            onCurrencySelect={handleCurrencySelect}
                            showBalance={false}
                            className="w-full"
                            trigger={
                              <button className="btn btn-md sm:btn-lg bg-base-200/80 hover:bg-base-200 text-base-content border-0 w-full flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CurrencyIcon currency={selectedCurrency} className="w-5 h-5" />
                                  <span className="text-base font-bold">{selectedCurrency}</span>
                                </div>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            }
                          />
                        </div>
                        {/* Game Currency Display */}
                        <div className="mb-3 flex items-center">
                          <p className="text-xs text-base-content/60 mb-1.5">The selected currency will be displayed in:</p>
                          <div className="flex items-center justify-center gap-2 badge badge-soft badge-primary badge-lg">
                            <CurrencyIcon currency={gameCurrency} className="w-4 h-4" />
                            <span className="font-semibold text-xs">{gameCurrency}</span>
                          </div>
                        </div>
                        {/* Play Button */}
                        <button
                          className="btn btn-primary btn-md w-full gap-2 font-bold mb-3"
                          onClick={handlePlayNow}
                          disabled={isLoadingCurrency || isLaunchingGame}
                        >
                          <Iconify icon="custom:play" className="w-4 h-4" />
                          Play
                        </button>
                        <button
                          className="btn btn-ghost btn-md w-full gap-2 font-bold text-base-content/50"
                          onClick={handleDemoPlay}
                          disabled={isLoadingCurrency || isLaunchingGame}
                        >
                          Demo Play
                        </button>
                      </>)
                    ) : (
                      /* Unauthenticated User - Demo Only */
                      (<div className="flex items-center justify-center h-full">
                        <button
                          className="btn btn-primary btn-soft btn-md w-full gap-2 font-bold"
                          onClick={handleDemoPlay}
                          disabled={isLoadingCurrency || isLaunchingGame}
                        >
                          <Iconify icon="custom:play" className="w-4 h-4" />
                          Demo Play
                        </button>
                      </div>)
                    )}
                  </div>
                </div>
              </div>

              {/* Game Info and Tags - Mobile */}
              <div className="sm:hidden mt-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="badge badge-sm border-none font-semibold">{game?.provider_name}</div>
                  {game?.rtp && (
                    <div className="badge border-none badge-soft badge-sm font-semibold">
                      <Iconify icon="custom:rtp" />
                      {game?.rtp}
                    </div>
                  )}
                </div>

                <p className="text-xl font-bold mb-3">{game?.display_game_name}</p>

                <div className="flex gap-2 flex-wrap">
                  {game?.rtp && (
                    <div className="badge badge-soft badge-sm badge-primary font-semibold">
                      <Iconify icon="custom:rtp" />
                      {game?.rtp}
                    </div>
                  )}
                  {game?.max_win && (
                    <div className="badge badge-soft badge-sm badge-primary font-semibold">
                      <Iconify icon="custom:max-win" />
                      {game?.max_win}
                    </div>
                  )}
                  {game?.tags?.split(",").map((tag: string, index: number) => (
                    <div key={index} className="badge badge-soft badge-sm badge-primary font-semibold">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>

              {/* Game Description */}
              <div className="xl:col-span-6 space-y-3 sm:space-y-6 mt-4 sm:mt-8">
                <h3 className="sm:text-lg text-base font-semibold text-base-content/90">{t("gameDetail:gameInformation")}</h3>
                <p className="text-base-content/50 text-xs sm:text-base leading-relaxed">
                  {t(`game_info:${game.game_provider}_${game.inner_game_id}`)}
                </p>
              </div>
            </div>
          )}

          {/* Featured Games and other sections - always show */}
          {casinoHomeGameList && casinoHomeGameList.home_data.hot_game && (
            <FeaturedGames games={casinoHomeGameList.home_data.hot_game} country_code={casinoHomeGameList.country_code} />
          )}
          {casinoHomeGameList &&
            casinoHomeGameList.home_data.game_category &&
            casinoHomeGameList.home_data.game_category.map((c: any, i: number) => (
              <CategoryGames key={`${c.category}-${i}`} games={c.games} category={c.category} />
            ))}
          <GameProviders />
          <AlliancePartnerships />
        </div>
      </div>
      <SpecialOffer />
    </div>
  )
};

// Route Configuration
export const Route = createFileRoute("/_main/games/$gameId")({
  component: GameDetail,
  // Optional: Add loader for data fetching
  // loader: async ({ params }) => {
  //   const { gameId } = params
  //   // Pre-load game data
  //   return await gameService.getGameById(gameId)
  // },
  // Optional: Add error handling
  // errorComponent: ({ error }) => {
  //   return <div>Error loading game: {error.message}</div>
  // },
  // Optional: Add pending component
  // pendingComponent: () => {
  //   return <div>Loading game details...</div>
  // }
});
