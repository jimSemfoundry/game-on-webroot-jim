type NavigationItem = {
  type: 'item';
  icon: string;
  label: string;
  path: string;
  id: string;
} | {
  type: 'divider';
  id: string;
};

export const NAVIGATION_ITEMS = (t: (key: string) => string, isAuthenticated: boolean, isLoading: boolean): NavigationItem[] => {
  const baseItems: NavigationItem[] = [
    {
      type: 'item' as const,
      icon: 'custom:hot',
      label: t('casino:hot'),
      path: '/explore?type=casino&category=hot',
      id: 'hot'
    },
  ];

  const authenticatedItems: NavigationItem[] = [
    {
      type: 'item' as const,
      icon: 'custom:recent',
      label: t('menu:recents'),
      path: '/explore?type=casino&category=recent',
      id: 'recent'
    },
    {
      type: 'item' as const,
      icon: 'custom:favorites',
      label: t('casino:favorites'),
      path: '/explore?type=casino&category=favorites',
      id: 'favorites'
    },
  ];

  const gameItems: NavigationItem[] = [
    {
      type: 'divider' as const,
      id: 'divider-1'
    },
    {
      type: 'item' as const,
      icon: 'custom:slots',
      label: t('explore:slots'),
      path: '/explore?type=slots',
      id: 'slots'
    },
    {
      type: 'item' as const,
      icon: 'custom:live-casino',
      label: t('explore:liveCasino'),
      path: '/explore?type=liveCasino',
      id: 'live-casino'
    },
    {
      type: 'item' as const,
      icon: 'custom:fast',
      label: t('explore:fastGames'),
      path: '/explore?type=fast',
      id: 'fast'
    },
    {
      type: 'item' as const,
      icon: 'custom:fishing',
      label: t('explore:fishing'),
      path: '/explore?type=fishing',
      id: 'fishing'
    },
    {
      type: 'item' as const,
      icon: 'custom:providers',
      label: t('explore:providers'),
      path: '/explore?type=casino&providers=',
      id: 'providers'
    },
  ];

  const featureItems: NavigationItem[] = [
    {
      type: 'divider' as const,
      id: 'divider-2'
    },
    {
      type: 'item' as const,
      icon: 'custom:bonus',
      label: t('bonus:bonus'),
      path: '/bonus',
      id: 'bonus'
    },
    {
      type: 'item' as const,
      icon: 'custom:tournament',
      label: t('menu:tournaments'),
      path: '/tournament',
      id: 'tournaments'
    },
    {
      type: 'item' as const,
      icon: 'custom:vip',
      label: t('menu:vipClub'),
      path: '/vip-club',
      id: 'vip'
    },
    {
      type: 'item' as const,
      icon: 'custom:referral',
      label: t('common:common.referral'),
      path: '/referral',
      id: 'referral'
    },
  ];

  // Always include base items
  let items = [...baseItems];

  // Add authenticated items only when user is actually authenticated (not during loading)
  if (isAuthenticated && !isLoading) {
    items = [...items, ...authenticatedItems];
  }

  // Add the rest of the items
  items = [...items, ...gameItems, ...featureItems];

  return items;
};

// Sports 导航项配置
export const SPORTS_NAVIGATION_ITEMS = (t: (key: string) => string, isAuthenticated: boolean, isLoading: boolean): NavigationItem[] => {
  const baseItems: NavigationItem[] = [
    {
      type: 'item' as const,
      icon: 'custom:hot',
      label: t('casino:hot'),
      path: '/sports?category=hot',
      id: 'sports-hot'
    },
    {
      type: 'item' as const,
      icon: 'custom:live-casino',
      label: t('explore:sportsLive'),
      path: '/sports?category=live',
      id: 'sports-live'
    },
  ];

  const authenticatedItems: NavigationItem[] = [
    {
      type: 'item' as const,
      icon: 'custom:favorites',
      label: t('casino:favorites'),
      path: '/sports?category=favorites',
      id: 'sports-favorites'
    },
  ];

  const sportsItems: NavigationItem[] = [
    {
      type: 'divider' as const,
      id: 'sports-divider-1'
    },
    {
      type: 'item' as const,
      icon: 'custom:football',
      label: t('explore:football'),
      path: '/sports?sport=football',
      id: 'football'
    },
    {
      type: 'item' as const,
      icon: 'custom:tennis',
      label: t('explore:tennis'),
      path: '/sports?sport=tennis',
      id: 'tennis'
    },
    {
      type: 'item' as const,
      icon: 'custom:baseball',
      label: t('explore:baseball'),
      path: '/sports?sport=baseball',
      id: 'baseball'
    },
    {
      type: 'item' as const,
      icon: 'custom:ice-hockey',
      label: t('explore:iceHockey'),
      path: '/sports?sport=ice-hockey',
      id: 'ice-hockey'
    },
    {
      type: 'item' as const,
      icon: 'custom:basketball',
      label: t('explore:basketball'),
      path: '/sports?sport=basketball',
      id: 'basketball'
    },
    {
      type: 'item' as const,
      icon: 'custom:volleyball',
      label: t('explore:volleyball'),
      path: '/sports?sport=volleyball',
      id: 'volleyball'
    },
    {
      type: 'item' as const,
      icon: 'custom:handball',
      label: t('explore:handball'),
      path: '/sports?sport=handball',
      id: 'handball'
    },
    {
      type: 'item' as const,
      icon: 'custom:formula1',
      label: t('explore:formula1'),
      path: '/sports?sport=formula1',
      id: 'formula1'
    },
  ];

  const featureItems: NavigationItem[] = [
    {
      type: 'divider' as const,
      id: 'sports-divider-2'
    },
    {
      type: 'item' as const,
      icon: 'custom:bonus',
      label: t('bonus:bonus'),
      path: '/bonus',
      id: 'sports-bonus'
    },
    {
      type: 'item' as const,
      icon: 'custom:tournament',
      label: t('menu:tournaments'),
      path: '/tournament',
      id: 'sports-tournaments'
    },
    {
      type: 'item' as const,
      icon: 'custom:vip',
      label: t('menu:vipClub'),
      path: '/vip-club',
      id: 'sports-vip'
    },
    {
      type: 'item' as const,
      icon: 'custom:referral',
      label: t('common:common.referral'),
      path: '/referral',
      id: 'sports-referral'
    },
  ];

  // 组装导航项
  let items = [...baseItems];

  // 添加认证用户专属项
  if (isAuthenticated && !isLoading) {
    items = [...items, ...authenticatedItems];
  }

  // 添加体育项目和功能项
  items = [...items, ...sportsItems, ...featureItems];

  return items;
};
