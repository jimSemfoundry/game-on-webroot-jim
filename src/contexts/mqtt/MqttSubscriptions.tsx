import { useEffect, useMemo, useRef } from "react";
import { ISubscriptionMap } from "mqtt/lib/client";
import { useMqttService } from "@/contexts/mqtt";
import { useAuth } from "@/contexts/AuthContext.tsx";

type Props = {
  subscriptions?: ISubscriptionMap | null;
};

export const MqttSubscriptions = ({ subscriptions }: Props) => {
  const { subscribe, unsubscribe } = useMqttService();
  const prevTopicsRef = useRef<string[]>([]);

  useEffect(() => {
    const prevTopics = prevTopicsRef.current;
    const nextTopics = subscriptions ? Object.keys(subscriptions) : [];

    // 切换订阅集合时，先清旧再上新
    if (prevTopics.length > 0) {
      unsubscribe(prevTopics);
    }

    // 切换订阅集合时，先清旧再上新
    if (subscriptions && nextTopics.length > 0) {
      subscribe(subscriptions);
    }

    prevTopicsRef.current = nextTopics;

    return () => {
      if (nextTopics.length > 0) {
        unsubscribe(nextTopics);
      }
      prevTopicsRef.current = [];
    };
  }, [subscribe, subscriptions, unsubscribe]);

  return null;
};

/**
 * Demo
 * ```tsx
 * import { useMemo } from "react";
 * import type { ISubscriptionMap } from "mqtt/lib/client";
 *
 * const subscriptions: ISubscriptionMap | null = useMemo(() => {
 *   if (!user?.id) return null;
 *
 *   return {
 *     [`user/${user.id}/balance_detail`]: { qos: 1 },
 *     [`user/${user.id}/bonus_wallet`]: { qos: 0 }
 *   };
 * }, [user?.id]);
 *
 * <MqttSubscriptions subscriptions={subscriptions} />
 * ```
 */

export const MqttSubscriptionsEntry = () => {
  const { user } = useAuth();

  const subscriptions: ISubscriptionMap = useMemo(() => ({
    // 公共订阅 - 始终有效
    [`public/order/greatest`]: { qos: 0 },   // 最大投注
    [`public/order/latest_win`]: { qos: 0 }, // 最新赢奖
    [`public/order/latest_bet`]: { qos: 0 },  // 最新投注
    // 用户订阅 - 条件性添加
    ...(user?.id && { [`user/${user.id}/bonus_wallet`]: { qos: 0 } }),
    ...(user?.id && { [`user/${user.id}/sports_bonus_wallet`]: { qos: 0 } }),
    ...(user?.id && { [`user/${user.id}/balance_detail`]: { qos: 0 } }),
    ...(user?.id && { [`user/${user.id}/notification`]: { qos: 0 } }),
    ...(user?.id && { [`user/${user.id}/promo_code_result`]: { qos: 0 } }),
    ...(user?.id && { [`user/${user.id}/free_spin`]: { qos: 0 } }),
    ...(user?.id && { [`user/${user.id}/deposit`]: { qos: 0 } }),
    ...(user?.id && { [`user/${user.id}/lucky_spin`]: { qos: 0 } }), // Lucky Spin 抽奖次数发放通知
    ...(user?.id && { [`user/${user.id}/big_win_share`]: { qos: 0 } }),
    ...(user?.id && { [`user/${user.id}/bounty_winner`]: { qos: 2 } }), // Bounty 中奖个人通知 (t110585)
  }), [user?.id]);

  return <MqttSubscriptions subscriptions={subscriptions} />;
};