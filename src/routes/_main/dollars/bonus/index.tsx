import {
  InnerPlayToClaim,
  InnerDescription,
  InnerBonusSlogan,
  InnerBonusContainer,
  InnerUnavailable,
  EBonus
} from "@/sections/dollars/components.tsx";
import { useUserBonusWallet } from "@/query/dollars.ts";
import { createFileRoute } from "@tanstack/react-router";
import { useRTLContext } from "@/contexts/RTLContext.tsx";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useBonusConfigList, useCurrentUser } from "@/hooks/api/useAuth.ts";
import clsx from "clsx";
import BonusOptional from "@/sections/dollars/bonus-optional.tsx";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_main/dollars/bonus/")({
  component: Index
});

function Index() {
  const user: any = useCurrentUser();

  const { t } = useTranslation();

  const { isRTL } = useRTLContext();

  // 彩金钱包数据
  const { data: bonusWallet, isLoading: bonusWalletLoading } = useUserBonusWallet();

  // 彩金配置数据
  const { data: bonusConfig, isLoading: bonusConfigLoading } = useBonusConfigList();

  const current = bonusWallet?.data;

  return (<div className="max-w-[500px] m-auto md:bg-base-400 md:rounded-xl mb-10">
    <InnerBonusContainer
      className={clsx("h-50 px-5 pt-20", { "-scale-x-100": isRTL })}>
      <InnerBonusSlogan title={t("bonus:bonusStore")} />
    </InnerBonusContainer>

    <div className={"m-5"}>
      <SmallLoading
        loading={bonusWalletLoading || bonusConfigLoading || user?.isLoading}
        className="!min-h-[213px] !bg-base-200 rounded-xl"
        content={
          <div className="min-h-[213px] bg-base-200 rounded-xl">
            {/* 选择彩金活动 */}
            {!current && bonusConfig?.data && <BonusOptional />}

            {/*活动不可用 */}
            {!current && !bonusConfig?.data && <InnerUnavailable />}

            {/* 活动已开启 */}
            {!!current && <InnerPlayToClaim currency={EBonus.TOKEN} />}
          </div>
        } />
    </div>

    {/* 活动描述 */}
    <InnerDescription data={current} currency={EBonus.TOKEN} />
  </div>);
}