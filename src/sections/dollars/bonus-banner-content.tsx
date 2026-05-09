import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { bonus_dollars_router_path } from "@/sections/dollars/bonus-wallet.tsx";
import { BonusDollarsState, BonusNotAvailable, InnerConfirmBox } from "@/sections/dollars/components.tsx";
import { useTranslation } from "react-i18next";
import { emitter } from "@/store/emitter.ts";
import { parser } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";
import {
  InnerTimeDesc,
  useNavigateGuard,
  InnerTimeLabel,
  InnerContainer,
  InnerBannerTitle,
  InnerBannerWrapper,
  InnerTimeLabelPlaceholder,
  InnerBannerContent,
  InnerBannerPerson,
  InnerBannerButton
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import duration from "dayjs/plugin/duration";
import { InnerContentVisible } from "@/components/header/message-v2/c/InnerComponents.tsx";

dayjs.extend(duration);

const init = [0, 0, 0, 0];

export const DollarsBonusBannerItem = ({ data, content }: {
  data: Record<string, any>
  content: string
}) => {
  const timerRef = useRef<any>(null);

  const { navigate } = useNavigateGuard();

  const { t } = useTranslation(["tournament", "common", "banner", "bonus"]);

  const banner = parser(content);
  const expired_at = data?.extra_data?.expired_at ?? 0;
  const bonus_status = !BonusNotAvailable.has(data?.extra_data?.status) && BonusDollarsState.give_up !== data?.extra_data?.status;

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
        emitter.emit("UPDATE", "BONUS");
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
    if (!timerRef.current && expired_at && bonus_status) {
      startTimer();
    }
    return () => {
      stopTimer();
    };
  }, [expired_at, bonus_status]);
  // 钱包数据不是实时更新，有些情况下需要自己监听过期时间--end

  return (<InnerBannerWrapper>
    <InnerBannerContent>
      {/* 活动标语 */}
      <InnerBannerTitle list={banner?.text_list ?? []} data={data} banner={banner} className={"rtl:text-left"} />

      {expired_at && bonus_status
        ? (<InnerContainer className="relative w-50 rounded-lg p-2 mt-2 rtl:ml-auto">
          <InnerTimeDesc text={t("bonus:expires_in")} />

          <div className="flex w-full items-center gap-1">
            {expired_at > 0 && bonus_status
              ? <InnerTimeLabel value={estimatedTime[0]} label={t("common:common.daysUnit")} />
              : <InnerTimeLabelPlaceholder value={"--"} label={t("common:common.daysUnit")} />}

            {expired_at > 0 && bonus_status
              ? <InnerTimeLabel value={estimatedTime[1]} label={t("common:common.hours")} />
              : <InnerTimeLabelPlaceholder value={"--"} label={t("common:common.hours")} />}

            {expired_at > 0 && bonus_status
              ? <InnerTimeLabel value={estimatedTime[2]} label={t("common:common.minutes")} />
              : <InnerTimeLabelPlaceholder value={"--"} label={t("common:common.minutes")} />}

            {expired_at > 0 && bonus_status
              ? <InnerTimeLabel value={estimatedTime[3]} label={t("common:common.seconds")} />
              : <InnerTimeLabelPlaceholder value={"--"} label={t("common:common.seconds")} />}
          </div>

          <InnerConfirmBox
            className={"mt-2"}
            onClick={() => navigate(bonus_dollars_router_path["BONUS"], true)}>
            {t(`banner:${banner?.button_list[0]?.button_text}`)}
          </InnerConfirmBox>
        </InnerContainer>)
        : (<InnerContentVisible
          className={"flex flex-wrap gap-2"}
          show={banner?.button_list && banner?.button_list?.length > 0}>
          <InnerBannerButton banner={{ ...banner, name: data?.name }} />
        </InnerContentVisible>)}
    </InnerBannerContent>

    {/* 人物 */}
    <InnerBannerPerson src={banner?.float_image_list[0]?.mobile_image} />
  </InnerBannerWrapper>);
};