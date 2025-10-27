import Iconify from "@/components/iconify";
import { Tabs } from "@/components/ui/Tabs";
import { SECONDARY_MENUS } from "@/config/exploreMenuConfig";

interface ExploreTabsProps {
  value: string;
  onChange: (value: string) => void;
  gameType: string;
}

export function ExploreTabs({ value, onChange, gameType }: ExploreTabsProps) {
  // Get secondary menu items based on the primary game type
  const secondaryMenuItems = SECONDARY_MENUS[gameType] || SECONDARY_MENUS.casino;
  
  // Generate tabs from configuration
  const tabs = secondaryMenuItems.map((item) => ({
    value: item.value,
    label: (
      <div className="flex flex-col items-center gap-1 justify-center rounded-field min-w-[48px] px-2 h-[46px] py-1 font-semibold">
        <Iconify icon={item.icon} width={14} height={14} />
        <span className="text-xs whitespace-nowrap">{item.label}</span>
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