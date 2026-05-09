import { m } from "motion/react";
import { useNotificationMessage, useUnreadNotificationCounter } from "@/hooks/api/useAuth.ts";
import { useMqttTopicMessagesReadonly } from "@/contexts/mqtt";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useEffect } from "react";

export default function InternalMessageCounter({ onClick }: { onClick: () => void }) {
  const { user } = useAuth();

  const { data: unreadCounter, refetch: unreadCounterRefetch } = useUnreadNotificationCounter();

  // TODO: 更新站内信数据
  const { refetch: refetchMessage } = useNotificationMessage({ read: -1 }, true);

  // TODO: EMQX - 站内信通知
  const { parsedMessages } = useMqttTopicMessagesReadonly<any>(user?.id ? `user/${user!.id}/notification` : null);

  const latest = parsedMessages?.[0];

  useEffect(() => {
    const parsed_data = latest?.parsed;
    if (!parsed_data) return;

    if (parsed_data) {
      void refetchMessage();
      void unreadCounterRefetch();
    }
  }, [latest?.timestamp]);

  return (
    <div
      className="indicator cursor-pointer z-40 bg-base-200 rounded-lg w-10 h-10 md:w-10 md:h-10 flex items-center justify-center"
      onClick={onClick}>
      <img src="/icons/ui/bell.png" alt="" className="w-8 h-8" />
      {
        unreadCounter?.unread_count > 0 && (
          <m.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={`
            indicator-item badge border-1 border-base-400 
            badge-primary !rounded-sm p-0 z-20 md:h-4 h-4
            w-5.5 text-[11px] font-bold -bottom-3
            top-auto left-1 md:left-3
            `}>
            {unreadCounter?.unread_count >= 10 ? "9+" : unreadCounter?.unread_count}
          </m.span>
        )
      }
    </div>
  );
}
