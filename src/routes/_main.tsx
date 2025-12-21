import { MotionLazy } from "@/components/animate";
import { Dock } from "@/components/Dock";
import { useSidebar } from "@/contexts/SidebarContext";
import { FreeSpinContainer } from "@/sections/free-spins";
import { cn } from "@/utils/themeMerger";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import React from "react";
import Header from "../components/header/Header";
import { Sidebar } from "../components/sidebar/Sidebar";
import { ChatwootWrapper } from "../components/ui/ChatwootFloatingButton";
import { LimitedOffer } from "@/sections/limited-offer/LimitedOffer";
import { NavItem } from "@/config/navigation";
import { t } from "i18next";

export const Route = createFileRoute("/_main")({
  component: MainLayout,
});

/**
 * 主布局 - 包含完整的应用导航（Sidebar + Header + Dock）
 * 用于大部分应用页面
 */
export default function MainLayout() {
  const { isMobile } = useSidebar();
  const mainRef = React.useRef<HTMLElement>(null);
  const location = useLocation();

  // Sports 页面需要全屏显示，不受 container 限制
  const isSportsPage = location.pathname === '/sports';
  const isGamePlayPage = location.pathname.startsWith("/games/play/");
  const shouldShowDock = !(isMobile && isGamePlayPage);

  // 路由切换时滚动到顶部
  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [location.pathname, location.search]);

  const MAIN_NAV_ITEMS: NavItem[] = [
    {
      href: "#",
      label: t("common:common.menu"),
      icon: "custom:menu",
    },
    {
      href: "/explore",
      label: t("common:common.explore"),
      icon: "custom:explore",
    },
    {
      href: "/casino",
      label: t("common:common.casino"),
      icon: "custom:casino",
    },
    {
      href: "/sports",
      label: t("common:common.sports"),
      icon: "custom:sports",
    },
    {
      href: "/bonus",
      label: t("common:common.bonus"),
      icon: "custom:bonus",
    },
  ];

  return (
    <MotionLazy>
      <div className="flex h-[100dvh] bg-base-300">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main
            ref={mainRef}
            className={cn(
              "flex-1 w-full overflow-y-auto hide-scrollbar",
              // 为移动端 Dock 预留空间
              isMobile && shouldShowDock ? "pb-18" : "",
            )}
          >
            {isSportsPage ? (
              // Sports 页面：全宽显示，无容器限制
              <Outlet />
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
        <FreeSpinContainer />
        <LimitedOffer />
      </div>
    </MotionLazy>
  );
}
