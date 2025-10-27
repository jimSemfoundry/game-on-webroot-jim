import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface GameIframeProps {
  launchData: string;
  launchType: 'url' | 'html';
  isFullScreen?: boolean;
  onError?: () => void;
  onClose?: () => void;
  gameName?: string;
}

export function GameIframe({ launchData, launchType, isFullScreen = false, onError, onClose, gameName: _ }: GameIframeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleBack = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      navigate({ to: "/casino", search: { openLogin: undefined, redirect: undefined } });
    }
  }, [navigate, onClose]);

  const handleError = useCallback(() => {
    toast.error(t("gameDetail:gameFailedToOpen"));
    onError?.();
  }, [onError, t]);

  const sizeClasses = useMemo(() => {
    if (isFullScreen) return "h-full w-full";
    return "h-full w-full";
  }, [isFullScreen]);

  const UrlIframe = useCallback(() => {
    if (launchType !== 'url' || !launchData) return null;

    return (
      <iframe
        ref={iframeRef}
        src={launchData}
        className={`${sizeClasses} border-none`}
        allowFullScreen={isFullScreen}
        allow="fullscreen; microphone; camera; payment; autoplay; encrypted-media"
        sandbox="allow-forms allow-modals allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-downloads"
        onLoad={() => setIsLoading(false)}
        onError={handleError}
        title="Game"
      />
    );
  }, [launchData, launchType, sizeClasses, isFullScreen, handleError]);

  const HtmlIframe = useCallback(() => {
    if (launchType !== 'html' || !launchData) return null;

    return (
      <iframe
        ref={iframeRef}
        srcDoc={launchData}
        className={`${sizeClasses} border-none`}
        allowFullScreen={isFullScreen}
        allow="fullscreen; microphone; camera; payment; autoplay; encrypted-media"
        sandbox="allow-forms allow-modals allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-downloads"
        onLoad={() => setIsLoading(false)}
        onError={handleError}
        title="Game"
      />
    );
  }, [launchData, launchType, sizeClasses, isFullScreen, handleError]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (iframeRef.current) {
        // 清理 iframe 内容
        iframeRef.current.src = 'about:blank';
      }
    };
  }, []);

  if (!launchData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4" />
          <p className="text-base-content/70">Loading game...</p>
        </div>
      </div>
    );
  }

  // 全屏模式
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        {/* 返回按钮 */}
        <button 
          onClick={handleBack}
          className="fixed top-4 left-4 z-[9999] btn btn-sm btn-square"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Loading 状态 */}
        {isLoading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center gap-4 text-white">
              <span className="loading loading-spinner loading-xl text-primary" />
              <p className="text-lg font-medium">Loading Game...</p>
              <p className="text-sm opacity-70">Preparing your gaming experience...</p>
            </div>
          </div>
        )}

        {/* 游戏内容 */}
        <div className="h-screen w-full">
          {launchType === 'url' && <UrlIframe />}
          {launchType === 'html' && <HtmlIframe />}
        </div>
      </div>
    );
  }

  // 嵌入模式 - 直接渲染iframe内容
  return (
    <div className="relative h-full w-full">
      {/* Loading 状态 */}
      {isLoading && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 rounded-lg">
          <div className="flex flex-col items-center gap-4 text-white">
            <span className="loading loading-spinner loading-xl text-primary" />
            <p className="text-lg font-medium">Loading Game...</p>
            <p className="text-sm opacity-70">Preparing your gaming experience...</p>
          </div>
        </div>
      )}

      {/* 游戏iframe */}
      <div className="h-full w-full rounded-lg overflow-hidden">
        {launchType === 'url' && <UrlIframe />}
        {launchType === 'html' && <HtmlIframe />}
      </div>
    </div>
  );
}