import clsx from "clsx";
import { Trans, useTranslation } from "react-i18next";
import { AlertCircle, ArrowRight, ChevronRight, Lock, Zap } from "lucide-react";
import { Decimal } from "decimal.js";
import { toast } from "sonner";
import { m as motion } from "motion/react";
import { useCallback, useMemo, useState, ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

import { useAuth } from "@/contexts/AuthContext.tsx";
import { useUserSportWallet } from "@/query/sports-bonus.ts";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useUserBalance } from "@/hooks/api/useAuth.ts";
import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext.tsx";
import { useBoundStore } from "@/store";
import { authService } from "@/services/authService.ts";
import { sleep } from "@/components/socialLogin/helper.ts";

import { InnerContentVisible } from "@/components/header/message-v2/c/InnerComponents.tsx";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { parser } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";
import { CountdownTimer } from "@/sections/dollars/CountdownTimer.tsx";

import {
  BonusDollarsState,
  BonusInProgress,
  BonusWaitingActive,
  BonusNotAvailable,
  InnerConfirmBox,
  InnerProgress, ESport
} from "@/sections/dollars/components.tsx";
import { SportsBonusClaimModal } from "@/sections/sports-bonus/sports-bonus-claim-modal.tsx";

// 体育彩金钱包 - 进度+操作区
export const InnerSportsPlayToClaim = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { updateSettlementCurrency } = useSettlementCurrency();

  const { data: sportsBonusWallet, refetch } = useUserSportWallet();
  const { data: userBalance = [] } = useUserBalance();
  const { formatCurrency, convertCurrency, exchangeRates } = useCurrencyData();

  const [triggerClaim, setTriggerClaim] = useState(false);
  const [bonusExpired, setBonusExpired] = useState(false);
  const [bonusPending, setBonusPending] = useState(false);

  // 余额信息（用 SPORT 作为余额币种）
  const match = userBalance?.find((token: { currency: string }) => token?.currency === ESport.TOKEN);
  const status = sportsBonusWallet?.data;

  const progress1 = useMemo(() => {
    if (Decimal(status?.wager || 0).eq(0)) return 0;
    const a = Decimal(match?.balance || 0).div(status?.claim_max || 1).toNumber();
    return Math.min(1, a);
  }, [userBalance, status?.wager, status?.claim_max]);

  const progress2 = useMemo(() => {
    const a = Decimal(status?.wager || 0);
    const b = Decimal(status?.wager_require || 0);
    if (a.eq(0) || b.eq(0)) return 0;
    return Math.min(1, a.div(b).toNumber());
  }, [status?.wager, status?.wager_require]);

  const currency_fiat = user?.currency_fiat || "USD";

  // 提取奖励
  const handle = useCallback(
    async (currency: string) => {
      setBonusPending(true);
      setTriggerClaim(false);
      try {
        const response = await authService.claimSportsBonusWallet(status?.id, currency);

        if (response.code === 0 || response.code === 200) {
          void refetch();
          toast.success(t("toast:bonusClaimedSuccessfully"), { duration: 3_000 });

          await sleep(3000);

          void navigate({
            to: "/sports",
            search: {
              openLogin: undefined,
              openSignUp: undefined,
              redirect: undefined,
              startapp: undefined,
              openFinance: undefined
            } as any
          });

          // 切换为非 SPORT 的结算币
          const currency = await authService.getCurrencyOtherThanBonusCoin();

          if (currency?.data?.currency) {
            void updateSettlementCurrency(currency?.data?.currency);
          }
        } else {
          toast.error(t("toast:claimBonusFailed"));
        }
      } catch {
        toast.error(t("toast:claimBonusFailed"));
      } finally {
        setBonusPending(false);
      }
    },
    [status?.id]
  );

  return (
    <div className="p-4 rounded-lg bg-base-300 flex flex-col gap-4 border-2 border-base-100">
      <div className="flex flex-col gap-4 text-sm font-bold">
        {/* Bonus Balance */}
        <div className="flex flex-col gap-2">
          <div
            className={clsx("flex items-center justify-between text-base-content/60 text-xs", {
              "text-primary": status?.status === BonusDollarsState.pending_collection
            })}
          >
            <div className="flex items-center gap-2">
              {t("bonus:bo_balance")}
              <div
                className="tooltip tooltip-right before:shadow-2xl before:text-left before:text-[12px] before:w-[200px] before:font-normal tooltip-primary"
                data-tip={t("bonus:tracks_claim")}
              >
                <AlertCircle className="w-4 h-4 text-base-content/60" />
              </div>
            </div>

            <InnerContentVisible
              show={!status || BonusNotAvailable.has(status?.status) || BonusWaitingActive.has(status?.status)}
            >
              <span>0.00</span>
            </InnerContentVisible>

            <InnerContentVisible show={BonusInProgress.has(status?.status) && progress1 < 1}>
              <div className="flex flex-col">
                <span className="flex items-center justify-end">
                  {status?.status === BonusDollarsState.pending_collection && (
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -6, 6, 0], x: [0, -1, 1, -0.5, 0.5, 0] }}
                      transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                    >
                      <Zap className="w-4 h-4" />
                    </motion.div>
                  )}
                  {
                    formatCurrency({
                      amount: convertCurrency({
                        amount: match?.balance || 0,
                        fromCurrency: "USDT",
                        toCurrency: currency_fiat,
                        exchangeRates
                      }),
                      currency: currency_fiat,
                      showSymbol: true,
                      showCode: false
                    }).formatted
                  }{" "}/{" "}
                  {
                    formatCurrency({
                      amount: convertCurrency({
                        amount: status?.claim_max || 0,
                        fromCurrency: "USDT",
                        toCurrency: currency_fiat,
                        exchangeRates
                      }),
                      currency: currency_fiat,
                      showSymbol: true,
                      showCode: false
                    }).formatted
                  }
                </span>
                <span className="text-[10px] text-base-content/35 flex items-center justify-end">
                  {t("bonus:bonus")} / {t("bonus:maxClaim")}
                </span>
              </div>
            </InnerContentVisible>

            <InnerContentVisible show={BonusInProgress.has(status?.status) && progress1 >= 1}>
              <div className="flex flex-col">
                <span className="flex items-center justify-end">
                  <Zap className="w-4 h-4" />
                  {
                    formatCurrency({
                      amount: convertCurrency({
                        amount: Decimal.min(match?.balance || 0, status?.claim_max || 0).toString(),
                        fromCurrency: "USDT",
                        toCurrency: currency_fiat,
                        exchangeRates
                      }),
                      currency: currency_fiat,
                      showSymbol: true,
                      showCode: false
                    }).formatted
                  }
                </span>
                <span className="text-[10px] text-base-content/35 flex items-center justify-end">
                  {t("bonus:bonus")}
                </span>
              </div>
            </InnerContentVisible>
          </div>

          <InnerProgress
            className={clsx("progress progress-warning w-full", {
              "!progress-primary": [BonusDollarsState.pending_collection].includes(status?.status)
            })}
            value={progress1}
            max={1}
          />
        </div>

        {/* Wagering */}
        <div className="flex flex-col gap-2">
          <div className={clsx("flex items-center justify-between text-base-content/60 text-xs")}>
            <div className={clsx("flex items-center gap-2", { "text-primary": progress2 >= 1 })}>
              {t("bonus:wagering")}
              <div
                className="tooltip tooltip-right before:shadow-2xl before:text-left before:text-[12px] before:w-[200px] before:font-normal tooltip-primary"
                data-tip={t("bonus:progress_playthrough")}
              >
                <AlertCircle className="w-4 h-4 text-base-content/60" />
              </div>
            </div>

            <InnerContentVisible show={!status || [BonusDollarsState.claimed].includes(status?.status)}>
              <span>0.00</span>
            </InnerContentVisible>

            <InnerContentVisible show={[0, 1, 2].includes(status?.status)}>
              <span className="flex items-center gap-1">
                {
                  formatCurrency({
                    amount: convertCurrency({
                      amount: status?.wager || 0,
                      fromCurrency: "USDT",
                      toCurrency: currency_fiat,
                      exchangeRates
                    }),
                    currency: currency_fiat,
                    showSymbol: true,
                    showCode: false
                  }).formatted
                }{" "}/{" "}
                {
                  formatCurrency({
                    amount: convertCurrency({
                      amount: status?.wager_require || 0,
                      fromCurrency: "USDT",
                      toCurrency: currency_fiat,
                      exchangeRates
                    }),
                    currency: currency_fiat,
                    showSymbol: true,
                    showCode: false
                  }).formatted
                }
              </span>
            </InnerContentVisible>

            <InnerContentVisible show={progress2 >= 1}>
              <span className="text-primary">{t("bonus:completed")}</span>
            </InnerContentVisible>
          </div>
          <InnerProgress
            className={clsx("progress progress-warning w-full", {
              "!progress-primary": [BonusDollarsState.pending_collection].includes(status?.status)
            })}
            value={progress2}
            max={1}
          />
        </div>
      </div>

      {/* 等待激活 */}
      <InnerContentVisible show={BonusWaitingActive.has(status?.status)}>
        <InnerConfirmBox className="btn-soft" loading={true}>
          {t("bonus:bonus")} {t("bonus:pending")}
        </InnerConfirmBox>
      </InnerContentVisible>

      {/* 不可用 */}
      <InnerContentVisible show={!status || BonusNotAvailable.has(status?.status) || bonusExpired}>
        <InnerConfirmBox className="btn-soft">
          <Lock className="w-4 h-4" />
          {t("bonus:activity_unavailable")}
        </InnerConfirmBox>
      </InnerContentVisible>

      {/* 跳转体育页 */}
      <InnerContentVisible
        show={[BonusDollarsState.in_progress].includes(status?.status) && !bonusExpired}
      >
        <InnerConfirmBox
          className="btn-soft"
          onClick={async () => {
            // TODO: 切换体育彩金币种
            try {
              await updateSettlementCurrency(ESport.TOKEN);

              void navigate({
                to: "/sports",
                search: {} as any
              });
            } catch (e) {
            }
          }}
        >
          <Lock className="w-4 h-4" />
          {t("bonus:play_to_claim")}
        </InnerConfirmBox>
      </InnerContentVisible>

      {/* 提取 */}
      <InnerContentVisible
        show={
          [BonusDollarsState.pending_collection].includes(status?.status) &&
          !bonusExpired &&
          Decimal(match?.balance || 0).gte(status?.claim_min || 0)
        }
      >
        <InnerConfirmBox onClick={() => setTriggerClaim(true)} loading={bonusPending}>
          {t("bonus:claim")}{" "}
          {
            formatCurrency({
              amount: convertCurrency({
                amount: Decimal.min(match?.balance || 0, status?.claim_max || 0).toString(),
                fromCurrency: "USDT",
                toCurrency: currency_fiat,
                exchangeRates
              }),
              currency: currency_fiat,
              showSymbol: true,
              showCode: false
            }).formatted
          }
        </InnerConfirmBox>
      </InnerContentVisible>

      {/* 不足领取门槛 */}
      <InnerContentVisible
        show={
          [BonusDollarsState.pending_collection].includes(status?.status) &&
          !bonusExpired &&
          Decimal(match?.balance || 0).lt(status?.claim_min || 0)
        }
      >
        <InnerConfirmBox sample>
          {t("bonus:min_claim")}:{" "}
          {
            formatCurrency({
              amount: convertCurrency({
                amount: status?.claim_min || 0,
                fromCurrency: "USDT",
                toCurrency: currency_fiat,
                exchangeRates
              }),
              currency: currency_fiat,
              showSymbol: true,
              showCode: false
            }).formatted
          }
        </InnerConfirmBox>
      </InnerContentVisible>

      {/* 已提取 */}
      <InnerContentVisible show={[BonusDollarsState.claimed].includes(status?.status)}>
        <InnerConfirmBox sample>
          {t("bonus:claimed")}{" "}
          {
            formatCurrency({
              amount: convertCurrency({
                amount: Decimal.min(match?.balance || 0, status?.claim_max || 0).toString(),
                fromCurrency: "USDT",
                toCurrency: currency_fiat,
                exchangeRates
              }),
              currency: currency_fiat,
              showSymbol: true,
              showCode: false
            }).formatted
          }
        </InnerConfirmBox>
      </InnerContentVisible>

      {/* 倒计时 */}
      <InnerContentVisible show={[BonusDollarsState.in_progress].includes(status?.status)}>
        <div className="flex gap-1 text-[11px] justify-center text-base-content/60 font-bold">
          {t("bonus:bonus_ends_in")}:{" "}
          <CountdownTimer
            onFinished={(v) => v && setBonusExpired(true)}
            expireTime={status?.expired_at}
          />
        </div>
      </InnerContentVisible>

      {/* 历史记录 */}
      <InnerSportsHistoryLink />

      {/* claim 弹窗 */}
      <SportsBonusClaimModal
        bonus={Decimal.min(match?.balance || 0, status?.claim_max || 0).toString()}
        open={triggerClaim}
        onClick={handle}
        onClose={() => setTriggerClaim(false)}
      />
    </div>
  );
};

