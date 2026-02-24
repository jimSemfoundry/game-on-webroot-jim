import { MAIN_NAV_ITEMS, type NavItem } from "@/config/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/utils/themeMerger";
import { useLocation, useNavigate } from "@tanstack/react-router";
import Iconify from "../components/iconify";
import { useBonusClaimCount } from "@/hooks/api/useAuth.ts";
import { m } from 'motion/react'
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useAuthModals } from "@/contexts/ModalsProvider.tsx";

// 为了向后兼容，导出 DockItem 类型别名
export type DockItem = NavItem;

interface DockProps {
  scrollContainer?: HTMLElement | null;
  items?: DockItem[];
}

export const Dock = ({ items = MAIN_NAV_ITEMS }: DockProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleDrawer, isMobile } = useSidebar();
  const { t } = useTranslation();
  // const { scrollDirection, isScrolled } = useScrollDirection({
  //   threshold: 50,
  //   debounceDelay: 150,
  //   container: scrollContainer
  // });

  const { user } = useAuth()

  const { openSignInModal } = useAuthModals();

  const handleItemClick = (e: React.MouseEvent, item: DockItem) => {
    e.preventDefault();
    e.stopPropagation();

    if (location.pathname.startsWith('/sports') && item.href !== '/sports') {
      (window as any).__betby_disable_route_sync = true;
    }

    // TODO: 奖励页面需要login
    if (item.href === '/bonus' && !user) return openSignInModal()

    if (item.href === "#") {
      if (isMobile) {
        toggleDrawer();
      }
    } else if (item.href === "back") {
      navigate({ to: "/casino", search: { openLogin: undefined, openSignUp: undefined, redirect: undefined, startapp: undefined, openFinance: undefined } });
    } else if (item.href === "/sports") {
      navigate({ to: "/sports", search: { "bt-path": undefined } });
    } else if (item.href === "/casino") {
      navigate({ to: "/casino", search: { openLogin: undefined, openSignUp: undefined, redirect: undefined, startapp: undefined, openFinance: undefined } });
    } else {
      navigate({ to: item.href });
    }
  };

  // 确定是否应该隐藏（自动隐藏功能）
  const shouldHide = false;
  // const shouldHide = isMobile && isScrolled && scrollDirection === 'down';

  return (
    <div
      className={cn(
        "app-dock",
        "fixed bottom-0 left-0 right-0 bg-base-200 md:hidden h-18 pb-4 pt-1 px-0 border-t border-base-300 z-[997]",
        "transition-transform duration-300 ease-in-out",
        shouldHide ? "translate-y-full" : "translate-y-0",
      )}
      style={{ overscrollBehavior: "contain", touchAction: "pan-x" }}
    >
      <div
        className={cn(
          "grid h-full font-medium text-gray-500",
          items.length === 3 && "grid-cols-3",
          items.length === 4 && "grid-cols-4",
          items.length === 5 && "grid-cols-5",
          items.length === 6 && "grid-cols-6",
        )}
      >
        {items.map((item) => {
          // 处理查询参数的active状态判断
          const isActive = item.href.includes("?")
            ? location.href.includes(item.href) || location.pathname + location.search === item.href
            : location.pathname === item.href;
          return (
            <button
              key={item.label}
              className={cn(
                "relative inline-flex flex-col gap-1 items-center justify-center rounded-xl hover:bg-base-300 transition-colors",
                isActive ? "text-primary" : "",
              )}
              onClick={(e) => handleItemClick(e, item)}
            >
              <Iconify icon={item.icon} width={18} height={18} />
              <span className="text-xs font-bold text-base-content truncate max-w-full overflow-hidden whitespace-nowrap">{t(item.label)}</span>
              <InnerBonusLabel label={item.href} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const InnerBonusLabel = ({ label, className }: { label: string, className?: string }) => {
  const { data } = useBonusClaimCount()
  return (label.includes('bonus') && <>{
    data?.data?.total_count > 0 && (
      <m.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={clsx("absolute text-black indicator-item badge bg-primary p-1 h-3.5 min-w-3.5 text-xs font-bold top-0 border-1 border-base-content rounded-sm", className)}>
        {data?.data?.total_count >= 10 ? '9+' : data?.data?.total_count}
      </m.div>
    )
  }</>)
}