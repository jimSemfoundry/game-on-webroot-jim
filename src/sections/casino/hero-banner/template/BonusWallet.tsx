import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { BonusDollarsState, BonusNotAvailable, InnerConfirmBox } from "@/sections/dollars/components.tsx";
import { useTranslation } from "react-i18next";
import { emitter } from "@/store/emitter.ts";
import { parser } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";
import {
  InnerTimeDesc,
  useNavigateGuard,
  InnerTimeLabel,
  InnerContainer,
  InnerBannerWrapper,
  InnerBannerContent,
  InnerTimeLabelPlaceholder,
  InnerBannerPerson,
  InnerBannerButtonV2, InnerBannerTitleV2
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import duration from "dayjs/plugin/duration";
import { useNavigate } from "@tanstack/react-router";
import i18n from "@/i18n.ts";

dayjs.extend(duration);

const init = [0, 0, 0, 0];

export const BonusWallet = ({ data, content, extra_content }: {
  data: Record<string, any>
  content: string
  extra_content: string
}) => {
  const timerRef = useRef<any>(null);

  const navigate = useNavigate();

  const { navigateCallback } = useNavigateGuard();

  const { t } = useTranslation(["tournament", "common", "banner", "bonus"]);

  const banner = parser(content);
  const expired_at = banner?.expired_at ?? 0;
  const bonus_status = !BonusNotAvailable.has(data?.extra_data?.status) && BonusDollarsState.give_up !== data?.extra_data?.status;

  const [_timeFinished, setTimeFinished] = useState<boolean>(false);
  const [estimatedTime, setEstimatedTime] = useState<number[]>(init);

  // 根据用户的语言匹配相应的模版内容
  const banner_extra_content = useMemo(() => {
    const keys = JSON.parse(extra_content)
    return keys.find((l: Record<string, any>) => l?.language === i18n.language) ?? (keys[0] || "en");
  }, [i18n.language]);

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

  const handleNavigate = () => {
    // 解析path为路径和查询参数
    const url = new URL(decodeURIComponent("/dollars/bonus"), window.location.origin);
    const pathname = url.pathname;
    const searchParams = Object.fromEntries(url.searchParams?.entries() || []);

    void navigate({
      to: pathname || "/",
      search: searchParams
    });
  };

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
      <InnerBannerTitleV2 banner={banner_extra_content} />

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
            onClick={() => {
              navigateCallback(handleNavigate, true);
            }}>
            {t(`banner:Claim_Now`)}
          </InnerConfirmBox>
        </InnerContainer>)
        : (<InnerBannerButtonV2
          text={t(`banner:Claim_Now`)}
          onClick={() => {
            navigateCallback(handleNavigate, true);
          }} />)}
    </InnerBannerContent>

    {/* 人物 */}
    <InnerBannerPerson src={banner_extra_content?.picture} />
  </InnerBannerWrapper>);
};