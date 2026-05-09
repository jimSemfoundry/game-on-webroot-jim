import { MotionLazy } from "@/components/animate";
import { Dock } from "@/components/Dock";
import { useSidebar } from "@/contexts/SidebarContext";
import { FreeSpinContainerV2 } from "@/sections/free-spins";
import { BountyMqttListener } from "@/sections/bounty/BountyMqttListener";
import { cn } from "@/utils/themeMerger";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import React from "react";
import { useBoundStore } from "@/store";
import Header from "../components/header/Header";
import { Sidebar } from "../components/sidebar/Sidebar";
import { ChatwootWrapper } from "../components/ui/ChatwootFloatingButton";
import { NavItem } from "@/config/navigation";
import { LuckySpinContainer } from "@/sections/lucky-spin/lucky-spin-container.tsx";

export const Route = createFileRoute("/_main")({
  component: MainLayout
});

/**
 * 主布局 - 包含完整的应用导航（Sidebar + Header + Dock）
 * 用于大部分应用页面
 */
export default function MainLayout() {
  const { isMobile } = useSidebar();
  const mainRef = React.useRef<HTMLElement>(null);
  const location = useLocation();
  const headerBackAction = useBoundStore((s) => s.headerBackAction);

  // Legacy viewport hacks removed in favor of interactive-widget=resizes-content

  // Sports 页面需要全屏显示，不受 container 限制
  const isSportsPage = location.pathname === '/sports';
  const isBuddyBallsPage = location.pathname.startsWith('/buddy-balls');
  const isGamePlayPage = location.pathname.startsWith("/games/play/");
  const isGameDetailPage = location.pathname.startsWith("/games/");
  // When an in-page game iframe is active, game detail sets a custom back action.
  const isInGameOverlay = isMobile && isGameDetailPage && Boolean(headerBackAction);
  const shouldShowDock = !(isMobile && (isGamePlayPage || isInGameOverlay));

  // 路由切换时滚动到顶部
  React.useEffect(() => {
    if (mainRef.current) {
      const shouldScrollBonusCheckToBottom = location.pathname === "/bonus/check"
        && sessionStorage.getItem("bonusCheckScrollToBottom") === "1";

      if (shouldScrollBonusCheckToBottom) {
        sessionStorage.removeItem("bonusCheckScrollToBottom");
        mainRef.current.scrollTo({
          top: mainRef.current.scrollHeight,
          behavior: "smooth"
        });
        return;
      }

      mainRef.current.scrollTo(0, 0);
    }
  }, [location.pathname, location.search]);

  // Safety cleanup: prevent the global fullscreen flag from leaking into non-game pages.
  React.useEffect(() => {
    const isGamesRoute = location.pathname.startsWith("/games/");
    if (!isGamesRoute) {
      document.documentElement.classList.remove("game-fullscreen");
    }
  }, [location.pathname]);

  const MAIN_NAV_ITEMS: NavItem[] = [
    {
      href: "#",
      label: "common:common.menu",
      icon: "custom:menu"
    },
    {
      href: "/explore",
      label: "common:common.explore",
      icon: "custom:explore"
    },
    {
      href: "/casino",
      label: "common:common.casino",
      icon: "custom:casino"
    },
    {
      href: "/sports",
      label: "common:common.sports",
      icon: "custom:sports"
    },
    {
      href: "/bonus",
      label: "common:common.bonus",
      icon: "custom:bonus"
    }
  ];

  return (
    <MotionLazy>
      <div
        className="fixed inset-0 flex bg-base-300"
        style={{
          overscrollBehavior: "none"
        }}
      >
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden" style={{ overscrollBehavior: "none" }}>
          <Header />
          <main
            ref={mainRef}
            className={cn(
              "flex-1 w-full hide-scrollbar",
              "overflow-y-auto",
              // 为固定 Header 预留顶部空间
              isBuddyBallsPage
                ? (isMobile
                  ? "pt-[calc(3rem+var(--safe-area-inset-top))]"
                  : "pt-[calc(3rem+var(--safe-area-inset-top))] md:pt-[calc(4.5rem+var(--safe-area-inset-top))]")
                : (isMobile
                  ? "pt-[calc(3rem+var(--safe-area-inset-top))]"
                  : "pt-[calc(3rem+var(--safe-area-inset-top))] md:pt-[calc(4.5rem+var(--safe-area-inset-top))]"),
              // 为移动端 Dock 预留空间 (Dock高度 + safe-area-inset-bottom)
              isMobile && shouldShowDock ? "pb-[calc(4.5rem+var(--safe-area-inset-bottom))]" : ""
            )}
            style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
          >
            {isSportsPage || isBuddyBallsPage ? (
              // Sports / Buddy Balls 页面：全宽显示，无通用 container 限制
              <div className={cn("w-full", isBuddyBallsPage ? "h-full" : undefined)}>
                <Outlet />
              </div>
            ) : (
              // 其他页面：使用标准容器
              <div className="container mx-auto md:max-w-7xl">
                <Outlet />
              </div>
            )}
          </main>
        </div>
        {shouldShowDock ? <Dock scrollContainer={mainRef.current} items={MAIN_NAV_ITEMS} /> : null}
        <ChatwootWrapper />
        {/* Free Spin 全局容器 - 会在用户登录15秒后自动检查待处理的Free Spin */}
        <FreeSpinContainerV2 />
        <BountyMqttListener />
        {/* Lucky Spin 抽奖次数发放通知*/}
        <LuckySpinContainer />
      </div>
    </MotionLazy>
  );
}
