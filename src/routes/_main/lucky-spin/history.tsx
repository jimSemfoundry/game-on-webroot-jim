import { createFileRoute } from "@tanstack/react-router";
import {
  getPrizeImageUrl,
  InnerBonusContainer,
  InnerBonusSlogan, InnerDataLoading, InnerPrizeDisplay, maskUsername
} from "@/sections/lucky-spin/components.tsx";
import clsx from "clsx";
import { useRTLContext } from "@/contexts/RTLContext.tsx";
import { useTranslation } from "react-i18next";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { FormBox } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { useEffect, useMemo, useState } from "react";
import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
import { useAllSpinWinList } from "@/hooks/api/useAuth.ts";
import { parser } from "@/components/header/message-v2/c/InnerMsgLink.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";

export const Route = createFileRoute("/_main/lucky-spin/history" as any)({
  component: History
});

function History() {
  const { t } = useTranslation();

  const { isRTL } = useRTLContext();

  const [status, setStatus] = useState<Record<string, any>>({
    data: [],
    page: 1,
    limit: 10,
    option: "latest",
    last_id: "",
    is_jump_page: false
  });

  const { data, isFetching } = useAllSpinWinList({
    page: status.page,
    limit: status.limit,
    sort_type: status.option
  });

  const options = useMemo(() => {
    return [
      {
        id: "0",
        value: "latest",
        label: t('casino:latest') // "按中奖时间倒序（最新在前）"
      },
      {
        id: "1",
        value: "top",
        label: t('luckySpin:highest') // "最高价值"
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
      data: data?.data?.list ?? [],
      last_id: data?.last_id,
      is_jump_page: false
    }));
  }, [data, isFetching]);

  return (
    <div className="sm:min-h-[calc(100vh-100px)] max-w-[500px] m-auto sm:bg-base-400 sm:rounded-xl overflow-hidden">
      <InnerBonusContainer
        className={clsx("h-40 px-5 pt-18", { "-scale-x-100": isRTL })}>
        <InnerBonusSlogan />
      </InnerBonusContainer>

      <div className={"flex flex-col gap-3 p-3 m-5 rounded-xl bg-base-200 mb-10"}>
        <div className="flex gap-2 items-center text-sm font-semibold">
          <img src="/images/lucky-spin/spins-small.png" alt="" className={"w-6 h-6"} />
          {t("common:common.history")}
        </div>

        <FormBox label={t("transaction:filters.status")}>
          <SelectDropdown
            height="sm"
            options={options}
            value={status.option}
            onChange={(option) => setStatus((v) => ({ ...v, option, page: 1 }))}
          />
        </FormBox>

        <div className={"relative min-h-[240px]"}>
          <div className="space-y-2">
            {/*<div className={"flex justify-between text-base-content/50 text-xs font-bold"}>*/}
            {/*  <span>USER</span>*/}
            {/*  <span>CLAIM</span>*/}
            {/*</div>*/}
            {status.data.map((data: Record<string, any>, index: number) => {
              const parsed_data = parser(data?.extra_data);
              return (
                <div
                  key={index}
                  className={clsx("flex rounded-field p-3 bg-base-300 text-xs justify-between font-semibold")}
                >
                  <div className="flex items-center gap-2">
                    <img src={getPrizeImageUrl(parsed_data)} alt="" className={"w-5 h-5"} />
                    <InnerPrizeDisplay data={parsed_data} />
                  </div>
                  <span className={"text-base-content/50"}>{maskUsername(data?.user_name)}</span>
                </div>
              );
            })}
          </div>

          {isFetching && <InnerDataLoading />}
          {!isFetching && Number(data?.data?.total || 0) === 0 &&
            <NothingFound icon={"/images/lucky-spin/spins-small.png"} />}
        </div>

        {/* Pagination */}
        <Paginate
          page={status.page}
          limit={status.limit}
          disabled={isFetching}
          pageCount={Math.ceil((data?.data?.total || 0) / status.limit)}
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