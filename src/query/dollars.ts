import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { authService } from "@/services/authService.ts";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import { hasAuth } from "@/utils/auth.ts";

export const useBonusWallet = () => {
  const { user } = useAuth();

  // 基础配置数据
  const { data: baseConfig } = useBaseConfig();

  // 彩金钱包的总开关是否开启
  const slot_bonus_wallet = baseConfig?.data?.bonus_switch?.slot_bonus_wallet !== 0;

  return useQuery({
    queryKey: ["bonusWallet"],
    queryFn: () => authService.getBonusWallet(),
    enabled: !!user && hasAuth() && slot_bonus_wallet,
    refetchOnMount: true,
    refetchInterval: 15_000
  });
};