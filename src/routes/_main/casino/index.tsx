import { useCasinoHomeGameList } from "@/hooks/api/usePublic.ts";
import { FeaturedGames, RecentBigWins } from "@/sections/casino";
import { AcceptCurrencies } from "@/sections/casino/AccpetCurrencies.tsx";
import { AlliancePartnerships } from "@/sections/casino/AlliancePartnerships.tsx";
import { CategoryGames } from "@/sections/casino/CategoryGames.tsx";
import { Footer } from "@/sections/casino/Footer.tsx";
import { GameProviders } from "@/sections/casino/GameProviders.tsx";
import { HeroBanner } from "@/sections/casino/HeroBanner.tsx";
import { LiveBets } from "@/sections/casino/LiveBets.tsx";
import { PromotionalSection } from "@/sections/casino/PromotionalSection.tsx";
import { QuickActions } from "@/sections/casino/QuickActions.tsx";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { memo, useEffect } from "react";
import { useAuthModals } from "@/contexts/ModalsProvider.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";

const RouteComponent = memo(function RouteComponent() {
  const { data: casinoHomeGameListResponse } = useCasinoHomeGameList();
  const { openSignInModal } = useAuthModals();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: '/_main/casino/' });

  const { data: casinoHomeGameList } = casinoHomeGameListResponse ?? {};

  // 处理登录对话框打开
  useEffect(() => {
    if (search.openLogin === 'true' && !isAuthenticated) {
      openSignInModal();
      // 清理 URL 参数，但保留 redirect
      navigate({
        to: '/casino',
        search: search.redirect ? { redirect: search.redirect, openLogin: undefined } : { openLogin: undefined, redirect: undefined },
        replace: true,
      });
    }
  }, [search.openLogin, isAuthenticated, openSignInModal, navigate, search.redirect]);

  if (!casinoHomeGameList) return null;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 px-5 py-3 w-full">
      <HeroBanner />
      <RecentBigWins />
      {casinoHomeGameList && (
        <FeaturedGames games={casinoHomeGameList?.home_data?.hot_game || []} country_code={casinoHomeGameList?.country_code} />
      )}

      {casinoHomeGameList &&
        casinoHomeGameList?.home_data?.game_category?.map((c: any, i: number) => (
          <CategoryGames key={`${c.category}-${i}`} games={c.games} category={c.category} />
        ))}
      <GameProviders />
      <QuickActions games={casinoHomeGameList?.home_data?.hot_game || []} />
      <PromotionalSection />
      <LiveBets />
      <AcceptCurrencies />
      <AlliancePartnerships />
      <Footer />
    </div>
  );
});

export const Route = createFileRoute("/_main/casino/")({
  validateSearch: (search: Record<string, unknown>) => ({
    openLogin: (search.openLogin as string) || undefined,
    redirect: (search.redirect as string) || undefined,
  }),
  component: RouteComponent,
});
