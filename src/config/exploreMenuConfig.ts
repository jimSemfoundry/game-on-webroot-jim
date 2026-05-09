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
    label: "explore:hot", // 使用翻译 key
    icon: "custom:casino",
    apiCategory: "casino",
  },
  {
    value: "slots",
    label: "explore:slots", // 使用翻译 key
    icon: "custom:slots",
    apiCategory: "slots",
  },
  {
    value: "liveCasino",
    label: "explore:liveCasino", // 使用翻译 key
    icon: "custom:live-casino",
    apiCategory: "live-casino",
  },
  {
    value: "fast",
    label: "explore:fast", // 使用翻译 key
    icon: "custom:fast",
    apiCategory: "fast",
  },
  {
    value: "fishing",
    label: "explore:fishing", // 使用翻译 key
    icon: "custom:fishing",
    apiCategory: "fishing",
  },
];


const bonus_wallet_supported_games_menu = { value: "bonus", label: "explore:bonus", icon: "custom:dollars" };

// 二级菜单配置 (Tabs) - 映射到 game_category_2
export const SECONDARY_MENUS: Record<string, TabConfig[]> = {
  casino: [
    bonus_wallet_supported_games_menu,
    { value: "hot", label: "explore:hot", icon: "custom:hot" },
    { value: "recent", label: "explore:recents", icon: "custom:recent" },
    { value: "favorites", label: "explore:favorites", icon: "custom:favorites" },
    { value: "slots", label: "explore:slots", icon: "custom:slots" },
    { value: "liveCasino", label: "explore:liveCasino", icon: "custom:live-casino" },
    { value: "fast", label: "explore:fast", icon: "custom:crash" },
    { value: "fishing", label: "explore:fishing", icon: "custom:fishing" },
  ],
  slots: [
    bonus_wallet_supported_games_menu,
    { value: "all", label: "casino:all", icon: "custom:explore" },
    { value: "hot", label: "explore:hot", icon: "custom:hot" },
    { value: "new", label: "explore:new", icon: "custom:new" },
    { value: "feature-buy", label: "explore:featureBuy", icon: "custom:feature-buy" },
    { value: "enhanced-rtp", label: "explore:enhancedRTP", icon: "custom:enhanced-rtp" },
    { value: "jackpot", label: "explore:jackpot", icon: "custom:jackpot" },
    { value: "megaways", label: "explore:megaways", icon: "custom:megaways" },
    { value: "table-games", label: "explore:tableGames", icon: "custom:table-game" },
    { value: "video-poker", label: "explore:videoPoker", icon: "custom:video-poker" },
    { value: "arcade", label: "explore:arcade", icon: "custom:arcade" },
    { value: "other-slots", label: "explore:others", icon: "custom:more" },
  ],
  liveCasino: [
    bonus_wallet_supported_games_menu,
    { value: "all", label: "explore:all", icon: "custom:explore" },
    { value: "hot", label: "explore:hot", icon: "custom:hot" },
    { value: "new", label: "explore:new", icon: "custom:new" },
    { value: "baccarat", label: "explore:baccarat", icon: "custom:baccarat" },
    { value: "blackjack", label: "explore:blackjack", icon: "custom:blackjack" },
    { value: "roulette", label: "explore:roulette", icon: "custom:roulette" },
    { value: "poker", label: "explore:poker", icon: "custom:poker" },
    { value: "other-live", label: "explore:others", icon: "custom:more" },
  ],
  fast: [
    bonus_wallet_supported_games_menu,
    { value: "all", label: "explore:all", icon: "custom:explore" },
    { value: "hot", label: "explore:hot", icon: "custom:hot" },
    { value: "new", label: "explore:new", icon: "custom:new" },
    { value: "crash", label: "explore:crash", icon: "custom:crash" },
    { value: "plinko", label: "explore:plinko", icon: "custom:plinko" },
    { value: "mines", label: "explore:mines", icon: "custom:mines" },
    { value: "scratch", label: "explore:scratch", icon: "custom:scratch" },
    { value: "bingo", label: "explore:bingo", icon: "custom:bingo" },
    { value: "keno", label: "explore:keno", icon: "custom:keno" },
    { value: "other-fast", label: "explore:others", icon: "custom:more" },
  ],
};

// 判断一级菜单是否有二级菜单
export const hasSecondaryMenu = (primaryValue: string): boolean => {
  // fishing 没有二级菜单
  if (primaryValue === "fishing") {
    return false;
  }
  const secondaryMenus = SECONDARY_MENUS[primaryValue];
  return secondaryMenus && secondaryMenus.length > 0;
};

// 获取默认的二级菜单值
export const getDefaultSecondaryValue = (primaryValue: string): string => {
  // fishing 没有二级菜单，返回空字符串
  if (primaryValue === "fishing") {
    return "";
  }

  const secondaryMenus = SECONDARY_MENUS[primaryValue];
  if (!secondaryMenus || secondaryMenus.length === 0) return "";

  // slots/liveCasino/fast/sports 默认显示 'all'，其他显示第一个选项
  if (primaryValue === "slots" || primaryValue === "liveCasino" || primaryValue === "fast" || primaryValue === "sports" || primaryValue === "hot") {
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
  if (secondaryValue === "hot" || secondaryValue === "new" || secondaryValue === "recent" || secondaryValue === "favorites") {
    return "";
  }
  // 'all' 表示不限制二级分类
  return secondaryValue === "all" ? "" : secondaryValue;
};
