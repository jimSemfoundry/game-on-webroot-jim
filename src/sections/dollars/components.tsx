import styled from "styled-components";
import { ComponentProps, ReactNode, useCallback, useMemo, useState } from "react";
import clsx from "clsx";
import { Trans, useTranslation } from "react-i18next";
import { AlertCircle, ChevronRight, Lock, Zap } from "lucide-react";
import { Decimal } from "decimal.js";
import { BonusClaimModal } from "@/sections/dollars/bonus-claim-modal.tsx";
import { toast } from "sonner";
import { m as motion } from "motion/react";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useBonusWallet } from "@/query/dollars.ts";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import {
  useBonusConfigList,
  useBonusWalletCurrencySwitch,
  useCurrentUser,
  useUserBalance, useUserBonusLatestHistory
} from "@/hooks/api/useAuth.ts";
import { InnerContentVisible } from "@/components/header/message-v2/c/InnerComponents.tsx";
import { authService } from "@/services/authService.ts";
import { CountdownTimer } from "@/sections/dollars/CountdownTimer.tsx";
import { useNavigate } from "@tanstack/react-router";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import {
  BONUS_TYPE_MODAL_MAP,
  BONUS_WALLET_INFO_MAP,
  EBonus,
  TBonus
} from "@/components/modal/bonus-wallet/components.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { parser } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";
import { Alert } from "@/components/icons/Alert.tsx";
import { useBoundStore } from "@/store";
import { randomString } from "@/components/modal/UserFinanceModal/helper.ts";
import { useFinanceModal } from "@/contexts/ModalsProvider.tsx";
import { useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { sleep } from "@/components/socialLogin/helper.ts";

export const VALID_BONUS_SET = new Set([EBonus.MINI, EBonus.MEGA]);

// 状态：0-inactive，1-进行中，2-过期，3-待领取，4-已领取，5-失败结束
export enum BonusDollarsState {
  inactive = 0,
  in_progress = 1,
  expired = 2,
  pending_collection = 3,
  claimed = 4,
  failure_end = 5,
  not_open = 6,
  give_up = 7,
}

export const InnerBonusContainer = styled.div<{ $rtl: boolean }>`
    background: url('/images/dollars/coins.png') no-repeat,
    url('/images/dollars/tiger.png') no-repeat;
    background-position: ${props => props.$rtl
            ? "left top 20px, left 25px top 20px"
            : "right top 20px, right 25px top 20px"};
    position: relative;
`;

export const BonusInProgress = new Set([
  BonusDollarsState.in_progress,
  BonusDollarsState.pending_collection
]);

export const BonusWaitingActive = new Set([
  BonusDollarsState.inactive,
  BonusDollarsState.not_open
]);

export const BonusNotAvailable = new Set([
  BonusDollarsState.expired,
  BonusDollarsState.claimed,
  BonusDollarsState.failure_end
]);

export const InnerSportContainer = styled.div`
    background: url('/images/dollars/coins.png') no-repeat right top,
    url('/images/dollars/sports.png') no-repeat;
    background-position: right top 20px, right 10px top -30px;
    position: relative;
`;

export const InnerBonusSlogan = ({}: { currency: "BONUS" | "SPORT" }) => {
  const user: any = useCurrentUser();

  const { t } = useTranslation();

  // 彩金钱包数据
  const { data: bonusWallet } = useBonusWallet();

  // 币种转换辅助
  const { formatCurrency, convertCurrency, exchangeRates } = useCurrencyData();

  const currency_fiat = user?.data?.user.currency_fiat || "USD";

  // 匹配彩金币种状态信息 打码的数据 奖励的数据等
  const status = bonusWallet?.data;

  return <h3 className={"pl-3 font-extrabold text-[20px] text-white leading-6 whitespace-pre-line min-h-18"}>
    <Trans
      i18nKey={status ? "bonus:spin_to_win" : t("banner:bo_do")}
      values={{
        bonus: formatCurrency({
          amount: convertCurrency({
            amount: status?.claim_max || 0,
            fromCurrency: "USDT",
            toCurrency: currency_fiat,
            exchangeRates
          }),
          currency: currency_fiat,
          showSymbol: true, showCode: false
        }).formatted
      }}
      components={[<span className={"text-primary"} />]}
    />
  </h3>;
};

export const InnerBonusDollars = ({}: { currency?: "SPORT" | "BONUS" }) => {
  const user: any = useCurrentUser();

  const openModal = useBoundStore((state) => state.openModal);

  const { t } = useTranslation();

  const { navigateCallback } = useNavigateGuard();

  const { openUserFinanceModalWithTab } = useFinanceModal();

  // 彩金活动配置列表
  const { data: bonusConfig } = useBonusConfigList();

  // 币种转换辅助
  const { formatCurrency, convertCurrency, exchangeRates } = useCurrencyData();

  const targetCurrency = (user?.currency_fiat ?? "USD");

  const bonus_wallet_name = user?.data?.status?.bonus_wallet_name;

  const target_bonus = parser((bonusConfig?.data ?? []).find((bonus: Record<string, any>) => bonus?.name.includes(bonus_wallet_name))?.extra_data);

  return <div className={"skeleton p-4 rounded-lg bg-base-300 flex flex-col gap-4 border-2 border-white/10"}>
    <div className={"flex items-center justify-between gap-4"}>
      <div>
        <p className="text-[14px] font-extrabold">
          {t(BONUS_WALLET_INFO_MAP[target_bonus?.type as TBonus]?.title)}
        </p>
        <p className="text-[12px] font-bold text-primary break-word">
          {t(BONUS_WALLET_INFO_MAP[target_bonus?.type as TBonus]?.subTitle, {
            value: Decimal(target_bonus?.bonus_rate || 0).times(100).toFixed(0) + "%",
            amount: Number(target_bonus?.bonus_value) >= 0 ? formatCurrency({
              amount: convertCurrency({
                amount: target_bonus?.bonus_value || 0,
                fromCurrency: "USDT",
                toCurrency: targetCurrency,
                exchangeRates
              }),
              currency: targetCurrency,
              showSymbol: true, showCode: false
            }).formatted : ""
          })}
        </p>
      </div>
      {/* 活动详情 */}
      <InnerDisplayContent show={target_bonus?.type !== "none_bonus"}>
        <button
          className={"btn btn-square bg-base-400"}
          onClick={(e) => {
            e?.stopPropagation();
            openModal(BONUS_TYPE_MODAL_MAP[target_bonus?.type as TBonus]);
            return false;
          }}>
          <Alert />
        </button>
      </InnerDisplayContent>
    </div>
    <InnerDisplayContent show={VALID_BONUS_SET.has(target_bonus?.type)}>
      <InnerConfirmBox onClick={() => {
        navigateCallback(() => {
          openUserFinanceModalWithTab(`deposit_${randomString()}`);
        }, true);
      }}>
        {t("common:common.deposit")}
      </InnerConfirmBox>
    </InnerDisplayContent>
  </div>;
};

export const InnerPlayToClaim = (
  {
    currency
  }: {
    currency: "SPORT" | "BONUS"
  }) => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const { user } = useAuth();

  // 彩金钱包数据
  const { data: bonusWallet, refetch: bonusWalletRefetch } = useBonusWallet();

  const { refetch: refetchBonusLatest } = useUserBonusLatestHistory();

  // 切换彩金币种为其他结算币种
  const { switchBonusCurrencyToOther } = useBonusWalletCurrencySwitch();

  // 用户余额数据
  const { data: userBalance = [] } = useUserBalance();

  // 币种转换辅助
  const { formatCurrency, convertCurrency, exchangeRates } = useCurrencyData();

  // 提取收益窗口控制
  const [triggerClaim, setTriggerClaim] = useState<boolean>(false);
  // 设置活动是否过期
  const [bonusExpired, setBonusExpired] = useState<boolean>(false);
  // 奖励领取状态
  const [bonusPending, setBonusPending] = useState<boolean>(false);

  // 匹配币种信息，余额 icon 精度 等
  const match = userBalance?.find((token: { currency: string; }) => token?.currency === currency);

  // 匹配彩金币种状态信息 打码的数据 奖励的数据等
  const status = bonusWallet?.data;

  // 余额5s更新一次，进度条会更新
  // balance / claim_max  - 注意超范围1
  const progress1 = useMemo(() => {
    if (Decimal(status?.wager || 0).eq(0)) return 0;
    const a = Decimal(match?.balance || 0).div(status?.claim_max || 1).toNumber();
    return Math.min(1, a);
  }, [match, status]);

  // TODO: 是否需要数据定时更新，虽然每次进入页面都会重新拉数据，还是存在数据有延迟的可能性
  // wager / wager_require - 注意超范围1
  const progress2 = useMemo(() => {
    const a = Decimal(status?.wager || 0);
    const b = Decimal(status?.wager_require || 0);
    if (a.eq(0) || b.eq(0)) return 0;
    const c = a.div(b).toNumber();
    return Math.min(1, c);
  }, [status]);

  const currency_fiat = user?.currency_fiat || "USD";

  /**
   * 奖金提取
   * @currency: 用户提取奖励的时候选择的要将bonus转换为哪个法币提取到钱包，和用户的结算法币设置无关
   */
  const handle = useCallback(async (currency: string) => {
    setBonusPending(true);
    setTriggerClaim(false); // 重置数据：下次还能打开提取收益窗口

    try {
      const response = await authService.claimBonusWallet(status?.id, currency);

      if (response.code === 0 || response.code === 200) {
        void bonusWalletRefetch(); // 更新彩金钱包信息
        void refetchBonusLatest();
        void switchBonusCurrencyToOther(); // 切换彩金币种为其他结算币种

        toast.success(t("toast:bonusClaimedSuccessfully"), { duration: 3_000 }); // 奖励提取成功

        await sleep(3000);

        void navigate({
          to: "/casino",
          search: {
            openLogin: undefined,
            openSignUp: undefined,
            redirect: undefined,
            startapp: undefined,
            openFinance: undefined
          }
        });
      } else {
        toast.error(t("toast:claimBonusFailed")); // 奖励提取失败
      }
    } catch (err) { // 接口异常
      toast.error(t("toast:claimBonusFailed")); // 奖励提取失败
    } finally {
      setBonusPending(false);
    }
  }, [status?.id, switchBonusCurrencyToOther]);

  return <div className={"p-4 rounded-lg bg-base-300 flex flex-col gap-4 border-2 border-base-100"}>
    <div className={"flex flex-col gap-4 text-sm font-bold"}>
      {/* Bonus Balance */}
      <div className={"flex flex-col gap-2"}>
        <div
          className={clsx("flex items-center justify-between text-base-content/60 text-xs", { "text-primary": status?.status === BonusDollarsState.pending_collection })}>
          <div className={"flex items-center gap-2 "}>
            {t("bonus:bo_balance")}
            <div
              className={"tooltip tooltip-right before:shadow-2xl before:text-left before:text-[12px] before:w-[200px] before:font-normal tooltip-primary"}
              data-tip={t("bonus:tracks_claim")}>
              <AlertCircle
                className={"w-4 h-4 text-base-content/60"} /></div>
          </div>

          <InnerContentVisible
            show={!status || BonusNotAvailable.has(status?.status) || BonusWaitingActive.has(status?.status)}>
            <span>0.00</span>
          </InnerContentVisible>

          {/* 达到领取标准 & 进度未100% */}
          <InnerContentVisible
            show={BonusInProgress.has(status?.status) && progress1 < 1}>
            <div className={"flex flex-col"}>
              <span className={"flex items-center justify-end"}>
              {status?.status === BonusDollarsState.pending_collection && <motion.div
                animate={{ rotate: [0, -10, 10, -6, 6, 0], x: [0, -1, 1, -0.5, 0.5, 0] }}
                transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
              >
                <Zap className="w-4 h-4" />
              </motion.div>}
                {formatCurrency({
                  amount: convertCurrency({
                    amount: match?.balance || 0,
                    fromCurrency: "USDT",
                    toCurrency: currency_fiat,
                    exchangeRates
                  }),
                  currency: currency_fiat,
                  showSymbol: true, showCode: false
                }).formatted
                }{" "}/{" "}{formatCurrency({
                amount: convertCurrency({
                  amount: status?.claim_max || 0,
                  fromCurrency: "USDT",
                  toCurrency: currency_fiat,
                  exchangeRates
                }),
                currency: currency_fiat,
                showSymbol: true, showCode: false
              }).formatted
              }
            </span><span
              className={"text-[10px] text-base-content/35 flex items-center justify-end"}>{t("bonus:bonus")} / {t("bonus:maxClaim")}</span>
            </div>
          </InnerContentVisible>

          {/* 达到领取标准 & 进度已100% */}
          <InnerContentVisible
            show={BonusInProgress.has(status?.status) && progress1 >= 1}>
            <div className={"flex flex-col"}>
            <span className={"flex items-center justify-end"}>
              <Zap className={"w-4 h-4"} />
              {formatCurrency({
                amount: convertCurrency({
                  amount: Decimal.min(match?.balance || 0, status?.claim_max || 0).toString(),
                  fromCurrency: "USDT",
                  toCurrency: currency_fiat,
                  exchangeRates
                }),
                currency: currency_fiat,
                showSymbol: true, showCode: false
              }).formatted
              }
            </span>
              <span
                className={"text-[10px] text-base-content/35 flex items-center justify-end"}>{t("bonus:bonus")}</span>
            </div>
          </InnerContentVisible>
        </div>

        <InnerProgress
          className={clsx("progress progress-warning w-full", { "!progress-primary": [BonusDollarsState.pending_collection].includes(status?.status) })}
          value={progress1}
          max={1}
        />
      </div>

      {/* Wagering */}
      <div className={"flex flex-col gap-2"}>
        <div className={clsx("flex items-center justify-between text-base-content/60 text-xs")}>
          <div
            className={clsx("flex items-center gap-2", { "text-primary": progress2 >= 1 })}>
            {t("bonus:wagering")}
            <div
              className={"tooltip tooltip-right before:shadow-2xl before:text-left before:text-[12px] before:w-[200px] before:font-normal tooltip-primary"}
              data-tip={t("bonus:progress_playthrough")}>
              <AlertCircle
                className={"w-4 h-4 text-base-content/60"} /></div>
          </div>

          <InnerContentVisible show={!status || [BonusDollarsState.claimed].includes(status?.status)}>
            <span>0.00</span>
          </InnerContentVisible>

          <InnerContentVisible show={[0, 1, 2].includes(status?.status)}>
            <span className={"flex items-center gap-1"}>
              {formatCurrency({
                amount: convertCurrency({
                  amount: status?.wager || 0,
                  fromCurrency: "USDT",
                  toCurrency: currency_fiat,
                  exchangeRates
                }),
                currency: currency_fiat,
                showSymbol: true, showCode: false
              }).formatted
              }{" "}/{" "}{formatCurrency({
              amount: convertCurrency({
                amount: status?.wager_require || 0,
                fromCurrency: "USDT",
                toCurrency: currency_fiat,
                exchangeRates
              }),
              currency: currency_fiat,
              showSymbol: true, showCode: false
            }).formatted
            }
            </span>
          </InnerContentVisible>

          <InnerContentVisible show={progress2 >= 1}>
            <span className={"text-primary"}>{t("bonus:completed")}</span>
          </InnerContentVisible>
        </div>
        <InnerProgress
          className={clsx("progress progress-warning w-full", { "!progress-primary": [BonusDollarsState.pending_collection].includes(status?.status) })}
          value={progress2}
          max={1}
        />
      </div>
    </div>

    {/* 按钮操作 - 活动正在启动中 */}
    <InnerContentVisible show={BonusWaitingActive.has(status?.status)}>
      <InnerConfirmBox className="btn-soft" loading={true}>
        {t("bonus:bonus")} {t("bonus:pending")}
      </InnerConfirmBox>
    </InnerContentVisible>

    {/* 按钮操作 - 活动不可用 除了状态还要附加是否过期 */}
    <InnerContentVisible show={!status || BonusNotAvailable.has(status?.status) || bonusExpired}>
      <InnerConfirmBox className="btn-soft"><Lock
        className={"w-4 h-4"} />{t("bonus:activity_unavailable")}</InnerConfirmBox>
    </InnerContentVisible>

    {/* 按钮操作 - 跳转游戏列表 - 除了状态还要附加是否过期 */}
    <InnerContentVisible show={[BonusDollarsState.in_progress].includes(status?.status) && !bonusExpired}>
      <InnerConfirmBox
        className="btn-soft"
        onClick={() => navigate({
          to: "/explore", search: {
            type: "casino",
            category: "bonus"
          }
        })}><Lock
        className={"w-4 h-4"} />{t("bonus:play_to_claim")}</InnerConfirmBox>
    </InnerContentVisible>

    {/* 按钮操作 - 提取奖励 Claim - 除了状态还要附加是否过期 */}
    <InnerContentVisible
      show={[BonusDollarsState.pending_collection].includes(status?.status) && !bonusExpired && Decimal(match?.balance || 0).gte(status?.claim_min || 0)}>
      <InnerConfirmBox onClick={() => setTriggerClaim(true)} loading={bonusPending}>
        {t("bonus:claim")}{" "}
        {formatCurrency({
          amount: convertCurrency({
            amount: Decimal.min(match?.balance || 0, status?.claim_max || 0).toString(),
            fromCurrency: "USDT",
            toCurrency: currency_fiat,
            exchangeRates
          }),
          currency: currency_fiat,
          showSymbol: true, showCode: false
        }).formatted
        }</InnerConfirmBox>
    </InnerContentVisible>

    {/* 按钮操作 - 提取奖励 Claim - amount 小于 claim_min - 不可领取 - 除了状态还要附加是否过期 */}
    <InnerContentVisible
      show={[BonusDollarsState.pending_collection].includes(status?.status) && !bonusExpired && Decimal(match?.balance || 0).lt(status?.claim_min || 0)}>
      <InnerConfirmBox sample>{t("bonus:min_claim")}:{" "}
        {formatCurrency({
          amount: convertCurrency({
            amount: status?.claim_min || 0,
            fromCurrency: "USDT",
            toCurrency: currency_fiat,
            exchangeRates
          }),
          currency: currency_fiat,
          showSymbol: true, showCode: false
        }).formatted
        }</InnerConfirmBox>
    </InnerContentVisible>

    {/* 按钮操作 - 已提取奖励 Claimed */}
    <InnerContentVisible show={[BonusDollarsState.claimed].includes(status?.status)}>
      <InnerConfirmBox sample>{t("bonus:claimed")}{" "}
        {formatCurrency({
          amount: convertCurrency({
            amount: Decimal.min(match?.balance || 0, status?.claim_max || 0).toString(),
            fromCurrency: "USDT",
            toCurrency: currency_fiat,
            exchangeRates
          }),
          currency: currency_fiat,
          showSymbol: true, showCode: false
        }).formatted
        }
      </InnerConfirmBox>
    </InnerContentVisible>

    {/* 活动倒计时 */}
    <InnerContentVisible show={[BonusDollarsState.in_progress].includes(status?.status)}>
      <div className={"flex gap-1 text-[10px] justify-center text-base-content/60 font-bold"}>
        {t("bonus:bonus_ends_in")}:{" "}<CountdownTimer
        onFinished={(v) => v && setBonusExpired(true)}
        expireTime={status?.expired_at} />
      </div>
    </InnerContentVisible>

    {/* 奖励领取和转换 */}
    <BonusClaimModal
      bonus={Decimal.min(match?.balance || 0, status?.claim_max || 0).toString()} open={triggerClaim}
      onClick={handle}
      onClose={() => setTriggerClaim(false)} />
  </div>;
};

