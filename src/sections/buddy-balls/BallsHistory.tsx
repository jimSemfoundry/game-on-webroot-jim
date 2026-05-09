import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
import { useBuddyBallsClaimList, useUserBuddyBallsHome } from "@/hooks/api/useAuth.ts";
import dayjs from "dayjs";
import { InnerDataLoading, InnerItemWrap } from "@/sections/buddy-balls/components.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";

export function BallsHistory() {
  const { t } = useTranslation(["buddyBalls"]);

  // 球游戏 -> 球游戏的主页信息
  const { data: buddy } = useUserBuddyBallsHome();

  const [status, setStatus] = useState<Record<string, any>>({
    data: [],
    page: 1,
    limit: 10,
    last_id: "",
    is_jump_page: false
  });

  const { data, isFetching } = useBuddyBallsClaimList({
    page: status.page,
    limit: status.limit,
    last_id: ""
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
    <div className="md:rounded-xl md:bg-base-200 md:p-3">
      <div className="mt-1 flex items-center justify-between gap-2 text-sm font-semibold">
        {t("buddyBalls:records")}
        <span
          className={"bg-primary rounded-lg text-primary-content font-bold px-2 py-0.5"}>{buddy?.data?.total_claimed_balls || 0}</span>
      </div>

      <div className={"relative min-h-[200px] mt-2"}>
        <div className="space-y-2">
          {status.data.map((data: Record<string, any>, index: number) => {
            return (
              <div
                key={index}
                className={clsx("flex flex-col gap-2 rounded-field border border-base-content/10 bg-base-300 p-3 font-semibold")}
              >
                <InnerItemWrap
                  label={t(`type_${data?.source}`)}
                  value={
                    <div className={"flex items-center gap-1 text-primary"}>
                      +{data?.ball}
                      <img src="/images/bonus/ball.png" alt="" className={"w-4 h-4"} />
                    </div>
                  }
                />
                <span
                  className="text-xs text-base-content/50">
                    {dayjs((data?.created_at ?? 0) * 1000).format("DD/MM/YY HH:mm:ss")}</span>
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

