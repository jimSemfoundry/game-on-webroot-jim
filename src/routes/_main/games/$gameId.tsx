import { GameIframe } from "@/components/game/GameIframe.tsx";
import Iconify from "@/components/iconify";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon.tsx";
import { CurrencySelector } from "@/components/ui/CurrencySelector.tsx";
import { FavoriteButton } from "@/components/ui/FavoriteButton.tsx";
import { GameImage } from "@/components/ui/GameImage.tsx";
import { SegmentedControl } from "@/components/ui/SegmentedControl.tsx";
import { Select } from "@/components/ui/Select.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useDisplayCurrency, useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useAuthModals } from "@/contexts/ModalsProvider.tsx";
import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext";
import {
  useCheckDemoSupportQuery,
  useGetUserDefaultCurrencyMutation,
  useLaunchDemoGameMutation,
  useLaunchGameMutation,
  useLikeGameMutation,
  useUserBalance
} from "@/hooks/api/useAuth.ts";
import { useCasinoHomeGameList } from "@/hooks/api/usePublic.ts";
import { useIsMobileDevice } from "@/hooks/useIsMobileDevice";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { FeaturedGames } from "@/sections/casino";
import { AlliancePartnerships } from "@/sections/casino/AlliancePartnerships.tsx";
import { CategoryGames } from "@/sections/casino/CategoryGames.tsx";
import { GameMyBets } from "@/sections/casino/GameMyBets";
import { GameProviders } from "@/sections/casino/GameProviders.tsx";
import { LimitedOffer } from "@/sections/limited-offer/LimitedOffer";
import { GameProviderTournaments } from "@/sections/tournament";
import { publicService } from "@/services/publicService.ts";
import { useBoundStore } from "@/store";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  fn_ban_regions,
  fn_ban_support_settlement_currencies, fn_regions,
  fn_support_settlement_currencies
} from "@/utils/helper";
import { useCountryCodeByIp } from "@/sections/profile/security/helper.ts";

type SectionKey = "tournament" | "bets";

