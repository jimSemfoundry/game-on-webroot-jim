import { cn } from "@/utils/cn.ts";
import Decimal from "decimal.js";
import { useBoundStore } from "@/store";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useCallback } from "react";

export const DepositRangeOptions = (
  {
    amount,
    onClick,
    rangeOptions
  }: {
    amount: string
    onClick: (v: string) => void;
    rangeOptions: string[]
  }) => {
  // from data store, share common data
  const { depositFiat } = useBoundStore();

  // 查询代币信息
  const { getCurrencySymbol } = useCurrencyData();

  /**
   * 有些供应商提供的快捷选项值和通道的min max不符合
   * 需要去禁止不适合的快捷选项值做禁用
   *
   * 选项小于通道最小值
   * 选项大于通道最大值
   */
  const disabled = useCallback((value: string) => {
    return !depositFiat.method || Decimal(value || 0).lt(depositFiat.method?.min || 0) || Decimal(value || 0).gt(depositFiat.method?.max || 0)
  }, [depositFiat.method])

  return (
    <div className="mt-2 grid grid-cols-3 gap-2">
      {rangeOptions.map((value, index) => (
        <button
          key={index}
          className={cn(
            `btn btn-sm bg-base-300 text-base-content/50 border-0 rounded-sm`,
            Decimal(value || 0).eq(amount) && "btn-outline btn-primary border-1 text-primary"
          )}
          onClick={() => onClick(value)}
          disabled={disabled(value)}
        >
          {getCurrencySymbol(depositFiat.currency?.currency)}
          {value.toLocaleString()}
        </button>
      ))}
    </div>
  );
};
