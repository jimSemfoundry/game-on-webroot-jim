import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/utils/themeMerger";
import React from "react";

// import { useLocation } from "@tanstack/react-router";
import { MotionLazy } from "../components/animate";
import Header from "../components/header/Header";
import { Sidebar } from "../components/sidebar/Sidebar";
import { ChatFloatingButton } from "../components/ui/ChatwootFloatingButton";
// import { PRIMARY_MENUS } from "../config/exploreMenuConfig";
import { FreeSpinContainer } from "../sections/free-spins";
import { Dock } from "@/components/Dock";
import { SpecialOffer } from "@/sections/special-offer/SpecialOffer";
import { NavItem } from "@/config/navigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isMobile } = useSidebar();
  // const location = useLocation();
  const mainRef = React.useRef<HTMLElement>(null);

  // 根据路由决定使用哪个 Dock items
  const getDockItems = (): NavItem[] => {
    /*
    if (location.pathname.startsWith("/explore")) {
      return [
        { href: "back", label: "Back", icon: "custom:back" },
        ...PRIMARY_MENUS.map((menu) => ({
          href: `/explore?type=${menu.value}`,
          label: menu.label,
          icon: menu.icon,
        })),
      ];
    }
    */

    // 默认导航项
    return [
      { href: "#", label: "Menu", icon: "custom:menu" },
      { href: "/explore", label: "Explore", icon: "custom:explore" },
      { href: "/casino", label: "Casino", icon: "custom:casino" },
      { href: "/sports", label: "Sports", icon: "custom:sports" },
      { href: "/bonus", label: "Bonus", icon: "custom:bonus" },
    ];
  };

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
            <div className="container mx-auto md:max-w-7xl">{children}</div>
          </main>
        </div>
        <Dock items={getDockItems()} scrollContainer={mainRef.current} />
        <ChatFloatingButton />
        {/* Free Spin 全局容器 - 会在用户登录15秒后自动检查待处理的Free Spin */}
        <FreeSpinContainer />
        <SpecialOffer />
      </div>
    </MotionLazy>
  );
}