// Game Detail Component
const GameDetail = () => {
  const { gameId } = Route.useParams();
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();
  const isFreeSpinsMode = searchParams?.freeSpins === "true";
  const searchCurrency = typeof searchParams?.currency === "string" ? searchParams.currency.trim() : "";
  const { t } = useTranslation();
  const { gameIsFullScreen, setGameIsFullScreen, setHeaderBackAction } = useBoundStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [game, setGame] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayingGame, setIsPlayingGame] = useState(false);
  const [gameData, setGameData] = useState<{
    launchData: string;
    launchType: "url" | "html";
  } | null>(null);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const [gameCurrency, setGameCurrency] = useState<string>(searchCurrency || "PHP");
  const { selectedCurrency: settlementCurrency, updateSettlementCurrency } = useSettlementCurrency();
  const { selectedCurrency: displayCurrency } = useDisplayCurrency();
  const { openSignUpModal } = useAuthModals();
  const { isAuthenticated, user, setStatus, status } = useAuth();
  const { mutate: likeGame } = useLikeGameMutation();
  const { mutate: launchGame, isPending: isLaunchingGame } = useLaunchGameMutation();
  const { mutate: launchDemoGame, isPending: isLaunchingDemoGame } = useLaunchDemoGameMutation();
  const { mutate: getUserDefaultCurrency, isPending: isLoadingCurrency } = useGetUserDefaultCurrencyMutation();
  const { data: userBalances, isLoading: isUserBalanceLoading } = useUserBalance();
  const {
    formatWithConversion,
    formatWithoutConversion,
    isLoading: isDisplayCurrencyFormatterLoading
  } = useDisplayCurrencyFormatter();
  const { data: casinoHomeGameListResponse } = useCasinoHomeGameList();
  const isDesktopControls = useMediaQuery("(min-width: 768px)");
  const isMobile = useMediaQuery("(max-width: 767px)");
  // 基于设备类型的检测，不受横屏影响，用于游戏播放状态判断
  const isMobileDevice = useIsMobileDevice();
  const [activeSection, setActiveSection] = useState<SectionKey>("bets");

  // 根据IP获取地区
  const { data: country } = useCountryCodeByIp();

  // 检查游戏是否支持 Demo 模式
  const { data: demoSupportData } = useCheckDemoSupportQuery(
    {
      inner_game_id: game?.inner_game_id || "",
      game_provider: game?.game_provider || "",
      game_currency: gameCurrency || "USD",
      lang: "EN"
    },
    !!game?.inner_game_id && !!game?.game_provider && isAuthenticated
  );

  const isDemoSupported = demoSupportData?.code === 0 && demoSupportData?.data?.support_demo === true;

  // 检查游戏是否已收藏
  const isGameFavorite = useMemo(() => {
    if (!game?.inner_game_id || !status?.favorites_game) return false;
    const favoritesList = status.favorites_game.split(",").filter((item) => item.trim().length > 0);
    return favoritesList.includes(game.inner_game_id);
  }, [game?.inner_game_id, status?.favorites_game]);

  // 处理收藏切换
  const handleToggleFavorite = useCallback(async () => {
    if (!game?.inner_game_id) {
      toast.error(t("common:noGameSelected", "No game selected"));
      return Promise.reject(new Error("No game selected"));
    }

    return new Promise<void>((resolve, reject) => {
      likeGame(game.inner_game_id, {
        onSuccess: (response) => {
          if (response.code === 0) {
            // 使用服务器返回的状态作为最终状态
            const nextIsFavorite = response.data.is_favorite;

            // 更新全局收藏状态
            setStatus((prev) => {
              if (!prev) return prev;

              const favorites = new Set(prev.favorites_game?.split(",").filter((item) => item.trim().length > 0));

              if (nextIsFavorite) {
                favorites.add(game.inner_game_id);
              } else {
                favorites.delete(game.inner_game_id);
              }

              return {
                ...prev,
                favorites_game: Array.from(favorites).join(",")
              };
            });

            // 同时更新本地 game 对象的 is_favorite 状态
            setGame((prev: any) => ({
              ...prev,
              is_favorite: nextIsFavorite
            }));

            resolve();
          } else {
            toast.error(response.msg || t("common:operationFailed", "Operation failed"));
            reject(new Error(response.msg));
          }
        },
        onError: (error) => {
          toast.error(t("common:operationFailed", "Operation failed, please try again"));
          reject(error);
        }
      });
    });
  }, [game, likeGame, setStatus, t]);

  const segmentOptions = useMemo(
    () => [
      {
        value: "tournament",
        label: (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Iconify icon="custom:tournament" className="w-4 h-4 sm:w-5 sm:h-5" />
            {t("menu:tournaments", "Tournaments")}
          </div>
        )
      },
      {
        value: "bets",
        label: (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Iconify icon="custom:profile-achievements" className="w-4 h-4 sm:w-5 sm:h-5" />
            {t("gameDetail:myBets", "My Bets")}
          </div>
        )
      }
    ],
    [t]
  );

  const selectOptions = useMemo(() => segmentOptions.map((option) => ({
    value: option.value,
    label: option.label
  })), [segmentOptions]);

  const { data: casinoHomeGameList } = casinoHomeGameListResponse ?? {};

  const isHiddenTournamentProvider = useMemo(() => {
    const normalized = (game?.game_provider || "").toLowerCase();
    return normalized === "pp" || normalized === "pragmatic" || normalized === "pragmaticplay";
  }, [game?.game_provider]);

  const settlementBalanceAmount = useMemo(() => {
    if (!Array.isArray(userBalances)) {
      return undefined as number | undefined;
    }

    const balanceEntry = userBalances.find((balance: any) => balance.currency === settlementCurrency);
    return balanceEntry ? Number(balanceEntry.balance ?? 0) : 0;
  }, [userBalances, settlementCurrency]);

  const settlementBalanceDisplay = useMemo(() => {
    if (settlementBalanceAmount === undefined || isDisplayCurrencyFormatterLoading) {
      return null;
    }

    const convertedAmount = formatWithConversion(settlementBalanceAmount, settlementCurrency, {
      showSymbol: true,
      showCode: false,
      compact: false,
      minimizeDecimals: true
    }).formatted;

    if (convertedAmount) {
      return convertedAmount;
    }

    return formatWithoutConversion(settlementBalanceAmount, settlementCurrency, {
      showSymbol: true,
      showCode: true,
      compact: false,
      minimizeDecimals: true
    }).formatted;
  }, [
    settlementBalanceAmount,
    settlementCurrency,
    displayCurrency,
    formatWithConversion,
    formatWithoutConversion,
    isDisplayCurrencyFormatterLoading
  ]);
  const isBalanceDisplayLoading = isUserBalanceLoading || settlementBalanceAmount === undefined || isDisplayCurrencyFormatterLoading;

  // 结算币禁止
  const is_currency_settlement_prohibited = useMemo(() => {
    const current_settlement_currency = user?.currency ?? "";

    const limit1 = fn_ban_support_settlement_currencies(game?.ban_support_settlement_currencies ?? "", current_settlement_currency);
    const limit2 = fn_support_settlement_currencies(game?.support_settlement_currencies ?? "", current_settlement_currency);

    return limit1 || limit2;
  }, [user?.currency, game]);

  // 地区禁止
  const is_regional_access_prohibited = useMemo(() => {
    const country_code = country?.data?.country_code ?? "";

    const limit1 = fn_ban_regions(game?.ban_regions ?? "", country_code);
    const limit2 = fn_regions(game?.regions ?? "", country_code);

    return limit1 || limit2;
  }, [country?.data?.country_code, game]);

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
          lang: "en" // You can make this dynamic based on user language
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
              setGameCurrency(searchCurrency || gameCurrencyValue);
            }
          },
          onError: (error) => {
            console.error("Failed to get game currency:", error);
            // 使用fallback值
            setGameCurrency(searchCurrency || game.default_currency || user.currency || "USDT");
          },
        },
      );
    }
  }, [game?.inner_game_id, user, displayCurrency, searchCurrency]);

  // Free Spins 模式自动启动游戏
  useEffect(() => {
    if (isFreeSpinsMode && game && user && !isPlayingGame && !isLaunchingGame && !isLaunchingDemoGame) {
      // 延迟一下确保页面渲染完成
      const timer = setTimeout(() => {
        handlePlayNow();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFreeSpinsMode, game, user, isPlayingGame, isLaunchingGame, isLaunchingDemoGame]);

  // Handle currency selection from CurrencySelector
  const handleCurrencySelect = (currency: string) => {
    updateSettlementCurrency(currency);
  };

  const handlePlayNow = () => {
    if (!isAuthenticated) {
      openSignUpModal();
      return;
    }

    if (!game || !user) {
      return;
    }

    // Free Spins 模式跳过余额检查
    if (!isFreeSpinsMode) {
      // 检查选择的货币余额是否大于0
      if (settlementBalanceAmount !== undefined && settlementBalanceAmount <= 0) {
        toast.error(t("gameDetail:insufficientBalance", "Insufficient balance. Please deposit or select another currency."));
        return;
      }
    }

    // 首先获取用户对该游戏的默认货币
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
              close_url: `${origin}/casino`
            };

            launchGame(launchParams, {
              onSuccess: (response) => {
                if (response.code === 0 && response.data) {
                  console.log("[Game Launch] Success:", {
                    launchType: response.launch_type,
                    dataLength: response.data?.length,
                    isMobile,
                    willBeFullscreen: gameIsFullScreen && isMobile
                  });
                  setGameData({
                    launchData: response.data,
                    launchType: response.launch_type
                  });
                  setIsPlayingGame(true);
                  // 只在移动设备应用全屏设置（使用 isMobileDevice 避免横屏时切换）
                  if (gameIsFullScreen && isMobileDevice) {
                    setIsMobileFullscreen(true);
                  }
                } else {
                  toast.error(response.msg || "Failed to launch game");
                }
              },
              onError: (error) => {
                toast.error("Failed to launch game");
                console.error("Game launch error:", error);
              }
            });
          } else {
            toast.error("Failed to get game currency");
          }
        },
        onError: (error) => {
          toast.error("Failed to get game currency");
          console.error("Get currency error:", error);
        }
      }
    );
  };

  const handleCloseGame = useCallback(() => {
    setIsPlayingGame(false);
    setGameData(null);
    setIsMobileFullscreen(false);

    if (isFreeSpinsMode) {
      navigate({
        to: "/games/$gameId",
        params: { gameId },
        search: (prev) => ({
          ...prev,
          freeSpins: undefined
        }),
        replace: true
      });
    }
  }, [gameId, isFreeSpinsMode, navigate]);

  // Manage header back button action
  useEffect(() => {
    if (isPlayingGame) {
      setHeaderBackAction(handleCloseGame);
    } else {
      setHeaderBackAction(null);
    }
    return () => {
      setHeaderBackAction(null);
    };
  }, [isPlayingGame, setHeaderBackAction, handleCloseGame]);

  const handleGameError = () => {
    toast.error("Game failed to load");
    handleCloseGame();
  };

  const handleDemoPlay = () => {
    // Demo Play 也需要登录
    if (!isAuthenticated) {
      openSignUpModal();
      return;
    }

    if (!game) return;

    // 检查是否支持 Demo 模式
    if (!isDemoSupported) {
      toast.error(t("gameDetail:demoNotSupported", "This game does not support demo mode"));
      return;
    }

    // 使用独立的 Demo API
    const origin = window.location.origin;
    const launchParams = {
      inner_game_id: game.inner_game_id,
      game_provider: game.game_provider,
      game_currency: gameCurrency || "USD", // 必需参数
      lang: "EN",
      home_url: `${origin}/casino`,
      deposit_url: `${origin}/finance/deposit`,
      close_url: `${origin}/casino`
    };

    launchDemoGame(launchParams, {
      onSuccess: (response) => {
        if (response.code === 0 && response.data) {
          setGameData({
            launchData: response.data,
            launchType: response.launch_type
          });
          setIsPlayingGame(true);
          // 只在移动设备应用全屏设置（使用 isMobileDevice 避免横屏时切换）
          if (gameIsFullScreen && isMobileDevice) {
            setIsMobileFullscreen(true);
          }
        } else {
          toast.error(response.msg || "Failed to launch demo game");
        }
      },
      onError: (error) => {
        toast.error("Failed to launch demo game");
        console.error("Demo game launch error:", error);
      }
    });
  };

  const GameSettingsDialog = () => {
    if (!isSettingsOpen) return null;

    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={() => setIsSettingsOpen(false)}
      >
        <div className="bg-base-300 w-[90%] max-w-md rounded-box p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">{t("gameDetail:gameLobbySettings")}</h3>
            <button onClick={() => setIsSettingsOpen(false)} className="btn btn-sm btn-circle btn-ghost">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold mb-1 text-sm">{t("gameDetail:launchInFullScreen")}</p>
              <p className="text-xs text-base-content/50">{t("gameDetail:launchInFullScreenDescription")}</p>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={gameIsFullScreen}
              onChange={(e) => setGameIsFullScreen(e.target.checked)}
            />
          </div>
        </div>
      </div>
    );
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
            <p className="text-lg font-medium text-base-content">{t("common:common.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  // 移动端全屏游戏渲染
  if (isMobileFullscreen && isPlayingGame && gameData) {
    return (
      <GameIframe
        launchData={gameData.launchData}
        launchType={gameData.launchType}
        isFullScreen={true}
        onError={handleGameError}
        onClose={handleCloseGame}
        gameName={game?.display_game_name}
      />
    );
  }

  // 移动端非全屏游戏渲染（独立结构，使用 isMobileDevice 避免横屏时切换）
  if (isPlayingGame && gameData && !isMobileFullscreen && isMobileDevice) {
    return (
      <div
        className="fixed inset-x-0 bottom-0 z-999 bg-base-200"
        style={{ top: "calc(env(safe-area-inset-top) + 3rem)" }}
      >
        <div className="h-[calc(100%)] w-full">
          {/* Loading状态 */}
          {(isLoadingCurrency || isLaunchingGame || isLaunchingDemoGame) && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <span className="loading loading-spinner loading-xl text-primary" />
                <p
                  className="text-lg font-medium">{isLoadingCurrency ? "Getting game currency..." : "Loading Game..."}</p>
              </div>
            </div>
          )}

          {/* 游戏iframe区域 */}
          {!isLoadingCurrency && !isLaunchingGame && !isLaunchingDemoGame && (
            <div className="h-full w-full">
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
    );
  }

  return (
    <div className="min-h-screen relative">
      <GameSettingsDialog />
      {/** Overlay Blur Image */}
      <div className="absolute inset-0 bg-base-200/50 rounded-box blur-xs w-full h-[260px] sm:hidden">
        <img src={game?.image} alt={game?.display_game_name} className="w-full h-full object-cover " />
        {/** Gradient mask */}
        <div className="absolute inset-0 bg-gradient-to-b from-base-300/60 to-base-300"></div>
      </div>
      <div className="sm:pb-12 px-5 py-4">
        {/* Hero Header with Game Background */}
        <div className="relative overflow-hidden flex flex-col gap-6">
          {/* Game iframe section - Desktop embedded mode (排除移动设备) */}
          {isPlayingGame && gameData && !isMobileFullscreen && !isMobileDevice && (
            <>
              {/* 桌面端：带控制栏和容器 */}
              <div className="container mx-auto relative">
                <div className="bg-base-200 rounded-box overflow-hidden">
                  {/* 游戏控制栏 */}
                  <div className="flex items-center justify-between px-4 py-3 bg-base-200">
                    <div className="flex items-center gap-3">
                      <button onClick={handleCloseGame} className="btn btn-sm btn-ghost gap-2">
                        <ChevronLeft className="w-4 h-4" />
                        {t("bonus:back", "Back")}
                      </button>
                      {isFreeSpinsMode && (
                        <div className="badge badge-primary badge-sm gap-1">
                          <Iconify icon="custom:gift" className="w-3 h-3" />
                          {t("gameDetail:free_spins", "Free Spins")}
                        </div>
                      )}
                    </div>
                    <h2 className="text-lg font-bold -translate-x-1/2">{game?.display_game_name}</h2>
                    <div />
                  </div>

                  {/* Loading状态 */}
                  {(isLoadingCurrency || isLaunchingGame || isLaunchingDemoGame) && (
                    <div className="flex items-center justify-center h-[600px]">
                      <div className="flex flex-col items-center gap-4">
                        <span className="loading loading-spinner loading-xl text-primary" />
                        <p
                          className="text-lg font-medium">{isLoadingCurrency ? "Getting game currency..." : "Loading Game..."}</p>
                      </div>
                    </div>
                  )}

                  {/* 游戏iframe区域 */}
                  {!isLoadingCurrency && !isLaunchingGame && !isLaunchingDemoGame && (
                    <div className="h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden bg-base-200">
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
            </>
          )}

          {/* Main Game Hero Section - shows when not playing or not in mobile fullscreen */}
          {!isPlayingGame && !isMobileFullscreen && (
            <div className="relative z-10 container mx-auto sm:p-12 sm:bg-base-200/50 rounded-box"
                 style={{
                   backgroundImage: `repeating-linear-gradient(-45deg,
                      oklch(from var(--color-base-100) l c h / 0.2) 0px,
                    oklch(from var(--color-base-100) l c h / 0.2) 6px,
                    oklch(from var(--color-base-300) l c h / 0.3) 6px,
                    oklch(from var(--color-base-300) l c h / 0.3) 12px,
                    oklch(from var(--color-base-100) l c h / 0.2) 12px,
                    oklch(from var(--color-base-100) l c h / 0.2) 18px
                  )`
                 }}
            >
              {/* Desktop Layout */}
              <div className="hidden sm:flex items-center sm:gap-8">
                <div className="aspect-3/4 w-[140px] sm:w-[160px] rounded-box overflow-hidden">
                  <GameImage src={game?.image} alt={game?.display_game_name} data={game} />
                </div>

                <div className="flex-col sm:gap-3 hidden sm:flex max-w-96">
                  <div className="flex items-center gap-2">
                    <div className="badge badge-xl bg-base-200 text-sm font-semibold">{game?.provider_name}</div>
                    {isAuthenticated && game?.inner_game_id && (
                      <FavoriteButton initialLiked={isGameFavorite} onToggle={handleToggleFavorite} size="sm"
                                      className="bg-base-200" />
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
                    <div className="text-start">
                      <h3
                        className="text-xs text-base-content/70 mb-1 font-semibold">{t("gameDetail:play_with_balance_in", "Play with Balance In")}</h3>
                      {/* User Balance Button with CurrencySelector */}
                      <div className="mb-4 bg-base-300 rounded-field h-10 flex items-center w-full">
                        <div className=" flex-1 px-2">
                          <CurrencySelector
                            selectedCurrency={settlementCurrency}
                            onCurrencySelect={handleCurrencySelect}
                            showBalance={true}
                            className="w-full"
                          />
                        </div>
                      </div>
                      {/* Game Currency */}
                      <div className="mb-4 text-center flex items-center gap-2 h-17">
                        <p
                          className="text-xs text-base-content/60 mb-2 text-start"> {t("gameDetail:the_selected_currency_will_be_displayed_in", "The selected currency will be displayed in")}:</p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg btn btn-soft">
                          <CurrencyIcon currency={gameCurrency} className="w-4 h-4" />
                          <span className="font-semibold">{gameCurrency}</span>
                        </div>
                      </div>
                      {/* Play Button */}
                      <button
                        className="btn btn-primary btn-lg w-full gap-3 text-lg font-bold"
                        onClick={handlePlayNow}
                        disabled={
                          is_regional_access_prohibited ||
                          is_currency_settlement_prohibited ||
                          isLoadingCurrency ||
                          isLaunchingGame ||
                          isLaunchingDemoGame ||
                          (settlementBalanceAmount !== undefined && settlementBalanceAmount <= 0)
                        }
                      >
                        <Iconify icon="custom:play" width={24} height={24} />
                        {t("gameDetail:play", "Play")}
                      </button>
                      {/* Demo Play Button - 仅在支持时显示 */}
                      {isDemoSupported && (
                        <button
                          className="btn btn-primary btn-soft btn-lg w-full gap-3 text-lg font-bold mt-3"
                          onClick={handleDemoPlay}
                          disabled={is_regional_access_prohibited ||
                            is_currency_settlement_prohibited || isLoadingCurrency || isLaunchingGame || isLaunchingDemoGame}
                        >
                          <Iconify icon="custom:play" width={24} height={24} />
                          {t("gameDetail:demoPlay", "Demo Play")}
                        </button>
                      )}
                    </div>
                  ) : (
                    /* 未登录用户 - Demo Play 按钮（点击弹出登录框） */
                    <div className="text-start w-full">
                      <button className="btn btn-primary btn-soft btn-lg w-full gap-3 text-lg font-bold"
                              onClick={handleDemoPlay}>
                        <Iconify icon="custom:play" width={24} height={24} />
                        {t("gameDetail:demoPlay", "Demo Play")}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Layout - Image and Play Section Side by Side */}
              <div className="sm:hidden flex flex-col gap-4">
                <div className="flex gap-4">
                  {/* Game Image - Mobile */}
                  <div className="flex items-center flex-col gap-3">
                    <div className="aspect-3/4 w-[140px] rounded-box overflow-hidden shrink-0">
                      <GameImage src={game?.image} alt={game?.display_game_name} data={game} />
                    </div>
                    {isAuthenticated && game?.inner_game_id && (
                      <div className="flex gap-2 justify-center items-center">
                        <FavoriteButton initialLiked={isGameFavorite} onToggle={handleToggleFavorite} size="sm"
                                        className="bg-base-200" />
                        <button className="btn btn-square btn-sm" onClick={() => setIsSettingsOpen(true)}>
                          <Iconify icon="custom:setting-2" className="text-base-content/50 w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Play with Balance In - Mobile Right Side */}
                  <div className="flex-1">
                    {isAuthenticated ? (
                      /* Authenticated User - Full Controls */
                      <>
                        <h3 className="text-xs sm:text-sm font-semibold text-base-content/60 mb-1 text-start px-1">Play
                          with Balance In</h3>
                        {/* Currency Selector */}
                        <div className="mb-3">
                          <CurrencySelector
                            selectedCurrency={settlementCurrency}
                            onCurrencySelect={handleCurrencySelect}
                            className="w-full"
                            trigger={
                              <button
                                className="btn btn-md sm:btn-lg bg-base-300 text-base-content border-0 w-full flex items-center gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                  <CurrencyIcon currency={settlementCurrency} className="w-5 h-5" />
                                </div>
                                <div className="flex-1 text-center">
                                  {isBalanceDisplayLoading ? (
                                    <span className="loading loading-dots loading-xs" />
                                  ) : (
                                    <span
                                      className="text-xs font-semibold text-base-content">{settlementBalanceDisplay ?? "0"}</span>
                                  )}
                                </div>
                                <ChevronDown className="w-4 h-4 flex-shrink-0" />
                              </button>
                            }
                          />
                        </div>
                        {/* Game Currency Display */}
                        <div className="mb-3 flex items-center">
                          <p
                            className="text-xs text-base-content/60 mb-1.5"> {t("gameDetail:theSelectedCurrencyWillBeDisplayedIn", "The selected currency will be displayed in")}:</p>
                          <div
                            className="flex items-center justify-center gap-2 badge badge-soft badge-primary badge-lg">
                            <CurrencyIcon currency={gameCurrency} className="w-4 h-4" />
                            <span className="font-semibold text-xs">{gameCurrency}</span>
                          </div>
                        </div>
                        {/* Play Button */}

                        <button
                          className="btn btn-primary btn-md w-full gap-2 font-bold mb-3"
                          onClick={handlePlayNow}
                          disabled={
                            is_regional_access_prohibited ||
                            is_currency_settlement_prohibited ||
                            isLoadingCurrency ||
                            isLaunchingGame ||
                            isLaunchingDemoGame ||
                            (settlementBalanceAmount !== undefined && settlementBalanceAmount <= 0)
                          }
                        >
                          <Iconify icon="custom:play" className="w-4 h-4" />
                          {t("gameDetail:play", "Play")}
                        </button>
                        {/* Demo Play Button - 仅在支持时显示 */}
                        {isDemoSupported && (
                          <button
                            className="btn btn-ghost btn-md w-full gap-2 font-bold text-base-content/50"
                            onClick={handleDemoPlay}
                            disabled={is_regional_access_prohibited ||
                              is_currency_settlement_prohibited || isLoadingCurrency || isLaunchingGame || isLaunchingDemoGame}
                          >
                            {t("gameDetail:demoPlay", "Demo Play")}
                          </button>
                        )}
                      </>
                    ) : (
                      /* 未登录用户 - Demo Play 按钮（点击弹出登录框） */
                      <div className="flex items-center justify-center h-full">
                        <button className="btn btn-primary btn-soft btn-md w-full gap-2 font-bold"
                                onClick={handleDemoPlay}>
                          <Iconify icon="custom:play" className="w-4 h-4" />
                          {t("gameDetail:demoPlay", "Demo Play")}
                        </button>
                      </div>
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
                <h3
                  className="sm:text-lg text-base font-semibold text-base-content/90">{t("gameDetail:gameInformation")}</h3>
                <p className="text-base-content/50 text-xs sm:text-base leading-relaxed">
                  {t(`game_info:${game.game_provider}_${game.inner_game_id}`)}
                </p>
              </div>
            </div>
          )}

          {/* Featured Games and other sections - always show */}
          {casinoHomeGameList && casinoHomeGameList.home_data.hot_game && (
            <FeaturedGames games={casinoHomeGameList.home_data.hot_game}
                           country_code={casinoHomeGameList.country_code} />
          )}

          <GameProviders />

          <div className="container mx-auto px-0 flex flex-row justify-between items-center w-full">
            <div className="flex items-center gap-2 px-3">
              <div className="inline-grid *:[grid-area:1/1]">
                <div className="status status-primary animate-ping"></div>
                <div className="status status-primary"></div>
              </div>
              <p className="text-md sm:text-lg font-bold">{t("gameDetail:activity", "Activity")}</p>
            </div>

            <div className="sm:w-auto sm:min-w-[240px]">
              {isDesktopControls ? (
                <SegmentedControl
                  options={segmentOptions}
                  value={activeSection}
                  onChange={(value) => setActiveSection(value as SectionKey)}
                  isActiveClassName="text-base-content"
                  // className="bg-base-200 rounded-field w-full sm:w-[280px]"
                />
              ) : (
                <Select
                  options={selectOptions}
                  showCheckIcon={false}
                  value={activeSection}
                  onChange={(value) => setActiveSection(String(value) as SectionKey)}
                  variant="base"
                  size={isMobile ? "sm" : "md"}
                  className="bg-base-200 min-w-44 rounded-field"
                  renderValue={(option) => option.label}
                />
              )}
            </div>
          </div>

          {activeSection === "tournament" && !isHiddenTournamentProvider ? (
            <GameProviderTournaments provider={game?.game_provider} withContainer={false} showHeading={false} />
          ) : activeSection === "bets" ? (
            <div className="container mx-auto px-0 mb-6">
              <GameMyBets game_id={game?.inner_game_id} />
            </div>
          ) : null}

          {casinoHomeGameList &&
            casinoHomeGameList.home_data.game_category &&
            casinoHomeGameList.home_data.game_category.map((c: any, i: number) => (
              <CategoryGames key={`${c.category}-${i}`} games={c.games} category={c.category} />
            ))}

          <AlliancePartnerships />
        </div>
      </div>
      <LimitedOffer />
    </div>
  );
};

// Route Configuration
export const Route = createFileRoute("/_main/games/$gameId")({
  component: GameDetail,
  validateSearch: (search: Record<string, unknown>): { freeSpins?: string; currency?: string } => {
    return {
      freeSpins: (search.freeSpins as string) || undefined,
      currency: typeof search.currency === "string" ? search.currency : undefined,
    };
  }
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
