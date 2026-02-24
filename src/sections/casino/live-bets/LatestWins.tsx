import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useModals } from "@/contexts/ModalsProvider";
import { useLatestWins } from "@/hooks/api/usePublic";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useMqttTopicMessagesReadonly } from "@/contexts/mqtt";
import { BetRow, BetRowSkeleton, getBetOrderRowKey, ROW_LIMIT } from "@/sections/casino/live-bets/components.tsx";

export const LatestWins = () => {
  const { i18n } = useTranslation();

  const { openBetSlipModal } = useModals();

  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const { data: latestWinsResponse } = useLatestWins(i18n.language.toUpperCase());

  const { parsedMessages } = useMqttTopicMessagesReadonly(`public/order/latest_win`);

  const mergedMessages = useMemo(() => {
    const apiList = latestWinsResponse?.data ?? [];
    let apiMessages = apiList.slice(0, ROW_LIMIT);

    // 去重复
    const firstWsId = (parsedMessages as any)?.[0]?.parsed?.id;

    if (apiList?.[0]?.id != null && firstWsId != null && String(apiList[0].id) === String(firstWsId)) {
      apiMessages = apiMessages.slice(1);
    }

    // TODO: debug code 检查可疑的重复数据
    // console.info(`wss推送数据ids ${parsedMessages?.map(({ parsed }: any) => parsed?.id)}`);
    // const groupedByCreatedAt = new Map<string, any[]>();
    // ((apiList ?? []) as any[]).forEach((item) => {
    //   const key = String(item?.id ?? "unknown");
    //   const value = {
    //     nickname: item?.nickname,
    //     game_name: item?.game_name,
    //     game_category_1: item?.game_category_1
    //   };
    //   const list = groupedByCreatedAt.get(key);
    //   if (list) list.push(value);
    //   else groupedByCreatedAt.set(key, [value]);
    // });
    // const groupedEntries = Array.from(groupedByCreatedAt.entries())
    //   .map(([id, items]) => ({ id, items }))
    //   .sort((a, b) => b.items.length - a.items.length);
    // console.info("兜底接口数据:");
    // console.info(groupedEntries);

    return [...(parsedMessages ?? []), ...apiMessages].slice(0, ROW_LIMIT);
  }, [latestWinsResponse, parsedMessages]);

  const tableRows = useMemo(() => {
    const rows = [];

    // 渲染实际数据行
    for (let index = 0; index < Math.min(ROW_LIMIT, mergedMessages.length); index++) {
      const bet = mergedMessages[index] as Record<string, any>;
      const _bet = bet?.parsed || bet;
      const rowKey = getBetOrderRowKey(_bet, index);
      rows.push(
        <BetRow
          key={rowKey}
          bet={_bet}
          index={index}
          format={formatWithConversion}
          onClick={openBetSlipModal}
        />
      );
    }

    // 添加 skeleton 占位行，确保始终显示 ROW_LIMIT 行
    const skeletonCount = Math.max(0, ROW_LIMIT - rows.length);
    for (let i = 0; i < skeletonCount; i++) {
      rows.push(<BetRowSkeleton key={`skeleton-row-${i}`} />);
    }

    return rows;
  }, [mergedMessages, formatWithConversion, openBetSlipModal]);

  return (
    <div style={{ overflowAnchor: "none" }}>
      {tableRows}
    </div>
  );
};
