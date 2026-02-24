import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { BetbyAccessDeniedError, BetbyNoAccessError, BetbyNotAllowedError } from '@/types/betby';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createFileRoute, useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import { fetchBetbyAuthToken, getBetByConfig } from '@/services/betbyService';
import type { BetbyAuthResponse, BTRendererInstance } from '@/types/betby';
import { useAuthModals } from '@/contexts/ModalsProvider';

export const Route = createFileRoute('/_main/sports/')({
  component: SportsPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      'bt-path': search['bt-path'] as string | undefined,
    };
  },
});

function SportsPage() {
  const { user } = useAuth();
  const { isMobile } = useSidebar();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { openSignInModal, openSignUpModal } = useAuthModals();
  const searchParams = useSearch({ from: '/_main/sports/' });
  const btPathParam = searchParams['bt-path'];
  const [params, setParams] = useState<BetbyAuthResponse | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);
  const [restrictionReason, setRestrictionReason] = useState<'currency' | 'noAccess' | null>(null);

  const btInstanceRef = useRef<BTRendererInstance | null>(null);
  const isSportsRouteRef = useRef(true);
  const lastInitParamsRef = useRef<{
    brandId: string | number;
    lang: string;
    topOffset: number;
    bottomOffset: number;
    currency: string;
  } | null>(null);
  const lastUserStateRef = useRef<{
    currency?: string;
    currency_fiat?: string;
    language_code?: string;
  }>({});

  const brandId = params?.brand_id;
  const token = params?.jwt ?? null;
  const normalizedLang = params?.lang === 'zh-CN' ? 'zh' : (params?.lang || 'en');
  const currency = params?.currency || user?.currency_fiat || 'USD';

  // Header 和 Betby 导航栏高度
  const headerHeight = 48;
  const betbyNavigationHeight = 48;
  const betbyStickyTop = 0;
  
  // 动态获取 safe-area-inset-top（Telegram Mini App 顶部安全区域）
  const [safeAreaInsetTop, setSafeAreaInsetTop] = useState(0);
  
  useEffect(() => {
    const updateSafeAreaInset = () => {
      if (typeof document !== 'undefined') {
        const value = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top');
        const parsed = parseInt(value, 10);
        setSafeAreaInsetTop(isNaN(parsed) ? 0 : parsed);
      }
    };
    
    updateSafeAreaInset();
    
    // 监听 Telegram viewport 变化
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.onEvent?.('viewportChanged', updateSafeAreaInset);
      tg.onEvent?.('safeAreaChanged', updateSafeAreaInset);
      tg.onEvent?.('contentSafeAreaChanged', updateSafeAreaInset);
      
      return () => {
        tg.offEvent?.('viewportChanged', updateSafeAreaInset);
        tg.offEvent?.('safeAreaChanged', updateSafeAreaInset);
        tg.offEvent?.('contentSafeAreaChanged', updateSafeAreaInset);
      };
    }
  }, []);
  
  // bet slip 需要考虑：safe area + header + betby 导航栏
  const betbyBetSlipOffsetTop = safeAreaInsetTop + headerHeight + betbyNavigationHeight;

  // Dock 高度
  const dockHeight = isMobile ? 72 : 0;
  const betSlipBottomOffset = dockHeight;

  const getBetbyUrl = useCallback((btPath?: string) => {
    if (!btPath) return undefined;

    let value = btPath;
    try {
      value = decodeURIComponent(value);
    } catch {
      // ignore
    }

    if (!value.startsWith('/')) {
      value = `/${value}`;
    }
    return value;
  }, []);

  const getLegacyBetbyPathFromLocation = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const sport = params.get('sport');

    if (category === 'hot') return '/';
    if (category === 'live') return '/live';
    if (category === 'favorites') return '/favorites';
    if (!sport) return null;

    const sportMap: Record<string, string> = {
      football: '/soccer-1',
      basketball: '/basketball-2',
      cricket: '/cricket-21',
      tennis: '/tennis-5',
      esoccer: '/esoccer-300',
      'ice-hockey': '/ice-hockey-4',
      esports: '/e_sport/109',
      formula1: '/formula-1-40',
      baseball: '/3',
      handball: '/6',
      volleyball: '/volleyball-23',
    };

    return sportMap[sport] ?? null;
  }, []);

  const syncSearchWithBetbyPath = useCallback(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).__betby_disable_route_sync) return;
    if (!isSportsRouteRef.current) return;
    if (!window.location.pathname.startsWith('/sports')) return;

    const params = new URLSearchParams(window.location.search);
    const betbyPath = params.get('bt-path');
    if (!betbyPath) return;

    const hasExtraParams = Array.from(params.keys()).some((key) => key !== 'bt-path');
    if (!hasExtraParams && btPathParam === betbyPath) {
      return;
    }

    void navigate({
      to: '/sports',
      search: {
        'bt-path': betbyPath,
      },
      replace: true,
    });
  }, [btPathParam, navigate]);

  // 动态加载 Betby SDK 脚本
  useEffect(() => {
    if (window.BTRenderer) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://1stgame.sptpub.com/bt-renderer.min.js';
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Betby SDK');
    };

    document.body.appendChild(script);

    return () => {
      // 组件卸载时可选择移除脚本
    };
  }, []);

  // 限制访问
  const restrictAccess = useCallback((reason: 'currency' | 'noAccess' = 'currency') => {
    if (btInstanceRef.current && typeof btInstanceRef.current.kill === 'function') {
      btInstanceRef.current.kill();
    }
    btInstanceRef.current = null;
    lastInitParamsRef.current = null;
    setIsRestricted(true);
    setRestrictionReason(reason);
  }, []);

  // 获取集成参数
  const getIntegrationParams = useCallback(async () => {
    if (user) {
      // 已登录用户，获取认证令牌
      try {
        const response = await fetchBetbyAuthToken({
          currency: user.currency_fiat,
          lang: user.language_code,
        });

        const paramsWithCurrency = {
          ...response,
          currency: user.currency_fiat,
        };
        setParams(paramsWithCurrency);
        setIsRestricted(false);
        setRestrictionReason(null);
        return paramsWithCurrency;
      } catch (error) {
        if (error instanceof BetbyNotAllowedError) {
          console.error('❌ Betby 不允许访问（错误码 80004）:', error);
          restrictAccess('noAccess');
          return null;
        }
        if (error instanceof BetbyNoAccessError) {
          console.error('❌ Betby 访问被拒绝（无访问代码）:', error);
          restrictAccess('noAccess');
          return null;
        }
        if (error instanceof BetbyAccessDeniedError) {
          console.error('❌ Betby 访问被拒绝（币种限制）:', error);
          restrictAccess('currency');
          return null;
        }
        console.error('❌ 获取认证令牌失败，回退到游客模式', error);

        // 回退到游客模式
        try {
          const brandId = await getBetByConfig();
          const guestParams = {
            jwt: null,
            brand_id: brandId,
            lang: i18n.language,
            currency: 'USD',
          };
          setParams(guestParams);
          setIsRestricted(false);
          setRestrictionReason(null);
          return guestParams;
        } catch (configError) {
          console.error('❌ 获取 Betby 配置失败:', configError);
          restrictAccess('currency');
        }
      }
    } else {
      // 未登录用户，使用游客模式
      try {
        const brandId = await getBetByConfig();
        const guestParams = {
          jwt: null,
          brand_id: brandId,
          lang: i18n.language,
          currency: 'USD',
        };
        setParams(guestParams);
        setIsRestricted(false);
        setRestrictionReason(null);
        return guestParams;
      } catch (error) {
        console.error('❌ 获取游客配置失败:', error);
        restrictAccess('currency');
      }
    }
    return null;
  }, [user, restrictAccess, i18n.language]);

  // 刷新令牌
  const refreshToken = useCallback(async () => {
    if (!user) {
      return null;
    }

    try {
      const response = await fetchBetbyAuthToken({
        currency: user.currency_fiat,
        lang: user.language_code,
      });

      return response?.jwt ?? null;
    } catch (error) {
      if (error instanceof BetbyNotAllowedError) {
        console.error('❌ 刷新令牌时 Betby 不允许访问（错误码 80004）:', error);
        restrictAccess('noAccess');
        return null;
      }
      if (error instanceof BetbyNoAccessError) {
        console.error('❌ 刷新令牌时访问被拒绝（无访问代码）:', error);
        restrictAccess('noAccess');
        return null;
      }
      if (error instanceof BetbyAccessDeniedError) {
        console.error('❌ 刷新令牌时访问被拒绝:', error);
        restrictAccess('currency');
        return null;
      }
      console.error('❌ 刷新令牌失败，回退到游客模式', error);
      await getIntegrationParams();
      return null;
    }
  }, [user, getIntegrationParams, restrictAccess]);

  // 会话刷新回调
  const handleSessionRefresh = useCallback(async () => {
    try {
      const newParams = await getIntegrationParams();
      if (newParams) {
        const nextToken = newParams?.jwt ?? null;
        return nextToken;
      }
      return null;
    } catch (error) {
      console.error('❌ 会话刷新失败:', error);
      return null;
    }
  }, [getIntegrationParams]);

  // 令牌过期回调
  const handleTokenExpired = useCallback(async () => {
    try {
      const newToken = await refreshToken();
      return newToken;
    } catch (error) {
      console.error('❌ 刷新过期令牌失败:', error);
      return null;
    }
  }, [refreshToken]);

  // 令牌刷新回调
  const handleTokenRefresh = useCallback(async () => {
    try {
      const newToken = await refreshToken();
      return newToken;
    } catch (error) {
      console.error('❌ 令牌刷新失败:', error);
      return null;
    }
  }, [refreshToken]);

  const handleBetbyLogin = useCallback(() => {
    openSignInModal();
  }, [openSignInModal]);

  const handleBetbyRegister = useCallback(() => {
    openSignUpModal();
  }, [openSignUpModal]);

  // 初始化时获取参数
  useEffect(() => {
    if (scriptLoaded) {
      if (user) {
        lastUserStateRef.current = {
          currency: user.currency || undefined,
          currency_fiat: user.currency_fiat || undefined,
          language_code: user.language_code,
        };
      }
      getIntegrationParams();
    }
  }, [scriptLoaded, getIntegrationParams]);

  // 监听用户变化（包括币种变化）
  useEffect(() => {
    if (scriptLoaded && user) {
      const currentState = {
        currency: user.currency || undefined,
        currency_fiat: user.currency_fiat || undefined,
        language_code: user.language_code,
      };

      const lastState = lastUserStateRef.current;
      const hasChanged =
        lastState.currency !== currentState.currency ||
        lastState.currency_fiat !== currentState.currency_fiat ||
        lastState.language_code !== currentState.language_code;

      if (hasChanged) {
        lastUserStateRef.current = currentState;
        getIntegrationParams();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.currency, user?.currency_fiat, user?.language_code, scriptLoaded]);

  // 监听游客用户的语言变化
  useEffect(() => {
    if (scriptLoaded && !user) {
      getIntegrationParams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language, scriptLoaded, user]);

  // 监听 URL 参数变化，更新 Betby 导航
  useEffect(() => {
    if (btInstanceRef.current && typeof btInstanceRef.current.updateOptions === 'function') {
      const betbyUrl = getBetbyUrl(btPathParam);
      if (!betbyUrl) return;
      btInstanceRef.current.updateOptions({ url: betbyUrl });
    }
  }, [btPathParam, getBetbyUrl]);

  // 初始化时补齐 bt-path（兼容旧参数）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).__betby_disable_route_sync) return;
    if (!isSportsRouteRef.current) return;
    if (!window.location.pathname.startsWith('/sports')) return;

    const params = new URLSearchParams(window.location.search);
    const locationPath = params.get('bt-path');
    const hasExtraParams = Array.from(params.keys()).some((key) => key !== 'bt-path');

    if (btPathParam && !hasExtraParams) return;

    const legacyPath = getLegacyBetbyPathFromLocation();
    const nextPath = btPathParam ?? legacyPath ?? locationPath ?? '/';

    void navigate({
      to: '/sports',
      search: {
        'bt-path': nextPath,
      },
      replace: true,
    });
  }, [btPathParam, getLegacyBetbyPathFromLocation, navigate]);

  // 初始化 Betby SDK
  useEffect(() => {
    const target = document.getElementById('betby');

    if (isRestricted) {
      if (btInstanceRef.current && typeof btInstanceRef.current.kill === 'function') {
        btInstanceRef.current.kill();
        btInstanceRef.current = null;
      }
      lastInitParamsRef.current = null;
      return;
    }

    if (!scriptLoaded || brandId == null || !target) {
      return;
    }

    const currentInitParams = {
      brandId,
      lang: normalizedLang,
      topOffset: betbyBetSlipOffsetTop,
      bottomOffset: betSlipBottomOffset,
      currency,
    };

    const lastInit = lastInitParamsRef.current;
    const shouldReuseExistingInstance =
      !!btInstanceRef.current &&
      !!lastInit &&
      lastInit.brandId === currentInitParams.brandId &&
      lastInit.lang === currentInitParams.lang &&
      lastInit.currency === currentInitParams.currency;

    if (shouldReuseExistingInstance) {
      if (
        btInstanceRef.current &&
        typeof btInstanceRef.current.updateOptions === 'function' &&
        lastInit &&
        (lastInit.topOffset !== currentInitParams.topOffset ||
          lastInit.bottomOffset !== currentInitParams.bottomOffset)
      ) {
        btInstanceRef.current.updateOptions({
          betSlipOffsetTop: currentInitParams.topOffset,
          betSlipOffsetBottom: currentInitParams.bottomOffset,
        });
        lastInit.topOffset = currentInitParams.topOffset;
        lastInit.bottomOffset = currentInitParams.bottomOffset;
      }
      return;
    }

    if (btInstanceRef.current && typeof btInstanceRef.current.kill === 'function') {
      btInstanceRef.current.kill();
      btInstanceRef.current = null;
      lastInitParamsRef.current = null;
    }

    let isCancelled = false;

    const timeoutId = window.setTimeout(() => {
      if (isCancelled) {
        return;
      }

      // 获取初始 URL
      const initialUrl = getBetbyUrl(btPathParam);

      const bt = new window.BTRenderer().initialize({
        brand_id: brandId,
        token,
        themeName: '1stgame',
        lang: normalizedLang,
        target,
        url: initialUrl, // 设置初始页面
        betSlipOffsetTop: betbyBetSlipOffsetTop,
        betSlipOffsetBottom: betSlipBottomOffset,
        stickyTop: betbyStickyTop,
        betslipZIndex: 996, // 低于 Sidebar (z-999) 和 Betby 导航栏 (z-997)
        onRouteChange: syncSearchWithBetbyPath,
        onLogin: handleBetbyLogin,
        onRegister: handleBetbyRegister,
        onRecharge: function () {
          // 导航到个人资料页面
          navigate({ to: '/profile' });
        },
        onSessionRefresh: handleSessionRefresh,
        onTokenExpired: handleTokenExpired,
        onTokenRefresh: handleTokenRefresh,
        onBetSlipStateChange: function () {},
      });

      btInstanceRef.current = bt;
      lastInitParamsRef.current = currentInitParams;
    }, 100);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [
    brandId,
    normalizedLang,
    currency,
    scriptLoaded,
    navigate,
    betbyStickyTop,
    betbyBetSlipOffsetTop,
    betSlipBottomOffset,
    isRestricted,
    syncSearchWithBetbyPath,
    handleBetbyLogin,
    handleBetbyRegister,
    handleSessionRefresh,
    handleTokenExpired,
    handleTokenRefresh,
    token,
    btPathParam,
    getBetbyUrl,
  ]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      isSportsRouteRef.current = false;
      if (btInstanceRef.current && typeof btInstanceRef.current.kill === 'function') {
        btInstanceRef.current.kill();
        btInstanceRef.current = null;
      }
      lastInitParamsRef.current = null;
    };
  }, []);

  useEffect(() => {
    isSportsRouteRef.current = location.pathname.startsWith('/sports');
    if (isSportsRouteRef.current && typeof window !== 'undefined') {
      (window as any).__betby_disable_route_sync = false;
    }
  }, [location.pathname]);

  const restrictionTitle =
    restrictionReason === 'noAccess'
      ? t('information:userRestriction.noSportsAccessTitle', 'You are not allowed to access sports')
      : t('information:userRestriction.title');

  const restrictionDescription =
    restrictionReason === 'noAccess'
      ? t(
          'information:userRestriction.noSportsAccessDescription',
          'This account is restricted from sports. Please go back to the casino lobby.',
        )
      : t('common:common.currencyRestrictionError');

  const restrictionButtonLabel = restrictionReason === 'noAccess' ? t('information:goCasino', 'Go to Casino') : t('information:goBack');

  // 显示加载动画的条件：SDK 未加载或参数未准备好
  const showLoading = !scriptLoaded || (!params && !isRestricted);

  return (
    // Sports 页面全屏显示（layout 已移除 container 限制）
    <div className="w-full h-full min-h-screen relative">
      {/* Betby 容器 */}
      {!isRestricted && <div id="betby" className="pb-18" />}

      {/* 加载动画 */}
      {showLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-300 z-50">
          <div className='flex flex-col items-center gap-2'>
          <span className="loading loading-ring loading-lg sm:loading-xl text-primary"></span>
          <span className='text-base-content font-bold text-base sm:text-lg uppercase whitespace-break-spaces'>{t("common:common.challengeEverything")}</span>
          </div>
        </div>
      )}

      {isRestricted && (
        <div className="absolute inset-0 flex items-center justify-center px-6 bg-base-300">
          <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
            <div className="text-2xl font-bold leading-8 text-primary">{restrictionTitle}</div>
            <div className="text-sm leading-5 text-base-content/80">{restrictionDescription}</div>
            <img src="/images/information/user-restriction.png" alt="userRestriction" className="h-40 w-40" />
            <button
              className="btn btn-primary min-w-31.5 h-10"
              onClick={() => {
                // 导航到赌场页面
                window.location.href = '/casino';
              }}
            >
              {restrictionButtonLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
