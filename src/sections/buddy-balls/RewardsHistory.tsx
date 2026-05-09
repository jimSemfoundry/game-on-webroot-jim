import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
import { useBuddyBallsPlayList, useUserBuddyBallsHome } from "@/hooks/api/useAuth.ts";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";
import {
  InnerDataLoading, InnerItemWrap
} from "@/sections/buddy-balls/components.tsx";
import dayjs from "dayjs";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import Decimal from "decimal.js";

export function RewardsHistory() {
  const { t } = useTranslation();

  const { user } = useAuth();

  const { convertCurrency, formatCurrency, exchangeRates } = useCurrencyData();

  // 球游戏 -> 球游戏的主页信息
  const { data: buddy } = useUserBuddyBallsHome();

  const currency_fiat = (user?.currency_fiat ?? "USD");

  const [status, setStatus] = useState<Record<string, any>>({
    data: [],
    page: 1,
    limit: 10,
    last_id: "",
    is_jump_page: false
  });

  const { data, isFetching } = useBuddyBallsPlayList({
    page: status.page,
    limit: status.limit,
    last_id: ""
  });

  const bonus_amount_convert = formatCurrency({
    amount: convertCurrency({
      amount: Decimal(buddy?.data?.claimed_total_amount || 0).plus(buddy?.data?.processing_total_amount || 0).toString(),
      fromCurrency: "USDT",
      toCurrency: currency_fiat,
      exchangeRates
    }),
    currency: currency_fiat,
    showSymbol: true, showCode: false
  }).formatted;

  /**
   * TODO: 快速点击分页的时候会导致数据更新出问题,需要限制更新频率
   *       isFetching
   */
  useEffect(() => {
    if (isFetching) return;
    setStatus((v) => ({
      ...v,
      data: data?.data?.list ?? [],
      last_id: data?.last_id,
      is_jump_page: false
    }));
  }, [data, isFetching]);

  return (
    <div className="md:rounded-xl md:bg-base-200 md:p-3">
      <div className="mt-1 flex items-center justify-between gap-2 text-sm font-semibold">
        {t("buddyBalls:rewards")}
        <div
          className={"bg-primary rounded-lg text-primary-content font-bold px-2 py-0.5 flex flex-col text-primary"}>
          <span>{bonus_amount_convert}</span>
        </div>
      </div>

      <div className={"relative min-h-[200px] mt-2"}>
        <div className="space-y-2">
          {status.data.map((data: Record<string, any>, index: number) => {
            const bonus_amount = (data?.times || 0) * 0.01;
            const bonus_amount_convert = formatCurrency({
              amount: convertCurrency({
                amount: bonus_amount,
                fromCurrency: "USDT",
                toCurrency: currency_fiat,
                exchangeRates
              }),
              currency: currency_fiat,
              showSymbol: true, showCode: false
            }).formatted;

            return (
              <div
                key={index}
                className={clsx("flex flex-col gap-2 rounded-field border border-base-content/10 bg-base-300 p-3 font-semibold")}
              >
                {/* 彩金打码状态 */}
                <InnerItemWrap
                  label={t("buddyBalls:buddyBalls")}
                  value={
                    <div className={"flex flex-col text-primary"}>
                      <span>{bonus_amount} USDT</span>
                      <span className={"text-base-content/50 text-xs"}>≈{" "}{bonus_amount_convert}</span>
                    </div>
                  }
                />
                <span
                  className="text-xs text-base-content/50">
                    {dayjs((data?.play_time ?? 0) * 1000).format("DD/MM/YY HH:mm:ss")}</span>
              </div>
            );
          })}
        </div>

        {isFetching && <InnerDataLoading />}
        {!isFetching && Number(data?.data?.total || 0) === 0 && <NothingFound icon={"/images/bonus/buddy-balls.png"} />}
      </div>

      {/* Pagination */}
      <Paginate
        page={status.page}
        limit={status.limit}
        disabled={isFetching}
        pageCount={Math.ceil((data?.data?.total || 0) / status.limit)}
        className="my-5"
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
  );
}