export const InnerBonusLatest = (
  {
    currency
  }: {
    currency: "SPORT" | "BONUS"
  }) => {
  const { t } = useTranslation();

  const { user } = useAuth();

  // 彩金最终操作记录
  const { data: bonusLatest } = useUserBonusLatestHistory();

  // 用户余额数据
  const { data: userBalance = [] } = useUserBalance();

  // 币种转换辅助
  const { formatCurrency, convertCurrency, exchangeRates } = useCurrencyData();

  // 匹配币种信息，余额 icon 精度 等
  const match = userBalance?.find((token: { currency: string; }) => token?.currency === currency);

  // 匹配彩金币种状态信息 打码的数据 奖励的数据等
  const status = bonusLatest?.data;

  // 余额5s更新一次，进度条会更新
  // balance / claim_max  - 注意超范围1
  const progress1 = useMemo(() => {
    if (Decimal(status?.wager || 0).eq(0)) return 0;
    const a = Decimal(match?.balance || 0).div(status?.claim_max || 1).toNumber();
    return Math.min(1, a);
  }, [match, status]);

  // TODO: 是否需要数据定时更新，虽然每次进入页面都会重新拉数据，还是存在数据有延迟的可能性
  // wager / wager_require - 注意超范围1
  const progress2 = useMemo(() => {
    const a = Decimal(status?.wager || 0);
    const b = Decimal(status?.wager_require || 0);
    if (a.eq(0) || b.eq(0)) return 0;
    const c = a.div(b).toNumber();
    return Math.min(1, c);
  }, [status]);

  const currency_fiat = user?.currency_fiat || "USD";

  return <div className={"p-4 rounded-lg bg-base-300 flex flex-col gap-4 border-2 border-base-100"}>
    <div className={"flex flex-col gap-4 text-sm font-bold"}>
      {/* Bonus Balance */}
      <div className={"flex flex-col gap-2"}>
        <div
          className={clsx("flex items-center justify-between text-base-content/60 text-xs")}>
          <div className={"flex items-center gap-2 "}>
            {t("bonus:bo_balance")}
            <div
              className={"tooltip tooltip-right before:shadow-2xl before:text-left before:text-[12px] before:w-[200px] before:font-normal tooltip-primary"}
              data-tip={t("bonus:tracks_claim")}>
              <AlertCircle
                className={"w-4 h-4 text-base-content/60"} /></div>
          </div>

          <div className={"flex flex-col"}>
              <span className={"flex items-center justify-end"}>
                {formatCurrency({
                  amount: convertCurrency({
                    amount: match?.balance || 0,
                    fromCurrency: "USDT",
                    toCurrency: currency_fiat,
                    exchangeRates
                  }),
                  currency: currency_fiat,
                  showSymbol: true, showCode: false
                }).formatted
                }{" "}/{" "}{formatCurrency({
                amount: convertCurrency({
                  amount: status?.claim_max || 0,
                  fromCurrency: "USDT",
                  toCurrency: currency_fiat,
                  exchangeRates
                }),
                currency: currency_fiat,
                showSymbol: true, showCode: false
              }).formatted
              }
            </span>
            <span className={"text-[10px] text-base-content/35"}>{t("bonus:bonus")} / {t("bonus:maxClaim")}</span>
          </div>
        </div>

        <InnerProgress
          className={clsx("progress progress-warning w-full")}
          value={progress1}
          max={1}
        />
      </div>

      {/* Wagering */}
      <div className={"flex flex-col gap-2"}>
        <div className={clsx("flex items-center justify-between text-base-content/60 text-xs")}>
          <div
            className={clsx("flex items-center gap-2")}>
            {t("bonus:wagering")}
            <div
              className={"tooltip tooltip-right before:shadow-2xl before:text-left before:text-[12px] before:w-[200px] before:font-normal tooltip-primary"}
              data-tip={t("bonus:progress_playthrough")}>
              <AlertCircle
                className={"w-4 h-4 text-base-content/60"} /></div>
          </div>

          <span className={"flex items-center gap-1"}>
              {formatCurrency({
                amount: convertCurrency({
                  amount: status?.wager || 0,
                  fromCurrency: "USDT",
                  toCurrency: currency_fiat,
                  exchangeRates
                }),
                currency: currency_fiat,
                showSymbol: true, showCode: false
              }).formatted
              }{" "}/{" "}{formatCurrency({
            amount: convertCurrency({
              amount: status?.wager_require || 0,
              fromCurrency: "USDT",
              toCurrency: currency_fiat,
              exchangeRates
            }),
            currency: currency_fiat,
            showSymbol: true, showCode: false
          }).formatted
          }
            </span>
        </div>
        <InnerProgress
          className={clsx("progress progress-primary w-full")}
          value={progress2}
          max={1}
        />
      </div>
    </div>

    <InnerConfirmBox className="btn-soft">
      {t(`bonus:bonus_${BonusDollarsState[status?.status]}`)}
    </InnerConfirmBox>
  </div>;
};

