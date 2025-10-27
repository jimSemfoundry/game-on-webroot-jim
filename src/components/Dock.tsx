import { MAIN_NAV_ITEMS, type NavItem } from "@/config/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/utils/themeMerger";
import { useLocation, useNavigate } from "@tanstack/react-router";
import Iconify from "../components/iconify";

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
  // const { scrollDirection, isScrolled } = useScrollDirection({
  //   threshold: 50,
  //   debounceDelay: 150,
  //   container: scrollContainer
  // });

  const handleItemClick = (e: React.MouseEvent, item: DockItem) => {
    e.preventDefault();

    if (item.href === "#") {
      if (isMobile) {
        toggleDrawer();
      }
    } else if (item.href === "back") {
      navigate({ to: "/casino", search: { openLogin: undefined, redirect: undefined } });
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
        "fixed bottom-0 left-0 right-0 bg-base-200 md:hidden h-18 pb-4 pt-1 px-0 border-t border-base-300 z-[20]",
        "transition-transform duration-300 ease-in-out",
        shouldHide ? "translate-y-full" : "translate-y-0",
      )}
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
                "inline-flex flex-col gap-1 items-center justify-center rounded-xl hover:bg-base-300 transition-colors",
                isActive ? "text-primary" : "",
              )}
              onClick={(e) => handleItemClick(e, item)}
            >
              <Iconify icon={item.icon} width={18} height={18} />
              <span className="text-xs font-bold text-base-content">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
