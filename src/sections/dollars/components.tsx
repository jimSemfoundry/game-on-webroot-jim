import styled from "styled-components";
import { ComponentProps, CSSProperties, useCallback, useMemo, useState } from "react";
import clsx from "clsx";
import { Trans, useTranslation } from "react-i18next";
import { AlertCircle, ArrowRight, ChevronRight, Lock, X, Zap } from "lucide-react";
import { Decimal } from "decimal.js";
import { BonusClaimModal } from "@/sections/dollars/bonus-claim-modal.tsx";
import { toast } from "sonner";
import { m as motion } from "motion/react";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useUserBonusWallet } from "@/query/dollars.ts";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import {
  useUserBalance
} from "@/hooks/api/useAuth.ts";
import { InnerContentVisible } from "@/components/header/message-v2/c/InnerComponents.tsx";
import { authService } from "@/services/authService.ts";
import { CountdownTimer } from "@/sections/dollars/CountdownTimer.tsx";
import { useNavigate } from "@tanstack/react-router";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { parser } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";
import { Alert } from "@/components/icons/Alert.tsx";
import { useBoundStore } from "@/store";
import { sleep } from "@/components/socialLogin/helper.ts";
import { PropsWithChildren, ReactNode } from "react";
import { Store } from "@/components/icons/Store.tsx";
import { LockKeyhole } from "lucide-react";
import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext.tsx";

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

export const InnerBonusContainer = styled.div`
    background: url('/images/dollars/bonus-store.png') no-repeat;
    background-position: right 20px top 12px;
    position: relative;
`;