// 跳转体育彩金的历史记录链接
export const InnerSportsHistoryLink = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="flex justify-center">
      <div
        className="inline-flex items-center justify-center gap-1 font-semibold text-xs cursor-pointer underline text-base-content/50"
        onClick={() => void navigate({ to: "/dollars/sports-bonus/history" as any })}
      >
        {t("common:common.history")}
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
};

// 描述区域 - 使用体育彩金专属 FAQ 文案
const sports_bonus_rules_desc = (hide: boolean) => {
  return [
    {
      id: 1,
      title: "sportsBonus:sportsBonusFaq.q1.title",
      desc: "sportsBonus:sportsBonusFaq.q1.body"
    },
    {
      id: 2,
      title: "sportsBonus:sportsBonusFaq.q2.title",
      desc: "sportsBonus:sportsBonusFaq.q2.body"
    },
    {
      id: 3,
      title: "sportsBonus:sportsBonusFaq.q3.title",
      desc: "sportsBonus:sportsBonusFaq.q3.body"
    },
    {
      id: 4,
      title: "sportsBonus:sportsBonusFaq.q4.title",
      desc: "sportsBonus:sportsBonusFaq.q4.body"
    },
    {
      id: 5,
      title: "sportsBonus:sportsBonusFaq.q5.title",
      desc: "sportsBonus:sportsBonusFaq.q5.body"
    },
    hide ? {
      id: 6,
      title: "sportsBonus:sportsBonusFaq.q6.title",
      desc: "sportsBonus:sportsBonusFaq.q6.body"
    } : {},
    {
      id: 7,
      title: "sportsBonus:sportsBonusFaq.q7.title",
      desc: "sportsBonus:sportsBonusFaq.q7.body"
    },
    {
      id: 8,
      title: "sportsBonus:sportsBonusFaq.q8.title",
      desc: "sportsBonus:sportsBonusFaq.q8.body"
    },
    {
      id: 9,
      title: "sportsBonus:sportsBonusFaq.q9.title",
      desc: "sportsBonus:sportsBonusFaq.q9.body"
    },
    {
      id: 10,
      title: "sportsBonus:sportsBonusFaq.q10.title",
      desc: "sportsBonus:sportsBonusFaq.q10.body"
    },
    {
      id: 11,
      title: "sportsBonus:sportsBonusFaq.q11.title",
      desc: "sportsBonus:sportsBonusFaq.q11.body"
    },
    {
      id: 12,
      title: "sportsBonus:sportsBonusFaq.q12.title",
      desc: "sportsBonus:sportsBonusFaq.q12.body"
    },
    {
      id: 13,
      title: "sportsBonus:sportsBonusFaq.q13.title",
      desc: "sportsBonus:sportsBonusFaq.q13.body"
    }
  ];
};

