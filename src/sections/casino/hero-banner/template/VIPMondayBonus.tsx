import { useCallback, useState, useEffect, useRef } from "react";
import { parser } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";
import { useTranslation } from "react-i18next";
import { InnerConfirmBox } from "@/sections/dollars/components.tsx";
import dayjs from "dayjs";
import {
  InnerBannerPerson,
  InnerTimeDesc,
  InnerTimeLabel,
  InnerContainer,
  useNavigateGuard, InnerBannerWrapper, InnerBannerContent, InnerDataTranslation
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import duration from "dayjs/plugin/duration";
import clsx from "clsx";
import { useNavigate } from "@tanstack/react-router";

dayjs.extend(duration);

const init = [0, 0, 0, 0];

export const VIPMondayBonus = ({ content }: {
  content: string
}) => {
  const timerRef = useRef<any>(null);

  const navigate = useNavigate();

  const { t } = useTranslation("bonus");

  const { navigateCallback } = useNavigateGuard();

  const banner = parser(content);
  const expired_at = banner?.expired_at ?? 0;

  const [_timeFinished, setTimeFinished] = useState<boolean>(false);
  const [estimatedTime, setEstimatedTime] = useState<number[]>(init);

  // 钱包数据不是实时更新，有些情况下需要自己监听过期时间--start
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setEstimatedTime(() => init);
    }
    timerRef.current = null;
  };

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(function() {
      const current = dayjs().valueOf();

      const diff = dayjs(expired_at * 1000).diff(current);

      if (diff <= 0) {
        stopTimer();
        setTimeFinished(true);
        return;
      }

      const duration = dayjs.duration?.(diff);
      const days = Math.floor(duration.asDays());
      const hours = Math.floor(duration.asHours()) % 24;
      const minutes = Math.floor(duration.asMinutes()) % 60;
      const seconds = Math.floor(duration.asSeconds()) % 60;

      setEstimatedTime(() => [
        days,
        hours,
        minutes,
        seconds
      ]);
    }, 1_000);
  }, [expired_at]);

  // bonus wallet 的内部开关 - 倒计时
  useEffect(() => {
    if (!timerRef.current && expired_at) {
      startTimer();
    }
    return () => {
      stopTimer();
    };
  }, [expired_at]);
  // 钱包数据不是实时更新，有些情况下需要自己监听过期时间--end

  return (
    <InnerBannerWrapper>
      <InnerBannerContent>
        <div className="flex flex-col whitespace-pre-line font-black leading-5">
          <p className={clsx("text-base-content rtl:ml-auto")}>
            <InnerDataTranslation
              text={`${banner?.title}`}
              value=""
              percent="" />
          </p>
        </div>

        {/* 倒计时 */}
        <InnerContainer className="relative w-50 rounded-lg p-2 mt-2">
          <InnerTimeDesc text={t("bonus:expires_in")} />

          <div className="flex w-full items-center gap-1">
            <InnerTimeLabel value={estimatedTime[0]} label={t("common:common.daysUnit")} />
            <InnerTimeLabel value={estimatedTime[1]} label={t("common:common.hours")} />
            <InnerTimeLabel value={estimatedTime[2]} label={t("common:common.minutes")} />
            <InnerTimeLabel value={estimatedTime[3]} label={t("common:common.seconds")} />
          </div>

          <InnerConfirmBox
            className={"mt-2"}
            onClick={() => {
              navigateCallback(() => {
                // 解析path为路径和查询参数
                const url = new URL(decodeURIComponent("/bonus"), window.location.origin);
                const pathname = url.pathname;
                const searchParams = Object.fromEntries(url.searchParams?.entries() || []);

                void navigate({
                  to: pathname || "/",
                  search: searchParams
                });
              }, true);
            }}>
            {t(`banner:Claim_Now`)}
          </InnerConfirmBox>
        </InnerContainer>
      </InnerBannerContent>

      {/* 人物 */}
      <InnerBannerPerson src={banner?.picture} />
    </InnerBannerWrapper>
  );
};