import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useBuddyBallMessages } from "@/hooks/useBuddyBallMessages.ts";
import { Dashboard } from "@/sections/buddy-balls/Dashboard.tsx";
import { DesktopBuddyBallsPanel, type DesktopBuddyTab } from "@/sections/buddy-balls/DesktopBuddyBallsPanel.tsx";
import { PlinkoBoard } from "@/components/plinko/PlinkoBoard";
import { InnerShareLink } from "@/sections/bonus/buddy-ball/share.tsx";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

const BUDDY_BALL_GAME_URL = `${import.meta.env.BASE_URL}game/buddyball-cocos/index.html`;
const BUDDY_BALL_GAME_ID = "Plinko";

export const Route = createFileRoute("/_main/buddy-balls/")({
  component: RouteComponent
});

const calculateSharePanelLayout = (containerWidth: number, containerHeight: number) => {
  const targetTriangleWidth = containerWidth * 0.64;
  const targetTriangleHeight = containerHeight * 0.8;
  const imageAspectRatio = 0.8;
  const targetAspectRatio = targetTriangleWidth / targetTriangleHeight;

  let triangleWidth: number;
  let triangleHeight: number;

  if (imageAspectRatio > targetAspectRatio) {
    triangleWidth = targetTriangleWidth;
    triangleHeight = triangleWidth / imageAspectRatio;
  } else {
    triangleHeight = targetTriangleHeight;
    triangleWidth = triangleHeight * imageAspectRatio;
  }

  const panelWidth = Math.max(0, Math.round(triangleWidth));
  const panelHeight = Math.max(0, Math.round(panelWidth * 0.6));

  return { panelWidth, panelHeight };
};

