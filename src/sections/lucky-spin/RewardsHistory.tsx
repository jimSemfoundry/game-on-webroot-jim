import clsx from "clsx";
import { useEffect, useState } from "react";
import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
import { useUserSpinWinList } from "@/hooks/api/useAuth.ts";
import {
  InnerDataLoading
} from "@/sections/buddy-balls/components.tsx";
import dayjs from "dayjs";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { parser } from "@/components/header/message-v2/c/InnerMsgLink.tsx";
import { getPrizeImageUrl, InnerPrizeDisplay } from "@/sections/lucky-spin/components.tsx";

export function RewardsHistory() {
  const [status, setStatus] = useState<Record<string, any>>({
    data: [],
    page: 1,
    limit: 10,
    last_id: "",
    is_jump_page: false
  });

  const { data, isFetching } = useUserSpinWinList({
    page: status.page,
    limit: status.limit,
    sort_type: "latest"
  });

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
    <>
      <div className={"relative min-h-[200px] mt-2"}>
        <div className="space-y-2">
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
                <span
                  className="text-xs text-base-content/50">
                    {dayjs((data?.claimed_at ?? 0) * 1000).format("DD/MM/YY HH:mm:ss")}</span>
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
    </>
  );
}