export const InnerConfirmBox = (
  {
    sample,
    loading,
    onClick,
    children,
    className,
    ...props
  }: ComponentProps<"button"> & {
    sample?: boolean;
    loading?: boolean;
  }) => {
  return (
    sample
      ? <div
        className={"bg-primary text-sm font-bold text-primary-content px-4 py-2.5 rounded-lg flex items-center justify-center"}>{children}</div>
      : <button
        {...props}
        className={clsx(`truncate btn btn-primary btn-md flex items-center justify-center w-full font-bold`, className)}
        onClick={(e) => !loading && onClick?.(e)}
      >
        {children}
        {loading && <span className="loading loading-spinner loading-xs" />}
      </button>
  );
};

// 活动有特殊的描述兼容
const bonus_rules_desc = (key: TBonus | number | undefined) => {
  const isFree = key === "free_bonus" || key === BONUS_WALLET_INFO_MAP["free_bonus"];

  const baseRules = [
    {
      id: 0,
      title: "bonus:bonus_rules_desc.r0.title",
      desc: "bonus:bonus_rules_desc.r0.desc"
    },
    {
      id: 1,
      title: "bonus:bonus_rules_desc.r1.title",
      desc: "bonus:bonus_rules_desc.r1.desc"
    },
    isFree
      ? {
        id: 9,
        title: "bonus:bonus_rules_desc.r2.title",
        desc: "bonus:bonus_rules_desc.r2.desc"
      }
      : {
        id: 2,
        title: "bonus:bonus_rules_desc.r9.title",
        desc: "bonus:bonus_rules_desc.r9.desc"
      },
    isFree
      ? {
        id: 3,
        title: "bonus:bonus_rules_desc.r3.title",
        desc: "bonus:bonus_rules_desc.r3.desc"
      }
      : {
        id: 10,
        title: "bonus:bonus_rules_desc.r10.title",
        desc: "bonus:bonus_rules_desc.r10.desc"
      }
  ];

  const commonRules = [
    {
      id: 4,
      title: "bonus:bonus_rules_desc.r4.title",
      desc: "bonus:bonus_rules_desc.r4.desc"
    },
    {
      id: 5,
      title: "bonus:bonus_rules_desc.r5.title",
      desc: "bonus:bonus_rules_desc.r5.desc"
    },
    {
      id: 6,
      title: "bonus:bonus_rules_desc.r6.title",
      desc: "bonus:bonus_rules_desc.r6.desc"
    },
    {
      id: 7,
      title: "bonus:bonus_rules_desc.r7.title",
      desc: "bonus:bonus_rules_desc.r7.desc"
    },
    {
      id: 8,
      title: "bonus:bonus_rules_desc.r8.title",
      desc: "bonus:bonus_rules_desc.r8.desc"
    }
  ];

  return [...baseRules, ...commonRules];
};

