import { useAuth } from "@/contexts/AuthContext.tsx";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/authService.ts";
import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext.tsx";

/**
 * List of games where region or settlement currency is unavailable
 */
export const useBanGameList = (enabled = false) => {
  const { user } = useAuth();
  // 用户当前的结算币
  const { selectedCurrency } = useSettlementCurrency();
  return useQuery({
    queryKey: ["banGameList", selectedCurrency],
    queryFn: async () => {
      return authService.getBanGameList(selectedCurrency);
    },
    enabled: !!user && enabled
  });
};