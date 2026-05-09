import { ReactNode, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMqttTopicMessagesReadonly } from "@/contexts/mqtt";
import { SPIN_RADIALS, SPIN_TYPE_ICON } from "@/sections/lucky-spin/components.tsx";
import { toast } from "sonner";
import { InnerToastCustom } from "@/sections/dollars/components.tsx";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const LuckySpinContainer = () => {
  const navigate = useNavigate();

  const { t } = useTranslation(['luckySpin']);

  const { user } = useAuth();

  // TODO: 事件通知
  //       EMQX - Lucky Spin 抽奖次数发放通知
  const { parsedMessages } = useMqttTopicMessagesReadonly<any>(user?.id ? `user/${user!.id}/lucky_spin` : null);

  const latest = parsedMessages?.[0];
  const spinType = latest?.parsed?.type?.endsWith("_normal") ? "normal" : "mega";

  const showBaseToast = useCallback((params: {
    icon: string;
    title: string;
    subTitle: ReactNode;
  }) => {
    toast.custom(
      (tst) => (
        <InnerToastCustom
          closeBtn
          tst={tst}
          icon={params.icon}
          style={{ background: SPIN_RADIALS[spinType] }}
          title={params.title}
          subTitle={params.subTitle}
          closeIcon={<ChevronRight size={16} />}
          onConfirm={() => void navigate({ to: "/lucky-spin", state: { spinType } as any })}
        />
      ),
      { duration: 10_000, position: "top-right" }
    );
  }, [latest?.parsed?.type]);

  useEffect(() => {
    if (latest?.parsed) {
      showBaseToast({
        icon: SPIN_TYPE_ICON[spinType],
        title: t("luckySpin:fortune"),
        subTitle: (
          <div>
            <div
              className="text-primary font-semibold">{t(`luckySpin:available`, { times: latest?.parsed?.times })}</div>
          </div>
        )
      });
    }
  }, [latest?.timestamp]);

  return null;
};
