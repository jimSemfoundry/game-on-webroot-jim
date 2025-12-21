import Iconify from "@/components/iconify";
import { Tabs } from "@/components/ui/Tabs";
import { SECONDARY_MENUS, PRIMARY_MENUS, hasSecondaryMenu } from "@/config/exploreMenuConfig";
import { useAuth } from "@/contexts/AuthContext";
import { t } from "i18next";

interface ExploreTabsProps {
  value: string;
  onChange: (value: string) => void;
  gameType: string;
}

export function ExploreTabs({ value, onChange, gameType }: ExploreTabsProps) {
  const { isAuthenticated } = useAuth();

  // fishing 没有二级菜单，显示一级菜单
  if (!hasSecondaryMenu(gameType)) {
    const primaryTabs = PRIMARY_MENUS.map((item) => ({
      value: item.value,
      label: (
        <div className="flex flex-col items-center gap-1 justify-center rounded-field min-w-[48px] px-2 h-[46px] py-1 font-semibold">
          <Iconify icon={item.icon} width={14} height={14} />
          <span className="text-xs whitespace-nowrap">{t(item.label)}</span>
        </div>
      ),
    }));

    return (
      <Tabs
        tabs={primaryTabs}
        size="sm"
        value={gameType}
        onChange={onChange}
        className="gap-2 bg-base-300 w-full"
        layoutId="explore-tabs"
      />
    );
  }

  // Get secondary menu items based on the primary game type
  const secondaryMenuItems = SECONDARY_MENUS[gameType] || SECONDARY_MENUS.casino;

  // 如果用户未登录，过滤掉 recent 和 favorites tabs
  const filteredMenuItems = isAuthenticated
    ? secondaryMenuItems
    : secondaryMenuItems.filter(item => item.value !== 'recent' && item.value !== 'favorites');

  // Generate tabs from configuration
  const tabs = filteredMenuItems.map((item) => ({
    value: item.value,
    label: (
      <div className="flex flex-col items-center gap-1 justify-center rounded-field min-w-[48px] px-2 h-[46px] py-1 font-semibold">
        <Iconify icon={item.icon} width={14} height={14} />
        <span className="text-xs whitespace-nowrap">{t(item.label)}</span>
      </div>
    ),
  }));

  return (
    <Tabs
      tabs={tabs}
      size="sm"
      value={value}
      onChange={onChange}
      className="gap-2 bg-base-300 w-full"
      layoutId="explore-tabs"
    />
  );
}