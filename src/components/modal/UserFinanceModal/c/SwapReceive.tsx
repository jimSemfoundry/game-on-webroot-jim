import { useSupportedSwapToCurrenciesFilter } from "@/components/modal/UserFinanceModal/helper.ts";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { NumericFormat } from "@/components/modal/UserFinanceModal/c/NumericFormat.tsx";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useBoundStore } from "@/store";
import { useFiatSymbol } from "@/utils/currencySymbol";
import Decimal from "decimal.js";
import { EqualApproximately } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import FormatAmount from "./FormatAmount";
import { emitter } from "@/store/emitter.ts";

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
      exchangeRates
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

    const amount = (Decimal(exchangeRates?.[swapFrom.currency.currency] || 0)
      .div(exchangeRates?.[swapTo.currency.currency] || 1)
      .times(swapFrom.inAmount || 0)).toFixed(swapTo.currency?.display_decimal, Decimal.ROUND_DOWN).toString();

    if (swapFeeRate.gt(0)) {
      const b = Decimal(amount);
      const c = b.minus(b.mul(swapFeeRate));
      const d = c.gt(0) ? c : Decimal(0);
      return d.toFixed(swapTo.currency?.display_decimal, Decimal.ROUND_DOWN).toString();
    }

    return amount;
  }, [l2, swapTo, swapFrom, swapFeeRate, exchangeRates]);

  useEffect(() => {
    if (origin.length > 0) setSwapTo({ currency: origin[0] });
  }, [origin]);

  // 事件通知【CLOSE_FINANCE_MODAL- 关闭finance操作窗口】需要重置表单状态
  useEffect(() => {
    const em = emitter.addListener("CLOSE_FINANCE_MODAL", function () {
      setSwapTo({ outAmount: "" });
    });

    return () => em?.remove()
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-base-300 p-4 rounded-xl">
        <div className="flex justify-between">
          <div>
            <span className="text-base-content/50 text-xs font-semibold">{t("finance:swap_receive")}</span>
            <NumericFormat
              readOnly
              wrapCls={"!px-0"}
              className="!px-0 !text-lg !h-10 !py-2"
              placeholder="0.00"
              value={swapToAmount}
              thousandSeparator
              decimalScale={swapTo.currency?.decimal}
            />
          </div>
          <div className="flex-shrink-0 flex flex-col justify-end">
            <SelectDropdown
              title={t("common.selectCurrency")}
              height="sm"
              options={currencies}
              value={swapTo.currency?.currency}
              onChange={(v) => {
                setSwapTo({ currency: origin.find((o: Record<string, any>) => o.currency === v) });
              }}
              placeholder={t("common.selectCurrency")}
              className="!w-[120px]"
              buttonClassName="rounded-full !p-2 !bg-base-400"
              showSearch
              loading={l1}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <SmallLoading loading={l2} className="bg-base-400 !rounded-full"
            content={<CurrencySymbol rate={exchangeRate} />} />
        </div>
      </div>
      <div className="bg-base-300 p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-base-content/50 text-xs font-semibold">{t("finance:swap_send")}</span>
          <span className="text-base-content text-xs font-bold flex items-center gap-1">
            <FormatAmount amount={swapFrom.inAmount} local decimals={18} />
            {swapFrom.currency?.currency}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-base-content/50 text-xs font-semibold">{t("finance:swap_receive")}</span>
          <span className="text-base-content text-xs font-bold flex items-center gap-1">
            <FormatAmount amount={swapToAmount} local decimals={swapTo.currency?.decimal} />
            {swapTo.currency?.currency}
          </span>
        </div>
      </div>
    </div>
  );
};

const CurrencySymbol = ({ rate }: { rate: string }) => {
  // TODO: 使用服务端提供的法币缩写符号
  const { showFiatSymbol } = useFiatSymbol()

  const { swapTo, swapFrom } = useBoundStore();
  const fiat = useMemo(() => {
    const v = ["USDC", "USDT"].includes(swapTo.currency?.currency) ? "USD" : swapTo.currency?.currency;
    return showFiatSymbol(v);
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
