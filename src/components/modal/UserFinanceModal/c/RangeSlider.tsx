import { useCallback, useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBoundStore } from "@/store";
import { useGetPromoByPage } from "@/query/promo.tsx";
import { default_deposit_range_options } from "./DepositFiatAmount";
import { useCurrencyData } from "@/hooks/useCurrency.ts";


export const RangeSlider = () => {
  const { convertCurrency, exchangeRates } = useCurrencyData();

  const [,setIsValidAmountPromo] = useState(false);

  const { t } = useTranslation();

  const { depositFiat, setDepositFiat } = useBoundStore();

  const { currentPromo } = useGetPromoByPage();

  const minAmountValue = useMemo(() => {

    // const value = formatWithConversion(currentPromo?.min_amount, 'USDT', {
    //   showSymbol: false,
    //   showCode: false,
    //   compact: false,
    //   minimizeDecimals: true,
    // }).formatted || '0';

    const value = convertCurrency({
      amount: currentPromo?.min_amount,
      fromCurrency: 'USDT',
      toCurrency: depositFiat?.currency?.currency,
      exchangeRates: exchangeRates,
    }) || 0;

    const valueNum = Math.ceil(value);

    // const minAmountValue = Math.max(depositFiat.method?.min, valueNum)

    setDepositFiat({ formItem: { amount: valueNum?.toString() || '0' } });
    return valueNum;

  }, [depositFiat.method?.min, depositFiat.currency?.currency, setDepositFiat]);

  // useEffect(() => {
  //   const numAmount = parseFloat(depositFiat.formItem?.['amount'] || '0');
  //   setIsValidAmountPromo(numAmount >= depositFiat.method?.min && numAmount <= depositFiat.method?.max);
  // }, [depositFiat.method?.min, depositFiat.method?.max, depositFiat.formItem?.['amount']]);

  // 使用 useMemo 优化 rangeLabels 计算
  const rangeLabels = useMemo(() => {
    // 过滤掉小于 minAmountValue 的推荐金额
    const filteredRecommendedAmounts = (depositFiat.method?.recommended || default_deposit_range_options).filter((amount: string) => parseFloat(amount) > minAmountValue);

    const labels: Array<{ value: number, label: string, amount: number }> = [
      { value: 0, label: '0', amount: 0 },
      { value: 1, label: t('finance:min'), amount: minAmountValue },
      ...filteredRecommendedAmounts.map((presetAmount: string, index: number) => ({
        value: index + 2,
        label: '',
        amount: presetAmount
      })),
    ];
    if (depositFiat.method?.max > labels[labels.length - 1].amount) {
      labels.push({ value: labels.length, label: t('finance:max'), amount: depositFiat.method?.max });
    } else {
      labels[labels.length - 1].label = t('finance:max');
    }

    return labels;
  }, [depositFiat.method?.recommended, default_deposit_range_options, minAmountValue, depositFiat.method?.max]);

  // 计算 range 配置
  const { min: rangeMin, max: rangeMax, step: rangeStep } = useMemo(() => {
    return {
      min: 0,
      max: (rangeLabels.length - 1) * 100,
      step: 1
    };
  }, [rangeLabels.length]);


  // 缓存映射函数，避免重复计算，优化性能
  const mappingFunctions = useMemo(() => {
    const rangeStepSize = (rangeMax - rangeMin) / (rangeLabels.length - 1);
    const amounts = rangeLabels.map(item => item.amount);

    // 金额到 range 值的映射 - 优化版本
    const amountToRange = (amount: number): number => {
      if (amount <= amounts[0]) return rangeMin;
      if (amount >= amounts[amounts.length - 1]) return rangeMax;

      // 使用二分查找优化查找过程
      let left = 0, right = amounts.length - 1;
      while (left < right - 1) {
        const mid = Math.floor((left + right) / 2);
        if (amounts[mid] <= amount) {
          left = mid;
        } else {
          right = mid;
        }
      }

      const progress = (amount - amounts[left]) / (amounts[right] - amounts[left]);
      return rangeMin + left * rangeStepSize + progress * rangeStepSize;
    };

    // range 值到金额的映射 - 优化版本
    const rangeToAmount = (rangeValue: number): number => {
      const normalizedValue = Math.max(rangeMin, Math.min(rangeMax, rangeValue));
      const rangeIndex = Math.floor((normalizedValue - rangeMin) / rangeStepSize);
      const progress = ((normalizedValue - rangeMin) % rangeStepSize) / rangeStepSize;

      if (rangeIndex >= amounts.length - 1) {
        return amounts[amounts.length - 1];
      }

      return amounts[rangeIndex] + progress * (amounts[rangeIndex + 1] - amounts[rangeIndex]);
    };

    return { amountToRange, rangeToAmount };
  }, [rangeLabels, rangeMin, rangeMax]);

  const setIsValidAmountCallback = useCallback((value: number) => {
    setIsValidAmountPromo(value >= depositFiat.method?.min && value <= rangeLabels[rangeLabels.length - 1].amount);
  }, [setIsValidAmountPromo, depositFiat.method?.min, rangeLabels]);

  // 使用 useCallback 优化事件处理函数，添加防抖优化
  const onRangeChange = useCallback((value: string) => {
    const rangeValue = parseFloat(value);
    const calculatedAmount = mappingFunctions.rangeToAmount(rangeValue);
    const flooredAmount = Math.floor(calculatedAmount);

    // 避免重复设置相同的值
    const currentAmount = parseFloat(depositFiat.formItem?.['amount'] || '0');
    if (Math.abs(flooredAmount - currentAmount) > 0) {
      setDepositFiat({ formItem: { amount: flooredAmount.toString() } });
      setIsValidAmountCallback(flooredAmount);
    }
  }, [mappingFunctions, setDepositFiat, depositFiat.formItem?.['amount'], setIsValidAmountCallback]);

  // 处理 range 拖动开始，禁止页面滚动
  const onRangeStart = useCallback(() => {
    // 禁止页面滚动
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  }, []);

  // 处理 range 拖动结束，恢复页面滚动
  const onRangeEnd = useCallback(() => {
    // 恢复页面滚动
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  }, []);

  const onNumberClick = useCallback((number: number) => {
    if (rangeLabels.length > 0 && number < rangeLabels.length && rangeLabels[number]) {
      setDepositFiat({ formItem: { amount: Math.floor(rangeLabels[number].amount).toString() } });
      setIsValidAmountCallback(rangeLabels[number].amount);
    }
  }, [rangeLabels, setDepositFiat, setIsValidAmountCallback]);

  // 计算当前 range 值，添加缓存优化
  const currentRangeValue = useMemo(() => {
    if (!depositFiat.formItem?.['amount'] || depositFiat.formItem?.['amount'] === '') return rangeMin;
    const amount = parseFloat(depositFiat.formItem?.['amount']);
    // 如果金额是整数且已经在刻度点上，直接返回对应的 range 值
    for (let i = 0; i < rangeLabels.length; i++) {
      if (Math.abs(amount - rangeLabels[i].amount) < 0.01) {
        return rangeMin + (i * (rangeMax - rangeMin)) / (rangeLabels.length - 1);
      }
    }
    return mappingFunctions.amountToRange(amount);
  }, [depositFiat.formItem?.['amount'], mappingFunctions, rangeMin, rangeMax, rangeLabels]);

  // 优化标记和标签的渲染，减少重复计算
  const markers = useMemo(() => {
    const currentAmount = parseFloat(depositFiat.formItem?.['amount'] || '0');
    const stepSize = (rangeMax - rangeMin) / (rangeLabels.length - 1);

    return rangeLabels.map((item, index) => ({
      ...item,
      isActive: currentAmount >= item.amount,
      rangeValue: rangeMin + index * stepSize
    }));
  }, [rangeLabels, depositFiat.formItem?.['amount'], rangeMin, rangeMax]);

  // 确保组件卸载时恢复页面滚动
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, []);

  return (
    <div className="w-full">
      <input
        type="range"
        min={rangeMin}
        max={rangeMax}
        value={currentRangeValue}
        step={rangeStep}
        className={`range range-xs w-full [--range-bg:var(--color-base-content/10)] 
            ${parseFloat(depositFiat.formItem?.['amount'] || '0') >= minAmountValue ?
            '[--range-progress:var(--color-primary)]' :
            '[--range-progress:var(--color-warning)]'}`}
        onInput={(e) => onRangeChange(e.currentTarget.value)}
        onChange={(e) => onRangeChange(e.target.value)}
        onMouseDown={onRangeStart}
        onMouseUp={onRangeEnd}
        onTouchStart={onRangeStart}
        onTouchEnd={onRangeEnd}
      />
      <div className='relative w-full mt-2 h-[18px]'>
        {/* 标记线 */}
        <div className="flex justify-between text-sm text-white px-2.5 w-full absolute top-0 left-0">
          {markers.map((item, index) => (
            <span
              key={`marker-${index}`}
              className={`cursor-pointer hover:text-primary transition-colors w-[1px] 
                  ${item.label === '' ? '' : 'opacity-0'} 
                  ${item.isActive ? 'text-primary font-bold' : ''}`
              }
              onClick={() => onNumberClick(index)}
            >
              |
            </span>
          ))}
        </div>
        {/* 标签 */}
        <div className="flex justify-between text-sm text-white px-1 w-full absolute top-0 left-0" style={{ pointerEvents: 'none' }}>
          {markers.map((item, index) => (
            <span
              key={`label-${index}`}
              className={`cursor-pointer hover:text-primary transition-colors 
                  ${item.isActive ? 'text-primary font-bold' : ''}`
              }
              style={{ pointerEvents: item.label === '' ? 'none' : 'auto' }}
              onClick={() => onNumberClick(index)}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
      {minAmountValue > parseFloat(depositFiat.formItem?.['amount']) && (
        <p className="text-sm text-warning font-semibold leading-3 mt-2">
          {t('finance:minimum_deposit_for_bonus_eligibility',
            { value: ` ${minAmountValue} ${depositFiat.currency?.currency}` })}
        </p>
      )}
    </div>
  );
};