function RouteComponent() {
  const { t } = useTranslation(["buddyBalls"]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const closeShareTimeoutRef = useRef<number | null>(null);
  const iframeBackgroundColor = import.meta.env.VITE_PWA_THEME_COLOR || "#0f1419";
  const themedPageBackgroundColor = "var(--color-base-300)";
  const buildIframeSrc = useCallback((width?: number, height?: number) => {
    const params = new URLSearchParams({ gameid: BUDDY_BALL_GAME_ID });
    params.set("color", iframeBackgroundColor);
    if (typeof width === "number" && Number.isFinite(width)) {
      params.set("width", String(Math.round(width)));
    }
    if (typeof height === "number" && Number.isFinite(height)) {
      params.set("height", String(Math.round(height)));
    }
    return `${BUDDY_BALL_GAME_URL}?${params.toString()}`;
  }, [iframeBackgroundColor]);
  const [iframeSrc, setIframeSrc] = useState(() => buildIframeSrc());
  const [, setIsIframeLoading] = useState(false); // Plinko 不需要加载
  const [iframeLoadError, setIframeLoadError] = useState<string | null>(null);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false); // Plinko 不显示加载
  const [dashboardHeight, setDashboardHeight] = useState(0);
  const [desktopPanelTab, setDesktopPanelTab] = useState<DesktopBuddyTab>("details");
  const [showShare, setShowShare] = useState(false);
  const [isSharePanelVisible, setIsSharePanelVisible] = useState(false);
  const [sharePanelLayout, setSharePanelLayout] = useState(() => ({ panelWidth: 0, panelHeight: 0 }));
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 768px)").matches;
  });

  useLayoutEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlBg = html.style.backgroundColor;
    const prevBodyBg = body.style.backgroundColor;
    html.style.backgroundColor = themedPageBackgroundColor;
    body.style.backgroundColor = themedPageBackgroundColor;
    return () => {
      html.style.backgroundColor = prevHtmlBg;
      body.style.backgroundColor = prevBodyBg;
    };
  }, [themedPageBackgroundColor]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!dashboardRef.current) return;
    const el = dashboardRef.current;
    const update = () => {
      const contentHeight = Math.max(0, Math.round(el.getBoundingClientRect().height));
      // 在桌面端，Dashboard有20px的顶部外边距，需要额外加上
      const marginTop = isDesktop ? 20 : 0;
      const next = contentHeight + marginTop;
      setDashboardHeight((current) => (current === next ? current : next));
    };
    const timeoutId = setTimeout(() => {
      update();
      if (!("ResizeObserver" in window)) return;
      const ro = new ResizeObserver(() => update());
      ro.observe(el);
      return () => ro.disconnect();
    }, 100);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [showLoadingOverlay, iframeLoadError, isDesktop]);

  useBuddyBallMessages({
    onClose: () => null,
    onError: () => null,
    onGameReady: () => {
      setIsIframeLoading(false);
      setIframeLoadError(null);
    },
    iframeRef,
    containerRef: gameAreaRef,
    iframeSrc
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const width = gameAreaRef.current?.clientWidth ?? containerRef.current?.clientWidth ?? window.innerWidth;
    const height = gameAreaRef.current?.clientHeight ?? containerRef.current?.clientHeight ?? window.innerHeight;
    setIframeSrc((current) => {
      const next = buildIframeSrc(width, height);
      return current === next ? current : next;
    });
  }, [buildIframeSrc]);

  useEffect(() => {
    // Plinko 不需要加载逻辑，直接设置为完成状态
    setIsIframeLoading(false);
    setIframeLoadError(null);
    setShowLoadingOverlay(false);
  }, []);

  useLayoutEffect(() => {
    if (typeof document === "undefined") return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setIframeSrc(buildIframeSrc(width, height));
      }
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [buildIframeSrc]);

  useEffect(() => {
    const handleGameMessage = (event: MessageEvent) => {
      if (event.data?.type === "gameReady") {
        setIsIframeLoading(false);
        setIframeLoadError(null);
      }
    };
    window.addEventListener("message", handleGameMessage);
    return () => window.removeEventListener("message", handleGameMessage);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const handleCloseBuddyBall = useCallback(() => {
    if (typeof window === "undefined") return;
    window.history.back();
  }, []);

  const handleOpenShare = useCallback(() => {
    if (closeShareTimeoutRef.current != null) {
      window.clearTimeout(closeShareTimeoutRef.current);
      closeShareTimeoutRef.current = null;
    }
    setShowShare(true);
    setIsSharePanelVisible(false);
    requestAnimationFrame(() => setIsSharePanelVisible(true));
  }, []);

  const handleCloseShare = useCallback(() => {
    setIsSharePanelVisible(false);
    if (closeShareTimeoutRef.current != null) {
      window.clearTimeout(closeShareTimeoutRef.current);
    }
    closeShareTimeoutRef.current = window.setTimeout(() => {
      setShowShare(false);
      closeShareTimeoutRef.current = null;
    }, 220);
  }, []);

  useEffect(() => {
    return () => {
      if (closeShareTimeoutRef.current != null) {
        window.clearTimeout(closeShareTimeoutRef.current);
        closeShareTimeoutRef.current = null;
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (!showShare) return;
    const el = gameAreaRef.current ?? containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const next = isDesktop
        ? calculateSharePanelLayout(rect.width, rect.height)
        : (() => {
          const panelWidth = Math.max(0, Math.round(window.innerWidth * 0.9));
          const panelHeight = Math.max(0, Math.round(panelWidth * 0.6));
          return { panelWidth, panelHeight };
        })();
      setSharePanelLayout((current) => (
        current.panelWidth === next.panelWidth && current.panelHeight === next.panelHeight
          ? current
          : next
      ));
    };

    update();
    if (!("ResizeObserver" in window)) return;
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [showShare, isDesktop]);

  return (
    <div
      className="relative z-40 flex h-full w-full flex-col md:overflow-y-auto"
      style={{
        backgroundColor: themedPageBackgroundColor,
      }}
    >
      <div className="mx-auto flex h-full w-full flex-col md:h-auto md:min-h-full md:w-[920px] md:max-w-[920px]">
        <div className="flex min-h-0 flex-1 flex-col md:flex-none">
          <div className="mx-auto flex h-full w-full max-w-[920px] flex-col md:h-[68vh] md:min-h-[560px] md:max-h-[820px] md:flex-none">
            <div className="flex h-full min-h-0 flex-col md:rounded-[1rem] md:bg-base-200 md:px-[24px] md:pb-[24px] md:pt-[20px]">
              <div className="relative mx-auto flex h-full w-full max-w-[873px] flex-col min-h-0 md:max-w-none">
                <div
                  className="relative z-10 hidden shrink-0 items-center justify-between rounded-t-[1rem] bg-base-200 py-3 md:flex">
                  <div className="flex items-center gap-2">
                    <span className="text-[1.25rem] font-semibold leading-none text-base-content">
                      {t("buddyBalls:buddyBalls")}
                    </span>
                  </div>
                  <button
                    className="btn btn-md btn-square bg-base-300"
                    onClick={handleCloseBuddyBall}
                  >
                    <X className="text-base-content/50" size={20} />
                  </button>
                </div>

                {/* 游戏入口 */}
                <div
                  ref={containerRef}
                  className={"px-0 flex-1 min-h-0 pt-0"}
                  style={{
                    backgroundColor: themedPageBackgroundColor,
                    paddingBottom: "calc(0.5rem + var(--safe-area-inset-bottom, 0px) + 6px)"
                  }}
                >
                  <div className="relative w-full h-full overflow-hidden">
                    {!showLoadingOverlay && !iframeLoadError && (
                      <div
                          className={`absolute top-0 z-20 pt-0 ${isDesktop ? "" : "left-[10px] right-[10px]"}`}
                          style={isDesktop ? {
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "calc(100% - 20px)",
                            maxWidth: "calc(100% - 20px)",
                            borderRadius: "11px",
                            overflow: "hidden",
                            marginTop: "20px", /* 桌面端顶部外边距 */
                          } : undefined}
                          ref={dashboardRef}
                        >
                        <Dashboard onOpenShare={handleOpenShare} />
                      </div>
                    )}

                    {showShare && (
                      <div
                        className="absolute inset-0 z-50 flex justify-center items-end md:items-center"
                        style={{
                          paddingBottom: isDesktop 
                            ? "0px" 
                            : "calc(var(--safe-area-inset-bottom, 0px) + var(--android-nav-offset, 0px) + 0.5rem + 3px)",
                          paddingLeft: "12px",
                          paddingRight: "12px"
                        }}
                      >
                        <button
                          type="button"
                          className="absolute inset-0 bg-black/40"
                          onClick={handleCloseShare}
                          aria-label="Close share"
                        />
                        <div
                          className="relative w-full"
                          style={{
                            width: `${sharePanelLayout.panelWidth}px`,
                            height: isDesktop ? `${sharePanelLayout.panelHeight}px` : "auto",
                            transform: isDesktop
                              ? `scale(${isSharePanelVisible ? 1 : 0.98})`
                              : `translateY(${isSharePanelVisible ? 0 : 110}%)`,
                            transition: "transform 220ms ease"
                          }}
                        >
                          <div className="relative w-full rounded-[1rem] bg-base-300 p-3 shadow-xl" style={{ height: isDesktop ? "100%" : "auto" }}>
                            <div className="h-full min-h-0">
                              <InnerShareLink showQuickShareTitle onClose={handleCloseShare} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 flex flex-col" ref={gameAreaRef}>
                      <div style={{ height: `${dashboardHeight}px` }} />
                      <div className="relative flex-1 min-h-0">
                        {/* Plinko 不需要加载覆盖层，直接显示游戏 */}
                        {/* 替换 iframe 为 Plinko 组件，保持相同的样式和结构 */}
                        <div
                          className="block w-full h-full border-none outline-none"
                        >
                          <PlinkoBoard />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:flex-none">
            <DesktopBuddyBallsPanel
              activeTab={desktopPanelTab}
              onTabChange={setDesktopPanelTab}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


