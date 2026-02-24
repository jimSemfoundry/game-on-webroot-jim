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
      path: '/explore?type=casino&providers=all',
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
      path: '/sports?bt-path=/',
      id: 'sports-hot'
    },
    {
      type: 'item' as const,
      icon: 'custom:live-casino',
      label: t('explore:sportsLive'),
      path: '/sports?bt-path=/live',
      id: 'sports-live'
    },
  ];

  const authenticatedItems: NavigationItem[] = [
    {
      type: 'item' as const,
      icon: 'custom:favorites',
      label: t('casino:favorites'),
      path: '/sports?bt-path=/favorites',
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
      path: '/sports?bt-path=/soccer-1',
      id: 'football'
    },
    {
      type: 'item' as const,
      icon: 'custom:basketball',
      label: t('explore:basketball'),
      path: '/sports?bt-path=/basketball-2',
      id: 'basketball'
    },
    {
      type: 'item' as const,
      icon: 'custom:baseball',
      label: t('explore:cricket'),
      path: '/sports?bt-path=/cricket-21',
      id: 'cricket'
    },
    {
      type: 'item' as const,
      icon: 'custom:tennis',
      label: t('explore:tennis'),
      path: '/sports?bt-path=/tennis-5',
      id: 'tennis'
    },
    {
      type: 'item' as const,
      icon: 'custom:football',
      label: t('explore:eSoccer'),
      path: '/sports?bt-path=/esoccer-300',
      id: 'esoccer'
    },
    {
      type: 'item' as const,
      icon: 'custom:ice-hockey',
      label: t('explore:iceHockey'),
      path: '/sports?bt-path=/ice-hockey-4',
      id: 'ice-hockey'
    },
    {
      type: 'item' as const,
      icon: 'custom:gameboy',
      label: t('explore:eSport'),
      path: '/sports?bt-path=/e_sport/109',
      id: 'esports'
    },
    {
      type: 'item' as const,
      icon: 'custom:formula1',
      label: t('explore:formula1'),
      path: '/sports?bt-path=/formula-1-40',
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
