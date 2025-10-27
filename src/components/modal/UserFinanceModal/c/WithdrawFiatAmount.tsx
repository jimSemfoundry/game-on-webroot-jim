import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { perRangeOptions, useAvailableBalance } from "@/components/modal/UserFinanceModal/helper.ts";
import { DisplayContent } from "@/components/modal/UserFinanceModal";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { MotionContentBox } from "@/components/modal/UserFinanceModal/c/MotionContentBox.tsx";
import { NumericFormat } from "@/components/modal/UserFinanceModal/c/NumericFormat.tsx";
import { WithdrawRangeOptions } from "@/components/modal/UserFinanceModal/c/WithdrawRangeOptions.tsx";
import { useSupportedFiatDepositGateways } from "@/hooks/api/useAuth.ts";
import { useBoundStore } from "@/store";
import Decimal from "decimal.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FormatAmount } from "sunmoon-working-components";
import { RequireItem } from "@/components/modal/UserFinanceModal/c/RequireItem.tsx";

export const WithdrawFiatAmount = ({ version = "V1", formKey }: { version?: "V1" | "V2", formKey: string }) => {
  const { t } = useTranslation();
  const [option, selected] = useState<{
    label: string;
    value: string;
  } | null>(null);

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
  }, [source.method, availableAndLocked]);

  // 计算快捷选项对应的提款 amount
  const calcWithdrawAmount = useCallback(
    (option: Record<string, any>) => {
      const min = source.method?.min ?? 0;
      const max = source.method?.max ?? 0;
      const balance = Decimal(availableAndLocked.available);
      switch (option?.value) {
        case "min":
          operate({ formItem: { [formKey]: balance.lt(min) ? 0 : min } });
          break;
        case "25%":
          const de_25 = Decimal(balance).mul(0.25);
          operate({ formItem: { [formKey]: de_25.gt(max) ? max : de_25.toString() } });
          break;
        case "50%":
          const de_50 = Decimal(balance).mul(0.5);
          operate({ formItem: { [formKey]: de_50.gt(max) ? max : de_50.toString() } });
          break;
        case "max":
          operate({ formItem: { [formKey]: Decimal.min(balance, max).toString() } });
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
      if (d_amount.lte(0)) return;
      if (d_amount.eq(d_min)) {
        const find = perRangeOptions.find((o) => o.value === "min");
        selected(find!);
        return;
      }
      if (d_amount.eq(d_balance)) {
        const find = perRangeOptions.find((o) => o.value === "max");
        selected(find!);
        return;
      }
      if (d_amount.eq(d_balance.mul(0.25))) {
        const find = perRangeOptions.find((o) => o.value === "25%");
        selected(find!);
        return;
      }
      if (d_amount.eq(d_balance.mul(0.5))) {
        const find = perRangeOptions.find((o) => o.value === "50%");
        selected(find!);
        return;
      }
      selected(null);
    },
    [availableAndLocked.available, source.method]
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

  // 提款范围错误提示
  const rangeError = useMemo(() => {
    const d_amount = Decimal(source.formItem?.[formKey] || 0);
    return (
      source.formItem?.[formKey] !== "" && (d_amount.lt(source.method?.min ?? 0) || d_amount.gt(source.method?.max ?? 0))
    );
  }, [source.formItem, source.method]);

  // 输入的提款数量大于余额
  const insufficient = useMemo(() => {
    const d_amount = Decimal(source.formItem?.[formKey] || 0);
    return source.formItem?.[formKey] !== "" && d_amount.gt(availableAndLocked.available);
  }, [source.formItem, availableAndLocked]);

  useEffect(() => {
    operate({ range_error: rangeError });
  }, [operate, rangeError]);

  // 事件通知
  useEffect(() => {
    if (syncAction.type === "OPEN_WITHDRAW_ORDER_OK_MODAL") selected(null);
  }, [syncAction]);

  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center justify-between pb-2 text-xs text-base-content/50 font-semibold">
          <RequireItem label={t(`finance:amount`)} />
          <SmallLoading
            loading={isGatewaysLoading}
            content={
              <p>
                {source.method?.min?.toLocaleString()} ~ {source.method?.max?.toLocaleString()}{" "}
                {withdrawFiat.currency?.currency}
              </p>
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
          decimalScale={withdrawFiat.currency?.decimal}
        />

        {/* 输入发生错误 */}
        <ErrorMessageBox show={lessThanMinimum}
                         content={t("finance:theBalanceDoesNotReachTheMinimumWithdrawalLimit")} />
        <ErrorMessageBox show={insufficient} content={t("finance:insufficient_balance")} />
        <ErrorMessageBox
          show={rangeError}
          content={`${t("finance:pleaseEnterAnAmountBetween")}
                       ${source.method?.min?.toLocaleString()}
                       ~
                       ${source.method?.max?.toLocaleString()}
                       ${withdrawFiat.currency?.currency}`}
        />

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
        <span className="text-base-content/50 text-xs font-semibold">
          {t("finance:available")}:{" "}
          <FormatAmount amount={availableAndLocked.available} local decimals={withdrawFiat.currency?.decimal} />{" "}
          {withdrawFiat.currency?.currency}
        </span>
        <span className="text-base-content/50 text-xs font-semibold">
          {t("finance:locked")}: <FormatAmount amount={availableAndLocked.locked} local
                                               decimals={withdrawFiat.currency?.decimal} />{" "}
          {withdrawFiat.currency?.currency}
        </span>
      </div>

      <div className="bg-base-300 p-4 rounded-xl">
        <div className="flex items-center justify-between text-primary/80">
          <span className="text-xs font-semibold">{t("finance:withdrawAmount")}</span>
          <div className="text-xs font-bold flex items-center gap-1">
            <FormatAmount amount={withdrawAmountControl} decimals={withdrawFiat.currency?.decimal} local />
            {withdrawFiat.currency?.currency}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-base-content/50 text-xs font-semibold">{t("finance:fee")}</span>
          <div className="text-base-content text-xs font-bold flex items-center gap-1">
            <FormatAmount amount={withdrawalFee} local decimals={withdrawFiat.currency?.decimal} />
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
                          decimals={withdrawFiat.currency?.decimal} />
            {withdrawFiat.currency?.currency}
          </div>
        </div>
      </div>
    </>
  );
};
