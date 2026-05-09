import {
  useSupportedBonusSwapFromCurrenciesFilter
} from "@/components/modal/UserFinanceModal/helper.ts";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { NumericFormat } from "@/components/modal/UserFinanceModal/c/NumericFormat.tsx";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useBoundStore } from "@/store";
import clsx from "clsx";
import Decimal from "decimal.js";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import FormatAmount from "@/components/modal/UserFinanceModal/c/FormatAmount";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useCurrentUser } from "@/hooks/api/useAuth.ts";

export const SwapSend = ({ open, loading, minimum, currency, available, onClose }: {
  open: boolean;
  loading: boolean;
  minimum: string,
  currency: string,
  available: string,
  onClose: () => void
}) => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const [l1, origin, currencies] = useSupportedBonusSwapFromCurrenciesFilter();

  const { bonusSwapFrom, setBonusSwapFrom } = useBoundStore();

  const insufficient = useMemo(() => {
    const d_available = Decimal(available);
    const d_in_amount = new Decimal(Number(bonusSwapFrom.inAmount)).gt(0);
    if (d_in_amount && d_available.lte(0)) return true;
    return d_in_amount && d_available.lt(bonusSwapFrom.inAmount || 0);
  }, [available, bonusSwapFrom.inAmount]);

  useEffect(() => {
    if (!open) {
      setBonusSwapFrom({ inAmount: "" });
      return;
    }

    const d_available = new Decimal(available || 0);

    if (d_available.lte(0)) {
      setBonusSwapFrom({ inAmount: "" });
      return;
    }

    setBonusSwapFrom({ inAmount: d_available.toString() });
  }, [open, available, setBonusSwapFrom]);

  return (
    <div className="bg-base-300 p-3 flex flex-col rounded-xl gap-2">
      <div className="flex items-center justify-between">
        <div className={"truncate"}>
          <span className="text-base-content/50 text-xs font-semibold">{t("bonus:youPay")}</span>

          {/* swap send amount control */}
          <NumericFormat
            suffix={''}
            wrapCls={"!px-0"}
            className={clsx("!px-0 !text-base !h-7", { "text-error": insufficient })}
            placeholder="0.00"
            value={bonusSwapFrom.inAmount}
            thousandSeparator
            onValueChange={(values) => {
              setBonusSwapFrom({ inAmount: values.value });
            }}
            decimalScale={bonusSwapFrom.currency?.decimal}
          />

          <InnerExchange amount={bonusSwapFrom.inAmount} fromCurrency={bonusSwapFrom.currency?.currency} />
        </div>

        <div className="flex-shrink-0 flex flex-col gap-2">
          {/* currency select options */}
          <div className="flex flex-col items-end gap-2">
            {new Decimal(available || 0).gt(0) && <div
              className="cursor-pointer text-xs font-extrabold underline uppercase"
              onClick={() => {
                if (Decimal(available).gt(0)) setBonusSwapFrom({ inAmount: available });
              }}
            >
              {t("finance:max")}
            </div>}
            {
              bonusSwapFrom.currency
                ? <SelectDropdown
                  title={t("common:common.selectCurrency")}
                  height="sm"
                  options={currencies as any}
                  value={bonusSwapFrom.currency?.currency}
                  onChange={(v) => {
                    setBonusSwapFrom({ currency: origin.find((o: Record<string, any>) => o.currency === v) });
                  }}
                  placeholder={t("finance:select")}
                  className="!w-[150px] sm:!w-[230px]"
                  buttonClassName="rounded-full !p-2 !bg-base-400"
                  showSearch
                  loading={l1}
                />
                : <button className={"btn btn-primary btn-soft btn-sm"} onClick={() => {
                  onClose();

                  // 打开存款窗口
                  void navigate({to:'/finance'})
                }}>{t("bonus:deposit")}</button>
            }
          </div>

          {/* 可用余额 */}
          <div className="flex justify-end">
            <SmallLoading
              loading={loading}
              className="bg-base-400 !rounded-full"
              content={
                <span className="text-base-content/50 text-xs font-semibold underline cursor-pointer" onClick={() => {
                  void navigate({ to: "/profile", search: (prev) => ({ ...prev, tab: "rollover" }) });

                  onClose();
                }}>
                <FormatAmount amount={available} local decimals={bonusSwapFrom.currency?.decimal} />{" "}
                  {bonusSwapFrom.currency?.currency}
              </span>
              }
            />
          </div>
        </div>
      </div>
      {bonusSwapFrom.currency &&
        <div className="mt-2 bg-base-400 rounded-md p-2 flex justify-between text-xs font-semibold">
          <span className={"text-base-content/50"}>{t("finance:min")}</span>
          <div className="flex items-center gap-3">
            <span>{minimum}{" "}{currency}</span>
            {new Decimal(available || 0).lt(minimum || 0) &&
              <span className={"text-primary cursor-pointer"} onClick={() => {
                onClose();

                // 打开存款窗口
                void navigate({to:'/finance'});
              }}>{t("bonus:deposit")}</span>}
          </div>
        </div>}
    </div>
  );
};

export const InnerExchange = ({ amount, fromCurrency, toCurrency }: {
  amount: string,
  toCurrency?: string,
  fromCurrency: string
}) => {
  const current_user = useCurrentUser();

  const { convertCurrency, formatCurrency, exchangeRates } = useCurrencyData();

  const currency_fiat = (current_user?.data?.user?.currency_fiat ?? "USD");
  const final_amount = formatCurrency({
    amount: convertCurrency({
      amount: amount || 0,
      fromCurrency: fromCurrency || "USDT",
      toCurrency: toCurrency || currency_fiat,
      exchangeRates
    }),
    currency: toCurrency || currency_fiat,
    showSymbol: true, showCode: false
  }).formatted;

  return (
    <div className="text-[12px] font-semibold text-base-content/50">
      ≈{final_amount}
    </div>
  );
};
