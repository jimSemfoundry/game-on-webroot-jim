import { Carousel, useCarousel } from "@/components/carousel";
import Iconify from "@/components/iconify";
import { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { useUserBuddyBallsHome } from "@/hooks/api/useAuth";
import { useDailyCheckInConfig } from "@/hooks/api/usePublic";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModals } from "@/contexts/ModalsProvider";
import { authService } from "@/services/authService";
import { toast } from 'sonner';
import { CheckInCardLoading } from "../bonus-components/check-in-card-loading";

 const isSameUtcDate = (left: Date, right: Date) => left.getUTCFullYear() === right.getUTCFullYear()
   && left.getUTCMonth() === right.getUTCMonth()
   && left.getUTCDate() === right.getUTCDate();

 const getUtcDateKey = (date: Date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;

const formatCountdown = (totalSeconds: number) => {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const getLocalTimeForUtcMidnight = (now: Date = new Date()) => {
  const utcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(utcMidnight);
};

const useUtcMidnightCountdown = (enabled: boolean, onExpire?: () => void) => {
  const getSecondsUntilUtcMidnight = () => {
    const now = new Date();
    const nextUtcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
    return Math.max(0, Math.floor((nextUtcMidnight - now.getTime()) / 1000));
  };

  const [remaining, setRemaining] = useState(getSecondsUntilUtcMidnight);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!enabled) return;
    setRemaining(getSecondsUntilUtcMidnight());
    const id = setInterval(() => {
      const next = getSecondsUntilUtcMidnight();
      setRemaining(next);
      if (next <= 0) {
        clearInterval(id);
        onExpireRef.current?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [enabled]);

  return { remaining, formatted: formatCountdown(remaining), expired: remaining <= 0 };
};

export function CheckInCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: buddyBallsData, refetch: refetchBuddyBalls, isLoading } = useUserBuddyBallsHome();

  const { isAuthenticated, isInitialized } = useAuth();
  const { openSignInModal } = useAuthModals();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const today = new Date();
  const lastCheckInAt = buddyBallsData?.data?.continuous_checkin_last_date_ts;
  const lastCheckInDate = lastCheckInAt ? new Date(lastCheckInAt * 1000) : null;
  const continuousCheckInDaysInPeriod = buddyBallsData?.data?.continuous_checkin_days_in_period || 0;
  const isTodayChecked = !!lastCheckInDate
    && isSameUtcDate(lastCheckInDate, today);

  const { expired: countdownExpired } = useUtcMidnightCountdown(
    isTodayChecked,
    () => { void refetchBuddyBalls(); },
  );
  const isButtonDisabled = isCheckingIn || (isTodayChecked && !countdownExpired);

  const dailyResetLocalTime = getLocalTimeForUtcMidnight(today);

  const navigateToCheckAndScrollBottom = () => {
    sessionStorage.setItem('bonusCheckScrollToBottom', '1');
    void navigate({ to: "/bonus/check" });
  };

  const handleCheckInHistory = () => {
    if (isAuthenticated) {
      void navigate({ to: "/bonus/check" });
    } else {
      openSignInModal();
    }
  };

  const handleCheckIn = () => {
    if (isAuthenticated) {
      checkIn()
    } else {
      openSignInModal();
    }
  };

  const checkIn = () => {
    setIsCheckingIn(true);
    authService.dailyCheckin().then((req) => {
      if (req.code === 0) {
        toast.success(t('toast:check_in_success'));
        return refetchBuddyBalls();
      } else if (req.code === 51046) {
        toast.error(t('toast:check_in_already'));
      } else {
        toast.error(t('toast:check_in_failed'));
      }
      return null;
    }).catch(() => {
      toast.error(t('toast:check_in_failed'));
    }).finally(() => {
      setIsCheckingIn(false);
    });
  };
  
  const isInitialLoading = !isInitialized || (isAuthenticated && isLoading && !buddyBallsData);

  if (isInitialLoading) return <CheckInCardLoading />;

  return (
    <div className="gap-3 flex flex-col py-2.5">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold capitalize text-base-content/50">
          <Trans
            i18nKey={"bonus:day_streak"}
            values={{ value: continuousCheckInDaysInPeriod }}
            components={[<span className="text-sm font-semibold" />]}
          />
        </div>
        <div className="text-sm font-semibold text-base-content underline capitalize cursor-pointer hidden xl:block" onClick={handleCheckInHistory}>
          {t('common:common.history')}
        </div>
      </div>
      <CheckInIconsCarousel />

      <button className="btn btn-primary w-full btn-md capitalize" onClick={handleCheckIn} disabled={isButtonDisabled}>{isCheckingIn ? <Iconify icon="mdi:loading" className="animate-spin" /> : (isTodayChecked && !countdownExpired) ? t('bonus:daily_reset', { time: dailyResetLocalTime }) : t('bonus:check_in')}</button>

      {
        isAuthenticated && (
          <div className="flex gap-2">
            <button className="btn btn-primary btn-md btn-outline flex-1 capitalize" onClick={() => void navigate({ to: "/buddy-balls" })}>{t('gameDetail:play')}</button>
            <button className="btn btn-primary btn-md btn-outline flex-1 capitalize" onClick={navigateToCheckAndScrollBottom}>{t('bonus:get_more')}</button>
          </div>
        )
      }

    </div>
  );
}

export const CheckInIconsCarousel = () => {
  const { t } = useTranslation();
  const { data: buddyBallsData, refetch } = useUserBuddyBallsHome();
  const { data: dailyCheckInConfigData } = useDailyCheckInConfig();
  const { isAuthenticated } = useAuth();
  const continuousCheckInDays = buddyBallsData?.data?.continuous_checkin_days_in_period || 0;
  const today = new Date();
  const lastCheckInAt = buddyBallsData?.data?.continuous_checkin_last_date_ts;
  const lastCheckInDate = lastCheckInAt ? new Date(lastCheckInAt * 1000) : null;
  const normalizedContinuousCheckInDays = isAuthenticated && continuousCheckInDays > 0
    ? ((continuousCheckInDays - 1) % 30) + 1
    : 0;
  const currentRewardDay = !isAuthenticated
    ? 1
    : lastCheckInDate
      && isSameUtcDate(lastCheckInDate, today)
      ? Math.max(normalizedContinuousCheckInDays, 1)
      : Math.max((normalizedContinuousCheckInDays % 30) + 1, 1);
  const dailyCheckInList = dailyCheckInConfigData?.data?.list ?? [];

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const getCurrentUtcDateKey = () => getUtcDateKey(new Date());

    let lastDateKey = getCurrentUtcDateKey();

    const refreshBuddyBalls = () => {
      refetch();
      lastDateKey = getCurrentUtcDateKey();
    };

    const scheduleNextMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
      const delay = Math.max(nextMidnight.getTime() - now.getTime(), 1000);

      timeoutId = setTimeout(() => {
        refreshBuddyBalls();
        scheduleNextMidnight();
      }, delay);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      const currentDateKey = getCurrentUtcDateKey();

      if (currentDateKey !== lastDateKey) {
        refreshBuddyBalls();
      }
    };

    scheduleNextMidnight();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);

  const carousel = useCarousel({
    slidesToShow: "auto",
    startIndex: Math.max(currentRewardDay - 1, 0),
    dragFree: true,
    align: "start",
    loop: false,
    containScroll: "trimSnaps" // 防止滚动超出边界
  });

  return (
    <div className="flex select-none -mx-1">
      <Carousel carousel={carousel}>
        {
          Array.from({ length: 30 }).map((_, index) => {
            const day = index + 1;
            const isTodayCard = isAuthenticated && day === currentRewardDay;
            const isDefaultDayCard = !isAuthenticated && day === 1;
            const isActiveCard = isTodayCard || isDefaultDayCard;
            const isClaimedCard = day <= continuousCheckInDays;
            const cardClassName = isActiveCard && !isClaimedCard
              ? 'bg-primary-content border-primary'
              : 'bg-base-200 border-base-100';
            const labelClassName = isActiveCard && !isClaimedCard
              ? 'text-primary-content bg-primary'
              : 'bg-base-100 text-base-content/50';
            const rewardConfig = dailyCheckInList[index % Math.max(dailyCheckInList.length, 1)] as { ball?: number } | undefined;
            const ball = rewardConfig?.ball ?? null;
            const ballIconSrc = ball === 12
              ? '/images/bonus/ball-12.png'
              : ball === 9
                ? '/images/bonus/ball-9.png'
                : ball === 6
                  ? '/images/bonus/ball-6.png'
                  : ball === 3
                    ? '/images/bonus/ball-3.png'
                    : ball === 2
                      ? '/images/bonus/ball-2.png'
                      : ball === 1
                        ? '/images/bonus/ball-1.png'
                        : null;
            const showMoreBallBg = !!ball && ball > 2;

            return (
              <div className={`${cardClassName} w-16 h-16 border rounded-lg mx-1 flex flex-col items-center justify-between overflow-hidden relative`}>
                {isAuthenticated && isClaimedCard &&
                  (
                    <div className="bg-base-100 rounded-bl-sm absolute top-0 right-0 w-4 h-4 flex items-center justify-center z-50">
                      <Iconify icon="custom:check_in" width={8} height={6} className="text-primary" />
                    </div>
                  )
                }

                {
                  (!isClaimedCard && isTodayCard) && (
                    <div className="bg-primary rounded-full absolute top-1.5 right-1.5 w-1 h-1 z-40" />
                  )
                }

                <div className="flex-1 w-full relative">
                  {showMoreBallBg && (
                    <img src="/images/bonus/more-ball-bg.png" alt="" className={`object-cover w-full h-full absolute top-0 left-0`} />
                  )}
                  {ballIconSrc && (
                    <img src={ballIconSrc} alt="" className={`h-[30px] object-cover absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`} />
                  )}
                </div>

                <div className={`${labelClassName} text-[8px] font-semibold h-3.5 w-full flex items-center justify-center capitalize`}>
                  {isTodayCard ? `${t('chat:today')}` : `D${day}`}
                </div>
              </div>
            )
          })
        }
      </Carousel>
    </div>
  );
};
