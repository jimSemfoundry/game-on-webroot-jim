import { GameIframe } from "@/components/game/GameIframe.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useAuthModals } from "@/contexts/ModalsProvider.tsx";
import { useLaunchGameMutation } from "@/hooks/api/useAuth.ts";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Game Play Component
const GamePlay = () => {
  const { gameId } = Route.useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const { openSignInModal } = useAuthModals();

  const [gameData, setGameData] = useState<{
    launchData: string;
    launchType: 'url' | 'html';
  } | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [gameName, setGameName] = useState<string>("");

  const { mutate: launchGame, isPending: isLaunching } = useLaunchGameMutation();

  // 检查用户登录状态
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error(t("auth:loginRequired"));
      openSignInModal();
      navigate({ to: "/casino", search: { openLogin: undefined, redirect: undefined } });
      return;
    }
  }, [isAuthenticated, openSignInModal, navigate, t]);

  // 启动游戏
  useEffect(() => {
    if (!isAuthenticated || !user || !gameId) return;

    // 解析 gameId - 支持多种格式
    let inner_game_id = gameId;
    let game_provider = "";
    let game_currency = user.currency || "USDT"; // 默认货币
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
        // 如果URL中包含currency参数，使用它
        if (parts.length >= 3 && parts[2]) {
          game_currency = parts[2];
        }
      } else {
        toast.error("Invalid game ID format");
        navigate({ to: "/casino", search: { openLogin: undefined, redirect: undefined } });
        return;
      }
    } else {
      // 如果没有提供商信息，尝试从游戏详情获取
      toast.error("Invalid game ID format");
      navigate({ to: "/casino", search: { openLogin: undefined, redirect: undefined } });
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
          navigate({ to: "/casino", search: { openLogin: undefined, redirect: undefined } });
        }
      },
      onError: () => {
        navigate({ to: "/casino", search: { openLogin: undefined, redirect: undefined } });
      },
    });
  }, [isAuthenticated, user, gameId, launchGame, navigate, i18n.language, t]);

  const handleGameError = () => {
    navigate({ to: "/casino", search: { openLogin: undefined, redirect: undefined } });
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
            <p className="text-lg font-medium">Loading Game</p>
            <p className="text-sm opacity-70">Preparing your gaming experience...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <GameIframe
        launchData={gameData.launchData}
        launchType={gameData.launchType}
        isFullScreen={isFullScreen}
        onError={handleGameError}
        gameName={gameName}
      />
      
      {/* 全屏切换按钮 */}
      <button
        onClick={() => setIsFullScreen(!isFullScreen)}
        className="fixed bottom-4 right-4 z-[9999] btn btn-sm btn-circle bg-black/50 text-white border-none hover:bg-black/70"
      >
        {isFullScreen ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h3a1 1 0 000 2H5.414l1.293 1.293a1 1 0 01-1.414 1.414L4 6.414V8a1 1 0 01-2 0V4zM16 4a1 1 0 00-1-1h-3a1 1 0 100 2h1.586l-1.293 1.293a1 1 0 001.414 1.414L15 6.414V8a1 1 0 102 0V4zM4 16a1 1 0 001 1h3a1 1 0 100-2H6.414l1.293-1.293a1 1 0 00-1.414-1.414L5 13.586V12a1 1 0 10-2 0v4zM16 16a1 1 0 01-1 1h-3a1 1 0 110-2h1.586l-1.293-1.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 112 0v4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 000 2h1.586l-1.293 1.293a1 1 0 001.414 1.414L6 7.414V9a1 1 0 102 0V4a1 1 0 00-1-1H4zM16 4a1 1 0 100 2h-1.586l1.293 1.293a1 1 0 11-1.414 1.414L14 7.414V9a1 1 0 11-2 0V4a1 1 0 011-1h3zM4 16a1 1 0 100-2H2.414l1.293-1.293a1 1 0 10-1.414-1.414L1 12.586V11a1 1 0 10-2 0v4a1 1 0 001 1h4zM16 16a1 1 0 110-2h1.586l-1.293-1.293a1 1 0 111.414-1.414L19 12.586V11a1 1 0 112 0v4a1 1 0 01-1 1h-4z" />
          </svg>
        )}
      </button>
    </div>
  );
};

// Route Configuration
export const Route = createFileRoute("/_main/games/play/$gameId")({
  component: GamePlay,
  // 在加载前检查认证状态
  beforeLoad: () => {
    // 这里可以添加认证检查逻辑
    // 如果需要，可以重定向到登录页面
  },
});
