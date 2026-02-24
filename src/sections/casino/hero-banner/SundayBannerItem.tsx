import { useCallback, useState, useEffect, useRef } from "react";
import { parser } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";
import { useTranslation } from "react-i18next";
import { InnerConfirmBox } from "@/sections/dollars/components.tsx";
import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";
import {
  InnerBannerPerson,
  InnerBannerTitle,
  InnerTimeDesc,
  InnerTimeLabel,
  InnerContainer,
  useNavigateGuard, InnerBannerWrapper, InnerBannerContent
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { emitter } from "@/store/emitter.ts";

dayjs.extend(duration);

const init = [0, 0, 0, 0];

export const SundayBannerItem = ({ data, content }: {
  data: Record<string, any>,
  type: string,
  content: string
}) => {
  const timerRef = useRef<any>(null);

  const { t } = useTranslation(['common', 'banner', 'bonus']);

  const { navigate } = useNavigateGuard();

  const banner = parser(content);
  const expired_at = data?.extra_data?.expired_at ?? 0;

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
        <InnerBannerTitle list={banner?.text_list ?? []} data={data} banner={banner} />

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
              // TODO 目的：周日充值，需要主动激活法币存款Tab项目
              emitter.emit("FROM_DEPOSIT_PROMOTION_SUNDAY");

              navigate(banner?.button_list[0]?.button_link, true);
            }}>
            {t(`banner:${banner?.button_list[0]?.button_text}`)}
          </InnerConfirmBox>
        </InnerContainer>
      </InnerBannerContent>

      {/* 人物 */}
      <InnerBannerPerson src={banner?.float_image_list[0]?.mobile_image} />
    </InnerBannerWrapper>
  );
};