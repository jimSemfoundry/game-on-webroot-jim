/**
 * 导航配置文件
 *
 * 集中管理应用的导航菜单项
 */

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  requireAuth?: boolean;
  badge?: string | number;
}

/**
 * 主导航菜单项（底部 Dock）
 */
export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    href: "#",
    label: "menu:menu",
    icon: "custom:menu",
  },
  {
    href: "/explore",
    label: "menu:explore",
    icon: "custom:explore",
  },
  {
    href: "/casino",
    label: "menu:casino",
    icon: "custom:casino",
  },
  {
    href: "/sports",
    label: "menu:sports",
    icon: "custom:sports",
  },
  {
    href: "/bonus",
    label: "menu:bonus",
    icon: "custom:bonus",
  },
];

/**
 * 侧边栏导航菜单项
 */
export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: "custom:home",
  },
  {
    href: "/explore",
    label: "Explore",
    icon: "custom:explore",
  },
  {
    href: "/casino",
    label: "Casino",
    icon: "custom:casino",
  },
  {
    href: "/sports",
    label: "Sports",
    icon: "custom:sports",
  },
  {
    href: "/bonus",
    label: "Bonus",
    icon: "custom:bonus",
  },
  {
    href: "/tournament",
    label: "Tournament",
    icon: "custom:tournament",
  },
  {
    href: "/vip-club",
    label: "VIP Club",
    icon: "custom:vip",
  },
  {
    href: "/referral",
    label: "Referral",
    icon: "custom:referral",
  },
];

/**
 * 用户菜单项（需要登录）
 */
export const USER_NAV_ITEMS: NavItem[] = [
  {
    href: "/profile",
    label: "Profile",
    icon: "custom:profile",
    requireAuth: true,
  },
  {
    href: "/profile/transactions",
    label: "Transactions",
    icon: "custom:transactions",
    requireAuth: true,
  },
  {
    href: "/profile/bet-history",
    label: "Bet History",
    icon: "custom:history",
    requireAuth: true,
  },
];

/**
 * 根据类型获取导航项
 */
export function getNavItems(type: "main" | "sidebar" | "user"): NavItem[] {
  switch (type) {
    case "main":
      return MAIN_NAV_ITEMS;
    case "sidebar":
      return SIDEBAR_NAV_ITEMS;
    case "user":
      return USER_NAV_ITEMS;
    default:
      return MAIN_NAV_ITEMS;
  }
}
