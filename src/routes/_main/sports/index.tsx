import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { BetbyAccessDeniedError, BetbyNoAccessError, BetbyNotAllowedError } from '@/types/betby';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { fetchBetbyAuthToken, getBetByConfig } from '@/services/betbyService';
import type { BetbyAuthResponse, BTRendererInstance } from '@/types/betby';

export const Route = createFileRoute('/_main/sports/')({
  component: SportsPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      category: search.category as string | undefined,
      sport: search.sport as string | undefined,
    };
  },
});

function SportsPage() {
  const { user } = useAuth();
  const { isMobile } = useSidebar();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const searchParams = useSearch({ from: '/_main/sports/' });
  const [params, setParams] = useState<BetbyAuthResponse | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);
  const [restrictionReason, setRestrictionReason] = useState<'currency' | 'noAccess' | null>(null);

  const btInstanceRef = useRef<BTRendererInstance | null>(null);
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

  // Betby 导航栏高度
  const betbyNavigationHeight = 48;
  const betbyStickyTop = 0;
  const betbyBetSlipOffsetTop = betbyNavigationHeight;

  // Dock 高度
  const dockHeight = isMobile ? 72 : 0;
  const betSlipBottomOffset = dockHeight;

  // 将 URL 参数映射为 Betby 内部路径
  const getBetbyUrl = useCallback((params: { category?: string; sport?: string }) => {
    // 根据 category 或 sport 参数构建 Betby URL
    // 这些路径需要根据实际的 Betby 路由结构调整
    // 使用 Shift+D 在 Betby 中查看实际路径
    if (params.category === 'hot') {
      return '/'; // 热门页面
    }
    if (params.category === 'live') {
      return '/live'; // 直播页面
    }
    if (params.category === 'favorites') {
      return '/favorites'; // 收藏页面
    }
    if (params.sport) {
      // 体育项目映射 - Sidebar URL 参数到 Betby 内部路径的映射
      const sportMap: Record<string, string> = {
        'football': '/1', // 足球
        'basketball': '/2', // 篮球
        'baseball': '/3', // 棒球
        'ice-hockey': '/4', // 冰球
        'tennis': '/5', // 网球
        'handball': '/6', // 手球
        'volleyball': '/volleyball-23', // 排球
        'formula1': '/formula-1-40', // F1
      };
      return sportMap[params.sport] || '/';
    }
    return undefined; // 默认不设置，让 Betby 显示首页
  }, []);

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
      console.log('✅ Betby SDK loaded successfully');
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
    console.log('🔄 [getIntegrationParams] 用户:', user?.id, '法币:', user?.currency_fiat);

    if (user) {
      // 已登录用户，获取认证令牌
      try {
        const response = await fetchBetbyAuthToken({
          currency: user.currency_fiat,
          lang: user.language_code,
        });
        console.log('✅ 成功获取 Betby 认证令牌');

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
          console.log('🔄 使用游客模式:', guestParams);
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
      console.log('👤 用户未登录，进入游客模式');
      try {
        const brandId = await getBetByConfig();
        const guestParams = {
          jwt: null,
          brand_id: brandId,
          lang: i18n.language,
          currency: 'USD',
        };
        console.log('✅ 游客模式参数:', guestParams);
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
    console.log('🔄 刷新 Betby 令牌...');

    if (!user) {
      console.log('👤 游客用户，无需刷新令牌');
      return null;
    }

    try {
      const response = await fetchBetbyAuthToken({
        currency: user.currency_fiat,
        lang: user.language_code,
      });

      console.log('✅ 令牌刷新成功');
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
    console.log('🔄 Betby onSessionRefresh 触发 - 完整参数刷新');
    try {
      const newParams = await getIntegrationParams();
      if (newParams) {
        const nextToken = newParams?.jwt ?? null;
        console.log('✅ 会话刷新成功，将使用新参数重新初始化');
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
    console.log('⚠️ Betby onTokenExpired 触发 - 刷新认证令牌');
    try {
      const newToken = await refreshToken();
      if (newToken) {
        console.log('✅ 令牌过期刷新成功');
      }
      return newToken;
    } catch (error) {
      console.error('❌ 刷新过期令牌失败:', error);
      return null;
    }
  }, [refreshToken]);

  // 令牌刷新回调
  const handleTokenRefresh = useCallback(async () => {
    console.log('🔄 Betby onTokenRefresh 触发 - 刷新认证令牌');
    try {
      const newToken = await refreshToken();
      if (newToken) {
        console.log('✅ 令牌刷新成功');
      }
      return newToken;
    } catch (error) {
      console.error('❌ 令牌刷新失败:', error);
      return null;
    }
  }, [refreshToken]);

  // 初始化时获取参数
  useEffect(() => {
    if (scriptLoaded) {
      console.log('📍 [useEffect-scriptLoaded] 调用 getIntegrationParams');
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

      console.log('📍 [useEffect-userChange] 触发', {
        hasChanged,
        currentState,
        lastState,
      });

      if (hasChanged) {
        console.log('✅ 用户数据变化，重新获取集成参数', currentState);
        lastUserStateRef.current = currentState;
        getIntegrationParams();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.currency, user?.currency_fiat, user?.language_code, scriptLoaded]);

  // 监听游客用户的语言变化
  useEffect(() => {
    if (scriptLoaded && !user) {
      console.log('📍 [useEffect-guestLanguageChange] 游客用户语言变化:', i18n.language);
      getIntegrationParams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language, scriptLoaded, user]);

  // 监听 URL 参数变化，更新 Betby 导航
  useEffect(() => {
    if (btInstanceRef.current && typeof btInstanceRef.current.updateOptions === 'function') {
      const betbyUrl = getBetbyUrl(searchParams);
      console.log('🔄 URL 参数变化，更新 Betby 导航:', { searchParams, betbyUrl });
      btInstanceRef.current.updateOptions({ url: betbyUrl });
    }
  }, [searchParams, getBetbyUrl]);

  // 初始化 Betby SDK
  useEffect(() => {
    const target = document.getElementById('betby');

    if (isRestricted) {
      if (btInstanceRef.current && typeof btInstanceRef.current.kill === 'function') {
        console.log('🚫 访问受限 - 销毁 Betby 实例');
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
      console.log('🔄 清理现有 Betby 实例以使用新参数');
      btInstanceRef.current.kill();
      btInstanceRef.current = null;
      lastInitParamsRef.current = null;
    }

    let isCancelled = false;

    const timeoutId = window.setTimeout(() => {
      if (isCancelled) {
        return;
      }

      console.log('🚀 初始化 BTRenderer，参数:', {
        brand_id: brandId,
        token,
        lang: normalizedLang,
        currency,
        betbyStickyTop,
        betbyBetSlipOffsetTop,
        isRestricted,
      });

      // 获取初始 URL
      const initialUrl = getBetbyUrl(searchParams);
      console.log('📍 初始化 Betby URL:', initialUrl);

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
        onRouteChange: function () {},
        onLogin: function () {
          console.log('🔑 Betby onLogin 回调触发');
          // 使用 window.location 导航到登录页
          window.location.href = '/login';
        },
        onRegister: function () {
          console.log('📝 Betby onRegister 回调触发');
          // 使用 window.location 导航到注册页
          window.location.href = '/login?type=sign-up';
        },
        onRecharge: function () {
          console.log('💰 Betby onRecharge 回调触发');
          // 导航到个人资料页面
          navigate({ to: '/profile' });
        },
        onSessionRefresh: handleSessionRefresh,
        onTokenExpired: handleTokenExpired,
        onTokenRefresh: handleTokenRefresh,
        onBetSlipStateChange: function (state: any) {
          console.log('🎰 Betby 投注单状态变化:', state);
        },
      });

      console.log('✅ BTRenderer 初始化完成:', bt);
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
    handleSessionRefresh,
    handleTokenExpired,
    handleTokenRefresh,
    token,
    searchParams,
    getBetbyUrl,
  ]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (btInstanceRef.current && typeof btInstanceRef.current.kill === 'function') {
        console.log('🧹 组件卸载，销毁 Betby 实例');
        btInstanceRef.current.kill();
        btInstanceRef.current = null;
      }
      lastInitParamsRef.current = null;
    };
  }, []);

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
