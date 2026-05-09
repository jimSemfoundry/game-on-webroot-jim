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
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation(['gameDetail', 'common']);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!isFullScreen) return;
    document.documentElement.classList.add("game-fullscreen");
    return () => {
      document.documentElement.classList.remove("game-fullscreen");
    };
  }, [isFullScreen]);

  // 延迟渲染 iframe，确保页面和认证状态都准备好
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // 清理 iframe 资源
  useEffect(() => {
    return () => {
      if (iframeRef.current) {
        const iframe = iframeRef.current;

        // 1. 移除所有事件监听器
        iframe.onload = null;
        iframe.onerror = null;

        // 2. 清理 Blob URL（如果存在）
        if (iframe.src.startsWith('blob:')) {
          URL.revokeObjectURL(iframe.src);
        }

        // 3. 强制停止 iframe 内部所有活动
        try {
          const contentWindow = iframe.contentWindow;
          if (contentWindow) {
            // 停止所有网络请求和脚本执行
            contentWindow.stop();
            // 清除所有定时器
            contentWindow.clearTimeout(0);
            contentWindow.clearInterval(0);
            // 移除所有事件监听器
            contentWindow.onbeforeunload = null;
            contentWindow.onunload = null;
          }
        } catch (e) {
          // 跨域情况下忽略，继续其他清理步骤
        }

        // 4. 导航到空白页面，强制浏览器清理
        iframe.src = 'about:blank';
        iframe.srcdoc = '';

        // 5. 立即从 DOM 移除（更简洁的方式）
        // 不需要等待，因为 about:blank 会立即生效
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }

        // 6. 清空引用
        iframeRef.current = null;
      }
    };
  }, []);
  
  const handleBack = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      // Use browser history to go back to the previous page
      navigate({ to: -1 as any });
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


  if (!launchData || !isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4" />
          <p className="text-base-content/70">{t("common:common.loading")}</p>
        </div>
      </div>
    );
  }

  // 全屏模式
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-[1002] bg-black">
        {/* 返回按钮 */}
        <button
          onClick={handleBack}
          className="fixed z-[9999] btn btn-sm btn-square"
          style={{
            top: "calc(var(--safe-area-inset-top) + 1rem)",
            left: "calc(var(--safe-area-inset-left) + 1rem)",
          }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Loading 状态 */}
        {isLoading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center gap-4 text-base-content">
              <span className="loading loading-spinner loading-xl text-primary" />
              <p className="text-lg font-medium">{t("common:common.loading")}</p>
            </div>
          </div>
        )}

        {/* 游戏内容 */}
        <div className="h-[100dvh] w-full">
          {launchType === 'url' && launchData && (
            <iframe
              ref={iframeRef}
              src={launchData}
              className={`${sizeClasses} border-none`}
              allowFullScreen={isFullScreen}
              allow="fullscreen; microphone; camera; payment; autoplay; encrypted-media; storage-access"
              sandbox="allow-forms allow-modals allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-downloads allow-storage-access-by-user-activation"
              onLoad={() => setIsLoading(false)}
              onError={handleError}
              title="Game"
            />
          )}
          {launchType === 'html' && launchData && (
            <iframe
              ref={iframeRef}
              srcDoc={launchData}
              className={`${sizeClasses} border-none`}
              allowFullScreen={isFullScreen}
              allow="fullscreen; microphone; camera; payment; autoplay; encrypted-media; storage-access"
              sandbox="allow-forms allow-modals allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-downloads allow-storage-access-by-user-activation"
              onLoad={() => setIsLoading(false)}
              onError={handleError}
              title="Game"
            />
          )}
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
          <div className="flex flex-col items-center gap-4 text-base-content">
            <span className="loading loading-spinner loading-xl text-primary" />
            <p className="text-lg font-medium">{t("common:common.loading")}</p>
          </div>
        </div>
      )}

      {/* 游戏iframe */}
      <div className="h-full w-full rounded-lg overflow-hidden">
        {launchType === 'url' && launchData && (
          <iframe
            ref={iframeRef}
            src={launchData}
            className={`${sizeClasses} border-none`}
            allowFullScreen={false}
            allow="microphone; camera; payment; autoplay; encrypted-media; storage-access"
            sandbox="allow-forms allow-modals allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-downloads allow-storage-access-by-user-activation"
            onLoad={() => setIsLoading(false)}
            onError={handleError}
            title="Game"
          />
        )}
        {launchType === 'html' && launchData && (
          <iframe
            ref={iframeRef}
            srcDoc={launchData}
            className={`${sizeClasses} border-none`}
            allowFullScreen={false}
            allow="microphone; camera; payment; autoplay; encrypted-media; storage-access"
            sandbox="allow-forms allow-modals allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-downloads allow-storage-access-by-user-activation"
            onLoad={() => setIsLoading(false)}
            onError={handleError}
            title="Game"
          />
        )}
      </div>
    </div>
  );
}
