import { useAuth } from "@/contexts/AuthContext";
import { useRTLContext } from "@/contexts/RTLContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { useLocation } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { m } from "motion/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Drawer } from "vaul";
import { NAVIGATION_ITEMS, SPORTS_NAVIGATION_ITEMS } from "./config";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarItem } from "./SidebarItem";
import { toUrlSearchParams } from "@/utils/urlSearchParams";

function DesktopSidebar() {
  const { mode, toggleMode, activeTab } = useSidebar();
  const location = useLocation();
  const isMini = mode === "mini";
  const { isRTL } = useRTLContext();
  const { isAuthenticated, isLoading } = useAuth();

  const { t } = useTranslation(["common"]);

  // 根据 activeTab 选择导航项
  const navigationItems = activeTab === "sport" 
    ? SPORTS_NAVIGATION_ITEMS(t, isAuthenticated, isLoading)
    : NAVIGATION_ITEMS(t, isAuthenticated, isLoading);

  return (
    <m.aside
      layout
      transition={{
        duration: 0.3,
        ease: [0.23, 1, 0.32, 1],
      }}
      className={`hide-scrollbar hidden md:flex flex-col bg-base-400 h-auto relative card md:card-sm my-2 ${isRTL ? "mr-2" : "ml-2"}`}
      style={{ overflow: "visible" }}
    >
      <div
        onClick={toggleMode}
        className={"btn btn-sm z-40 absolute rounded-lg top-1/6 px-0 h-12 w-6 flex items-center justify-center shadow-lg"}
        style={{
          [isRTL ? "left" : "right"]: "-12px",
        }}
      >
        {isMini ? (
          isRTL ? (
            <ChevronLeft size={14} />
          ) : (
            <ChevronRight size={14} />
          )
        ) : isRTL ? (
          <ChevronRight size={14} />
        ) : (
          <ChevronLeft size={14} />
        )}
      </div>

      <div className="card-body overflow-y-auto">
        <div className="flex-1 flex flex-col">
          <SidebarHeader />

          <nav className={`menu w-full overflow-y-auto overflow-x-hidden p-0 mt-4`}>
            {navigationItems.map((item, index) => (
              <React.Fragment key={item.id || `${item.type}-${index}`}>
                {item.type === "divider" ? (
                  <div className="h-px bg-gradient-to-r from-base-400 via-base-100 to-base-400 my-2 md:my-4"></div>
                ) : (
                  <SidebarItem
                    icon={item.icon}
                    label={item.label}
                    path={item.path}
                    isActive={(() => {
                      if (!item.path) return false;

                      if (item.path.includes("?")) {
                        const [itemPathname, itemSearch = ""] = item.path.split("?");
                        if (location.pathname !== itemPathname) return false;

                        const itemParams = new URLSearchParams(itemSearch);
                        const currentParams = toUrlSearchParams(location.search);

                        for (const [key, value] of itemParams.entries()) {
                          if (!currentParams.has(key)) {
                            return false;
                          }
                          if ((currentParams.get(key) ?? "") !== value) {
                            return false;
                          }
                        }

                        return true;
                      }

                      return location.pathname === item.path;
                    })()}
                    isMini={isMini}
                  />
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        <SidebarFooter isMini={isMini} />
      </div>
    </m.aside>
  );
}

function MobileDrawer() {
  const { isDrawerOpen, closeDrawer, activeTab } = useSidebar();
  const location = useLocation();
  const { isRTL } = useRTLContext();
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation(["common"]);

  // 根据 activeTab 选择导航项
  const navigationItems = activeTab === "sport" 
    ? SPORTS_NAVIGATION_ITEMS(t, isAuthenticated, isLoading)
    : NAVIGATION_ITEMS(t, isAuthenticated, isLoading);

  return (
    <Drawer.Root
      open={isDrawerOpen}
      onOpenChange={(open) => !open && closeDrawer()}
      direction={isRTL ? "right" : "left"}
      preventScrollRestoration={false}
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Title style={{ display: "none" }} />
        <Drawer.Overlay className="fixed inset-0 bg-black/50 z-[998]" />
        <Drawer.Content
          className={`fixed ${isRTL ? "right-0" : "left-0"} top-12 bottom-2 w-[80%] bg-transparent z-[999] md:hidden outline-none`}
        >
          <div className={`${isRTL ? "mr-2" : "ml-2"} h-full bg-base-400 shadow-xl rounded-2xl flex flex-col overflow-hidden p-3`}>
            <div className="flex-1 flex flex-col overflow-hidden">
              <SidebarHeader />

              <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden mt-4 menu flex-nowrap w-full">
                {navigationItems.map((item, index) => (
                  <React.Fragment key={item.id || `${item.type}-${index}`}>
                    {item.type === "divider" ? (
                      <div className="h-px bg-gradient-to-r from-base-400 via-base-100 to-base-400 my-2"></div>
                    ) : (
                      <SidebarItem
                        icon={item.icon}
                        label={item.label}
                        path={item.path}
                        isActive={(() => {
                          if (!item.path) return false;

                          if (item.path.includes("?")) {
                            const [itemPathname, itemSearch = ""] = item.path.split("?");
                            if (location.pathname !== itemPathname) return false;

                            const itemParams = new URLSearchParams(itemSearch);
                            const currentParams = toUrlSearchParams(location.search);

                            for (const [key, value] of itemParams.entries()) {
                              if (!currentParams.has(key)) {
                                return false;
                              }
                              if ((currentParams.get(key) ?? "") !== value) {
                                return false;
                              }
                            }

                            return true;
                          }

                          return location.pathname === item.path;
                        })()}
                        isMini={false}
                      />
                    )}
                  </React.Fragment>
                ))}
              </nav>
            </div>

            <SidebarFooter isMini={false} />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export const Sidebar = () => {
  const { isMobile, isMobileDevice } = useSidebar();

  return (
    <>
      {/* 移动设备上不显示桌面端 Sidebar（即使横屏宽度超过 md 断点） */}
      {!isMobileDevice && <DesktopSidebar />}
      {isMobile && <MobileDrawer />}
    </>
  );
};
