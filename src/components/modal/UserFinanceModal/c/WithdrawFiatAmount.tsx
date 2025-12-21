import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { perRangeOptions, useAvailableBalance } from "@/components/modal/UserFinanceModal/helper.ts";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { MotionContentBox } from "@/components/modal/UserFinanceModal/c/MotionContentBox.tsx";
import { NumericFormat } from "@/components/modal/UserFinanceModal/c/NumericFormat.tsx";
import { WithdrawRangeOptions } from "@/components/modal/UserFinanceModal/c/WithdrawRangeOptions.tsx";
import { useSupportedFiatDepositGateways } from "@/hooks/api/useAuth.ts";
import { useBoundStore } from "@/store";
import Decimal from "decimal.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { FormatAmount } from "sunmoon-working-components";
import { RequireItem } from "@/components/modal/UserFinanceModal/c/RequireItem.tsx";
import {
  DisplayContent, InnerMaintenance,
  InnerProviderAmountRangeFormat
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { useNavigate } from "@tanstack/react-router";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import { useFinanceModal } from "@/contexts/ModalsProvider.tsx";

export const WithdrawFiatAmount = ({ version = "V1", field, formKey }: {
  version?: "V1" | "V2",
  field?: Record<string, any> | null,
  formKey: string
}) => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const [option, selected] = useState<{
    label: string;
    value: number;
  } | null>(null);

  // finance 弹窗控制开关
  const { closeUserFinanceModal } = useFinanceModal();

  // from data store, share common data
  const { withdrawFiat, withdrawFiatV2, setWithdrawFiat, setWithdrawFiatV2, syncAction } = useBoundStore();

  const source = useMemo(() => version === "V1" ? withdrawFiat : withdrawFiatV2, [version, withdrawFiat, withdrawFiatV2]);

  const operate = useMemo(() => version === "V1" ? setWithdrawFiat : setWithdrawFiatV2, [version]);

  // 获取支持法币存款的网关
  const { isLoading: isGatewaysLoading } = useSupportedFiatDepositGateways(withdrawFiat.currency?.currency);

  // 用户的可提款数量
  const availableAndLocked = useAvailableBalance(withdrawFiat.currency?.currency);

  // 小于最小提款数量限制错误
  const lessThanMinimum = useMemo(() => {
    return Decimal(availableAndLocked.available).lt(source.method?.min ?? 0);
  }, [source.method, availableAndLocked.available]);

  // 计算快捷选项对应的提款 amount
  const calcWithdrawAmount = useCallback(
    (option: Record<string, any>) => {
      const min = source.method?.min ?? 0;
      const max = source.method?.max ?? 0;
      const balance = Decimal(availableAndLocked.available);
      switch (option?.label) {
        case "Min":
          operate({ formItem: { [formKey]: balance.lt(min) ? 0 : min } });
          break;
        case "25%":
          const de_25 = Decimal(balance).mul(0.25);
          let de_25_final_value = de_25.toString();
          if (de_25.lt(min)) de_25_final_value = min;
          if (de_25.gt(max)) de_25_final_value = max;
          operate({ formItem: { [formKey]: de_25_final_value } });
          break;
        case "50%":
          const de_50 = Decimal(balance).mul(0.5);
          let de_50_final_value = de_50.toString();
          if (de_50.lt(min)) de_50_final_value = min;
          if (de_50.gt(max)) de_50_final_value = max;
          operate({ formItem: { [formKey]: de_50_final_value } });
          break;
        case "Max":
          const de_100 = Decimal(balance);
          let de_100_final_value = de_100.toString();
          if (de_100.gt(max)) de_100_final_value = max;
          operate({ formItem: { [formKey]: de_100_final_value } });
          break;
      }
    },
    [availableAndLocked.available, source.method, operate]
  );

  // 根据输入的值判断快捷选项激活
  const calcWithdrawOption = useCallback(
    (amount: string) => {
      const d_min = source.method?.min ?? 0;
      const d_amount = Decimal(amount || 0);
      const d_balance = Decimal(availableAndLocked.available);
      if (d_amount.eq(d_min)) {
        const find = perRangeOptions.find((o) => o.value === 0);
        selected(find!);
        return;
      }
      if (d_amount.eq(d_balance.toDP(withdrawFiat.currency?.display_decimal, Decimal.ROUND_DOWN))) {
        const find = perRangeOptions.find((o) => o.value === 1);
        selected(find!);
        return;
      }
      if (d_amount.eq(d_balance.mul(0.25).toDP(withdrawFiat.currency?.display_decimal, Decimal.ROUND_DOWN)) && d_amount.gte(d_min)
      ) {
        const find = perRangeOptions.find((o) => o.value === 0.25);
        selected(find!);
        return;
      }
      if (d_amount.eq(d_balance.mul(0.5).toDP(withdrawFiat.currency?.display_decimal, Decimal.ROUND_DOWN)) && d_amount.gte(d_min)) {
        const find = perRangeOptions.find((o) => o.value === 0.5);
        selected(find!);
        return;
      }
      selected(null);
    },
    [availableAndLocked.available, source.method, withdrawFiat.currency]
  );

  // 计算手续费
  const withdrawalFee = useMemo(() => {
    return Decimal(source.formItem?.[formKey] || 0)
      .times(source.method?.fee_rate || 0)
      .plus(source.method?.fee_fix || 0)
      .toString();
  }, [source.method]);

  // total withdraw amount 显示控制
  const totalWithdrawAmountControl = useMemo(() => {
    const max = source.method?.max ?? 0;
    const d_amount = Decimal(source.formItem?.[formKey] || 0);
    return Decimal.min(d_amount, max);
  }, [source.formItem, source.method]);

  // 实际收到
  const withdrawAmountControl = useMemo(() => {
    const fee = totalWithdrawAmountControl.mul(source.method?.fee_rate || 0).plus(source.method?.fee_fix || 0);
    return Math.max(totalWithdrawAmountControl.sub(fee).toNumber(), 0).toString();
  }, [totalWithdrawAmountControl, source.method]);

  // 用户提款输入值: 0 / ""
  const amountError = useMemo(() => {
    const d_amount = source.formItem?.[formKey]
    return !d_amount
  }, [source.formItem]);

  // 提款范围错误提示
  const rangeError = useMemo(() => {
    const d_amount = Decimal(source.formItem?.[formKey] || 0);
    return (
      !!source.formItem?.[formKey] && (d_amount.lt(source.method?.min ?? 0) || d_amount.gt(source.method?.max ?? 0))
    );
  }, [source.formItem, source.method]);

  // 提款输入值倍数错误提示，有些通道要求x的倍数数值才能提款
  const multipleError = useMemo(() => {
    const d_amount = Decimal(source.formItem?.[formKey] || 0);
    return !(d_amount.mod(field?.multiple || 1).eq(0));
  }, [source.formItem, field?.multiple]);

  // 输入的提款数量大于余额
  const insufficient = useMemo(() => {
    const d_amount = Decimal(source.formItem?.[formKey] || 0);
    return !!source.formItem?.[formKey] && d_amount.gt(availableAndLocked.available);
  }, [source.formItem, availableAndLocked]);

  // 通道维护
  const method_bad_status = useMemo(() => {
    if (source.method) return Decimal(source.formItem?.amount || 0).gt(0) && source.method?.status === 0;
  }, [source.formItem, source.method]);

  // 通道未激活
  const method_is_unactive = useMemo(() => {
    if (source.method) return Decimal(source.formItem?.amount || 0).gt(0) && source.method?.active === false;
  }, [source.formItem, source.method]);

  useEffect(() => {
    operate({
      range_error: rangeError,
      amount_error: amountError,
      balance_error: insufficient,
      multiple_error: multipleError,
      less_than_minimum_error: lessThanMinimum
    });
  }, [operate, rangeError, amountError, insufficient, multipleError, lessThanMinimum]);

  // 事件通知 & 重置表单状态
  useEffect(() => {
    if (syncAction.type && ["CLOSE_FINANCE_MODAL", "OPEN_WITHDRAW_ORDER_OK_MODAL"].includes(syncAction.type)) {
      selected(null);
      operate({ formItem: { [formKey]: "" } });
    }
  }, [syncAction]);

  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center justify-between pb-2 text-xs text-base-content/50 font-semibold">
          <RequireItem label={t(`finance:amount`)} />
          <SmallLoading
            loading={isGatewaysLoading}
            content={
              Decimal(source.method?.min || 0).gt(0)
                ? <InnerProviderAmountRangeFormat
                  min={source.method?.min}
                  max={source.method?.max}
                  currency={withdrawFiat.currency?.currency} />
                : <InnerMaintenance show className={"rounded-xs relative !bg-base-200 text-white/20"} />
            }
          />
        </div>

        <NumericFormat
          placeholder="0.00"
          value={source.formItem?.[formKey]}
          thousandSeparator
          onValueChange={(values) => {
            operate({ formItem: { [formKey]: values.value } });
            calcWithdrawOption(values.value);
          }}
          disabled={lessThanMinimum}
          decimalScale={withdrawFiat.currency?.display_decimal}
        />

        {/* 余额不在最小范围 */}
        <ErrorMessageBox sample show={lessThanMinimum}
                         content={t("finance:theBalanceDoesNotReachTheMinimumWithdrawalLimit")} />
        {/* 余额不足 */}
        <ErrorMessageBox sample show={insufficient} content={t("finance:insufficient_balance")} />

        {/* 范围错误 */}
        <ErrorMessageBox
          sample
          show={rangeError && !insufficient}
          content={<span>
            {t("finance:pleaseEnterAnAmountBetween")}{" "}
            <InnerProviderAmountRangeFormat
              min={source.method?.min}
              max={source.method?.max}
              currency={withdrawFiat.currency?.currency} />
          </span>}
        />

        {/* 通道存款要求 */}
        <ErrorMessageBox sample show={!rangeError && multipleError}
                         content={t("finance:multiple_error", { multiple: field?.multiple })} />

        {/* 数量输入快捷选项 */}
        <MotionContentBox
          show={!lessThanMinimum}
          sample
          content={
            <WithdrawRangeOptions
              onClick={(v) => {
                selected(v);
                calcWithdrawAmount(v);
              }}
              selected={option!}
              disabled={isGatewaysLoading || lessThanMinimum}
            />
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-base-content/50 text-xs font-semibold underline cursor-pointer" onClick={() => {
          void navigate({ to: "/profile", search: (prev) => ({ ...prev, tab: "rollover" }) });

          closeUserFinanceModal()
        }}>
          {t("finance:available")}:{" "}
          <FormatAmount amount={availableAndLocked.available} local
                        decimals={withdrawFiat.currency?.display_decimal} />{" "}
          {withdrawFiat.currency?.currency}
        </span>
        <span className="text-base-content/50 text-xs font-semibold underline cursor-pointer" onClick={() => {
          void navigate({ to: "/profile", search: (prev) => ({ ...prev, tab: "rollover" }) });

          closeUserFinanceModal()
        }}>
          {t("finance:locked")}: <FormatAmount amount={availableAndLocked.locked} local
                                               decimals={withdrawFiat.currency?.display_decimal} />{" "}
          {withdrawFiat.currency?.currency}
        </span>
      </div>

      <InnerDisplayContent show={Boolean(method_bad_status) || Boolean(method_is_unactive)}>
        <div className="bg-base-300 rounded-lg p-2">
          {/* 通道在维护 */}
          <ErrorMessageBox
            sample
            content={
              <Trans
                i18nKey={"finance:channel_under_maintenance"}
                values={{ channel: withdrawFiat.method?.display_name }}
                components={[<span className="underline" />]} />}
            show={Boolean(method_bad_status) && !Boolean(method_is_unactive)} />

          {/* 通道未激活 */}
          <ErrorMessageBox
            sample
            content={<Trans
              i18nKey={"finance:channel_not_activated"}
              values={{ channel: withdrawFiat.method?.display_name }}
              components={[<span className="underline" />]} />}
            show={Boolean(method_is_unactive)} />
        </div>
      </InnerDisplayContent>

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
