import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { bonus_dollars_router_path } from "@/sections/dollars/bonus-wallet.tsx";
import { BonusDollarsState, InnerConfirmBox } from "@/sections/dollars/components.tsx";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { emitter } from "@/store/emitter.ts";
import { parser } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";
import {
  InnerTimeDesc,
  useNavigateGuard,
  InnerTimeLabel,
  InnerContainer,
  InnerBannerTitle, InnerBannerWrapper, InnerTimeLabelPlaceholder
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { getImgCompressParams } from "@/utils/helper.ts";
import duration from "dayjs/plugin/duration";
import { useRTLContext } from "@/contexts/RTLContext.tsx";

dayjs.extend(duration);

const init = [0, 0, 0, 0];

export const DollarsBonusBannerItem = ({ data, content }: {
  data: Record<string, any>
  content: string
}) => {
  const timerRef = useRef<any>(null);

  const { isRTL } = useRTLContext();

  const { navigate } = useNavigateGuard();

  const { t } = useTranslation(["tournament", "common", "banner", "bonus"]);

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
    if (!timerRef.current && expired_at) {
      startTimer();
    }
    return () => {
      stopTimer();
    };
  }, [expired_at]);
  // 钱包数据不是实时更新，有些情况下需要自己监听过期时间--end

  return (<InnerBannerWrapper className={"!p-0"}>
    <InnerBonusContainer src={getImgCompressParams(banner?.float_image_list?.[0]?.mobile_image, 209, 80)} $rtl={isRTL}
                         className={"p-4 h-full"}>
      {/* 引导bonus的tips */}
      {/*<InnerContentVisible show={data?.extra_data?.handle_status === 0}>*/}
      {/*  <InnerBonusTips*/}
      {/*    icon="/images/dollars/bonus.png"*/}
      {/*    type={"BONUS"}*/}
      {/*    text={t("bonus:bonus_dollars")} />*/}
      {/*</InnerContentVisible>*/}

      <div className="flex flex-col gap-2 mt-2">
        {/* 活动标语 */}
        <InnerBannerTitle list={banner?.text_list ?? []} data={data} banner={banner} className={"rtl:text-left"} />

        {/* 倒计时 */}
        <InnerContainer className="relative w-50 rounded-lg p-2 mt-2 rtl:ml-auto">
          <InnerTimeDesc text={t("bonus:expires_in")} />

          <div className="flex w-full items-center gap-1">
            {expired_at > 0 && ![BonusDollarsState.expired, BonusDollarsState.claimed, BonusDollarsState.failure_end, BonusDollarsState.give_up].includes(data?.extra_data?.status)
              ? <InnerTimeLabel value={estimatedTime[0]} label={t("common:common.daysUnit")} />
              : <InnerTimeLabelPlaceholder value={"--"} label={t("common:common.daysUnit")} />}

            {expired_at > 0 && ![BonusDollarsState.expired, BonusDollarsState.claimed, BonusDollarsState.failure_end, BonusDollarsState.give_up].includes(data?.extra_data?.status)
              ? <InnerTimeLabel value={estimatedTime[1]} label={t("common:common.hours")} />
              : <InnerTimeLabelPlaceholder value={"--"} label={t("common:common.hours")} />}

            {expired_at > 0 && ![BonusDollarsState.expired, BonusDollarsState.claimed, BonusDollarsState.failure_end, BonusDollarsState.give_up].includes(data?.extra_data?.status)
              ? <InnerTimeLabel value={estimatedTime[2]} label={t("common:common.minutes")} />
              : <InnerTimeLabelPlaceholder value={"--"} label={t("common:common.minutes")} />}

            {expired_at > 0 && ![BonusDollarsState.expired, BonusDollarsState.claimed, BonusDollarsState.failure_end, BonusDollarsState.give_up].includes(data?.extra_data?.status)
              ? <InnerTimeLabel value={estimatedTime[3]} label={t("common:common.seconds")} />
              : <InnerTimeLabelPlaceholder value={"--"} label={t("common:common.seconds")} />}
          </div>

          <InnerConfirmBox
            className={"mt-2"}
            onClick={() => navigate(bonus_dollars_router_path["BONUS"], true)}>
            {t(`banner:${banner?.button_list[0]?.button_text}`)}
          </InnerConfirmBox>
        </InnerContainer>
      </div>
    </InnerBonusContainer>
  </InnerBannerWrapper>);
};

export const InnerBonusContainer = styled.div<{ src?: string, $rtl: boolean }>`
    background: url(${props => props?.src}) no-repeat;
    background-position: ${props => props.$rtl
            ? "left bottom 0"
            : "right bottom 0"};
    position: relative;
    background-size: contain;
`;