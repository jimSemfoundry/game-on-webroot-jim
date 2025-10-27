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
      path: '/explore?type=casino',
      id: 'hot'
    },
  ];

  const authenticatedItems: NavigationItem[] = [
    {
      type: 'item' as const,
      icon: 'custom:recent',
      label: t('menu:recents'),
      path: '#',
      id: 'recent'
    },
    {
      type: 'item' as const,
      icon: 'custom:favorites',
      label: t('casino:favorites'),
      path: '#',
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
