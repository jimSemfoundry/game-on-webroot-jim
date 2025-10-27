// Explore页面的菜单配置
export interface MenuConfig {
  value: string;
  label: string;
  icon: string;
  apiCategory: string; // 对应API的category参数
}

export interface TabConfig {
  value: string;
  label: string;
  icon: string;
}

// 一级菜单配置 (Dock) - 映射到 game_category_1
export const PRIMARY_MENUS: MenuConfig[] = [
  {
    value: "casino",
    label: "Casino",
    icon: "custom:casino",
    apiCategory: "casino",
  },
  {
    value: "slots",
    label: "Slots",
    icon: "custom:slots",
    apiCategory: "slots",
  },
  {
    value: "liveCasino",
    label: "Live Casino",
    icon: "custom:live-casino",
    apiCategory: "live-casino",
  },
  {
    value: "fast",
    label: "Fast",
    icon: "custom:fast",
    apiCategory: "fast",
  },
  {
    value: "fishing",
    label: "Fishing",
    icon: "custom:fishing",
    apiCategory: "fishing",
  },
];

// 二级菜单配置 (Tabs) - 映射到 game_category_2
export const SECONDARY_MENUS: Record<string, TabConfig[]> = {
  casino: [
    { value: "hot", label: "Hot", icon: "custom:hot" },
    { value: "slots", label: "Slots", icon: "custom:slots" },
    { value: "liveCasino", label: "Live", icon: "custom:live-casino" },
    { value: "fast", label: "Fast", icon: "custom:crash" },
    { value: "fishing", label: "Fishing", icon: "custom:fishing" },
  ],
  slots: [
    { value: "all", label: "All", icon: "custom:explore" },
    { value: "hot", label: "Hot", icon: "custom:hot" },
    { value: "new", label: "New", icon: "custom:new" },
    { value: "feature-buy", label: "Feature Buy", icon: "custom:feature-buy" },
    { value: "enhanced-rtp", label: "Enhanced RTP", icon: "custom:enhanced-rtp" },
    { value: "jackpot", label: "Jackpot", icon: "custom:jackpot" },
    { value: "megaways", label: "Megaways", icon: "custom:megaways" },
    { value: "table-game", label: "Table Game", icon: "custom:table-game" },
    { value: "video-poker", label: "Video Poker", icon: "custom:video-poker" },
    { value: "arcade", label: "Arcade", icon: "custom:arcade" },
    { value: "others", label: "Others", icon: "custom:more" },
  ],
  liveCasino: [
    { value: "all", label: "All", icon: "custom:explore" },
    { value: "hot", label: "Hot", icon: "custom:hot" },
    { value: "new", label: "New", icon: "custom:new" },
    { value: "baccarat", label: "Baccarat", icon: "custom:baccarat" },
    { value: "blackjack", label: "Blackjack", icon: "custom:blackjack" },
    { value: "roulette", label: "Roulette", icon: "custom:roulette" },
    { value: "poker", label: "Poker", icon: "custom:poker" },
    { value: "others", label: "Others", icon: "custom:more" },
  ],
  fast: [
    { value: "all", label: "All", icon: "custom:explore" },
    { value: "hot", label: "Hot", icon: "custom:hot" },
    { value: "new", label: "New", icon: "custom:new" },
    { value: "crash", label: "Crash", icon: "custom:crash" },
    { value: "plinko", label: "Plinko", icon: "custom:plinko" },
    { value: "mines", label: "Mines", icon: "custom:mines" },
    { value: "scratch", label: "Scratch", icon: "custom:scratch" },
    { value: "bingo", label: "Bingo", icon: "custom:bingo" },
    { value: "keno", label: "Keno", icon: "custom:keno" },
    { value: "others", label: "Others", icon: "custom:more" },
  ],
};

// 获取默认的二级菜单值
export const getDefaultSecondaryValue = (primaryValue: string): string => {
  const secondaryMenus = SECONDARY_MENUS[primaryValue];
  if (!secondaryMenus || secondaryMenus.length === 0) return "";

  // slots 和 sports 默认显示 'all'，其他显示第一个选项
  if (primaryValue === "slots" || primaryValue === "sports" || primaryValue === "hot") {
    return "all";
  }
  return secondaryMenus[0].value;
};

// 根据主菜单值获取API的game_category_1参数
export const getPrimaryApiCategory = (primaryValue: string): string => {
  // 默认casino不传参数
  if (primaryValue === "casino") {
    return "";
  }
  const menu = PRIMARY_MENUS.find((m) => m.value === primaryValue);
  return menu?.apiCategory || "";
};

// 根据二级菜单值获取API的game_category_2参数
export const getSecondaryApiCategory = (secondaryValue: string): string => {
  // casino + hot 的默认组合不传参数
  if (secondaryValue === "hot" || secondaryValue === "new") {
    return "";
  }
  // 'all' 表示不限制二级分类
  return secondaryValue === "all" ? "" : secondaryValue;
};
