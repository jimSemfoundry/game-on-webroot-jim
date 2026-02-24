import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { BonusDollarsState, BonusNotAvailable, BonusWaitingActive } from "@/sections/dollars/components.tsx";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import { useBonusWallet } from "@/query/dollars.ts";
import { useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import Iconify from "@/components/iconify";
import { useTranslation } from "react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext.tsx";
import { useUserBalance } from "@/hooks/api/useAuth.ts";

export const BonusWallet = (
  {
    currency,
    onSelect,
    selected
  }: {
    currency: Record<string, any>
    onSelect: (v: string) => void
    selected: string
  }
) => {
  const { data: baseConfig } = useBaseConfig();

  // bonus 的总开关是否开启
  const slot_bonus_wallet = baseConfig?.data?.bonus_switch?.slot_bonus_wallet !== 0;

  return slot_bonus_wallet
    ? <InnerTokenInfo
      currency={currency}
      onSelect={() => onSelect(currency?.currency)}
      selected={selected}
    />
    : null;
};

export const bonus_dollars_router_path: Record<string, any> = {
  "BONUS": "/dollars/bonus",
};

const InnerTokenInfo = (
  {
    currency,
    onSelect,
    selected
  }: {
    currency: Record<string, any>
    onSelect: (v: string) => void
    selected: string
  }
) => {
  const timerRef = useRef<any>(null);

  const navigate = useNavigate();

  const { t } = useTranslation("bonus");

  // 彩金钱包数据
  const { data: bonusWallet } = useBonusWallet();

  const [isFinished, setFinished] = useState<boolean>(false);

  // 匹配彩金币种状态信息 打码的数据 奖励的数据等
  const status = bonusWallet?.data

  // 钱包数据不是实时更新，有些情况下需要自己监听过期时间--start
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = null;
  };

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(function() {
      const current = dayjs().valueOf();

      const diff = dayjs(status?.expired_at * 1000).diff(current);

      if (diff <= 0) {
        stopTimer();

        setFinished(true);

        return;
      }
    }, 1_000);
  }, [status?.expired_at]);

  // bonus wallet 的内部开关 - 倒计时
  useEffect(() => {
    if (status?.status === BonusDollarsState.in_progress && !timerRef.current && status?.expired_at) {
      startTimer();
    }
    return () => {
      stopTimer();
    };
  }, [status?.status, status?.expired_at]);
  // 钱包数据不是实时更新，有些情况下需要自己监听过期时间--end

  return ((BonusWaitingActive.has(status?.status) || BonusNotAvailable.has(status?.status) || isFinished) ? null :
    <div
      className={clsx("flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors cursor-pointer",
        selected === currency?.currency
          ? "bg-primary/10 text-primary"
          : "hover:bg-primary/5"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(currency.currency);
        void navigate({ to: bonus_dollars_router_path[currency.currency] });
      }}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <img src={currency?.icon} className="rounded-full w-6 h-6" />
          <p className="font-medium">{currency.currency}</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="btn btn-primary rounded-md btn-soft btn-xs px-2 mx-2 uppercase">
            {t("bonus:claim")}
          </label>
          <label className="btn btn-ghost btn-square btn-xs">
            <Iconify icon="custom:info" className="text-base-content/50 w-5 h-5" />
          </label>
        </div>

        <InnerTokenBalance currency={currency.currency} />
      </div>
    </div>);
};

const InnerTokenBalance = (
  {
    currency
  }: {
    currency: string
  }
) => {
  // 币种余额统计
  const { data: balances = [] } = useUserBalance();

  // 余额格式化函数
  const { formatWithConversion, formatWithoutConversion } = useDisplayCurrencyFormatter();

  // 彩金币种余额
  const balance = useMemo(() => balances.find((b: {
    currency: string
  }) => b.currency === currency), [balances])?.balance ?? 0;

  // 格式化输出余额转换
  const output_balance = useMemo(() => {
    const balance_transfer = formatWithConversion(balance, currency, {
      showSymbol: true,
      showCode: false,
      compact: false
    }).formatted;

    const balance_origin = formatWithoutConversion(balance, currency, {
      showSymbol: true,
      compact: false,
      minimizeDecimals: true
    }).formatted;

    return [balance_transfer, balance_origin];
  }, [balance, currency]);

  return (<div className="flex flex-col items-end">
    <p className="text-sm font-bold">{output_balance[0]}</p>
    <p className="text-base-content/50 text-xs font-semibold">{output_balance[1]}</p>
  </div>);
};