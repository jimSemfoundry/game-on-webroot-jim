import { useAuth } from "@/contexts/AuthContext.tsx";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/authService.ts";

/**
 * List of games where region or settlement currency is unavailable
 */
export const useBanGameList = (enabled = false) => {
  const {user} = useAuth()
  return useQuery({
    queryKey: ['banGameList', user?.currency_fiat],
    queryFn: async () => {
      return authService.getBanGameList();
    },
    enabled: !!user && enabled,
  });
};