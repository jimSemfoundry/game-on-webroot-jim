import { createFileRoute } from "@tanstack/react-router";
import {
  EBonus,
  InnerBonusContainer,
  InnerBonusSlogan
} from "@/sections/dollars/components.tsx";
import clsx from "clsx";
import { useRTLContext } from "@/contexts/RTLContext.tsx";
import { useTranslation } from "react-i18next";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { FormBox } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
import { useBonusWalletHistory } from "@/hooks/api/useAuth.ts";
import { Decimal } from "decimal.js";
import { parser } from "@/components/header/message-v2/c/InnerMsgLink.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { HistoryIcon } from "lucide-react";

export const Route = createFileRoute("/_main/dollars/bonus/history" as any)({
  component: History
});

function History() {
  const { t } = useTranslation();

  const { user } = useAuth();

  const { isRTL } = useRTLContext();

  const { convertCurrency, formatCurrency, exchangeRates } = useCurrencyData();

  const currency_fiat = (user?.currency_fiat ?? "USD");

  const [status, setStatus] = useState<Record<string, any>>({
    data: [],
    page: 1,
    limit: 10,
    option: 0,
    last_id: "",
    is_jump_page: false
  });

  const { data, isFetching } = useBonusWalletHistory({
    page: status.page,
    limit: status.limit,
    status: status.option,
    last_id: ""
  });

  const options = useMemo(() => {
    return [
      {
        id: "0",
        value: 0,
        label: t(EBonusStatus["0"]) // "进行中"
      },
      {
        id: "1",
        value: 1,
        label: t(EBonusStatus["1"]) // "进行中"
      },
      {
        id: "2",
        value: 2,
        label: t(EBonusStatus["2"]) // "过期"
      },
      {
        id: "3",
        value: 3,
        label: t(EBonusStatus["3"]) // "待领取"
      },
      {
        id: "4",
        value: 4,
        label: t(EBonusStatus["4"]) // "已领取"
      },
      {
        id: "5",
        value: 5,
        label: t(EBonusStatus["5"]) // "失败结束"
      }
    ];
  }, [t]);

  /**
   * TODO: 快速点击分页的时候会导致数据更新出问题,需要限制更新频率
   *       isFetching
   */
  useEffect(() => {
    if (isFetching) return;
    setStatus((v) => ({
      ...v,
      data: data?.data ?? [],
      last_id: data?.last_id,
      is_jump_page: false
    }));
  }, [data, isFetching]);

  return (
    <div className="sm:min-h-[calc(100vh-100px)] max-w-[500px] m-auto sm:bg-base-400 sm:rounded-xl overflow-hidden">
      <InnerBonusContainer
        className={clsx("h-50 px-5 pt-20", { "-scale-x-100": isRTL })}>
        <InnerBonusSlogan title={t("bonus:bonusStore")} />
      </InnerBonusContainer>

      <div className={"flex flex-col gap-3 p-3 m-5 rounded-xl bg-base-200 mb-10"}>
        <div className="flex gap-2 items-center text-sm font-semibold">
          <HistoryIcon size={16} className="text-primary" />
          {t("common:common.history")}
        </div>

        <FormBox label={t("transaction:filters.status")}>
          <SelectDropdown
            height="sm"
            options={options}
            value={status.option}
            onChange={(option) => setStatus((v) => ({ ...v, option }))}
          />
        </FormBox>

        <div className={"relative min-h-[240px]"}>
          <div className="space-y-2">
            {status.data.map((data: Record<string, any>, index: number) => {
              const parsed_data = parser(data?.extra_data);
              const bonus_amount = formatCurrency({
                amount: convertCurrency({
                  amount: parsed_data?.bonus_amount || 0,
                  fromCurrency: EBonus.TOKEN,
                  toCurrency: currency_fiat,
                  exchangeRates
                }),
                currency: currency_fiat,
                showSymbol: true, showCode: false
              }).formatted;
              const purchase_amount = formatCurrency({
                amount: convertCurrency({
                  amount: parsed_data?.purchase_amount || 0,
                  fromCurrency: parsed_data?.purchase_currency,
                  toCurrency: currency_fiat,
                  exchangeRates
                }),
                currency: currency_fiat,
                showSymbol: true, showCode: false
              }).formatted;
              const wager = formatCurrency({
                amount: convertCurrency({
                  amount: data?.wager || 0,
                  fromCurrency: EBonus.TOKEN,
                  toCurrency: currency_fiat,
                  exchangeRates
                }),
                currency: currency_fiat,
                showSymbol: true, showCode: false
              }).formatted;
              const wager_require = formatCurrency({
                amount: convertCurrency({
                  amount: data?.wager_require || 0,
                  fromCurrency: EBonus.TOKEN,
                  toCurrency: currency_fiat,
                  exchangeRates
                }),
                currency: currency_fiat,
                showSymbol: true, showCode: false
              }).formatted;

              return (
                <div
                  key={index}
                  className={clsx("flex flex-col gap-2 rounded-field p-3 bg-base-300")}
                >
                  {/* 彩金打码状态 */}
                  <InnerItemWrap
                    label={t("bonus:bonusStore")}
                    value={<InnerStatusWrap value={data?.status} />}
                  />

                  {/* 花了多少钱购买彩金 */}
                  <InnerItemWrap
                    label={t("bonus:buyAmount")}
                    value={<div className={"flex flex-col items-end"}>
                      <span
                        className="text-primary font-bold">
                        {Decimal(parsed_data?.purchase_amount).toDP(18, Decimal.ROUND_DOWN).toString()}{" "}{parsed_data?.purchase_currency}
                      </span>
                      <span>≈{purchase_amount}</span>
                    </div>}
                  />

                  {/* 购买的彩金数量 */}
                  <InnerItemWrap
                    label={t("bonus:bonus")}
                    value={
                      <div className={"flex flex-col items-end"}>
                        <span
                          className="text-primary font-bold">{Decimal(parsed_data?.bonus_amount).toDP(2, Decimal.ROUND_DOWN).toString()}{" "}{EBonus.TOKEN}</span>
                        <span>≈{bonus_amount}</span>
                      </div>}
                  />

                  {/* 打码要求 */}
                  <InnerItemWrap
                    label={t("transaction:rollover.wagerRequirement")}
                    value={
                      <div className={"flex flex-col items-end"}>
                      <span
                        className="text-primary font-bold">{wager_require}</span>
                      </div>}
                  />

                  {/* 打码进度 */}
                  {data?.status !== 4 && <InnerItemWrap
                    className={"text-base-content font-bold"}
                    value={<span>{wager}{" "}/{" "}{wager_require}</span>}
                  />}

                  {/* 奖励领取 */}
                  {data?.status === 4 && <InnerItemWrap
                    label={t("bonus:claimed")}
                    value={
                      <span
                        className="text-base-content font-bold">{Decimal(data?.claim_amount || 0).toDP(18, Decimal.ROUND_DOWN).toString()}{" "}{data?.claim_currency}</span>
                    }
                  />}
                </div>
              );
            })}
          </div>

          {isFetching && <InnerDataLoading />}
          {!isFetching && Number(data?.total || 0) === 0 && <NothingFound icon={"/images/dollars/bonus.png"} />}
        </div>

        {/* Pagination */}
        <Paginate
          page={status.page}
          limit={status.limit}
          disabled={isFetching}
          pageCount={Math.ceil((data?.total || 0) / status.limit)}
          className="my-2"
          onJumpPage={(page) => {
            setStatus((v) => ({
              ...v,
              page,
              is_jump_page: true
            }));
          }}
          onPaginate={(page) => {
            setStatus((v) => ({ ...v, page, is_jump_page: false }));
          }} />
      </div>
    </div>
  );
}

