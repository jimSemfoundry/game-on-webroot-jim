import Iconify from "@/components/iconify";
import { TournamentHeroSection, TournamentList } from "@/sections/tournament";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { publicService } from "@/services/publicService";
import { requireAuth } from "@/lib/auth-guards";
import { Footer } from "@/sections/casino/Footer";
import { useTranslation } from "react-i18next";
import { AlliancePartnerships } from "@/sections/casino/AlliancePartnerships";
import { useTournamentList } from "@/hooks/api/useAuth";

export const Route = createFileRoute("/_main/tournament/")({
  async beforeLoad({ context, location }) {
    // 1. 首先检查用户是否已登录
    requireAuth({ context, location });

    // 2. 检查 is_league 配置
    const baseConfig = await context.queryClient.fetchQuery({
      queryKey: ["baseConfig"],
      queryFn: () => publicService.getBaseConfig(),
      staleTime: 60 * 1000,
    });

    const isLeagueEnabled = baseConfig?.data?.is_league === 1;
    if (!isLeagueEnabled) {
      throw redirect({ to: "/casino", search: { openLogin: undefined, openSignUp: undefined, redirect: undefined , startapp: undefined, openFinance: undefined} });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const { tournamentList } = useTournamentList();

  return (
    <div className="flex flex-col gap-3 pb-26">
      <div className="relative">
        <TournamentHeroSection />
      </div>

      <div className="px-5 sm:px-0 flex flex-col gap-3 min-h-[600px]">
        <div className="flex items-center gap-2">
          <Iconify icon="custom:tournament" className="text-primary w-4 h-4 sm:w-5 sm:h-5" />
          <p className="text-md sm:text-lg font-bold">{t("casino:tournaments")}</p>
          {/** TODO:  这里length - 1 是因为暂时隐藏了beginner's Luck这个tournament */}
          {
            tournamentList?.length > 0 && (
              <div className="badge badge-primary badge-soft font-bold">
                {tournamentList.length || 0}
              </div>
            )
          }

        </div>
        <TournamentList />
      </div>

      <div className="sm:block hidden">
        <AlliancePartnerships />
      </div>
      <div className="sm:block hidden">
        <Footer />
      </div>
    </div>
  );
}
