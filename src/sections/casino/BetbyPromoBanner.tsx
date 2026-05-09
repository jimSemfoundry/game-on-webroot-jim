import Iconify from '@/components/iconify';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModals } from '@/contexts/ModalsProvider';
import { fetchBetbyAuthToken, getBetByConfig } from '@/services/betbyService';
import { BetbyAccessDeniedError, BetbyNoAccessError, BetbyNotAllowedError } from '@/types/betby';
import type { BTRendererInstance } from '@/types/betby';
import { isMobile } from '@/utils/browser';
import { cn } from '@/utils/cn';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

// Betby Promo Banner 的 placeholder 配置
const BETBY_PROMO_PLACEHOLDERS = import.meta.env.VITE_BETBY_PROMO_PLACEHOLDER
  ? import.meta.env.VITE_BETBY_PROMO_PLACEHOLDER.split(',')
  : ['operator_page', 'operator_page1', 'operator_page2', 'operator_page3', 'operator_page4', 'operator_page5'];

interface BetbyPromoBannerProps {
  className?: string;
}

export const BetbyPromoBanner = ({ className }: BetbyPromoBannerProps) => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { openSignInModal, openSignUpModal } = useAuthModals();

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const btInstanceRef = useRef<BTRendererInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      console.error('❌ Failed to load Betby SDK for promo banner');
      setHasError(true);
    };

    document.body.appendChild(script);
  }, []);

  // 获取集成参数
  const getIntegrationParams = useCallback(async () => {
    if (user) {
      // 已登录用户
      try {
        const response = await fetchBetbyAuthToken({
          currency: user.currency_fiat,
          lang: user.language_code,
        });
        return {
          jwt: response.jwt,
          brand_id: response.brand_id,
          lang: response.lang,
        };
      } catch (error) {
        if (
          error instanceof BetbyNotAllowedError ||
          error instanceof BetbyNoAccessError ||
          error instanceof BetbyAccessDeniedError
        ) {
          // 用户被限制访问，不显示 banner
          setHasError(true);
          return null;
        }
        // 其他错误回退到游客模式
        console.error('❌ 获取 Betby 认证失败，回退到游客模式', error);
      }
    }

    // 游客模式
    try {
      const brandId = await getBetByConfig();
      return {
        jwt: null,
        brand_id: brandId,
        lang: i18n.language,
      };
    } catch (error) {
      console.error('❌ 获取 Betby 配置失败:', error);
      setHasError(true);
      return null;
    }
  }, [user, i18n.language]);

  // Banner 点击回调
  const handleBannerClick = useCallback(
    ({ url, customAction }: { url?: string; customAction?: string }) => {
      // 处理自定义 action
      if (customAction === 'login') {
        openSignInModal();
        return;
      }
      if (customAction === 'register') {
        openSignUpModal();
        return;
      }

      // 跳转到 sports 页面
      if (url) {
        navigate({
          to: '/sports',
          search: { 'bt-path': url },
        });
      }
    },
    [navigate, openSignInModal, openSignUpModal]
  );

  // Outcome 点击回调（投注项点击）
  const handleOutcomeClick = useCallback(
    ({ url }: { url?: string }) => {
      if (url) {
        navigate({
          to: '/sports',
          search: { 'bt-path': url },
        });
      }
    },
    [navigate]
  );

  // 刷新 token
  const refreshToken = useCallback(async (): Promise<string | null> => {
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
      if (
        error instanceof BetbyNotAllowedError ||
        error instanceof BetbyNoAccessError ||
        error instanceof BetbyAccessDeniedError
      ) {
        setHasError(true);
        return null;
      }
      console.error('❌ 刷新 Betby token 失败:', error);
      return null;
    }
  }, [user]);

  // 会话刷新回调
  const handleSessionRefresh = useCallback(async (): Promise<string | null> => {
    try {
      const newParams = await getIntegrationParams();
      return newParams?.jwt ?? null;
    } catch (error) {
      console.error('❌ 会话刷新失败:', error);
      return null;
    }
  }, [getIntegrationParams]);

  // 令牌过期回调
  const handleTokenExpired = useCallback(async (): Promise<string | null> => {
    try {
      return await refreshToken();
    } catch (error) {
      console.error('❌ 刷新过期令牌失败:', error);
      return null;
    }
  }, [refreshToken]);

  // 初始化 Betby Promo Banner
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || hasError) {
      return;
    }

    let isCancelled = false;

    const initBanner = async () => {
      const params = await getIntegrationParams();
      if (!params || isCancelled) {
        return;
      }

      // 清理旧实例
      if (btInstanceRef.current && typeof btInstanceRef.current.kill === 'function') {
        btInstanceRef.current.kill();
        btInstanceRef.current = null;
      }

      const normalizedLang = params.lang === 'zh-CN' ? 'zh' : (params.lang || 'en');

      try {
        const bt = new window.BTRenderer().initialize({
          brand_id: params.brand_id,
          token: params.jwt,
          themeName: '1stgame',
          lang: normalizedLang,
          target: containerRef.current!,
          widgetName: 'promo',
          widgetParams: {
            placeholder: BETBY_PROMO_PLACEHOLDERS[0],
            onBannerClick: handleBannerClick,
            onOutcomeClick: handleOutcomeClick,
          },
          onLogin: () => openSignInModal(),
          onRegister: () => openSignUpModal(),
          // 会话过期时自动刷新
          onSessionRefresh: handleSessionRefresh,
          onTokenExpired: handleTokenExpired,
          onTokenRefresh: handleTokenExpired,
        });

        btInstanceRef.current = bt;
      } catch (error) {
        console.error('❌ 初始化 Betby Promo Banner 失败:', error);
        setHasError(true);
      }
    };

    // 延迟初始化，确保 DOM 已准备好
    const timeoutId = window.setTimeout(initBanner, 100);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [scriptLoaded, hasError, getIntegrationParams, handleBannerClick, handleOutcomeClick, openSignInModal, openSignUpModal, handleSessionRefresh, handleTokenExpired]);

  // 用户状态变化时的 key，用于触发重新初始化
  const userStateKey = `${user?.id ?? 'guest'}-${user?.currency_fiat ?? 'USD'}-${user?.language_code ?? i18n.language}`;
  const lastUserStateKeyRef = useRef<string>(userStateKey);

  // 用户状态变化时重新初始化
  useEffect(() => {
    if (!scriptLoaded) return;
    if (lastUserStateKeyRef.current === userStateKey) return;

    lastUserStateKeyRef.current = userStateKey;

    // 清理旧实例并重新初始化
    if (btInstanceRef.current && typeof btInstanceRef.current.kill === 'function') {
      btInstanceRef.current.kill();
      btInstanceRef.current = null;
    }
    setHasError(false);
  }, [scriptLoaded, userStateKey]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (btInstanceRef.current && typeof btInstanceRef.current.kill === 'function') {
        btInstanceRef.current.kill();
        btInstanceRef.current = null;
      }
    };
  }, []);

  // 如果有错误，不渲染
  if (hasError) {
    return null;
  }

  // 点击 ALL 按钮跳转到 sports 页面
  const handleAllClick = () => {
    navigate({ to: '/sports', search: { 'bt-path': undefined } });
  };

  return (
    <div className={className}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Iconify icon="custom:sports" />
          <p className="text-md sm:text-lg font-semibold">{t('common:common.sports')}</p>
        </div>
        {/* ALL 按钮 - 与 GameCarousel.Header 保持一致 */}
        <button
          onClick={handleAllClick}
          className={cn(
            "btn btn-xs md:btn-sm font-extrabold no-underline px-2 md:px-3 whitespace-nowrap",
            isMobile() && "btn-link",
          )}
        >
          {t('transaction:filters.all')}
        </button>
      </div>
      {/* Banner 容器 - Betby SDK 会注入约 8px 的水平内边距，这里不做额外处理 */}
      <div
        ref={containerRef}
        className="w-full min-h-[120px]"
      />
    </div>
  );
};
