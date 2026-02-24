import { useQuery } from "@tanstack/react-query";
import { publicService } from "@/services/publicService.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";

export const special_activity_set = new Set(["1st_game_bonus_wallet"]);

export const useBannerContentList = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bannerContentList", user?.id],
    queryFn: () => publicService.getBannerContentList(user?.id),
    enabled: !!user,
    refetchOnMount: true
  });
};