type TView = `view_${number}`;

export const InnerSportsDescription = (
  {
    data,
    hideId,
    className
  }: {
    data: Record<string, any> | undefined;
    hideId?: number;
    className?: string;
  }) => {
  console.info(data);

  const { t } = useTranslation();

  const [statement, setStatement] = useState<{ [key: TView]: boolean } | null>(null);

  // TODO: 体育彩金活动
  const { data: sports } = useUserSportWallet();

  const extra_data = parser(sports?.data?.extra_data);

  const handle = useCallback((rules: Record<string, any>) => {
    setStatement((v) => ({
      ...v,
      ["view_" + rules.id]: !v?.[("view_" + rules.id) as TView]
    }));
  }, []);

  return (
    <section className={clsx("flex flex-col gap-4 p-5 pt-0", className)}>
      <div className="flex flex-col gap-2">
        <div className="mb-2">
          <h4 className="font-bold flex items-center justify-between gap-4 mb-2">
            {t("common:common.challengeEverything")}
          </h4>
          <p className="text-base-content/50 text-xs">
            {t("sportsBonus:intro")}
          </p>
        </div>

        {/* 是否可放弃彩金 */}
        <InnerSportsGiveUpBonus />

        <h3 className="text-base-content font-bold mb-1 text-sm">{t("bonus:frequently_asked")}</h3>
        {sports_bonus_rules_desc(!!extra_data).map((rule) => {
          if (hideId === rule.id) return null;
          return (
            <InnerDescItem
              key={rule.id}
              desc={rule.desc}
              title={rule.title}
              values={{
                minOdds: extra_data?.min_odds,
                currency: ESport.TOKEN
              }}
              handle={() => handle(rule)}
              statement={statement}
            />
          );
        })}
      </div>
    </section>
  );
};

