import { MotionLazy } from "@/components/animate";
import { Dock } from "@/components/Dock";
import { useSidebar } from "@/contexts/SidebarContext";
import { FreeSpinContainer } from "@/sections/free-spins";
import { cn } from "@/utils/themeMerger";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import React from "react";
import Header from "../components/header/Header";
import { Sidebar } from "../components/sidebar/Sidebar";
import { ChatFloatingButton } from "../components/ui/ChatwootFloatingButton";
import { SpecialOffer } from "@/sections/special-offer/SpecialOffer";

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
              isMobile ? "pb-28" : "",
            )}
          >
            <div className="container mx-auto md:max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
        <Dock scrollContainer={mainRef.current} />
        <ChatFloatingButton />
        {/* Free Spin 全局容器 - 会在用户登录15秒后自动检查待处理的Free Spin */}
        <FreeSpinContainer />
        <SpecialOffer />  
      </div>
    </MotionLazy>
  );
}
