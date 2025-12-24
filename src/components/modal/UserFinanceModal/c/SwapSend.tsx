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
import { useNavigate } from "@tanstack/react-router";
import { useFinanceModal } from "@/contexts/ModalsProvider.tsx";
import { emitter } from "@/store/emitter.ts";

export const SwapSend = ({ open, loading, available }: { open: boolean; loading: boolean; available: string }) => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const [l1, origin, currencies] = useSupportedSwapFromCurrenciesFilter();

  // finance 弹窗控制开关
  const { closeUserFinanceModal } = useFinanceModal();

  const { swapFrom, setSwapFrom } = useBoundStore();

  const { isLoading: l2, convertCurrency, exchangeRates } = useCurrencyData();

  const exchangeUSD = useMemo(() => {
    if (l2 || !swapFrom.currency?.currency) return "0.00";
    return convertCurrency({
      amount: swapFrom.inAmount,
      fromCurrency: swapFrom.currency.currency,
      toCurrency: "USDT",
      exchangeRates
    }).toString();
  }, [l2, swapFrom, exchangeRates]);

  const insufficient = useMemo(() => {
    const d_available = Decimal(available);
    const d_in_amount = new Decimal(Number(swapFrom.inAmount)).gt(0);
    if (d_in_amount && d_available.lte(0)) return true;
    return d_in_amount && d_available.lt(swapFrom.inAmount || 0);
  }, [available, swapFrom.inAmount]);

  /**
   * FIXME:
   *  1. 进入swap页面，如果buck有值，则默认直接填入max，to那边是当前结算币
   *  2. 切换swap的来源（From 币），如果有值，则也自动填入max
   */
  useEffect(() => {
    if (open) setSwapFrom({ inAmount: Decimal(available).gt(0) ? available : "" });
  }, [open, available]);

  /**
   * FIXME:
   *  1. 进入swap页面，如果buck有值，则默认直接填入max，to那边是当前结算币
   *  2，切换swap的来源（From 币）， 如果有值，则也自动填入max
   */
  useEffect(() => {
    setSwapFrom({ inAmount: Decimal(available).gt(0) ? available : "" });
  }, [available]);

  // 事件通知【CLOSE_FINANCE_MODAL- 关闭finance操作窗口】需要重置表单状态
  useEffect(() => {
    const em = emitter.addListener("CLOSE_FINANCE_MODAL", function() {
      setSwapFrom({ inAmount: "" });
    });

    return () => em?.remove()
  }, []);

  return (
    <div className="bg-base-300 p-4 flex items-center justify-between rounded-xl gap-2">
      <div>
        <span className="text-base-content/50 text-xs font-semibold">{t("finance:swap_send")}</span>

        {/* swap send amount control */}
        <NumericFormat
          wrapCls={"!px-0"}
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
        <div className="flex items-center gap-2 justify-end">
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
            className="!w-[160px]"
            buttonClassName="rounded-full !p-2 !bg-base-400"
            showSearch
            loading={l1}
          />
        </div>

        {/* 可用余额 */}
        <div className="flex justify-end">
          <SmallLoading
            loading={loading}
            className="bg-base-400 !rounded-full"
            content={
              <span className="text-base-content/50 text-xs font-semibold underline cursor-pointer" onClick={() => {
                void navigate({ to: "/profile", search: (prev) => ({ ...prev, tab: "rollover" }) });

                closeUserFinanceModal();
              }}>
                {t("finance:available")}: <FormatAmount amount={available} local
                                                        decimals={swapFrom.currency?.decimal} />{" "}
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
