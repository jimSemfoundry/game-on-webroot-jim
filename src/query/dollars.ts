import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { authService } from "@/services/authService.ts";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import { hasAuth } from "@/utils/auth.ts";
import { useEffect } from "react";
import { useMqttTopicMessagesReadonly } from "@/contexts/mqtt";
import { AUTH_QUERY_KEYS, useUserBalance } from "@/hooks/api/useAuth.ts";

export const useUserBonusWallet = () => {
  const { user } = useAuth();

  // 基础配置数据
  const { data: baseConfig } = useBaseConfig();

  // 彩金钱包的总开关是否开启
  const slot_bonus_wallet = baseConfig?.data?.bonus_switch?.slot_bonus_wallet !== 0;

  return useQuery({
    queryKey: ["bonusWallet"],
    queryFn: () => authService.getBonusWallet(),
    enabled: !!user && hasAuth() && slot_bonus_wallet,
    refetchOnMount: true
  });
};

/**
 * mqtt数据和彩金钱包数据融合
 */
export const useBonusWalletMqttSync = () => {
  const bonusQuery = useUserBonusWallet();

  const queryClient = useQueryClient();

  const { user } = useAuth();

  const { parsedMessages } = useMqttTopicMessagesReadonly<any>(user?.id ? `user/${user!.id}/bonus_wallet` : null);

  const latest = parsedMessages?.[0];

  useEffect(() => {
    const parsed_data = latest?.parsed;
    if (!parsed_data) return;

    queryClient.setQueryData(["bonusWallet"], (prev: any) => {
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

  return bonusQuery;
};

/**
 * mqtt数据和用户余额变化数据融合
 */
export const useUserBalanceMqttSync = () => {
  const bonusQuery = useUserBalance();

  const queryClient = useQueryClient();

  const { user } = useAuth();

  // 存款通知 -> 用户存款成功时
  const { parsedMessages: parsedMessagesDeposit } = useMqttTopicMessagesReadonly<any>(user?.id ? `user/${user!.id}/deposit` : null);

  /**
   * {
   *     "id": 714391,
   *     "team_id": 0,
   *     "user_id": 7272320065,
   *     "currency": "PHP",
   *     "balance": "1.52870780",
   *     "cashback_base": "0E-8",
   *     "updated_at": 1766995078,
   *     "created_at": 1766995078,
   *     "withdraw_able": "0E-8",
   *     "version": 9
   * }
   */

    // 账户余额变化详情
  const { parsedMessages: parsedMessagesBalance } = useMqttTopicMessagesReadonly<any>(user?.id ? `user/${user!.id}/balance_detail` : null);

  const latestParsedMessagesDeposit = parsedMessagesDeposit?.[0];
  const latestParsedMessagesBalance = parsedMessagesBalance?.[0];

  // mqtt数据和用户余额变化数据融合
  useEffect(() => {
    const parsed_data = latestParsedMessagesBalance?.parsed;
    if (!parsed_data) return;

    queryClient.setQueryData(AUTH_QUERY_KEYS.userBalance, (prev: any) => {
      if (!Array.isArray(prev)) return prev;

      const changes = Array.isArray(parsed_data?.changes) ? parsed_data.changes : [];
      if (changes.length === 0) return prev;

      // 把本次 mqtt 推送的余额变化整理成：currency -> balance(string)
      const BALANCE_MAP = new Map<string, any>();
      for (const item of changes) {
        const currency = item?.currency;
        const balanceAfter = item?.balance_after;
        if (currency && !Number.isNaN(Number(balanceAfter))) {
          BALANCE_MAP.set(currency, String(balanceAfter));
        }
      }

      // 以 currency 为唯一 key 重新组装数组，保证不会出现重复币种
      const CURRENCY_MAP = new Map<string, any>();
      for (const item of prev) {
        const key = item?.currency;
        if (typeof key === 'string' && key) CURRENCY_MAP.set(key, item);
      }

      // 用 mqtt 推送的数据覆盖余额；不存在的币种会被补齐进去
      for (const [currency, balance] of BALANCE_MAP.entries()) {
        const existing = CURRENCY_MAP.get(currency);
        if (existing) {
          CURRENCY_MAP.set(currency, { ...existing, balance });
        } else {
          CURRENCY_MAP.set(currency, { id: `${currency}_${CURRENCY_MAP.size}`, currency, balance });
        }
      }

      return Array.from(CURRENCY_MAP.values()).map((item: any, idx: number) => ({
        ...item,
        id: item?.id ?? `${item?.currency}_${idx}`,
      }));
    });
  }, [latestParsedMessagesBalance?.timestamp, queryClient]);

  // 存款通知 -> 用户存款成功时 -> 主动更新一次余额数据
  useEffect(() => {
    const parsed_data = latestParsedMessagesDeposit?.parsed;
    if (!parsed_data) return;

    void bonusQuery.refetch();
  }, [latestParsedMessagesDeposit?.timestamp]);

  return bonusQuery;
};