const InnerItemWrap = ({ label, value, className }: { label?: string, value: ReactNode, className?: string }) => {
  return <div className="flex items-center justify-between text-xs font-semibold text-base-content/50">
    <span className={"truncate"}>{label}</span>
    <span className={clsx("text-end", className)}>{value}</span>
  </div>;
};

const InnerStatusWrap = ({ value }: { value: string }) => {
  const { t } = useTranslation();
  return <div
    className={clsx("text-xs border rounded-lg px-1 py-0.5", STATUS_DESC[`status_${value}`]?.style ?? STATUS_DESC.status_default.style)}>
    {t(STATUS_DESC[`status_${value}`]?.label ?? value)}
  </div>;
};

const InnerDataLoading = () => {
  return <div
    className="absolute inset-0 flex items-center justify-center rounded-xl overflow-hidden">
    <span className="loading loading-spinner loading-xl text-primary" />
  </div>;
};

enum EBonusStatus {
  "transaction:filters.all" = 0,
  "bonus:status.ongoing" = 1,
  "bonus:expires" = 2,
  "bonus:status.claim" = 3,
  "bonus:status.claimed" = 4,
  "bonus:bonus_failure_end" = 5,
  "bonus:bonus_give_up" = 7,
}

const STATUS_DESC: Record<string, any> = {
  status_1: {
    style: "border-info text-info",
    label: EBonusStatus["1"]
  },
  status_2: {
    style: "border-error text-error",
    label: EBonusStatus["2"]
  },
  status_3: {
    style: "border-primary text-primary-content bg-primary",
    label: EBonusStatus["3"]
  },
  status_4: {
    style: "border-primary text-primary",
    label: EBonusStatus["4"]
  },
  status_5: {
    style: "border-error text-error",
    label: EBonusStatus["5"]
  },
  status_7: {
    style: "border-error text-error",
    label: EBonusStatus["7"]
  },
  status_default: {
    style: "border-error text-error px-2",
    label: undefined
  }
};
