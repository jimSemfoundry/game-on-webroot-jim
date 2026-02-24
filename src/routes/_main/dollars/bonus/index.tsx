import {
  InnerPlayToClaim,
  InnerDescription,
  InnerBonusSlogan,
  InnerBonusDollars,
  InnerBonusContainer,
  InnerUnavailable,
  InnerBonusLatest,
  BonusDollarsState,
  BonusWaitingActive
} from "@/sections/dollars/components.tsx";
import { InnerContentVisible } from "@/components/header/message-v2/c/InnerComponents.tsx";
import { useBonusWallet } from "@/query/dollars.ts";
import { createFileRoute } from "@tanstack/react-router";
import { useRTLContext } from "@/contexts/RTLContext.tsx";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useCurrentUser, useUserBonusLatestHistory } from "@/hooks/api/useAuth.ts";
import { parser } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";
import { EBonus } from "@/components/modal/bonus-wallet/components.tsx";
import { useEffect } from "react";
import { BonusWalletChooseGuard } from "@/sections/dollars/bonus-wallet-choose-guard.tsx";
// import { useMqttTopicMessages } from "@/contexts/mqtt";
// import { useAuth } from "@/contexts/AuthContext.tsx";

export const Route = createFileRoute("/_main/dollars/bonus/")({
  component: Index
});

function Index() {
  const user: any = useCurrentUser();

  const { isRTL } = useRTLContext();

  // const { parsedMessages } = useMqttTopicMessages(user?.id ? `user/${user.id}/bonus_wallet` : null);

  // 基础配置数据
  const { data: baseConfig, isLoading: l1 } = useBaseConfig();

  // 彩金钱包数据
  const { data: bonusWallet, isLoading: l2 } = useBonusWallet();

  // 彩金最终操作记录
  const { data: bonusLatest, isLoading: l3, refetch: refetchBonusLatest } = useUserBonusLatestHistory();

  // 彩金钱包的总开关是否开启
  const slot_bonus_wallet = baseConfig?.data?.bonus_switch?.slot_bonus_wallet !== 0;

  // 匹配彩金币种状态信息 打码的数据 奖励的数据等
  const latest = bonusLatest?.data;

  const current = bonusWallet?.data;

  const bonus_wallet_name = user?.data?.status?.bonus_wallet_name;

  const bet_times = user?.data?.status?.bet_times as number;

  const recent_game = user?.data?.status?.recents_game as number;

  const deposit_times = user?.data?.status?.deposit_times as number;

  useEffect(() => {
    if (!BonusWaitingActive.has(current?.status)) void refetchBonusLatest();
  }, [current?.status]);

  return (<div className="max-w-[500px] m-auto md:bg-base-400 md:rounded-xl md:mb-10">
    <InnerBonusContainer $rtl={isRTL} className={"h-auto px-5 pt-15 flex flex-col gap-8 mb-4"}>
      <InnerBonusSlogan currency={EBonus.TOKEN} />
      <SmallLoading
        loading={l1 || l2 || l3 || user?.isLoading}
        className="!min-h-[76px] !bg-base-200 rounded-xl"
        content={
          <div className="min-h-[76px] bg-base-200 rounded-xl">

            {/*活动不可用 */}
            <InnerContentVisible show={
              !user?.data ||
              !slot_bonus_wallet ||
              latest?.status === BonusDollarsState.inactive ||
              latest?.status === BonusDollarsState.not_open ||
              !!bonus_wallet_name?.includes(EBonus.NONE) ||
              (!latest && (bet_times > 0 || deposit_times > 0 || !!recent_game))
            }>
              <InnerUnavailable />
            </InnerContentVisible>

            {/* 活动未开启 */}
            <InnerContentVisible
              show={
                !current &&
                !latest &&
                bonus_wallet_name &&
                !bonus_wallet_name?.includes(EBonus.NONE)
              }>
              <InnerBonusDollars currency={EBonus.TOKEN} />
            </InnerContentVisible>

            {/* 活动已各种情况结束 */}
            <InnerContentVisible
              show={
                !current && latest &&
                (
                  latest?.status === BonusDollarsState.expired ||
                  latest?.status === BonusDollarsState.claimed ||
                  latest?.status === BonusDollarsState.failure_end ||
                  latest?.status === BonusDollarsState.give_up
                )
              }>
              <InnerBonusLatest currency={EBonus.TOKEN} />
            </InnerContentVisible>

            {/* 活动已开启 */}
            <InnerContentVisible show={!!current}>
              <InnerPlayToClaim currency={EBonus.TOKEN} />
            </InnerContentVisible>

            {/* 重新选择的入口 */}
            <BonusWalletChooseGuard />
          </div>
        } />
    </InnerBonusContainer>
    <InnerDescription bonusKey={parser(current?.extra_data)?.type} currency={EBonus.TOKEN} />
  </div>);
}