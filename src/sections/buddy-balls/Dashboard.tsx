import { useNavigate } from "@tanstack/react-router";
import { Trans, useTranslation } from "react-i18next";
import { useUserBuddyBallsHome } from "@/hooks/api/useAuth.ts";
import { StyledBackground } from "@/sections/buddy-balls/components.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { ReactNode, useCallback, useState } from "react";
import { authService } from "@/services/authService.ts";
import { toast } from "sonner";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";
import clsx from "clsx";
import { useBoundStore } from "@/store";
import { InnerToastCustom } from "@/sections/dollars/components.tsx";

export function Dashboard({ onOpenShare }: { onOpenShare?: () => void }) {
  const navigate = useNavigate();

  const openModal = useBoundStore((state) => state.openModal);

  const { t } = useTranslation(["buddyBalls", "bonus", "common", "transaction", "toast"]);

  const { user } = useAuth();

  // 球游戏 -> 球游戏的主页信息
  const { data: buddy, refetch: refetchBuddyBallsHome } = useUserBuddyBallsHome();

  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();

  // 奖励领取状态
  const [bonusPending, setBonusPending] = useState<boolean>(false);

  // 用户当前的汇率币种
  const currency_fiat = user?.currency_fiat ?? "";

  // 游戏收益 - 原始值
  const processing_total_amount = buddy?.data?.processing_total_amount || 0;

  // 游戏收益 - 汇率转换
  const processing_total_amount_exchange = formatCurrency({
    amount: convertCurrency({
      amount: processing_total_amount,
      fromCurrency: "USDT",
      toCurrency: currency_fiat,
      exchangeRates
    }),
    currency: currency_fiat,
    showSymbol: true, showCode: false
  }).formatted;

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
          title={params.title}
          subTitle={params.subTitle}
          onConfirm={() => console.info("onClose")}
        />
      ),
      { duration: 6_000, position: "top-right" }
    );
  }, []);

  const showErrorToast = useCallback((i18nKey: string) => {
    showBaseToast({
      icon: "/images/dollars/bonus-error.png",
      title: t("transaction:transactionStatus.failed"),
      subTitle: <Trans i18nKey={i18nKey} />
    });
  }, [showBaseToast, t]);

  const showSuccessToast = useCallback((amount: string) => {
    const _amount = formatCurrency({
      amount: convertCurrency({
        amount: amount,
        fromCurrency: 'USDT',
        toCurrency: currency_fiat,
        exchangeRates
      }),
      currency: currency_fiat,
      showSymbol: true, showCode: false
    }).formatted;

    showBaseToast({
      icon: "/images/bonus/buddy-win.png",
      title: t("bonus:congratulations"),
      subTitle: (
        <div>
          <div className="text-primary font-semibold">{t(`bonus:you_win`)}{" "}<b>{_amount}</b></div>
        </div>
      )
    });
  }, [showBaseToast, exchangeRates, currency_fiat, t]);

  // 球游戏 -> 提取球游戏的奖励
  const handle = useCallback(async () => {
    setBonusPending(true);

    try {
      const response = await authService.userBuddyBallsClaim();

      if (response.code === 0 || response.code === 200) {
        showSuccessToast(response?.data?.ball_amount);

        // TODO: 更新用户统计数据
        void refetchBuddyBallsHome()
      } else {
        showErrorToast("toast:claimBonusFailed"); // 奖励提取失败
      }
    } catch (err) { // 接口异常
      showErrorToast("toast:claimBonusFailed"); // 奖励提取失败
    } finally {
      setBonusPending(false);
    }
  }, [processing_total_amount_exchange]);

  return (
    <>
      <StyledBackground
        className="relative flex justify-between p-4 md:flex-wrap md:items-center md:justify-between md:gap-4">
        <div className="flex flex-col gap-1 text-md font-bold md:min-w-0 md:flex-row md:flex-wrap md:items-center md:gap-x-6 md:gap-y-2">
          <div className="flex items-center gap-2 md:hidden">
            <span className="shrink-0">{t("buddyBalls:buddyBalls")}</span>
          </div>
          <div className="flex h-8 items-center gap-3 text-sm">
            <div className="inline-flex items-center gap-1 whitespace-nowrap">
              <img src="/images/bonus/ball.png" alt="" className={"w-4 h-4"} />
              {/* 持有球的总量 */}
              x{buddy?.data?.balls || 0}
            </div>
          </div>
          <span className={"cursor-pointer text-xs font-semibold underline md:shrink-0"}
                onClick={() => void navigate({ to: "/buddy-balls/history" })}>{t("common:common.history")}</span>
        </div>

        <div className="flex flex-col justify-between gap-2 text-sm font-bold md:mt-0 md:ml-auto md:max-w-full md:flex-row md:items-center md:justify-end md:gap-3 md:self-end md:shrink-0">
          {/* 游戏收益 */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-2 md:text-right">
              <span
                className={clsx("inline-flex items-center gap-1 whitespace-nowrap justify-end", { "text-primary": Number(processing_total_amount) > 0 })}>
                <span>{processing_total_amount_exchange}</span>
              </span>
          </div>

          {/* 提取球的收益 */}
          <ConfirmBox
            loading={bonusPending}
            disabled={Number(processing_total_amount) === 0}
            className="btn btn-sm btn-primary md:shrink-0 md:!w-auto md:min-w-0 md:px-2"
            onClick={handle}
          >{t("bonus:claim")}</ConfirmBox>
        </div>
      </StyledBackground>

      <div className="mt-3 flex items-start justify-between gap-3">
        <button
          type="button"
          className="inline-flex h-8 items-center gap-2.5 rounded-[9px] bg-[var(--color-base-200)] px-3.5 text-xs font-semibold text-base-content shadow-[inset_0_-6px_12px_rgba(0,0,0,0.08)] transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring focus-visible:ring-primary/40"
          onClick={() => openModal("OPEN_BUDDY_BALLS_MODAL")}
        >
          <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#89ff00]/20 shadow-[0_0_18px_rgba(137,255,0,0.45)]">
            <span className="absolute inset-1 rounded-full bg-[#89ff00]/30 blur-[2px]" />
            <img src="/images/bonus/ball.png" alt="" className="relative h-4.5 w-4.5" />
          </span>
          <span className="capitalize">{t('buddyBalls:getMore', 'Get more')}</span>
        </button>

        <button
          type="button"
          className="inline-flex h-8 items-center gap-2.5 rounded-[9px] bg-[var(--color-base-200)] px-4 text-xs font-semibold text-base-content shadow-[inset_0_-6px_12px_rgba(0,0,0,0.08)] transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring focus-visible:ring-primary/40"
          onClick={onOpenShare}
          aria-label={t("buddyBalls:shareBuddyball", "Share Buddyball")}
        >
          <span
            className="block h-5 w-5 shrink-0 bg-[#b8eb20]"
            style={{
              WebkitMaskImage: "url(/images/games/buddyballs/share.svg)",
              maskImage: "url(/images/games/buddyballs/share.svg)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain"
            }}
          />
          <span className="whitespace-nowrap">{t("buddyBalls:share", "Share")}</span>
        </button>
      </div>
    </>
  );
}
