import Iconify from "@/components/iconify";
import { TournamentHeroSection, TournamentList } from "@/sections/tournament";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { publicService } from "@/services/publicService";
import { requireAuth } from "@/lib/auth-guards";

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
      throw redirect({ to: "/casino", search: { openLogin: undefined, redirect: undefined } });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-3 pb-26">
      <div className="relative">
        <TournamentHeroSection />
      </div>

      <div className="px-5 sm:px-0 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Iconify icon="custom:tournament" className="text-primary w-4 h-4 sm:w-5 sm:h-5" />
          <p className="text-md sm:text-lg font-bold">Tournaments</p>
        </div>
        <TournamentList />
      </div>
    </div>
  );
}