const InnerDescItem = ({
                         desc,
                         title,
                         values
                       }: {
  desc: ReactNode;
  title: ReactNode;
  values: Record<string, any>;
  handle: () => void;
  statement: Record<string, any> | null;
}) => {
  const { t } = useTranslation();
  return (
    <details className="cursor-pointer group collapse text-[12px] bg-base-200 !rounded-xl p-4 text-base-content/50">
      <summary className="list-none select-none">
        <h4 className="font-bold flex items-center justify-between gap-4">
          {t(title as string)}
          <div className="btn btn-soft btn-square btn-primary btn-sm">
            <ChevronRight
              className="w-3 h-3 transition-transform duration-200 group-open:rotate-90"
              strokeWidth={3}
            />
          </div>
        </h4>
      </summary>
      <div className="whitespace-pre-line collapse-content p-0 mt-2 font-normal">
        <Trans
          i18nKey={desc as string}
          values={values}
          components={[<span className="text-primary" />, <span className="text-primary" />]}
        />
      </div>
    </details>
  );
};

const InnerSportsGiveUpBonus = () => {
  const setSyncAction = useBoundStore((state) => state.setSyncAction);
  const { t } = useTranslation();

  const { data: sportsBonusWallet } = useUserSportWallet();
  const { data: userBalance = [] } = useUserBalance();

  const match = userBalance?.find((token: { currency: string }) => token?.currency === ESport.TOKEN);
  const status = sportsBonusWallet?.data;

  // 余额小于 0.1 才可放弃
  const limit = Decimal(match?.balance || 0).gt(0) && Decimal(match?.balance || 0).lte(0.1);

  return (
    <InnerDisplayContent show={BonusInProgress.has(status?.status) && limit}>
      <div className="px-5">
        <ConfirmBox
          className="btn-soft flex w-full"
          onClick={() => {
            // TODO: 放弃体育彩金
            setSyncAction("OPEN_GIVE_UP_BONUS_MODAL", { id: status?.id, kind: "sports" });
          }}
        >
          {t("bonus:giveUp")}
        </ConfirmBox>
      </div>
    </InnerDisplayContent>
  );
};

// 解析 extra_data 工具，外部需要时可复用
export { parser };
