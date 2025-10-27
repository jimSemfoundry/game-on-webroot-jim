import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { NumericFormat } from "@/components/modal/UserFinanceModal/c/NumericFormat.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useSupportedFiatDepositGateways } from "@/hooks/api/useAuth.ts";
import { useDepositBonusConfig } from "@/hooks/api/usePublic.ts";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useBoundStore } from "@/store";
import { cn } from "@/utils/cn.ts";
import Decimal from "decimal.js";
import { Plus } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FormatAmount } from "sunmoon-working-components";
import { RequireItem } from "@/components/modal/UserFinanceModal/c/RequireItem.tsx";
import { RangeSlider } from "./RangeSlider.tsx";
import { useCurrentPromo } from "@/query/promo";

// 默认的数量输入快捷选项
export const amounts = ["200", "500", "1000", "5000", "10000", "50000"];

export const DepositFiatAmount = ({ formKey }: { formKey: string }) => {
  const { currentPromo, isFetching } = useCurrentPromo();

  const { t } = useTranslation();

  const { status } = useAuth();

  // 获取存款奖励配置
  const { data: bonusConfig } = useDepositBonusConfig();

  // from data store, share common data
  const { depositFiat, setDepositFiat } = useBoundStore();

  // 获取法币的提供商
  const { isLoading } = useSupportedFiatDepositGateways(depositFiat.currency?.currency);

  // 查询代币信息
  const { getCurrencySymbol, convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();

  const bonusPercent = useMemo(() => {
    const usdBonusConfig = bonusConfig?.data?.find((item: { level: number }) => item.level - 1 === status?.deposit_bonus_times);
    return usdBonusConfig?.bonus_percent ?? 1;
  }, [bonusConfig, status]);

  const minAmountValue = useMemo(() => {

    const value = convertCurrency({
      amount: currentPromo?.min_amount,
      fromCurrency: 'USDT',
      toCurrency: depositFiat?.currency?.currency,
      exchangeRates: exchangeRates,
    }) || 0;

    const valueNum = Math.ceil(value || 0);

    const minAmountValue = Math.max(depositFiat.method?.min, valueNum)

    return minAmountValue;

  }, [depositFiat.method?.min, depositFiat.currency?.currency, currentPromo, exchangeRates]);

  const rangeError = useMemo(() => {
    const d_amount = Decimal(depositFiat.formItem?.[formKey] || 0);
    return (d_amount.lt(minAmountValue) || d_amount.gt(depositFiat.method?.max ?? 0))
  }, [depositFiat.formItem, depositFiat.method, minAmountValue]);

  useEffect(() => {
    setDepositFiat({ range_error: rangeError });
  }, [rangeError]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between pb-2 text-xs text-base-content/50 font-semibold">
        <RequireItem label={t(`finance:amount`)} />
        <SmallLoading
          loading={isLoading}
          content={
            <p>
              {depositFiat.method ? (
                <>
                  {depositFiat.method?.min?.toLocaleString()} ~ {depositFiat.method?.max?.toLocaleString()}{" "}
                  {depositFiat.currency?.currency}
                </>
              ) : (
                <>? {depositFiat.currency?.currency}</>
              )}
            </p>
          }
        />
      </div>

      {/* deposit fiat amount control */}
      <div className='relative overflow-hidden rounded-sm'>
        <NumericFormat
          suf={
            <div className="text-primary text-sm font-bold flex items-center gap-1">
              <img src="/icons/ui/gift-box.svg" alt="" className="w-5 h-5" />
              <Plus size={10} strokeWidth={5} />
              {
                !isFetching && currentPromo?.promo_type === 1 && (() => {

                  const value = convertCurrency({
                    amount: currentPromo?.bonus_amount,
                    fromCurrency: 'USDT',
                    toCurrency: depositFiat?.currency?.currency,
                    exchangeRates: exchangeRates,
                  }) || 0;

                  return formatCurrency({
                    currency: depositFiat?.currency?.currency,
                    amount: value,
                    showCode: false,
                    showSymbol: true,
                  }).formatted
                })()
              }
              {
                !isFetching && !currentPromo && (
                  <FormatAmount
                    unit={getCurrencySymbol(depositFiat.currency?.currency)}
                    amount={String(Number(depositFiat.formItem?.[formKey]) * bonusPercent)}
                    decimals={2}
                    local
                  />
                )
              }
            </div>
          }
          isAllowed={({ value }) => Decimal(value || 0).lt(1000000000000)}
          className='input-lg'
          decimalScale={depositFiat.currency?.decimal}
          placeholder="0.00"
          prefix={getCurrencySymbol(depositFiat.currency?.currency)}
          value={depositFiat.formItem?.[formKey]}
          thousandSeparator
          onValueChange={(values) => {
            setDepositFiat({
              formItem: { [formKey]: values.value },
            });
          }}
        />

        <span className='absolute top-0 right-0 bg-primary text-[8px] font-bold px-2 text-primary-content rounded-bl-sm z-1'>
          {
            !isFetching && currentPromo?.promo_type === 1 && (
              t(`finance:to_your_account_balance`)
            )
          }
          {
            !isFetching && !currentPromo && (
              'TO YOUR BONUS POOL'
            )
          }
        </span>


        {/* 输入发生错误 */}
        <ErrorMessageBox
          sample
          show={depositFiat.formItem?.[formKey] !== "" && rangeError}
          content={`${t("finance:pleaseEnterAnAmountBetween")}
                       ${depositFiat.method?.min?.toLocaleString()}
                       ~
                       ${depositFiat.method?.max?.toLocaleString()}
                       ${depositFiat.currency?.currency}`}
        />
        {/* 数量输入快捷选项 */}

        {
          !isFetching && !currentPromo && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(depositFiat.method?.recommended ?? amounts)?.map((amount: string, i: number) => (
                <button
                  key={i}
                  className={cn(
                    `btn btn-sm bg-base-300 text-base-content/50 border-0 rounded-sm`,
                    Decimal(amount || 0).eq(depositFiat.formItem?.[formKey] || 0) && "btn-outline btn-primary border-1 text-primary",
                  )}
                  onClick={() => setDepositFiat({ formItem: { [formKey]: amount } })}
                  disabled={!depositFiat.method}
                >
                  {getCurrencySymbol(depositFiat.currency?.currency)}
                  {amount.toLocaleString()}
                </button>
              ))}
            </div>
          )
        }
        {
          !isFetching && currentPromo?.promo_type === 1 && (
            <RangeSlider />
          )
        }
      </div>
    </div>
  );
};
