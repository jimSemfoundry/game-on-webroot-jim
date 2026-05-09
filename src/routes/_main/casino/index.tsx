import { useCasinoHomeGameList } from "@/hooks/api/usePublic.ts";
// 首屏可见 / 关键内容 → 同步 import（保 LCP 不受影响）
import { FeaturedGames, RecentBigWins } from "@/sections/casino";
import { BetbyLinkGuard } from "@/components/sidebar/BetbyLinkGuard.tsx";
import { CategoryGames } from "@/sections/casino/CategoryGames.tsx";
import HeroBanner from "@/sections/casino/hero-banner";
import { PromotionalSection } from "@/sections/casino/PromotionalSection.tsx";
import { QuickActions } from "@/sections/casino/QuickActions.tsx";
import { AcceptCurrencies } from "@/sections/casino/AccpetCurrencies.tsx";
import { LazySection } from "@/components/ui/LazySection";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { lazy, memo, Suspense, useEffect } from "react";
import { useAuthModals } from "@/contexts/ModalsProvider.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { isTelegramWebApp } from "@/utils/telegramWebApp";
import { LimitOfferPromoCheck } from "@/sections/casino/LimitOfferPromoCheck.tsx";

// t110774 §3.4 / PR4: 折叠以下大体积 / 重依赖的 section 改成 React.lazy，
// 让首页 entry chunk 只装首屏关键代码。fallback 撑高度匹配 LazySection.minHeight=200，
// 避免布局跳动；不要 spinner（用户会以为出错）。
const SportsPromoCarousel = lazy(() =>
  import("@/sections/casino/SportsPromoCarousel.tsx").then((m) => ({ default: m.SportsPromoCarousel }))
);
const GameProviders = lazy(() =>
  import("@/sections/casino/GameProviders.tsx").then((m) => ({ default: m.GameProviders }))
);
const LiveBets = lazy(() =>
  import("@/sections/casino/live-bets").then((m) => ({ default: m.LiveBets }))
);
const AlliancePartnerships = lazy(() =>
  import("@/sections/casino/AlliancePartnerships.tsx").then((m) => ({ default: m.AlliancePartnerships }))
);
const Footer = lazy(() =>
  import("@/sections/casino/Footer.tsx").then((m) => ({ default: m.Footer }))
);

const LazyFallback = () => <div className="min-h-[200px]" />;
// import { TelegramStartupDebugPanel } from "@/components/TelegramStartupDebugPanel";

const RouteComponent = memo(function RouteComponent() {
  const { data: casinoHomeGameListResponse } = useCasinoHomeGameList();
  const { openSignInModal, openSignUpModal } = useAuthModals();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/_main/casino/" });
  const shouldHideAlliancePartnerships = import.meta.env.VITE_HIDE_ALLIANCE_PARTNERSHIPS === "true";

  const { data: casinoHomeGameList } = casinoHomeGameListResponse ?? {};

  // 处理登录/注册对话框打开
  useEffect(() => {
    if (isTelegramWebApp()) return;
    if (!isAuthenticated) {
      // 转换为字符串进行比较，以兼容 boolean 和 string 类型
      const shouldOpenLogin = String(search.openLogin) === "true";
      const shouldOpenSignUp = String(search.openSignUp) === "true";

      if (shouldOpenLogin) {
        openSignInModal();
        // 清理 URL 参数，但保留 redirect
        void navigate({
          to: "/casino",
          search: {
            openLogin: undefined,
            openSignUp: undefined,
            redirect: undefined,
            openFinance: undefined,
            startapp: undefined
          },
          replace: true
        });
      } else if (shouldOpenSignUp) {
        openSignUpModal();
        // 清理 URL 参数，但保留 redirect
        void navigate({
          to: "/casino",
          search: {
            openLogin: undefined,
            openSignUp: undefined,
            redirect: undefined,
            openFinance: undefined,
            startapp: undefined
          },
          replace: true
        });
      }
    }
  }, [search.openLogin, search.openSignUp, isAuthenticated, openSignInModal, openSignUpModal, navigate, search.redirect, search.startapp]);

  // 链接跳转后打开 Finance 窗口
  useEffect(() => {
    const should_open_finance = String(search.openFinance) === "true";

    if (!should_open_finance) return;

    void navigate({ to: "/finance" });
  }, [navigate, search.openFinance]);

  // if (!casinoHomeGameList) return null;

  return (
    <LimitOfferPromoCheck>
      <div className="flex flex-col gap-4 sm:gap-6 px-5 py-3 w-full">
        {/*<TelegramStartupDebugPanel />*/}
        <LazySection>
          <HeroBanner />
        </LazySection>
        <LazySection>
          <RecentBigWins />
        </LazySection>
        <LazySection>
          <PromotionalSection />
        </LazySection>
        <FeaturedGames
          games={casinoHomeGameList?.home_data?.hot_game || []}
          country_code={casinoHomeGameList?.country_code}
        />
        <BetbyLinkGuard>
          <LazySection>
            <Suspense fallback={<LazyFallback />}>
              <SportsPromoCarousel />
            </Suspense>
          </LazySection>
        </BetbyLinkGuard>
        {(casinoHomeGameList?.home_data?.game_category ?? [])?.map((c: any) => (
          <CategoryGames key={c.category} games={c.games} category={c.category} />
        ))}
        <LazySection>
          <Suspense fallback={<LazyFallback />}>
            <GameProviders />
          </Suspense>
        </LazySection>
        <LazySection>
          <QuickActions games={casinoHomeGameList?.home_data?.hot_game || []} />
        </LazySection>
        <LazySection>
          <Suspense fallback={<LazyFallback />}>
            <LiveBets />
          </Suspense>
        </LazySection>
        <LazySection>
          <AcceptCurrencies />
        </LazySection>
        {!shouldHideAlliancePartnerships && (
          <LazySection>
            <Suspense fallback={<LazyFallback />}>
              <AlliancePartnerships />
            </Suspense>
          </LazySection>
        )}
        <LazySection>
          <Suspense fallback={<LazyFallback />}>
            <Footer />
          </Suspense>
        </LazySection>
      </div>
    </LimitOfferPromoCheck>
  );
});

export const Route = createFileRoute("/_main/casino/")({
  validateSearch: (search: Record<string, unknown>) => ({
    openLogin: (search.openLogin as string) || undefined,
    openSignUp: (search.openSignUp as string) || undefined,
    redirect: (search.redirect as string) || undefined,
    startapp: (search.startapp as string) || undefined,
    openFinance: (search.openFinance as string) || undefined
  }),
  component: RouteComponent
});
