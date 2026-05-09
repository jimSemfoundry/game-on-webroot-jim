import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { NumericFormat } from "@/components/modal/UserFinanceModal/c/NumericFormat.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useBoundStore } from "@/store";
import getSymbolFromCurrency from "@/utils/currencySymbol";
import Decimal from "decimal.js";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import FormatAmount from "@/components/modal/UserFinanceModal/c/FormatAmount";
import { InnerExchange } from "@/components/modal/BonusSwapModal/SwapSend.tsx";
import { ESport, InnerBonusItem } from "@/sections/dollars/components.tsx";
import { parser } from "@/components/header/message-v2/c/InnerMsgLink.tsx";

export const SportsSwapReceive = ({
  open,
  data,
  minimum
}: {
  open: boolean;
  data: Record<string, any>;
  minimum: string;
}) => {
  const { t } = useTranslation();

  const { bonusSwapTo, bonusSwapFrom, setBonusSwapTo } = useBoundStore();

  const { isLoading: l2, convertCurrency, exchangeRates } = useCurrencyData();

  const exchangeRate = useMemo(() => {
    if (!bonusSwapFrom.currency?.currency || !bonusSwapTo.currency?.currency) return "0";
    return convertCurrency({
      amount: 1,
      fromCurrency: bonusSwapFrom.currency.currency,
      toCurrency: bonusSwapTo.currency.currency,
      exchangeRates
    }).toString();
  }, [l2, bonusSwapTo, bonusSwapFrom, exchangeRates]);

  const swapToAmount = useMemo(() => {
    if (l2 || !bonusSwapFrom.currency || !bonusSwapFrom.inAmount || !bonusSwapTo.currency) return "";
    if (!bonusSwapFrom.currency?.currency || !bonusSwapTo.currency?.currency) return "";

    if (Number(bonusSwapFrom.inAmount || 0) < Number(minimum)) return "0";

    return Decimal(exchangeRates?.[bonusSwapFrom.currency.currency] || 0)
      .div(exchangeRates?.[bonusSwapTo.currency.currency] || 1)
      .times(bonusSwapFrom.inAmount || 0)
      .toFixed(bonusSwapTo.currency?.display_decimal, Decimal.ROUND_DOWN)
      .toString();
  }, [l2, minimum, bonusSwapTo, bonusSwapFrom, exchangeRates]);

  const parsed_data = parser(data?.extra_data);
  const parsed_rate = parsed_data?.bonus_rate || 0;
  const bonus_rate = Decimal(parsed_rate).times(100).toFixed(0) + "%";
  const extra_bonus =
    Number(swapToAmount) > 0 && Number(bonusSwapFrom.inAmount || 0) >= Number(minimum)
      ? Decimal(swapToAmount).times(parsed_rate).toDP(2, Decimal.ROUND_DOWN)
      : Decimal(0);

  useEffect(() => {
    if (!open) setBonusSwapTo({ outAmount: "" });
  }, [open]);

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-base-300 p-3 flex items-center justify-between rounded-xl gap-2">
        <div className="truncate">
          <span className="text-base-content/50 text-xs font-semibold">{t("bonus:youGet")}</span>
          <NumericFormat
            readOnly
            wrapCls={"!px-0"}
            className="!px-0 !text-base !h-7"
            placeholder="0.00"
            value={swapToAmount}
            thousandSeparator
            decimalScale={bonusSwapTo.currency?.decimal}
          />
          <InnerExchange amount={swapToAmount} fromCurrency={ESport.TOKEN} />
        </div>
        <div className="flex-shrink-0 flex flex-col gap-2 items-end">
          <div className="flex items-center gap-2 w-[150px] rounded-full p-2 bg-base-400">
            <img
              src="/images/dollars/sport.png"
              className="w-6 h-6"
              alt=""
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/images/dollars/bonus.png";
              }}
            />
            <span className="text-sm font-bold">{bonusSwapTo.currency?.currency}</span>
          </div>
          {Number(exchangeRate) > 0 && (
            <SmallLoading
              loading={l2}
              className="bg-base-400 !rounded-full"
              content={<InnerCurrency rate={exchangeRate} />}
            />
          )}
        </div>
      </div>

      <InnerBonusItem
        src={'images/bonus/sport.png'}
        rate={bonus_rate}
        className="flex-row items-center justify-between px-3 py-2 bg-primary/10 text-xs font-bold rounded-lg"
      />

      <div className="bg-base-300 p-4 rounded-xl">
        <InnerDataLabel
          label={t("bonus:youPay")}
          currency={bonusSwapFrom.currency?.currency}
          amount={bonusSwapFrom.inAmount}
          decimal={bonusSwapFrom.currency?.decimal}
        />
        <InnerDataLabel
          label={t("bonus:extraBonus")}
          currency={bonusSwapTo.currency?.currency}
          amount={extra_bonus.toString()}
          decimal={bonusSwapTo.currency?.decimal}
        />
        <InnerDataLabel
          label={t("bonus:bonusReceived")}
          currency={bonusSwapTo.currency?.currency}
          amount={extra_bonus.plus(swapToAmount || 0).toString()}
          decimal={bonusSwapTo.currency?.decimal}
        />
      </div>
    </div>
  );
};

const InnerCurrency = ({ rate }: { rate: string }) => {
  const { bonusSwapTo, bonusSwapFrom } = useBoundStore();
  const fiat = useMemo(() => {
    const v = ["USDC", "USDT"].includes(bonusSwapTo.currency?.currency)
      ? "USD"
      : bonusSwapTo.currency?.currency;
    return getSymbolFromCurrency(v);
  }, [bonusSwapTo.currency]);
  return (
    <div className="text-base-content/50 text-xs font-semibold text-end flex items-center gap-1">
      1<span>{bonusSwapFrom.currency?.currency}</span>≈
      <FormatAmount unit={fiat ?? ""} amount={rate} decimals={bonusSwapTo.currency?.decimal} local />
      {!fiat && <span>{bonusSwapTo.currency?.currency}</span>}
    </div>
  );
};

const InnerDataLabel = ({
  label,
  amount,
  currency,
  decimal
}: {
  label: string;
  amount: string;
  currency: string;
  decimal: number;
}) => {
  return (
    <div className="flex items-center justify-between mt-1">
      <span className="text-base-content/50 text-xs font-semibold">{label}</span>
      <div className="text-right">
        <div className="text-base-content text-xs font-bold flex items-center gap-1 justify-end">
          <FormatAmount amount={amount} local decimals={decimal} />
          {currency}
        </div>
        <InnerExchange amount={amount} fromCurrency={currency} />
      </div>
    </div>
  );
};
