import { useCasinoHomeGameList } from "@/hooks/api/usePublic.ts";
import { FeaturedGames, RecentBigWins } from "@/sections/casino";
import { AcceptCurrencies } from "@/sections/casino/AccpetCurrencies.tsx";
import { AlliancePartnerships } from "@/sections/casino/AlliancePartnerships.tsx";
import { CategoryGames } from "@/sections/casino/CategoryGames.tsx";
import { Footer } from "@/sections/casino/Footer.tsx";
import { GameProviders } from "@/sections/casino/GameProviders.tsx";
import HeroBanner from "@/sections/casino/hero-banner";
import { LiveBets } from "@/sections/casino/live-bets";
import { PromotionalSection } from "@/sections/casino/PromotionalSection.tsx";
import { QuickActions } from "@/sections/casino/QuickActions.tsx";
import { LazySection } from "@/components/ui/LazySection";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { memo, useEffect } from "react";
import { useAuthModals } from "@/contexts/ModalsProvider.tsx";
import { useFinanceModal } from "@/contexts/ModalsProvider.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { getBroadcastChannel } from "@/utils/helper.ts";
import { isTelegramWebApp } from "@/utils/telegramWebApp";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { BonusWalletActivityActivationCheck } from "@/sections/casino/BonusWalletActivityActivationCheck.tsx";
import { LimitOfferPromoCheck } from "@/sections/casino/LimitOfferPromoCheck.tsx";

const RouteComponent = memo(function RouteComponent() {
  const { t } = useTranslation();
  const { data: casinoHomeGameListResponse } = useCasinoHomeGameList();
  const { openUserFinanceModal } = useFinanceModal();
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

    openUserFinanceModal();

    void navigate({
      to: "/casino",
      search: {
        redirect: undefined,
        startapp: undefined,
        openLogin: undefined,
        openSignUp: undefined,
        openFinance: undefined
      },
      replace: true
    });
  }, [navigate, openUserFinanceModal, search.openFinance]);

  // FIXME: PWA 应用更新消息，需要用户确认是否更新
  useEffect(() => {
    let toast_id: string | number = "";

    const channel = getBroadcastChannel();

    if (toast_id) toast.dismiss(toast_id);

    if (channel) channel.onmessage = () => {
      // 防止重复提示
      const pwa_prompt_lock = "pwa_update_prompt_lock";
      const last_prompt = sessionStorage.getItem(pwa_prompt_lock);
      if (last_prompt) return;

      toast_id = toast.info(t("common.newVersionDiscovered", "We have an update!"), {
        description: t("common.refreshToLatestVersionImmediately", "Reload the page to enjoy a new gaming experience."),
        duration: Infinity,
        action: {
          label: t("common.pressToUpdate", "Refresh"),
          onClick: () => {
            toast.dismiss(toast_id);
            // 标记已提示，避免重复
            sessionStorage.setItem(pwa_prompt_lock, Date.now().toString());
            // 延迟刷新，确保 toast 完全关闭
            setTimeout(() => {
              window.location.reload();
            }, 300);
          }
        },
        richColors: false
      });
    };

    // clear broadcastChannel
    return () => channel?.close();
  }, []);

  // if (!casinoHomeGameList) return null;

  return (
    <BonusWalletActivityActivationCheck>
      <LimitOfferPromoCheck>
        <div className="flex flex-col gap-4 sm:gap-6 px-5 py-3 w-full">
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
          {(casinoHomeGameList?.home_data?.game_category ?? [])?.map((c: any) => (
            <CategoryGames key={c.category} games={c.games} category={c.category} />
          ))}
          <LazySection>
            <GameProviders />
          </LazySection>
          <LazySection>
            <QuickActions games={casinoHomeGameList?.home_data?.hot_game || []} />
          </LazySection>
          <LazySection>
            <LiveBets />
          </LazySection>
          <LazySection>
            <AcceptCurrencies />
          </LazySection>
          {!shouldHideAlliancePartnerships && (
            <LazySection>
              <AlliancePartnerships />
            </LazySection>
          )}
          <LazySection>
            <Footer />
          </LazySection>
        </div>
      </LimitOfferPromoCheck>
    </BonusWalletActivityActivationCheck>
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
