import { useSupportedSwapFromCurrenciesFilter } from "@/components/modal/UserFinanceModal/helper.ts";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { NumericFormat } from "@/components/modal/UserFinanceModal/c/NumericFormat.tsx";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useBoundStore } from "@/store";
import classNames from "classnames";
import Decimal from "decimal.js";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FormatAmount } from "sunmoon-working-components";

export const SwapSend = ({ loading, available }: { loading: boolean; available: string }) => {
  const { t } = useTranslation();

  const [isCurrencyLoading, origin, currencies] = useSupportedSwapFromCurrenciesFilter();

  const { swapFrom, setSwapFrom } = useBoundStore();

  const { isLoading: l3, convertCurrency, exchangeRates } = useCurrencyData();

  const exchangeUSD = useMemo(() => {
    if (l3 || !swapFrom.currency?.currency) return "0.00";
    return convertCurrency({
      amount: swapFrom.inAmount,
      fromCurrency: swapFrom.currency.currency,
      toCurrency: "USDT",
      exchangeRates,
    }).toString();
  }, [l3, swapFrom, exchangeRates]);

  const insufficient = useMemo(() => {
    const d_available = Decimal(available);
    const d_in_amount = new Decimal(Number(swapFrom.inAmount)).gt(0);
    if (d_in_amount && d_available.lte(0)) return true;
    return d_in_amount && d_available.lt(swapFrom.inAmount || 0);
  }, [available, swapFrom.inAmount]);

  useEffect(() => {
    if (Array.isArray(origin)) setSwapFrom({ currency: origin[0] });
  }, [origin]);

  useEffect(() => {
    if (swapFrom.currency) setSwapFrom({ inAmount: '' });
  }, [swapFrom.currency]);

  return (
    <div className="bg-base-300 p-4 flex items-center justify-between rounded-xl gap-2">
      <div>
        <span className="text-base-content/50 text-xs font-semibold">{t("finance:swap_send")}</span>

        {/* swap send amount control */}
        <NumericFormat
          className={classNames("!px-0 !text-lg !h-7", { "text-error": insufficient })}
          placeholder="0.00"
          value={swapFrom.inAmount}
          thousandSeparator
          onValueChange={(values) => {
            setSwapFrom({ inAmount: values.value });
          }}
          decimalScale={swapFrom.currency?.decimal}
        />

        <ExchangeUSD amount={exchangeUSD} />
      </div>

      <div className="flex-shrink-0 flex flex-col gap-2">
        {/* currency select options */}
        <div className="flex items-center gap-2">
          <span
            className="cursor-pointer text-xs font-extrabold underline uppercase"
            onClick={() => {
              if (Decimal(available).gt(0)) setSwapFrom({ inAmount: available });
            }}
          >
            {t("finance:max")}
          </span>
          <SelectDropdown
            title={t("common.selectCurrency")}
            height="sm"
            options={currencies}
            value={swapFrom.currency?.currency}
            onChange={(v) => {
              setSwapFrom({ currency: origin.find((o: Record<string, any>) => o.currency === v) });
            }}
            placeholder={t("common.selectCurrency")}
            className="!w-[140px]"
            buttonClassName="rounded-full !p-2 !bg-base-400"
            showSearch
            loading={isCurrencyLoading}
          />
        </div>

        {/* 可用余额 */}
        <div className="flex justify-end">
          <SmallLoading
            loading={loading}
            className="bg-base-400 !rounded-full"
            content={
              <span className="text-base-content/50 text-xs font-semibold">
                {t("finance:available")}: <FormatAmount amount={available} local decimals={swapFrom.currency?.decimal} />{" "}
                {swapFrom.currency?.currency}
              </span>
            }
          />
        </div>
      </div>
    </div>
  );
};

export const ExchangeUSD = ({ amount }: { amount: string }) => {
  return (
    <div className="text-[10px] font-bold text-base-content/50">
      <FormatAmount unit="$" amount={amount} decimals={2} local />
    </div>
  );
};