export const InnerSportsContainer = styled.div`
    background: url('/images/dollars/bonus-sport.png') no-repeat;
    background-position: right 20px top 12px;
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

export const InnerBonusSlogan = ({title}:{title: string}) => {
  return <h3 className={"pl-3 font-extrabold text-[18px] text-base-content leading-5 whitespace-pre-line uppercase"}>
    {title}
  </h3>;
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

  const { updateSettlementCurrency } = useSettlementCurrency();

  // 彩金钱包数据
  const { data: bonusWallet, refetch: bonusWalletRefetch } = useUserBonusWallet();

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
  }, [
    userBalance,
    bonusWallet?.data?.wager,
    bonusWallet?.data?.claim_max
  ]);

  // TODO: 是否需要数据定时更新，虽然每次进入页面都会重新拉数据，还是存在数据有延迟的可能性
  // wager / wager_require - 注意超范围1
  const progress2 = useMemo(() => {
    const a = Decimal(status?.wager || 0);
    const b = Decimal(status?.wager_require || 0);
    if (a.eq(0) || b.eq(0)) return 0;
    const c = a.div(b).toNumber();
    return Math.min(1, c);
  }, [status?.wager, status?.wager_require]);

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

        // 切换彩金币种为其他结算币种
        const targetCurrency = await authService.getCurrencyOtherThanBonusCoin();
        if (targetCurrency?.data?.currency) {
          console.info(`Switch the invalid bonus currency to = ${targetCurrency?.data?.currency}`);
          void updateSettlementCurrency(targetCurrency?.data?.currency);
        }
      } else {
        toast.error(t("toast:claimBonusFailed")); // 奖励提取失败
      }
    } catch (err) { // 接口异常
      toast.error(t("toast:claimBonusFailed")); // 奖励提取失败
    } finally {
      setBonusPending(false);
    }
  }, [status?.id]);

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

      {/* 最小提款金额显示 */}
      <InnerContentVisible
        show={Decimal(status?.claim_min || 0).gt(0)}>
        <div className={clsx("flex items-center justify-between text-base-content/60 text-xs")}>
          <div>{t("bonus:withdrawal")}</div>

          <span>
            {formatCurrency({
              amount: convertCurrency({
                amount: status?.claim_min || 0,
                fromCurrency: "USDT",
                toCurrency: currency_fiat,
                exchangeRates
              }),
              currency: currency_fiat,
              showSymbol: true, showCode: false
            }).formatted}
          </span>
        </div>
      </InnerContentVisible>
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
      <div className={"flex gap-1 text-[11px] justify-center text-base-content/60 font-bold"}>
        {t("bonus:bonus_ends_in")}:{" "}<CountdownTimer
        onFinished={(v) => v && setBonusExpired(true)}
        expireTime={status?.expired_at} />
      </div>
    </InnerContentVisible>

    {/* 历史记录链接 */}
    <InnerHistoryLink />

    {/* 奖励领取和转换 */}
    <BonusClaimModal
      bonus={Decimal.min(match?.balance || 0, status?.claim_max || 0).toString()} open={triggerClaim}
      onClick={handle}
      onClose={() => setTriggerClaim(false)} />
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
        className={"bg-primary text-sm font-bold text-primary-content px-4 py-2.5 flex items-center justify-center"}>{children}</div>
      : <button
        {...props}
        className={clsx(` truncate btn btn-primary btn-md flex items-center justify-center w-full font-bold`, className)}
        onClick={(e) => !loading && onClick?.(e)}
      >
        {children}
        {loading && <span className="loading loading-spinner loading-xs" />}
      </button>
  );
};

// 活动有特殊的描述兼容
const bonus_rules_desc = (key: string) => {
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
    key
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
    key
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
      id: 11,
      title: "bonus:bonus_rules_desc.r11.title",
      desc: "bonus:bonus_rules_desc.r11.desc"
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
    data,
    hideId,
    currency,
    className
  }: {
    data: Record<string, any>
    hideId?: number
    currency: "SPORT" | "BONUS",
    className?: string
  }) => {
  const { t } = useTranslation();

  const { user } = useAuth();

  // 币种转换辅助
  const { formatCurrency, convertCurrency, exchangeRates } = useCurrencyData();

  const [statement, setStatement] = useState<{
    [key: TView]: boolean;
  } | null>(null);

  const parsed_data = parser(data?.extra_data);

  const currency_fiat = user?.currency_fiat || "USD";

  const handle = useCallback((rules: Record<string, any>) => {
    setStatement((v) => ({
      ...v,
      ["view_" + rules.id]: !v?.[("view_" + rules.id) as TView]
    }));
  }, []);

  return <section className={clsx("flex flex-col gap-4 p-5 pt-0", className)}>
    <div className={"flex flex-col gap-2"}>
      <div className={"mb-2"}>
        <h4 className={"font-bold flex items-center justify-between gap-4 mb-2"}>
          {t("common:common.challengeEverything")}
        </h4>
        <p className="text-base-content/50 text-xs">
          {t("bonus:bonus_rules_desc.mega")}
        </p>
      </div>

      {/* 是否可放弃彩金 */}
      <InnerGiveUpBonus />

      <h3 className={"text-base-content font-bold mb-1 text-sm"}>{t("bonus:frequently_asked")}</h3>
      {bonus_rules_desc(parsed_data?.type).map((rule) => {
        if (hideId === rule.id) return null;
        return (
          <InnerDescriptionItem
            key={rule.id}
            desc={rule.desc}
            title={rule.title}
            values={{
              min: Number(data?.claim_min) >= 0 ? formatCurrency({
                amount: convertCurrency({
                  amount: data?.claim_min || 0,
                  fromCurrency: "USDT",
                  toCurrency: currency_fiat,
                  exchangeRates
                }),
                currency: currency_fiat,
                showSymbol: true, showCode: false
              }).formatted : "",
              max: Number(data?.claim_max) >= 0 ? formatCurrency({
                amount: convertCurrency({
                  amount: data?.claim_max || 0,
                  fromCurrency: "USDT",
                  toCurrency: currency_fiat,
                  exchangeRates
                }),
                currency: currency_fiat,
                showSymbol: true, showCode: false
              }).formatted : "",
              amount: 0.1,
              currency: currency
            }}
            handle={() => handle(rule)}
            statement={statement}
          />);
      })}
    </div>
  </section>;
};

export const InnerDescriptionItem = (
  {
    desc,
    title,
    values,
  }: {
    desc: ReactNode,
    title: ReactNode,
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
    <div className={"whitespace-pre-line collapse-content p-0 mt-2 font-normal"}>
      <Trans
        i18nKey={desc as string}
        values={values}
        components={[<span className={"text-primary"} />, <span className={"text-primary"} />]}
      />
    </div>
  </details>;
};

export const InnerProgress = styled.progress`height: 6px;
    background-image: repeating-linear-gradient(135deg, var(--color-base-400) 0 5px, color-mix(in oklch, var(--color-primary) 5%, transparent) 5px 10px)`;

export const InnerUnavailable = () => {
  const { t } = useTranslation();

  return (
    <div
      className="uppercase text-primary skeleton rounded-xl h-[213px] bg-base-200 flex items-center justify-center font-extrabold">
      {t("bonus:activity_unavailable")}
    </div>);
};

const InnerGiveUpBonus = () => {
  const setSyncAction = useBoundStore((state) => state.setSyncAction);

  const { t } = useTranslation();

  // 彩金钱包数据
  const { data: bonusWallet } = useUserBonusWallet();

  // 用户余额数据
  const { data: userBalance = [] } = useUserBalance();

  // 匹配币种信息，余额 icon 精度 等
  const match = userBalance?.find((token: { currency: string; }) => token?.currency === "BONUS");

  // 匹配彩金币种状态信息 打码的数据 奖励的数据等
  const status = bonusWallet?.data;

  // 彩金余额小于 0.1 则可放弃
  const limit = Decimal(match?.balance || 0).lte(0.1);

  return <InnerDisplayContent show={BonusInProgress.has(status?.status) && limit}>
    <div className="px-5">
      <ConfirmBox className={"btn-soft flex w-full"} onClick={() => {
        // TODO: 放弃常规彩金
        setSyncAction("OPEN_GIVE_UP_BONUS_MODAL", { id: status?.id, kind: 'general' });
      }}>{t("bonus:giveUp")}</ConfirmBox>
    </div>
  </InnerDisplayContent>;
};

// TODO: 自定义轻量级toast提示模式
export const InnerToastCustom = (
  {
    tst,
    icon,
    title,
    style,
    subTitle,
    closeIcon,
    closeBtn = true,
    onConfirm
  }: {
    tst: any,
    icon: string,
    title: ReactNode,
    style?: CSSProperties,
    closeBtn: boolean
    closeIcon?: ReactNode,
    subTitle: ReactNode,
    onConfirm?: () => void
  }) => {
  return <div
    className="flex flex-col gap-4 rounded-xl bg-base-200 p-4 relative sm:min-w-[380px] border border-1 border-base-100"
    style={{ fontFamily: "var(--font-family)", ...style }}>

    <div className={clsx("flex items-center gap-4")}>
      {/* 主题图标 */}
      <img src={icon} className="h-12.5" alt="" />

      {/* 文本内容 大标题 小标题 */}
      <div className={"flex-1"}>
        <div
          className={clsx("font-extrabold text-md")}>
          {title}
        </div>
        <div
          className={clsx("mt-1 font-semibold text-[13px] leading-4 text-base-content/50 whitespace-pre-line")}>
          {subTitle}
        </div>
      </div>

      {/* 关闭按钮操作 */}
      {closeBtn && <button
        className={"btn btn-square bg-base-300 btn-sm rtl:left-4 right-4"}
        onClick={() => {
          toast.dismiss(tst);
          // 你的逻辑
          onConfirm?.();
        }}>
        {closeIcon || <X size={16} />}
      </button>}
    </div>
  </div>;
};

// 历史记录链接
export const InnerHistoryLink = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  return <div className={"flex justify-center"}>
    <div
      className={"inline-flex items-center justify-center gap-1 font-semibold text-xs cursor-pointer underline text-base-content/50"}
      onClick={() => void navigate({ to: "/dollars/bonus/history" })}>
      {t("common:common.history")}<ArrowRight className={"w-4 h-4"} />
    </div>
  </div>;
};

export const InnerLabel = ({ title, subTitle, className }: { title: string, subTitle: string, className?: string }) => {
  return <div className={clsx("bg-base-200 rounded-field p-3", className)}>
    <p className="text-xs text-base-content/50 mb-1 font-bold">{title}</p>
    <p className="text-sm font-extrabold text-primary">{subTitle}</p>
  </div>;
};

export const InnerHeader = () => {
  const { t } = useTranslation();
  return <div className="flex items-center gap-2">
    <Store className="w-5 h-5 text-primary" />
    <span className="text-md font-bold">{t("bonus:bonusStore")}</span>
  </div>;
};

export const InnerOption = ({ icon, time, rate, children, checked: _checked, onClick, onChecked, multiplier }: {
  icon: string
  time: number,
  name: string,
  rate: string,
  checked?: boolean,
  children?: ReactNode,
  onClick?: () => void,
  onChecked?: (checked: boolean) => void,
  multiplier: string
}) => {
  const [uncontrolledChecked, setUncontrolledChecked] = useState<boolean>(false);

  const isControlled = _checked != null;
  const checked = _checked ?? uncontrolledChecked;

  const setChecked = (next: boolean) => {
    if (!isControlled) setUncontrolledChecked(next);
    onChecked?.(next);
  };

  return <InnerTimeCheck time={time}>
    <div
      className={clsx("bg-base-200 rounded-field py-2 pl-3 cursor-pointer border border-1 border-base-200", { "border-primary": checked })}
      onClick={() => {
        setChecked(!checked);
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {children}
          <InnerBonusItem src={icon} rate={rate} />
        </div>

        <div>
          {/* 奖励比例 */}
          <span className={"rounded-md bg-primary/10 py-1 px-2 text-xs font-bold text-primary"}>x{multiplier}</span>

          {/* 活动详情 */}
          <button
            className={"btn btn-square bg-transparent border-none"}
            onClick={(e) => {
              e?.stopPropagation();
              onClick?.();
              return false;
            }}>
            <Alert />
          </button>
        </div>
      </div>
    </div>
  </InnerTimeCheck>;
};

// 活动倒计时
const InnerTimeCheck = (props: PropsWithChildren<{ time: number }>) => {
  const [bonusExpired, setBonusExpired] = useState<boolean>(false);

  // 限购期间禁止操作
  const locked = new Date().getTime() < ((props.time || 0) * 1000) && !bonusExpired;

  // 限购期间禁止操作
  const preventWhenLocked = (e: {
    preventDefault: () => void;
    stopPropagation: () => void;
  }) => {
    if (!locked) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return <div
    className="relative rounded-field overflow-hidden"
    onPointerDownCapture={preventWhenLocked}
    onClickCapture={preventWhenLocked}
    onKeyDownCapture={preventWhenLocked}
  >
    {locked &&
      <div className="absolute inset-0 bg-base-200/60 w-full h-full flex items-center justify-center">
        <div
          className={"inline-flex gap-1 text-[12px] justify-center text-base-content font-bold bg-base-400 rounded-field px-3 py-2"}>
          <LockKeyhole className={"w-4 h-4 text-warning"} />
          <CountdownTimer
            onFinished={(v) => v && setBonusExpired(true)}
            expireTime={props.time} />
        </div>
      </div>}
    <div className={clsx({ "pointer-events-none": locked })}>
      {props.children}
    </div>
  </div>;
};

export const InnerBonusItem = ({ src = '/images/dollars/bonus.png', rate, className }: { src?: string, rate: string, className?: string }) => {
  const { t } = useTranslation();

  return <div className={clsx("flex flex-col gap-1", className)}>
    <div className="flex items-center gap-2 font-bold text-sm">
      <img src={src} alt="" className={"w-5 h-5"} />
      +{rate}
    </div>
    <div className="text-[12px] font-bold text-primary leading-4">
      {t("bonus:extraBonusGet", { value: rate })}
    </div>
  </div>;
};

export enum EBonus {
  TOKEN = "BONUS",
  BONUS_20 = "20_bonus",
  BONUS_25 = "25_bonus",
  BONUS_30 = "30_bonus",
  BONUS_180 = "180_bonus",
}

export enum ESport {
  TOKEN = "SPORT",
  BONUS_20 = "20_bonus",
  BONUS_25 = "25_bonus",
  BONUS_30 = "30_bonus",
  BONUS_180 = "180_bonus",
}

export const BONUS_ERROR_MAP: Record<number, string> = {
  51029: "bonus:bonusExists",
  51030: "bonus:notAllowed",
  51032: "finance:insufficient_balance",
  51034: "bonus:amountLow",
  51035: "bonus:amountHigh"
};