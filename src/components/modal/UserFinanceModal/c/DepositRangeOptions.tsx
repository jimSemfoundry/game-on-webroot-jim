import { cn } from "@/utils/cn.ts";
import Decimal from "decimal.js";
import { useBoundStore } from "@/store";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useEffect, useMemo, useState, useTransition } from "react";

export const DepositRangeOptions = (
  {
    amount,
    onChange,
    rangeOptions
  }: {
    amount: string
    onChange: (v: string) => void;
    rangeOptions: string[]
  }) => {
  // from data store, share common data
  const { depositFiat } = useBoundStore();

  // 查询代币信息
  const { getCurrencySymbol } = useCurrencyData();

  const [value, setValue] = useState(amount);

  // 过渡效果优化
  const [, startTransition] = useTransition();

  const currency_symbol = useMemo(() => getCurrencySymbol(depositFiat.currency?.currency), [depositFiat.currency?.currency]);

  /**
   * 有些供应商提供的快捷选项值和通道的min max不符合
   * 需要去禁止不适合的快捷选项值做禁用
   *
   * 选项小于通道最小值
   * 选项大于通道最大值
   */
  const computedOptions = useMemo(() => {
    const min = depositFiat.method?.min ?? 0;
    const max = depositFiat.method?.max ?? 0;

    return rangeOptions.map((v) => {
      const d_value = new Decimal(v ?? 0);
      const isDisabled = !Boolean(depositFiat.method) || d_value.lt(min) || d_value.gt(max);
      const isSelected = d_value.eq(value || 0);
      return { value: v, isDisabled, isSelected };
    });
  }, [depositFiat.method, rangeOptions, value]);

  useEffect(() => {
    setValue(amount);
  }, [amount]);

  return (
    <div className="mt-0 grid grid-cols-3 gap-2">
      {computedOptions.map(({ value, isDisabled, isSelected }) => (
        <button
          key={value}
          className={cn(
            `btn btn-sm bg-base-300 text-base-content/50 border-0 rounded-sm`,
            isSelected && "btn-outline btn-primary border-1 text-primary",
            isDisabled && "opacity-50",
          )}
          onClick={() => {
            setValue(value);
            startTransition(() => onChange(value)); // 动画过渡优化
          }}
          disabled={isDisabled}
        >
          {currency_symbol}
          {value.toLocaleString()}
        </button>
      ))}
    </div>
  );
};
