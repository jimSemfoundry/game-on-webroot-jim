import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useMqttTopicMessagesReadonly } from "@/contexts/mqtt";
import { BountyHitModal } from "@/sections/bounty/BountyHitModal";

interface BountyWinnerPayload {
  event: string;
  timestamp: number;
  data: {
    winner_id: number;
    bounty_name: string;
    branch_name: string;
    user_id: number;
    username: string;
    bet_multiplier: number;
    bet_amount: number;
    bet_currency: string;
    settle_at: number;
    slot_no: number;
    reward_amount: number;
    reward_currency: string;
    claim_status: number;
    winner_slots: number;
    completed_count: number;
    remaining_slots: number;
    challenge_status: number;
  };
}

/**
 * 监听 user/{user_id}/bounty_winner MQTT topic（slice 3 timer 在写 winner 后立即推送）。
 * 收到中奖消息后弹中央 CONGRATULATIONS 弹窗，点 "Claim now" 跳 /bounty。
 *
 * 必须挂在 _main.tsx 这种始终在线的位置，玩家在游戏中也能弹窗。
 */
export function BountyMqttListener() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { parsedMessages } = useMqttTopicMessagesReadonly<BountyWinnerPayload>(
    user?.id ? `user/${user.id}/bounty_winner` : null,
  );
  const processedRef = useRef<Set<number>>(new Set());
  const [hitModal, setHitModal] = useState<{ multiplier: number } | null>(null);

  useEffect(() => {
    if (!parsedMessages.length) return;
    for (const msg of parsedMessages) {
      const data = msg.parsed?.data;
      if (!data || !data.winner_id) continue;
      if (processedRef.current.has(data.winner_id)) continue;
      processedRef.current.add(data.winner_id);

      setHitModal({ multiplier: Number(data.bet_multiplier ?? 0) });
    }
    qc.invalidateQueries({ queryKey: ["bounty"] });
    qc.invalidateQueries({ queryKey: ["claim", "count"] });
  }, [parsedMessages, qc]);

  return (
    <BountyHitModal
      isOpen={hitModal !== null}
      multiplier={hitModal?.multiplier ?? 0}
      onClose={() => setHitModal(null)}
      onClaim={() => {
        setHitModal(null);
        navigate({ to: "/bounty" });
      }}
    />
  );
}
