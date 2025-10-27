import { CurrencyIconPlaceholder } from "@/components/modal/UserFinanceModal/c/CurrencyIconPlaceholder.tsx";
import { useSupportedSwapToCurrenciesFilter } from "@/components/modal/UserFinanceModal/helper.ts";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { NumericFormat } from "@/components/modal/UserFinanceModal/c/NumericFormat.tsx";
import { ExchangeUSD } from "@/components/modal/UserFinanceModal/c/SwapSend.tsx";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useBoundStore } from "@/store";
import getSymbolFromCurrency from "currency-symbol-map";
import Decimal from "decimal.js";
import { EqualApproximately } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FormatAmount } from "sunmoon-working-components";

export const SwapReceive = () => {
  const { t } = useTranslation();

  const { swapTo, swapFrom, setSwapTo } = useBoundStore();

  const [l1, origin, currencies] = useSupportedSwapToCurrenciesFilter(swapFrom.currency);

  const { isLoading: l2, convertCurrency, exchangeRates } = useCurrencyData();

  const swapFeeRate = useMemo(() => {
    if (!swapFrom.currency || !swapTo.currency) return Decimal(0);
    const toFeeRate = swapTo.currency?.swap_fee_rate ?? Decimal(0);
    const fromFeeRate = swapFrom.currency?.swap_fee_rate ?? Decimal(0);
    return Decimal(fromFeeRate).plus(toFeeRate);
  }, [swapFrom, swapTo]);

  const exchangeRate = useMemo(() => {
    if (!swapFrom.currency?.currency || !swapTo.currency?.currency) return "0";
    
    const rate = convertCurrency({
      amount: 1,
      fromCurrency: swapFrom.currency.currency,
      toCurrency: swapTo.currency.currency,
      exchangeRates,
    }).toString();

    if (swapFeeRate.gt(0)) {
      const b = Decimal(rate);
      const c = b.minus(b.mul(swapFeeRate));
      const d = c.gt(0) ? c : Decimal(0);
      return d.toDP(8, Decimal.ROUND_DOWN).toString();
    }

    return rate;
  }, [l2, swapTo, swapFrom, swapFeeRate, exchangeRates]);

  const swapToAmount = useMemo(() => {
    if (l2 || !swapFrom.currency || !swapFrom.inAmount || !swapTo.currency) return "";
    if (!swapFrom.currency?.currency || !swapTo.currency?.currency) return "";
    
    const amount = convertCurrency({
      amount: swapFrom.inAmount,
      fromCurrency: swapFrom.currency.currency,
      toCurrency: swapTo.currency.currency,
      exchangeRates,
    }).toString();
    if (swapFeeRate.gt(0)) {
      const b = Decimal(amount);
      const c = b.minus(b.mul(swapFeeRate));
      const d = c.gt(0) ? c : Decimal(0);
      return d.toDP(8, Decimal.ROUND_DOWN).toString();
    }
    return amount;
  }, [l2, swapTo, swapFrom, swapFeeRate, exchangeRates]);

  const exchangeUSD = useMemo(() => {
    if (!swapToAmount || !swapTo.currency?.currency) return "0.00";
    return convertCurrency({
      amount: swapToAmount,
      fromCurrency: swapTo.currency.currency,
      toCurrency: "USDT",
      exchangeRates,
    }).toString();
  }, [swapToAmount, swapTo, exchangeRates]);

  useEffect(() => {
    if (Array.isArray(origin)) setSwapTo({ currency: origin[0] });
  }, [origin]);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-base-300 p-4 flex items-center justify-between rounded-xl gap-2">
        <div>
          <span className="text-base-content/50 text-xs font-semibold">{t("finance:swap_receive")}</span>
          <NumericFormat
            readOnly
            className="!px-0 !text-lg !h-7"
            placeholder="0.00"
            value={swapToAmount}
            thousandSeparator
            decimalScale={swapTo.currency?.decimal}
          />

          <ExchangeUSD amount={exchangeUSD} />
        </div>
        <div className="flex-shrink-0 flex flex-col gap-2 items-end">
          <div className="flex items-center gap-2">
            <SelectDropdown
              title={t("common.selectCurrency")}
              height="sm"
              options={currencies}
              value={swapTo.currency?.currency}
              onChange={(v) => {
                setSwapTo({ currency: origin.find((o: Record<string, any>) => o.currency === v) });
              }}
              placeholder={t("common.selectCurrency")}
              className="!w-[140px]"
              buttonClassName="rounded-full !p-2 !bg-base-400"
              showSearch
              loading={l1}
            />
          </div>
          <SmallLoading loading={l2} className="bg-base-400 !rounded-full" content={<CurrencySymbol rate={exchangeRate} />} />
        </div>
      </div>
      <div className="bg-base-300 p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-base-content/50 text-xs font-semibold">{t("finance:swap_send")}</span>
          <span className="text-base-content text-xs font-bold flex items-center gap-1">
            <CurrencyIconPlaceholder currency={swapFrom.currency?.currency} />
            <FormatAmount amount={swapFrom.inAmount} local decimals={18} />
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-base-content/50 text-xs font-semibold">{t("finance:swap_receive")}</span>
          <span className="text-base-content text-xs font-bold flex items-center gap-1">
            <CurrencyIconPlaceholder currency={swapTo.currency?.currency} />
            <FormatAmount amount={swapToAmount} local decimals={swapTo.currency?.decimal} />
          </span>
        </div>
      </div>
    </div>
  );
};

const CurrencySymbol = ({ rate }: { rate: string }) => {
  const { swapTo, swapFrom } = useBoundStore();
  const fiat = useMemo(() => {
    const v = ["USDC", "USDT"].includes(swapTo.currency?.currency) ? "USD" : swapTo.currency?.currency;
    return getSymbolFromCurrency(v);
  }, [swapTo.currency]);
  return (
    <div className="text-base-content/50 text-xs font-semibold text-end flex items-center gap-1">
      1<span>{swapFrom.currency?.currency}</span>
      <EqualApproximately className="w-4 h-4" />
      <FormatAmount unit={fiat ?? ""} amount={rate} decimals={swapTo.currency?.decimal} local />
      {!fiat && <span>{swapTo.currency?.currency}</span>}
    </div>
  );
};
