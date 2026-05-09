import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { parser } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";
import { useTranslation } from "react-i18next";
import { InnerConfirmBox } from "@/sections/dollars/components.tsx";
import dayjs from "dayjs";
import {
  InnerBannerPerson,
  InnerTimeDesc,
  InnerTimeLabel,
  InnerContainer, InnerBannerWrapper, InnerBannerContent, useNavigateGuard, InnerBannerTitleV2
} from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { emitter } from "@/store/emitter.ts";
import duration from "dayjs/plugin/duration";
import i18n from "@/i18n.ts";
import { useNavigate } from "@tanstack/react-router";

dayjs.extend(duration);

const init = [0, 0, 0, 0];

export const DepositThursday = ({ content, extra_content }: {
  content: string
  extra_content: string
}) => {
  const timerRef = useRef<any>(null);

  const navigate = useNavigate();

  const { t } = useTranslation("bonus");

  const { navigateCallback } = useNavigateGuard();

  const banner = parser(content);
  const expired_at = banner?.expired_at ?? 0;

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
        <InnerBannerTitleV2 banner={banner_extra_content} percent={(banner?.bonus_rate || 0) * 100 + "%"} />

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
                // 加密周四充值只针对加密货币，需要主动激活加密货币存款Tab项目
                emitter.emit("FROM_DEPOSIT_PROMOTION_THURSDAY");

                // 打开存款窗口
                void navigate({ to: "/finance" });
              }, true);
            }}>
            {t(`banner:DEPOSIT_NOW`)}
          </InnerConfirmBox>
        </InnerContainer>
      </InnerBannerContent>

      {/* 人物 */}
      <InnerBannerPerson src={banner_extra_content?.picture} />
    </InnerBannerWrapper>
  );
};
