import { PropsWithChildren, useCallback, useEffect } from "react";
import { useBoundStore } from "@/store";
import { authService } from "@/services/authService.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useMqttService, useMqttTopicMessagesReadonly } from "@/contexts/mqtt";
import { useCurrencyExchangeRate } from "@/hooks/api/usePublic.ts";
import Decimal from "decimal.js";
import { trackCustomEvent } from "@/utils/helper.ts";

/**
 * ⚠️ 存在多次弹出的时机, 非一次性
 * @param props
 * @constructor
 */
export const LimitOfferPromoCheck = (props: PropsWithChildren) => {
  const { user, status } = useAuth();

  const { clearMessages } = useMqttService();

  const { data: exchangeRate } = useCurrencyExchangeRate();

  const { parsedMessages: parsedMessagesDeposit } = useMqttTopicMessagesReadonly<any>(user?.id ? `user/${user!.id}/deposit` : null);
  const { parsedMessages: parsedMessagesBalance } = useMqttTopicMessagesReadonly<any>(user?.id ? `user/${user!.id}/balance_detail` : null);

  const setSyncAction = useBoundStore((state) => state.setSyncAction);

  const latestParsedMessagesDeposit = parsedMessagesDeposit?.[0];
  const latestParsedMessagesBalance = parsedMessagesBalance?.[0];

  // TODO: 激活优惠活动
  const handleLimitOfferTrigger = useCallback(async () => {
    try {
      const response = await authService.checkDetailPromo();
      if (response?.code === 51005) {
        const current = await authService.getCurrentPromo();
        if (current?.data) {
          setSyncAction("OPEN_LIMIT_OFFER_MODAL", current.data);

          // 清理副作用数据
          clearMessages(user?.id ? `user/${user!.id}/balance_detail` : undefined);
        }
      }
    } catch (_error) {
      console.info(_error);
    }
  }, [user?.id]);

  // TODO: 监听用户下注导致的余额变化,用于触发限时优惠
  useEffect(() => {
    const parsed_data = latestParsedMessagesBalance?.parsed;

    if (!parsed_data) return;

    const changes = Array.isArray(parsed_data?.changes) ? parsed_data.changes : [];

    const target = changes.find((c: Record<string, any>) => c?.currency === user?.currency);

    // TODO: 临界值 USDT - 注意等值的结算币种转换, 否则无法比较大小
    const limit_usd = 0.1;

    const exchange_rate = exchangeRate?.data?.[user?.currency ?? ""] ?? 0;

    // TODO: 临界值 USDT - 注意等值的结算币种转换, 否则无法比较大小
    const balance_after_lt = Number(target?.balance_after || 0) < Decimal(limit_usd).div(exchange_rate).toNumber();

    // TODO: 和后端沟通过, 关注 _bet 事件即可
    if (
      balance_after_lt &&
      target?.reasons?.toString()?.includes("_bet")
    ) {
      // TODO: 激活优惠活动
      void handleLimitOfferTrigger();
    }
  }, [user?.currency, exchangeRate, handleLimitOfferTrigger, latestParsedMessagesBalance]);

  // TODO: 监听用户充值完成的动作
  useEffect(() => {
    const parsed_data = latestParsedMessagesDeposit?.parsed;

    if (!parsed_data) return;

    // GTM 记录推送
    trackCustomEvent("deposit", "userDeposit", parsed_data);

    trackCustomEvent("deposit_times", "userDepositTimes", {
      "user_id": user?.id,
      "username": user?.username,
      "deposit_times": status?.deposit_times
    });
  }, [user?.id, status?.deposit_times, latestParsedMessagesDeposit?.timestamp]);

  return props.children;
};