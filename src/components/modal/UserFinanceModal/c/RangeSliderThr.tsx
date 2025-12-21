import { useCallback, useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBoundStore } from "@/store";
import { useGetPromoByPage } from "@/query/promo.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";

export const amounts = ["200", "500", "1000", "5000", "10000", "50000"];

export const RangeSliderThr = () => {
  const { convertCurrency, exchangeRates } = useCurrencyData();

  const [, setIsValidAmountPromo] = useState(false);

  const { t } = useTranslation();

  const { depositFiat, setDepositFiat } = useBoundStore();

  const { currentPromo } = useGetPromoByPage();

  const promoMinAmountValue = useMemo(() => {
    if (currentPromo?.promo_type !== 1) return undefined;

    const value = convertCurrency({
      amount: currentPromo?.min_amount,
      fromCurrency: 'USDT',
      toCurrency: depositFiat?.currency?.currency,
      exchangeRates: exchangeRates,
    }) || 0;

    return Math.ceil(value);
  }, [currentPromo?.promo_type, currentPromo?.min_amount, depositFiat.currency?.currency, convertCurrency, exchangeRates]);

  const promoMaxAmountValue = useMemo(() => {
    if (currentPromo?.promo_type !== 1) return undefined;
    const value = convertCurrency({
      amount: currentPromo?.max_deposit,
      fromCurrency: 'USDT',
      toCurrency: depositFiat?.currency?.currency,
      exchangeRates: exchangeRates,
    }) || 0;

    const valueNum = Math.ceil(parseFloat(value.toString().replace(/,/g, '')));

    return valueNum;

  }, [currentPromo?.promo_type, currentPromo?.max_deposit, depositFiat.currency?.currency, convertCurrency, exchangeRates])


  useEffect(() => {
    if (currentPromo?.promo_type !== 1) return;
    if (promoMinAmountValue === undefined) return;

    const currentAmountRaw = depositFiat.formItem?.['amount'] ?? '';
    const currentAmountNumber = parseFloat(currentAmountRaw);

    if (currentAmountRaw !== '' && Number.isFinite(currentAmountNumber)) return;

    const nextAmount = promoMinAmountValue.toString();
    if (currentAmountRaw === nextAmount) return;

    setDepositFiat({ formItem: { amount: nextAmount } });
  }, [currentPromo?.promo_type, promoMinAmountValue, depositFiat.formItem?.['amount'], setDepositFiat]);


  // useEffect(() => {
  //   const numAmount = parseFloat(depositFiat.formItem?.['amount'] || '0');
  //   setIsValidAmountPromo(numAmount >= depositFiat.method?.min && numAmount <= depositFiat.method?.max);
  // }, [depositFiat.method?.min, depositFiat.method?.max, depositFiat.formItem?.['amount']]);

  const rangeLabels = useMemo(() => {
    const recommendedNumbers = (depositFiat.method?.recommended || amounts)
      .map((amount: string) => parseFloat(amount))
      .filter((n: number) => Number.isFinite(n));

    const sortedRecommended = [...recommendedNumbers].sort((a, b) => a - b);

    const recommendedMin = sortedRecommended.length > 0 ? sortedRecommended[0] : depositFiat.method?.min;
    const recommendedMax = sortedRecommended.length > 0 ? sortedRecommended[sortedRecommended.length - 1] : depositFiat.method?.max;

    const methodMin = depositFiat.method?.min ?? depositFiat.method?.min;
    const methodMax = depositFiat.method?.max ?? depositFiat.method?.max;

    const minLabelAmount = Math.min(recommendedMin, methodMin);
    const maxLabelAmount = Math.max(recommendedMax, methodMax);

    const middleRecommended = sortedRecommended
      .filter((n) => n > minLabelAmount && n < maxLabelAmount);

    const uniqueAmounts = Array.from(new Set([minLabelAmount, ...middleRecommended, maxLabelAmount]));

    const labels: Array<{ value: number, label: string, amount: number }> = uniqueAmounts.map((amount, index) => ({
      value: index + 1,
      label: index === 0 ? t('finance:min') : (index === uniqueAmounts.length - 1 ? t('finance:max') : ''),
      amount,
    }));

    return labels;
  }, [depositFiat.method?.recommended, depositFiat.method?.min, depositFiat.method?.max, t]);

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
    setIsValidAmountPromo(value >= rangeLabels[0].amount && value <= rangeLabels[rangeLabels.length - 1].amount);
  }, [setIsValidAmountPromo, rangeLabels]);

  // 使用 useCallback 优化事件处理函数，添加防抖优化
  const onRangeChange = useCallback((value: string) => {
    const rangeValue = parseFloat(value);
    const calculatedAmount = mappingFunctions.rangeToAmount(rangeValue);
    const flooredAmount = Math.floor(calculatedAmount);
    const nextAmount = flooredAmount;

    // 避免重复设置相同的值
    const currentAmount = parseFloat(depositFiat.formItem?.['amount'] || '0');
    if (Math.abs(nextAmount - currentAmount) > 0) {
      setDepositFiat({ formItem: { amount: nextAmount.toString() } });
      setIsValidAmountCallback(nextAmount);
    }
  }, [mappingFunctions, currentPromo?.promo_type, setDepositFiat, depositFiat.formItem?.['amount'], setIsValidAmountCallback]);

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
    <>
      <div className="w-full">
        <input
          type="range"
          min={rangeMin}
          max={rangeMax}
          value={currentRangeValue}
          step={rangeStep}
          className={`range range-xs w-full [--range-bg:var(--color-base-content/10)] 
            ${parseFloat(depositFiat.formItem?.['amount'] || '0') >= (promoMinAmountValue ?? 0) ?
              '[--range-progress:var(--color-primary)]' :
              '[--range-progress:var(--color-warning)]'}`}
          onInput={(e) => onRangeChange(e.currentTarget.value)}
          // onChange={(e) => onRangeChange(e.target.value)}
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
      </div>
      {promoMinAmountValue !== undefined && !(currentPromo?.promo_code === 'special_offer_thursday' || currentPromo?.promo_code === 'special_offer_sunday') && (
        <p className="text-sm text-warning font-semibold leading-3 mt-2">
          {t('finance:minimum_deposit_for_bonus_eligibility',
            { value: ` ${promoMinAmountValue} ${depositFiat.currency?.currency}` })
          }
        </p>
      )}
      {promoMaxAmountValue !== undefined && (currentPromo?.promo_code === 'special_offer_thursday' || currentPromo?.promo_code === 'special_offer_sunday') && (
        <p className="text-sm text-warning font-semibold leading-3 mt-2">
          {t('finance:maximum_deposit_for_bonus_eligibility',
            { value: ` ${promoMaxAmountValue} ${depositFiat.currency?.currency}` })
          }
        </p>
      )}
    </>
  );
};
