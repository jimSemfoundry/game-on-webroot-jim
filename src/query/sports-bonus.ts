import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { authService } from "@/services/authService.ts";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import { hasAuth } from "@/utils/auth.ts";
import { useEffect } from "react";
import { useMqttTopicMessagesReadonly } from "@/contexts/mqtt";

export const SPORTS_BONUS_QUERY_KEY = ["sportsBonusWallet"] as const;

export const useUserSportWallet = () => {
  const { user } = useAuth();

  const { data: baseConfig } = useBaseConfig();

  const sports_bonus_wallet = baseConfig?.data?.bonus_switch?.sports_bonus_wallet !== 0;

  return useQuery({
    queryKey: SPORTS_BONUS_QUERY_KEY,
    queryFn: () => authService.getSportsBonusWallet(),
    enabled: !!user && hasAuth() && sports_bonus_wallet,
    refetchOnMount: true
  });
};

/**
 * mqtt 数据和体育彩金钱包数据融合
 */
export const useSportsBonusWalletMqttSync = () => {
  const sportsBonusQuery = useUserSportWallet();

  const queryClient = useQueryClient();

  const { user } = useAuth();

  const { parsedMessages } = useMqttTopicMessagesReadonly<any>(
    user?.id ? `user/${user!.id}/sports_bonus_wallet` : null
  );

  const latest = parsedMessages?.[0];

  useEffect(() => {
    const parsed_data = latest?.parsed;
    if (!parsed_data) return;

    queryClient.setQueryData(SPORTS_BONUS_QUERY_KEY, (prev: any) => {
      const prevData = prev?.data ?? {};

      const extraData = parsed_data?.extra_data;
      const normalizedIncoming = {
        ...parsed_data,
        extra_data: typeof extraData === "string" ? extraData : (extraData != null ? JSON.stringify(extraData) : extraData)
      };

      return {
        ...prev,
        data: {
          ...prevData,
          ...normalizedIncoming
        }
      };
    });
  }, [latest?.timestamp, queryClient]);

  return sportsBonusQuery;
};
