import Iconify from "@/components/iconify";
import { Tabs } from "@/components/ui/Tabs";
import { SECONDARY_MENUS, PRIMARY_MENUS, TabConfig, hasSecondaryMenu } from "@/config/exploreMenuConfig";
import { useAuth } from "@/contexts/AuthContext";
import { t } from "i18next";
import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext.tsx";
import { bonus_currencies, bonus_wallet_supported_games_menu } from "@/sections/explore/index.ts";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";

interface ExploreTabsProps {
  value: string;
  onChange: (value: string) => void;
  gameType: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function ExploreTabs({ value, onChange, gameType, showBackButton = false, onBack }: ExploreTabsProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { isAuthenticated } = useAuth();

  const { selectedCurrency } = useSettlementCurrency();

  // 是否是彩金币种
  const is_bonus_currency = bonus_currencies.has(selectedCurrency);

  // fishing 没有二级菜单，显示一级菜单
  if (!hasSecondaryMenu(gameType)) {
    const primaryTabs = PRIMARY_MENUS.map((item) => ({
      value: item.value,
      label: (
        <div
          className="flex flex-col items-center gap-1 justify-center rounded-field min-w-[48px] px-2 py-1 font-semibold">
          <Iconify icon={item.icon} width={14} height={14} />
          <span className="text-xs whitespace-nowrap">{t(item.label)}</span>
        </div>
      )
    }));

    return (
      <Tabs
        tabs={primaryTabs}
        size={isMobile ? "md" : "lg"}
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
    : secondaryMenuItems.filter((item: TabConfig) => item.value !== "recent" && item.value !== "favorites");

  // Generate tabs from configuration
  const generateTab = (item: TabConfig) => ({
    value: item.value,
    label: (
      <div className="flex flex-col items-center gap-0.5 justify-center rounded-field min-w-[48px] font-bold">
        <Iconify icon={item.icon} width={16} height={16} />
        <span className="text-xs whitespace-nowrap">{t(item.label)}</span>
      </div>
    ),
  });
  
  const tabs = filteredMenuItems.map(generateTab);
  if (is_bonus_currency) tabs.unshift(generateTab(bonus_wallet_supported_games_menu));

  return (
    <div className="flex items-center gap-2 w-full">
      {showBackButton && onBack && (
        <button
          type="button"
          className="btn btn-square btn-md text-base-content md:btn-lg"
          onClick={onBack}
          aria-label="Back to categories"
        >
          <BackCircleIcon />
        </button>
      )}
      <Tabs
        tabs={tabs}
        size={isMobile ? "md" : "lg"}
        value={value}
        onChange={onChange}
        className="gap-2 bg-base-300 w-full"
        layoutId="explore-tabs"
      />
    </div>
  );
}

function BackCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3.75C16.5563 3.75 20.25 7.44365 20.25 12C20.25 16.5563 16.5563 20.25 12 20.25C7.44365 20.25 3.75 16.5563 3.75 12C3.75 7.44365 7.44365 3.75 12 3.75ZM21.75 12C21.75 6.61522 17.3848 2.25 12 2.25C6.61522 2.25 2.25 6.61522 2.25 12C2.25 17.3848 6.61522 21.75 12 21.75C17.3848 21.75 21.75 17.3848 21.75 12ZM11.7803 8.46967C11.4874 8.17678 11.0126 8.17678 10.7197 8.46967L7.71967 11.4697C7.57902 11.6103 7.5 11.8011 7.5 12C7.5 12.1989 7.57902 12.3897 7.71967 12.5303L10.7197 15.5303C11.0126 15.8232 11.4874 15.8232 11.7803 15.5303C12.0732 15.2374 12.0732 14.7626 11.7803 14.4697L10.0607 12.75L15.75 12.75C16.1642 12.75 16.5 12.4142 16.5 12C16.5 11.5858 16.1642 11.25 15.75 11.25L10.0607 11.25L11.7803 9.53033C12.0732 9.23744 12.0732 8.76256 11.7803 8.46967Z"
        fill="currentColor"
      />
    </svg>
  );
}
