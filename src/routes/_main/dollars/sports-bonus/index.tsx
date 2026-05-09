import {
  InnerBonusSlogan,
  InnerSportsContainer,
  InnerUnavailable
} from "@/sections/dollars/components.tsx";
import {
  InnerSportsPlayToClaim,
  InnerSportsDescription
} from "@/sections/sports-bonus/components.tsx";
import { useUserSportWallet } from "@/query/sports-bonus.ts";
import { createFileRoute } from "@tanstack/react-router";
import { useRTLContext } from "@/contexts/RTLContext.tsx";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useSportsBonusConfigList, useCurrentUser } from "@/hooks/api/useAuth.ts";
import clsx from "clsx";
import SportsBonusOptional from "@/sections/sports-bonus/sports-bonus-optional.tsx";
import { useTranslation } from "react-i18next";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";

export const Route = createFileRoute("/_main/dollars/sports-bonus/" as any)({
  component: Index
});

function Index() {
  const user: any = useCurrentUser();

  const { t } = useTranslation(["sportsBonus"]);

  const { isRTL } = useRTLContext();

  // 基础配置数据
  const { data: baseConfig } = useBaseConfig();

  // 体育彩金钱包数据
  const { data: bonusWallet, isLoading: bonusWalletLoading } = useUserSportWallet();

  // 体育彩金配置数据
  const { data: bonusConfig, isLoading: bonusConfigLoading } = useSportsBonusConfigList();

  const current = bonusWallet?.data;

  const is_show_betby = baseConfig?.data?.is_show_betby !== 0;  // 是否开启 betby - 体育下注

  return (
    <div className="max-w-[500px] m-auto md:bg-base-400 md:rounded-xl mb-10">
      <InnerSportsContainer className={clsx("h-50 px-5 pt-20", { "-scale-x-100": isRTL })}>
        <InnerBonusSlogan title={t("sportsBonus:bonus")} />
      </InnerSportsContainer>

      <div className="m-5">
        <SmallLoading
          loading={bonusWalletLoading || bonusConfigLoading || user?.isLoading}
          className="!min-h-[213px] !bg-base-200 rounded-xl"
          content={
            <div className="min-h-[213px] bg-base-200 rounded-xl">
              {/* 选择体育彩金活动 */}
              {is_show_betby && !current && bonusConfig?.data && <SportsBonusOptional />}

              {/* 活动不可用 */}
              {((!current && !bonusConfig?.data) || !is_show_betby) && <InnerUnavailable />}

              {/* 活动已开启 */}
              {is_show_betby && !!current && <InnerSportsPlayToClaim />}
            </div>
          }
        />
      </div>

      {/* 活动描述 */}
      <InnerSportsDescription data={current} />
    </div>
  );
}
