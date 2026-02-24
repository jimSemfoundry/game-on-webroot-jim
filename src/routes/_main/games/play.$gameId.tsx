import { GameIframe } from "@/components/game/GameIframe.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useAuthModals } from "@/contexts/ModalsProvider.tsx";
import { useLaunchGameMutation } from "@/hooks/api/useAuth.ts";
import { cn } from "@/utils/cn";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Game Play Component
const GamePlay = () => {
  const { gameId } = Route.useParams();
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const { openSignInModal } = useAuthModals();

  const [gameData, setGameData] = useState<{
    launchData: string;
    launchType: 'url' | 'html';
  } | null>(null);
  const [gameName, setGameName] = useState<string>("");

  const { mutate: launchGame, isPending: isLaunching } = useLaunchGameMutation();

  // 检查用户登录状态
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error(t("auth:loginRequired"));
      openSignInModal();
      navigate({ to: "/casino", search: { openLogin: undefined, openSignUp: undefined, redirect: undefined, startapp: undefined, openFinance: undefined } });
      return;
    }
  }, [isAuthenticated, openSignInModal, navigate, t]);

  // 启动游戏
  useEffect(() => {
    if (!isAuthenticated || !user || !gameId) return;

    // 解析 gameId - 支持多种格式
    let inner_game_id = gameId;
    let game_provider = "";
    const searchCurrency = typeof searchParams?.currency === "string" ? searchParams.currency.trim() : "";
    let game_currency = searchCurrency || user.currency_fiat || "USDT"; // 默认货币
    let parsedGameId = gameId;

    // 检查是否是试玩模式（为将来的试玩功能预留）
    const isDemoPlay = gameId.includes("/demoPlay");
    if (isDemoPlay) {
      parsedGameId = gameId.replace("/demoPlay", "");
    }

    if (parsedGameId.includes(":")) {
      const [provider, innerGameId] = parsedGameId.split(":");
      game_provider = provider;
      inner_game_id = innerGameId;
    } else if (parsedGameId.includes("/")) {
      // 新格式: inner_game_id/provider 或 inner_game_id/provider/currency
      const parts = parsedGameId.split("/");
      if (parts.length >= 2) {
        inner_game_id = parts[0];
        game_provider = parts[1];
        // 如果URL中包含currency参数，使用它（除非 search currency 已提供）
        if (!searchCurrency && parts.length >= 3 && parts[2]) {
          game_currency = parts[2];
        }
      } else {
        toast.error("Invalid game ID format");
        navigate({ to: "/casino", search: { openLogin: undefined, openSignUp: undefined, redirect: undefined, startapp: undefined, openFinance: undefined } });
        return;
      }
    } else {
      // 如果没有提供商信息，尝试从游戏详情获取
      toast.error("Invalid game ID format");
      navigate({ to: "/casino", search: { openLogin: undefined, openSignUp: undefined, redirect: undefined, startapp: undefined, openFinance: undefined } });
      return;
    }

    // 设置游戏名称（使用inner_game_id作为显示名称）
    setGameName(`${game_provider} - ${inner_game_id}`);

    const origin = window.location.origin;
    const launchParams = {
      inner_game_id,
      game_provider,
      game_currency,
      lang: i18n.language.toUpperCase(),
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
        } else {
          toast.error(response.msg || "Failed to launch game");
          navigate({ to: "/casino", search: { openLogin: undefined, openSignUp: undefined, redirect: undefined, startapp: undefined, openFinance: undefined } });
        }
      },
      onError: () => {
        navigate({ to: "/casino", search: { openLogin: undefined, openSignUp: undefined, redirect: undefined , startapp: undefined, openFinance: undefined} });
      },
    });
  }, [isAuthenticated, user, gameId, launchGame, navigate, i18n.language, t, searchParams?.currency]);

  const handleGameError = () => {
    navigate({ to: "/casino", search: { openLogin: undefined, openSignUp: undefined, redirect: undefined, startapp: undefined, openFinance: undefined } });
  };

  // Loading state
  if (isLaunching || !gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-6 text-white">
          <div className="relative">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <div className="absolute inset-0 loading loading-ring loading-lg text-primary/30"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">{t("common:common.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  // MainLayout reserves header space via `pt-[calc(<header>+env(safe-area-inset-top))]`.
  // This route renders an iframe-heavy view where parent scrolling is effectively blocked,
  // so we must match the same subtraction to avoid clipping the bottom of the game.
  const playerViewportHeight = "h-[calc(100dvh-3rem-env(safe-area-inset-top))] md:h-[calc(100dvh-4.5rem-env(safe-area-inset-top))]";
  const playerViewportMinHeight = "min-h-[calc(100dvh-3rem-env(safe-area-inset-top))] md:min-h-[calc(100dvh-4.5rem-env(safe-area-inset-top))]";

  return (
    <div className={cn("bg-black overflow-hidden", playerViewportMinHeight)}>
      <div className={cn("w-full", playerViewportHeight)}>
        <GameIframe
          launchData={gameData.launchData}
          launchType={gameData.launchType}
          isFullScreen={false}
          onError={handleGameError}
          gameName={gameName}
        />
      </div>

    </div>
  );
};

// Route Configuration
export const Route = createFileRoute("/_main/games/play/$gameId")({
  component: GamePlay,
  validateSearch: (search: Record<string, unknown>): { currency?: string } => ({
    currency: typeof search.currency === "string" ? search.currency : undefined,
  }),
  // 在加载前检查认证状态
  beforeLoad: () => {
    // 这里可以添加认证检查逻辑
    // 如果需要，可以重定向到登录页面
  },
});
