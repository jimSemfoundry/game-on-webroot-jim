import {
  InnerPlayToClaim,
  InnerDescription,
  InnerBonusDollars,
  InnerBonusSlogan, InnerSportContainer, InnerUnavailable, InnerDataSkeleton
} from "@/sections/dollars/components.tsx";
import { useBonusWallet } from "@/query/dollars.ts";
import { InnerContentVisible } from "@/components/header/message-v2/c/InnerComponents.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/dollars/sports/")({
  component: Index
});

function Index() {
  // 彩金钱包数据
  const { data: bonusWallet, isFetching } = useBonusWallet();

  // 匹配彩金币种状态信息 打码的数据 奖励的数据等
  const status = (bonusWallet?.data ?? [])?.find((token: { currency: string; }) => token?.currency === "SPORT");

  return (
    <div>
      <InnerSportContainer className={"h-auto px-5 pt-15 flex flex-col gap-8 mb-4"}>
        <InnerBonusSlogan currency={"SPORT"} />
        <div>
          {/* 数据加载中 */}
          <InnerContentVisible show={isFetching}>
            <InnerDataSkeleton />
          </InnerContentVisible>
          {/* 活动未开启1 */}
          <InnerContentVisible show={!isFetching && !status}>
            <InnerUnavailable />
          </InnerContentVisible>
          {/* 活动未开启2 */}
          <InnerContentVisible show={!isFetching && status?.status === 0}>
            <InnerBonusDollars currency={"SPORT"} />
          </InnerContentVisible>
          {/* 活动已开启 */}
          <InnerContentVisible show={!isFetching && status && status?.status !== 0}>
            <InnerPlayToClaim currency={"SPORT"} />
          </InnerContentVisible>
        </div>
      </InnerSportContainer>
      <InnerDescription currency={"SPORT"} />
    </div>
  );
}