type TView = `view_${number}`;

export const InnerDescription = (
  {
    hideId,
    bonusKey,
    currency,
    className
  }: {
    hideId?: number
    bonusKey?: TBonus
    currency: "SPORT" | "BONUS",
    className?: string
  }) => {
  const { t } = useTranslation();

  const { user } = useAuth();

  // 彩金活动配置列表
  const { data: bonusConfig } = useBonusConfigList();

  // 币种转换辅助
  const { formatCurrency, convertCurrency, exchangeRates } = useCurrencyData();

  const match = (bonusConfig?.data ?? []).find((bonus: Record<string, any>) => bonus.name?.includes(bonusKey));

  const parsed = parser((bonusConfig?.data ?? []).find((bonus: Record<string, any>) => bonus.name?.includes(bonusKey))?.extra_data);

  const [statement, setStatement] = useState<{
    [key: TView]: boolean;
  } | null>(null);

  const currency_fiat = user?.currency_fiat || "USD";

  const handle = useCallback((rules: Record<string, any>) => {
    setStatement((v) => ({
      ...v,
      ["view_" + rules.id]: !v?.[("view_" + rules.id) as TView]
    }));
  }, []);

  return <section className={clsx("flex flex-col gap-4 p-5 pt-0", className)}>
    <div className={"flex flex-col gap-2"}>
      <h3 className={"text-white font-bold mb-1 text-sm"}>{t("bonus:frequently_asked")}</h3>
      {bonus_rules_desc(bonusKey).map((rule) => {
        if (hideId === rule.id) return null;
        return (
          <InnerDescriptionItem
            id={match?.id}
            key={rule.id}
            desc={rule.desc}
            title={rule.title}
            ruleId={rule.id}
            values={{
              min: Number(parsed?.claim_min_value) >= 0 ? formatCurrency({
                amount: convertCurrency({
                  amount: parsed?.claim_min_value || 0,
                  fromCurrency: "USDT",
                  toCurrency: currency_fiat,
                  exchangeRates
                }),
                currency: currency_fiat,
                showSymbol: true, showCode: false
              }).formatted : "",
              max: Number(parsed?.claim_max_value) >= 0 ? formatCurrency({
                amount: convertCurrency({
                  amount: parsed?.claim_max_value || 0,
                  fromCurrency: "USDT",
                  toCurrency: currency_fiat,
                  exchangeRates
                }),
                currency: currency_fiat,
                showSymbol: true, showCode: false
              }).formatted : "",
              currency: currency
            }}
            handle={() => handle(rule)}
            statement={statement}
          />);
      })}
      <div className="h-3" />
    </div>
  </section>;
};

