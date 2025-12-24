import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { NumericFormat } from "@/components/modal/UserFinanceModal/c/NumericFormat.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useSupportedFiatDepositGateways } from "@/hooks/api/useAuth.ts";
import { useDepositBonusConfig } from "@/hooks/api/usePublic.ts";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useBoundStore } from "@/store";
import Decimal from "decimal.js";
import { Plus } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FormatAmount } from "sunmoon-working-components";
import { RequireItem } from "@/components/modal/UserFinanceModal/c/RequireItem.tsx";
import { RangeSliderThr } from "./RangeSliderThr.tsx";
import { useGetPromoByPage } from "@/query/promo";
import { InnerProviderAmountRangeFormat } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import { DepositRangeOptions } from "@/components/modal/UserFinanceModal/c/DepositRangeOptions.tsx";
import { emitter } from "@/store/emitter.ts";

// 默认的数量输入快捷选项
export const amounts = ["200", "500", "1000", "5000", "10000", "50000"];

export const DepositFiatAmount = () => {
  const { currentPromo } = useGetPromoByPage();

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
    const usdBonusConfig = bonusConfig?.data?.find((item: {
      level: number
    }) => item.level - 1 === status?.deposit_bonus_times);
    return usdBonusConfig?.bonus_percent ?? 1;
  }, [bonusConfig, status]);

  const minAmountValue = useMemo(() => {
    if (currentPromo?.promo_type === 1) {
      const value = convertCurrency({
        amount: currentPromo?.min_amount,
        fromCurrency: "USDT",
        toCurrency: depositFiat?.currency?.currency,
        exchangeRates: exchangeRates
      }) || 0;

      const valueNum = Math.ceil(value || 0);

      return valueNum;
    }
    return 0;
  }, [depositFiat.currency?.currency, currentPromo, exchangeRates]);

  const maxAmountValue = useMemo(() => {
    if (currentPromo?.promo_type === 1) {

      const value = convertCurrency({
        amount: currentPromo?.max_deposit,
        fromCurrency: "USDT",
        toCurrency: depositFiat?.currency?.currency,
        exchangeRates: exchangeRates
      }) || 0;

      const valueNum = Math.ceil(value);

      return valueNum;
    }
    return 0;
  }, [depositFiat.currency?.currency, currentPromo, exchangeRates]);

  const rangeError = useMemo(() => {
    const d_amount = Decimal(depositFiat.formItem?.amount || 0);
    return (d_amount.lt(depositFiat.method?.min) || d_amount.gt(depositFiat.method?.max));
  }, [depositFiat.formItem, depositFiat.method]);

  useEffect(() => {
    setDepositFiat({ range_error: rangeError });
  }, [rangeError]);

  // 事件通知【CLOSE_FINANCE_MODAL- 关闭finance操作窗口】需要重置错误状态
  useEffect(() => {
    const em = emitter.addListener("CLOSE_FINANCE_MODAL", function () {
      setDepositFiat({ range_error: false });
    });

    return () => em?.remove();
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between pb-2 text-xs text-base-content/50 font-semibold">
        <RequireItem label={t(`finance:amount`)} />
        <SmallLoading
          loading={isLoading}
          content={
            <p>
              {depositFiat.method
                ? (<InnerProviderAmountRangeFormat
                  min={depositFiat.method?.min || 0}
                  max={depositFiat.method?.max || 0}
                  currency={depositFiat.currency?.currency} />)
                : (<>? {depositFiat.currency?.currency}</>)}
            </p>
          }
        />
      </div>

      {/* deposit fiat amount control */}
      <div className="relative overflow-hidden rounded-sm">
        <NumericFormat
          suf={
            <div className="text-primary text-sm font-bold flex items-center gap-1">
              <img src="/icons/ui/gift-box.svg" alt="" className="w-5 h-5" />
              <Plus size={10} strokeWidth={5} />
              {
                currentPromo?.promo_type === 1 && (() => {
                  if (parseFloat(depositFiat.formItem?.amount) < minAmountValue) {
                    return "0.00";
                  }
                  if (
                    currentPromo?.promo_code === "special_offer_thursday" ||
                    currentPromo?.promo_code === "special_offer_sunday"
                  ) {
                    const rawRate = Number(currentPromo?.bonus_rate ?? 0);
                    const rate = Number.isFinite(rawRate) ? rawRate : 0;

                    const parsedAmount = parseFloat(depositFiat.formItem?.amount);
                    if (!Number.isFinite(parsedAmount)) {
                      return "0.00";
                    }

                    const amountValue = Math.min(parsedAmount, maxAmountValue) * rate;

                    // 有小数：截断为 2 位；没有小数：直接返回整数
                    if (Number.isInteger(amountValue)) {
                      return amountValue.toString();
                    }

                    return Math.trunc(amountValue * 100) / 100;
                  } else {
                    const value = convertCurrency({
                      amount: currentPromo?.bonus_amount,
                      fromCurrency: "USDT",
                      toCurrency: depositFiat?.currency?.currency,
                      exchangeRates: exchangeRates
                    }) || 0;

                    return formatCurrency({
                      currency: depositFiat?.currency?.currency,
                      amount: value,
                      showCode: false,
                      showSymbol: true
                    }).formatted;
                  }
                })()
              }
              {
                !currentPromo && (
                  <FormatAmount
                    unit={getCurrencySymbol(depositFiat.currency?.currency)}
                    amount={String(Number(depositFiat.formItem?.amount) * bonusPercent)}
                    decimals={2}
                    local
                  />
                )
              }
            </div>
          }
          isAllowed={({ value }) => Decimal(value || 0).lt(1000000000000)}
          wrapCls="py-1"
          decimalScale={depositFiat.currency?.decimal}
          placeholder="0.00"
          prefix={getCurrencySymbol(depositFiat.currency?.currency)}
          value={depositFiat.formItem?.amount}
          thousandSeparator
          onValueChange={(values) => {
            setDepositFiat({
              formItem: { amount: values.value }
            });
          }}
        />

        <span
          className="absolute top-0 right-0 bg-primary text-[8px] font-bold px-2 text-primary-content rounded-bl-sm z-1">
          {
            currentPromo?.promo_type === 1 && (
              t(`finance:to_your_account_balance`)
            )
          }
          {
            !currentPromo && (
              t(`finance:toYourBonusPool`)
            )
          }
        </span>

        {/* 输入发生错误 - 数值输入范围错误 */}
        <ErrorMessageBox
          sample
          show={rangeError}
          content={<>{t("finance:pleaseEnterAnAmountBetween")}{" "}
            <InnerProviderAmountRangeFormat
              min={depositFiat.method?.min}
              max={depositFiat.method?.max}
              currency={depositFiat.currency?.currency} />
          </>}
        />

        {/* 数量输入快捷选项 - 无优惠充值活动的时候 */}
        <InnerDisplayContent show={true}>
          {
            ((currentPromo?.promo_code === "special_offer_thursday" || currentPromo?.promo_code === "special_offer_sunday") || !currentPromo) && (
              <DepositRangeOptions
                amount={depositFiat.formItem?.amount || 0}
                onChange={(amount) => setDepositFiat({ formItem: { amount: amount } })}
                rangeOptions={depositFiat.method?.recommended ?? amounts}
              />
            )
          }
          {
            currentPromo && currentPromo?.promo_type === 1 && currentPromo?.promo_code !== "special_offer_thursday" && currentPromo?.promo_code !== "special_offer_sunday" && (
              <div className="mt-3">
                <RangeSliderThr />
              </div>
            )
          }
        </InnerDisplayContent>
      </div>
    </div>
  );
};
