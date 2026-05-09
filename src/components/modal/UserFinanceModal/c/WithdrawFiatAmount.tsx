import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { useAvailableBalance, useSupportedFiatWithdrawGatewaysV2 } from "@/components/modal/UserFinanceModal/helper.ts";
import { NumericFormat } from "@/components/modal/UserFinanceModal/c/NumericFormat.tsx";
import { useBoundStore } from "@/store";
import Decimal from "decimal.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import FormatAmount from "./FormatAmount";
import { RequireItem } from "@/components/modal/UserFinanceModal/c/RequireItem.tsx";
import {
  DisplayContent, InnerErrorGapWrapper, InnerErrorWrapper,
  InnerProviderAmountRangeFormat
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { useNavigate } from "@tanstack/react-router";
import { useFinanceModal } from "@/contexts/ModalsProvider.tsx";
import { emitter } from "@/store/emitter.ts";
import { WithdrawRangeOptions } from "@/components/modal/UserFinanceModal/c/WithdrawRangeOptions.tsx";

export const WithdrawFiatAmount = ({ version = "V1", formKey }: {
  version?: "V1" | "V2",
  formKey: string
}) => {
  const navigate = useNavigate();

  // FIXME: 目的 -> 用户触发了数量输入则使快捷选项失效
  const [withdrawRangeOptionsReset, setWithdrawRangeOptionsReset] = useState<number>(0);

  const { t } = useTranslation();

  // finance 弹窗控制开关
  const { closeUserFinanceModal } = useFinanceModal();

  // from data store, share common data
  const {
    withdrawFiat,
    withdrawFiatV2,
    resetWithdrawFiat,
    resetWithdrawFiatV2,
    setWithdrawFiat,
    setWithdrawFiatV2,
    syncAction
  } = useBoundStore();

  // 区分 withdraw V1 V2 的数据控制源
  const source = version === "V1" ? withdrawFiat : withdrawFiatV2;

  // 区分 withdraw V1 V2 的数据操作源
  const operate = version === "V1" ? setWithdrawFiat : setWithdrawFiatV2;

  // 区分 withdraw V1 V2 的数据操作源
  const dataReset = version === "V1" ? resetWithdrawFiat : resetWithdrawFiatV2;

  // 获取支持法币提款的网关
  const { isLoading: isGatewaysLoading } = useSupportedFiatWithdrawGatewaysV2(withdrawFiat.currency?.currency);

  // 用户的可提款数量
  const availableAndLocked = useAvailableBalance(withdrawFiat.currency?.currency);

  // 小于最小提款数量限制错误
  const lessThanMinimum = useMemo(() => {
    return Decimal(availableAndLocked.available || 0).lt(source.method?.min ?? 0);
  }, [source.method, availableAndLocked.available]);

  // 计算快捷选项对应的提款 amount
  const calcWithdrawAmount = useCallback(
    (value: number) => {
      const min = source.method?.min ?? 0;
      const max = source.method?.max ?? 0;
      const balance = Decimal(availableAndLocked.available ?? 0);
      const final_max = balance.gt(max) ? Decimal(max) : balance;

      switch (value) {
        case 0:
          operate({ formItem: { [formKey]: balance.lt(min) ? 0 : min } });
          break;
        case 0.25:
          const de_25 = balance.mul(0.25);
          let de_25_final_value = de_25;
          if (de_25.lt(min)) de_25_final_value = Decimal(min);
          if (de_25.gt(final_max)) de_25_final_value = final_max;
          operate({ formItem: { [formKey]: de_25_final_value.floor().toString() } });
          break;
        case 0.5:
          const de_50 = balance.mul(0.5);
          let de_50_final_value = de_50;
          if (de_50.lt(min)) de_50_final_value = Decimal(min);
          if (de_50.gt(final_max)) de_50_final_value = final_max;
          operate({ formItem: { [formKey]: de_50_final_value.floor().toString() } });
          break;
        case 1:
          const de_100 = balance;
          let de_100_final_value = de_100;
          if (de_100.gt(final_max)) de_100_final_value = final_max;
          operate({ formItem: { [formKey]: de_100_final_value.floor().toString() } });
          break;
      }
    },
    [availableAndLocked.available, source.method]
  );

  // 计算手续费
  const withdrawalFee = useMemo(() => {
    return Decimal(source.formItem?.amount || 0)
      .times(source.method?.fee_rate || 0)
      .plus(source.method?.fee_fix || 0)
      .toString();
  }, [source.method]);

  // total withdraw amount 显示控制
  const totalWithdrawAmountControl = useMemo(() => {
    const max = source.method?.max ?? 0;
    const d_amount = Decimal(source.formItem?.amount || 0);
    return Decimal.min(d_amount, max);
  }, [source.formItem, source.method]);

  // 实际收到
  const withdrawAmountControl = useMemo(() => {
    const fee = totalWithdrawAmountControl.mul(source.method?.fee_rate || 0).plus(source.method?.fee_fix || 0);
    return Math.max(totalWithdrawAmountControl.sub(fee).toNumber(), 0).toString();
  }, [totalWithdrawAmountControl, source.method]);

  // 用户提款输入值: 0 / ""
  const amountError = useMemo(() => {
    const d_amount = source.formItem?.amount;
    return !d_amount;
  }, [source.formItem?.amount]);

  // 提款范围错误提示
  const rangeError = useMemo(() => {
    const d_amount = Decimal(source.formItem?.amount || 0);
    return (
      d_amount.lt(source.method?.min ?? 0) || d_amount.gt(source.method?.max ?? 0)
    );
  }, [source.formItem, source.method]);

  // 输入的提款数量大于余额
  const insufficient = useMemo(() => {
    const d_amount = Decimal(source.formItem?.amount || 0);
    return d_amount.gt(0) && d_amount.gt(availableAndLocked.available || 0);
  }, [source.formItem?.amount, availableAndLocked.available]);

  useEffect(() => {
    operate({
      range_error: rangeError,
      amount_error: amountError,
      balance_error: insufficient,
      less_than_minimum_error: lessThanMinimum
    });
  }, [operate, rangeError, amountError, insufficient, lessThanMinimum]);

  // 事件通知 & 重置表单状态
  useEffect(() => {
    const events = ["CLOSE_FINANCE_MODAL"];
    const subs = events.map((eventName) =>
      emitter.addListener(eventName, () => {
        dataReset();
      })
    );

    return () => {
      subs.forEach((sub) => sub.remove());
    };
  }, [formKey]);

  // FIXME：未来优化掉 用 emitter
  useEffect(() => {
    if (syncAction.type === "OPEN_WITHDRAW_ORDER_OK_MODAL") {
      dataReset();
    }
  }, [syncAction]);

  // FIXME: 目的 -> 切换供应商/关闭finance 时候需要重置快捷按钮状态
  useEffect(() => {
    if (source.method?.id) setWithdrawRangeOptionsReset((v) => v + 1);

    const em = emitter.addListener("CLOSE_FINANCE_MODAL", function() {
      setWithdrawRangeOptionsReset((v) => v + 1);
    });

    return () => em?.remove();
  }, [source.method?.id]);

  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center justify-between pb-2 text-xs text-base-content/50 font-semibold">
          <RequireItem label={t(`finance:amount`)} />
          {
            Decimal(source.method?.min || 0).gt(0)
              ? <InnerProviderAmountRangeFormat
                min={source.method?.min}
                max={source.method?.max}
                currency={withdrawFiat.currency?.currency} />
              : <>0.00{' '}{withdrawFiat.currency?.currency}</>
          }
        </div>

        <InnerErrorGapWrapper>
          <InnerErrorWrapper>
            <NumericFormat
              placeholder="0.00"
              value={source.formItem?.amount || ""}
              thousandSeparator
              onValueChange={(values) => {
                operate({ formItem: { amount: values.value } });
              }}
              onFocus={() => {
                setWithdrawRangeOptionsReset((v) => v + 1);
              }}
              disabled={lessThanMinimum}
              decimalScale={0}
            />

            {/* 余额不在最小范围 */}
            <ErrorMessageBox show={lessThanMinimum}
                             content={t("finance:theBalanceDoesNotReachTheMinimumWithdrawalLimit")} />
            {/* 余额不足 */}
            <ErrorMessageBox show={insufficient}
                             content={t("finance:insufficient_balance")} />

            {/* 范围错误 */}
            <ErrorMessageBox
              show={rangeError && !insufficient && !lessThanMinimum}
              content={<span>
            {t("finance:pleaseEnterAnAmountBetween")}{" "}
                <InnerProviderAmountRangeFormat
                  min={source.method?.min}
                  max={source.method?.max}
                  currency={withdrawFiat.currency?.currency} />
          </span>}
            />
          </InnerErrorWrapper>

          {/* 数量输入快捷选项 */}
          <WithdrawRangeOptions
            key={withdrawRangeOptionsReset}
            onChange={(v) => {
              calcWithdrawAmount(v);
            }}
            disabled={isGatewaysLoading || lessThanMinimum || source.method?.status === 0}
          />
        </InnerErrorGapWrapper>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-base-content/50 text-xs font-semibold underline cursor-pointer" onClick={() => {
          void navigate({ to: "/profile", search: (prev) => ({ ...prev, tab: "rollover" }) });

          closeUserFinanceModal();
        }}>
          {t("finance:available")}:{" "}
          <FormatAmount amount={availableAndLocked.available} local
                        decimals={withdrawFiat.currency?.display_decimal} />{" "}
          {withdrawFiat.currency?.currency}
        </span>
        <span className="text-base-content/50 text-xs font-semibold underline cursor-pointer" onClick={() => {
          void navigate({ to: "/profile", search: (prev) => ({ ...prev, tab: "rollover" }) });

          closeUserFinanceModal();
        }}>
          {t("finance:locked")}: <FormatAmount amount={availableAndLocked.locked} local
                                               decimals={withdrawFiat.currency?.display_decimal} />{" "}
          {withdrawFiat.currency?.currency}
        </span>
      </div>

      <div className="bg-base-300 p-4 rounded-xl">
        <div className="flex items-center justify-between text-primary/80">
          <span className="text-xs font-semibold">{t("finance:withdrawAmount")}</span>
          <div className="text-xs font-bold flex items-center gap-1">
            <FormatAmount amount={withdrawAmountControl} decimals={withdrawFiat.currency?.display_decimal} local />
            {withdrawFiat.currency?.currency}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-base-content/50 text-xs font-semibold">{t("finance:fee")}</span>
          <div className="text-base-content text-xs font-bold flex items-center gap-1">
            <FormatAmount amount={withdrawalFee} local decimals={withdrawFiat.currency?.display_decimal} />
            {withdrawFiat.currency?.currency}
            <DisplayContent status={Decimal(source.method?.fee_rate || 0).gt(0)}>
              <div className="text-[10px] text-base-content/50">
                {`(${source.method?.fee_rate * 100}% + ${source.method?.fee_fix || 0})`}
              </div>
            </DisplayContent>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-base-content/50 text-xs font-semibold">{t("finance:totalWithdrawAmount")}</span>
          <div className="text-base-content text-xs font-bold flex items-center gap-1">
            <FormatAmount amount={totalWithdrawAmountControl.toString()} local
                          decimals={withdrawFiat.currency?.display_decimal} />
            {withdrawFiat.currency?.currency}
          </div>
        </div>
      </div>
    </>
  );
};