export const InnerDescriptionItem = (
  {
    id,
    desc,
    title,
    values,
    ruleId
  }: {
    id: string,
    desc: ReactNode,
    title: ReactNode,
    ruleId: number;
    values: Record<string, any>
    handle: () => void,
    statement: Record<string, any> | null,
  }) => {
  const { t } = useTranslation();

  return <details
    className="cursor-pointer group collapse text-[12px] bg-base-200 !rounded-xl p-4 text-base-content/50">
    <summary className="list-none select-none">
      <h4 className={"font-bold flex items-center justify-between gap-4"}>
        {t(title as string)}
        <div className="btn btn-soft btn-square btn-primary btn-sm">
          <ChevronRight
            className="w-3 h-3 transition-transform duration-200 group-open:rotate-90"
            strokeWidth={3}
          />
        </div>
      </h4>
    </summary>
    <div className={"collapse-content p-0 mt-2 font-normal"}>
      <Trans
        i18nKey={desc as string}
        values={values}
        components={[<span className={"text-primary"} />, <span className={"text-primary"} />]}
      />

      <InnerGiveUpBonus id={id} ruleId={ruleId} />
    </div>
  </details>;
};

export const InnerProgress = styled.progress`height: 6px;
    background-image: repeating-linear-gradient(135deg, var(--color-base-400) 0 5px, color-mix(in oklch, var(--color-primary) 5%, transparent) 5px 10px)`;

export const InnerUnavailable = () => {
  const { t } = useTranslation();

  return (
    <div
      className="uppercase text-primary skeleton rounded-xl h-[76px] bg-base-200 flex items-center justify-center font-extrabold">
      {t("bonus:activity_unavailable")}
    </div>);
};

export const InnerDataSkeleton = () => {
  return (<div className="skeleton h-30 bg-base-200" />);
};

const InnerGiveUpBonus = ({ ruleId }: { id: string, ruleId: number }) => {
  const setSyncAction = useBoundStore((state) => state.setSyncAction);

  const { t } = useTranslation();

  // 彩金钱包数据
  const { data: bonusWallet } = useBonusWallet();

  // 匹配彩金币种状态信息 打码的数据 奖励的数据等
  const status = bonusWallet?.data;

  return <InnerDisplayContent show={ruleId === 0 && BonusInProgress.has(status?.status)}>
    <ConfirmBox className={"btn-outline flex w-full mt-4"} onClick={() => {
      setSyncAction("OPEN_GIVE_UP_BONUS_MODAL", { id: status?.id });
    }}>{t("bonus:giveUp")}</ConfirmBox>
  </InnerDisplayContent>;
};