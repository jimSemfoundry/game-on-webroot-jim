import { createFileRoute } from '@tanstack/react-router'
import { Trans, useTranslation } from "react-i18next";
import { useReferralLink } from '@/hooks/useReferralLink';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ReferralShareModal } from '@/sections/referral/referral-share-modal';
import Iconify from '@/components/iconify';
import { authService } from "@/services/authService";
import { toast } from 'sonner';
import { useUserBuddyBallsHome } from "@/hooks/api/useAuth";
import { useDailyCheckInConfig } from '@/hooks/api/usePublic';
import { useNavigate } from '@tanstack/react-router';
import { getPathInROIBEST } from "@/utils/helper.ts";

const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
type CheckInDateItem = { sign_date?: number; sign_date_date?: string };
type RewardMapEntry = { rewardDay: number; ball: number | null };
type HistoricalRewardState = {
  rewardMap: Map<string, RewardMapEntry>;
  historyRewardDayMap: Map<string, number>;
  latestRewardDay: number;
  latestHistoryDateKey: string;
};

const createUtcDate = (year: number, month: number, day: number) => new Date(Date.UTC(year, month, day));

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

  useEffect(() => {
    if (!enabled) return;
    setRemaining(getSecondsUntilUtcMidnight());
    const id = window.setInterval(() => {
      const next = getSecondsUntilUtcMidnight();
      setRemaining(next);
      if (next <= 0) {
        window.clearInterval(id);
        onExpire?.();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [enabled, onExpire]);

  return {
    remaining,
    formatted: formatCountdown(remaining),
    expired: remaining <= 0,
  };
};

// 统一把本地日期转成 YYYY-MM-DD，方便做按天维度的比较和 Map 索引
const getDateKey = (date: Date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;

// 把 YYYY-MM-DD 还原成本地 Date，后续用于计算相邻日期差值
const parseDateKeyToDate = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return createUtcDate(year, month - 1, day);
};

// 优先使用后端已返回的日期字符串；没有时再用秒级时间戳兜底生成日期 key
const getCheckInDateKey = (item: CheckInDateItem) => item.sign_date_date || (item.sign_date ? getDateKey(new Date(item.sign_date * 1000)) : '');

// 去重并排序，得到完整签到历史的日期序列
const getSortedCheckInDateKeys = (checkInDates: CheckInDateItem[]) => [...new Set(
  checkInDates
    .map((item) => getCheckInDateKey(item))
    .filter(Boolean)
)].sort();

// 按 rewardDay 从配置列表里取出对应奖励；超出长度时按周期循环
const getRewardConfigForDay = (dailyCheckInList: { day: number; ball: number }[], rewardDay: number) => dailyCheckInList[(rewardDay - 1) % dailyCheckInList.length] as { day: number; ball: number } | undefined;

// 先把历史真实签到日映射成奖励日，并记录“每个历史日期对应本轮第几天”
const buildHistoricalRewardMap = (
  sortedHistoryDates: string[],
  dailyCheckInList: { day: number; ball: number }[],
  monthStartDate: Date,
  visibleCalendarEndDate: Date,
): HistoricalRewardState => {
  const rewardMap = new Map<string, RewardMapEntry>();
  const historyRewardDayMap = new Map<string, number>();
  let latestRewardDay = 0;

  sortedHistoryDates.forEach((dateKey, index) => {
    const currentDate = parseDateKeyToDate(dateKey);

    if (index === 0) {
      latestRewardDay = 1;
    } else {
      const previousDate = parseDateKeyToDate(sortedHistoryDates[index - 1]);
      const diffDays = Math.round((currentDate.getTime() - previousDate.getTime()) / (24 * 60 * 60 * 1000));

      if (diffDays !== 1 || latestRewardDay >= dailyCheckInList.length) {
        latestRewardDay = 1;
      } else {
        latestRewardDay += 1;
      }
    }

    historyRewardDayMap.set(dateKey, latestRewardDay);

    if (currentDate.getTime() >= monthStartDate.getTime() && currentDate.getTime() <= visibleCalendarEndDate.getTime()) {
      const rewardConfig = getRewardConfigForDay(dailyCheckInList, latestRewardDay);

      rewardMap.set(dateKey, {
        rewardDay: latestRewardDay,
        ball: rewardConfig?.ball ?? null,
      });
    }
  });

  return {
    rewardMap,
    historyRewardDayMap,
    latestRewardDay,
    latestHistoryDateKey: sortedHistoryDates[sortedHistoryDates.length - 1] ?? '',
  };
};

// 以最后一次历史签到为基准，向未来补齐当前月/展示月后续日期的奖励预览
const appendProjectedRewardMap = (
  rewardMap: Map<string, RewardMapEntry>,
  latestHistoryDateKey: string,
  latestRewardDay: number,
  dailyCheckInList: { day: number; ball: number }[],
  monthStartDate: Date,
  visibleCalendarEndDate: Date,
  todayDateKey: string,
  isTodayCheckedDay: boolean,
) => {
  if (!latestHistoryDateKey) {
    return;
  }

  const latestHistoryDate = parseDateKeyToDate(latestHistoryDateKey);
  const todayDate = parseDateKeyToDate(todayDateKey);
  const daysFromLatestHistoryToToday = Math.round((todayDate.getTime() - latestHistoryDate.getTime()) / (24 * 60 * 60 * 1000));
  const shouldResetOnToday = !isTodayCheckedDay && daysFromLatestHistoryToToday >= 2;
  let projectionRewardDay = latestRewardDay;
  let projectionCursorDate = latestHistoryDate;

  while (projectionCursorDate.getTime() < visibleCalendarEndDate.getTime()) {
    projectionCursorDate = createUtcDate(
      projectionCursorDate.getUTCFullYear(),
      projectionCursorDate.getUTCMonth(),
      projectionCursorDate.getUTCDate() + 1
    );

    const projectionDateKey = getDateKey(projectionCursorDate);

    if (shouldResetOnToday && projectionDateKey === todayDateKey) {
      projectionRewardDay = 1;
    } else {
      projectionRewardDay = projectionRewardDay >= dailyCheckInList.length ? 1 : projectionRewardDay + 1;
    }

    const rewardConfig = getRewardConfigForDay(dailyCheckInList, projectionRewardDay);

    if (!rewardMap.has(projectionDateKey) && projectionCursorDate.getTime() >= monthStartDate.getTime()) {
      rewardMap.set(projectionDateKey, {
        rewardDay: projectionRewardDay,
        ball: rewardConfig?.ball ?? null,
      });
    }
  }
};

// 当查看历史月份时，把这个月中没有真实签到记录但理论上属于同一奖励周期的日期反向补齐出来
const appendBackfilledRewardMap = (
  rewardMap: Map<string, RewardMapEntry>,
  sortedHistoryDates: string[],
  historyRewardDayMap: Map<string, number>,
  dailyCheckInList: { day: number; ball: number }[],
  displayedMonthBackfillStartDate: Date | null,
  visibleCalendarEndDate: Date,
) => {
  if (!displayedMonthBackfillStartDate) {
    return;
  }

  let cursorDate = createUtcDate(
    displayedMonthBackfillStartDate.getUTCFullYear(),
    displayedMonthBackfillStartDate.getUTCMonth(),
    displayedMonthBackfillStartDate.getUTCDate()
  );

  while (cursorDate.getTime() <= visibleCalendarEndDate.getTime()) {
    const cursorDateKey = getDateKey(cursorDate);

    if (!rewardMap.has(cursorDateKey)) {
      let matchedRewardDay: number | null = null;

      for (let index = sortedHistoryDates.length - 1; index >= 0; index -= 1) {
        const segmentDate = parseDateKeyToDate(sortedHistoryDates[index]);

        if (segmentDate.getTime() > cursorDate.getTime()) {
          continue;
        }

        const diffDays = Math.floor((cursorDate.getTime() - segmentDate.getTime()) / (24 * 60 * 60 * 1000));
        const segmentRewardDay = historyRewardDayMap.get(sortedHistoryDates[index]) ?? null;

        if (segmentRewardDay && diffDays >= 0) {
          matchedRewardDay = ((segmentRewardDay - 1 + diffDays) % dailyCheckInList.length) + 1;
          break;
        }
      }

      if (matchedRewardDay) {
        const rewardConfig = getRewardConfigForDay(dailyCheckInList, matchedRewardDay);

        rewardMap.set(cursorDateKey, {
          rewardDay: matchedRewardDay,
          ball: rewardConfig?.ball ?? null,
        });
      }
    }

    cursorDate = createUtcDate(cursorDate.getUTCFullYear(), cursorDate.getUTCMonth(), cursorDate.getUTCDate() + 1);
  }
};

// 新用户还没有任何签到历史时，从“今天”开始构造一个纯前瞻性的奖励映射
const buildNewUserRewardMap = (
  dailyCheckInList: { day: number; ball: number }[],
  today: Date,
  monthStartDate: Date,
  visibleCalendarEndDate: Date,
) => {
  const rewardMap = new Map<string, RewardMapEntry>();
  const seedDate = createUtcDate(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const currentSystemMonthStartDate = createUtcDate(today.getUTCFullYear(), today.getUTCMonth(), 1);
  const nextSystemMonthStartDate = createUtcDate(today.getUTCFullYear(), today.getUTCMonth() + 1, 1);

  if (monthStartDate.getTime() !== currentSystemMonthStartDate.getTime() && monthStartDate.getTime() !== nextSystemMonthStartDate.getTime()) {
    return rewardMap;
  }

  let rewardDay = 1;
  let cursorDate = monthStartDate.getTime() === currentSystemMonthStartDate.getTime()
    ? seedDate
    : monthStartDate;

  if (cursorDate.getTime() > visibleCalendarEndDate.getTime()) {
    return rewardMap;
  }

  if (monthStartDate.getTime() === nextSystemMonthStartDate.getTime()) {
    const dayOffset = Math.floor((monthStartDate.getTime() - seedDate.getTime()) / (24 * 60 * 60 * 1000));
    rewardDay = (dayOffset % dailyCheckInList.length) + 1;
  }

  while (cursorDate.getTime() <= visibleCalendarEndDate.getTime()) {
    const cursorDateKey = getDateKey(cursorDate);
    const rewardConfig = getRewardConfigForDay(dailyCheckInList, rewardDay);

    rewardMap.set(cursorDateKey, {
      rewardDay,
      ball: rewardConfig?.ball ?? null,
    });

    rewardDay = rewardDay >= dailyCheckInList.length ? 1 : rewardDay + 1;
    cursorDate = createUtcDate(cursorDate.getUTCFullYear(), cursorDate.getUTCMonth(), cursorDate.getUTCDate() + 1);
  }

  return rewardMap;
};

const getBallIconSrc = (ball: number | null) => ball === 12
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

export const Route = createFileRoute('/_main/bonus/check')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { referralLink } = useReferralLink();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return createUtcDate(now.getUTCFullYear(), now.getUTCMonth(), 1);
  });
  const { data: buddyBallsData, refetch: refetchBuddyBalls, isLoading: isBuddyBallsLoading } = useUserBuddyBallsHome();
  const { data: dailyCheckInConfigData } = useDailyCheckInConfig();

  // 当前时间与接口原始数据
  const today = new Date();
  const dailyResetLocalTime = getLocalTimeForUtcMidnight(today);
  const buddyBalls = buddyBallsData?.data;
  const dailyCheckInList = dailyCheckInConfigData?.data?.list ?? [];
  const historyCheckInDates = buddyBalls?.checkin_dates ?? [];
  const continuousCheckInDaysInPeriod = buddyBalls?.continuous_checkin_days_in_period || 0;
  const currentPeriodStartTs = buddyBalls?.buddy_balls_first_checkin_date_ts || 0;
  const currentPeriodLastCheckInTs = buddyBalls?.continuous_checkin_last_date_ts || 0;
  const firstEverCheckInTs = buddyBalls?.first_checkin?.sign_date || 0;

  // 先把历史签到日期整理成去重且有序的 key 集合，后面所有奖励推导都基于它
  const sortedHistoryDateKeys = useMemo(() => getSortedCheckInDateKeys(historyCheckInDates), [historyCheckInDates]);
  const checkedDateKeys = useMemo<Set<string>>(() => new Set(sortedHistoryDateKeys), [sortedHistoryDateKeys]);

  // 找到最早可用签到日期，决定日历最早能回看哪个月份
  const fallbackEarliestHistoryDateKey = useMemo(() => (historyCheckInDates.length > 0
    ? sortedHistoryDateKeys[0]
    : null), [historyCheckInDates.length, sortedHistoryDateKeys]);
  const earliestHistoryCheckInTs = useMemo(() => firstEverCheckInTs
    || currentPeriodStartTs
    || (historyCheckInDates.length > 0
      ? Math.min(...historyCheckInDates.map((item: { sign_date: number }) => item.sign_date * 1000)) / 1000
      : 0), [currentPeriodStartTs, firstEverCheckInTs, historyCheckInDates]);
  const firstCheckInDate = useMemo(() => {
    if (earliestHistoryCheckInTs) {
      return new Date(earliestHistoryCheckInTs * 1000);
    }

    if (fallbackEarliestHistoryDateKey) {
      return parseDateKeyToDate(fallbackEarliestHistoryDateKey);
    }

    return null;
  }, [earliestHistoryCheckInTs, fallbackEarliestHistoryDateKey]);

  // 判断今天是否已经签到，并据此控制按钮状态和当天样式
  const todayDateKey = getDateKey(today);
  const lastCurrentPeriodCheckInDate = useMemo(() => currentPeriodLastCheckInTs
    ? new Date(currentPeriodLastCheckInTs * 1000)
    : null, [currentPeriodLastCheckInTs]);
  const isTodayCheckedDay = checkedDateKeys.has(todayDateKey)
    || (!!lastCurrentPeriodCheckInDate && getDateKey(lastCurrentPeriodCheckInDate) === todayDateKey);

  const { expired: isUtcResetExpired } = useUtcMidnightCountdown(
    isTodayCheckedDay,
    () => { void refetchBuddyBalls(); },
  );
  const previousMonth = createUtcDate(today.getUTCFullYear(), today.getUTCMonth() - 1, 1);
  const earliestDataMonth = firstCheckInDate
    ? createUtcDate(firstCheckInDate.getUTCFullYear(), firstCheckInDate.getUTCMonth(), 1)
    : createUtcDate(today.getUTCFullYear(), today.getUTCMonth(), 1);
  const minMonth = earliestDataMonth.getTime() > previousMonth.getTime()
    ? earliestDataMonth
    : previousMonth;
  const maxMonth = createUtcDate(today.getUTCFullYear(), today.getUTCMonth() + 1, 1);

  // 当前日历页的基础信息：天数、起始星期、月份前缀
  const currentMonthDays = createUtcDate(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 0).getUTCDate();
  const currentMonthStartDay = currentMonth.getUTCDay();
  const currentMonthDatePrefix = `${currentMonth.getUTCFullYear()}-${String(currentMonth.getUTCMonth() + 1).padStart(2, '0')}-`;
  const firstCurrentMonthCheckInDateKey = useMemo(() => {
    const currentMonthKeys: string[] = Array.from(checkedDateKeys)
      .filter((dateKey) => dateKey.startsWith(currentMonthDatePrefix))
      .sort();

    return currentMonthKeys[0] ?? null;
  }, [checkedDateKeys, currentMonthDatePrefix]);
  const lastCheckInBeforeCurrentMonthDateKey = useMemo(() => {
    const monthStartDate = createUtcDate(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1);

    for (let index = sortedHistoryDateKeys.length - 1; index >= 0; index -= 1) {
      const dateKey = sortedHistoryDateKeys[index];
      const historyDate = parseDateKeyToDate(dateKey);

      if (historyDate.getTime() < monthStartDate.getTime()) {
        return dateKey;
      }
    }

    return null;
  }, [currentMonth, sortedHistoryDateKeys]);
  const currentMonthRewardStartDate = useMemo(() => firstCurrentMonthCheckInDateKey
    ? parseDateKeyToDate(firstCurrentMonthCheckInDateKey)
    : null, [firstCurrentMonthCheckInDateKey]);
  const displayedMonthBackfillStartDate = useMemo(() => {
    const monthStartDate = createUtcDate(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1);
    const currentSystemMonthStartDate = createUtcDate(today.getUTCFullYear(), today.getUTCMonth(), 1);

    if (sortedHistoryDateKeys.length === 0) {
      return null;
    }

    if (currentMonth.getTime() > currentSystemMonthStartDate.getTime()) {
      return null;
    }

    if (lastCheckInBeforeCurrentMonthDateKey) {
      const lastCheckInBeforeCurrentMonthDate = parseDateKeyToDate(lastCheckInBeforeCurrentMonthDateKey);
      return createUtcDate(
        lastCheckInBeforeCurrentMonthDate.getUTCFullYear(),
        lastCheckInBeforeCurrentMonthDate.getUTCMonth(),
        lastCheckInBeforeCurrentMonthDate.getUTCDate() + 1
      );
    }

    return currentMonthRewardStartDate ?? monthStartDate;
  }, [currentMonth, currentMonthRewardStartDate, lastCheckInBeforeCurrentMonthDateKey, sortedHistoryDateKeys.length, today]);
  const visibleCalendarEndDate = createUtcDate(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), currentMonthDays);

  // 生成“日期 -> 奖励”的映射：先写入历史，再补未来预测，再补历史月份缺失区间
  const rewardMap = useMemo(() => {
    const nextRewardMap = new Map<string, { rewardDay: number; ball: number | null }>();
    const monthStartDate = createUtcDate(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1);
    const sortedHistoryDates = sortedHistoryDateKeys;

    if (dailyCheckInList.length === 0) {
      return nextRewardMap;
    }

    if (sortedHistoryDates.length === 0) {
      return buildNewUserRewardMap(dailyCheckInList, today, monthStartDate, visibleCalendarEndDate);
    }

    const historicalRewardState = buildHistoricalRewardMap(
      sortedHistoryDates,
      dailyCheckInList,
      monthStartDate,
      visibleCalendarEndDate
    );

    historicalRewardState.rewardMap.forEach((value, key) => {
      nextRewardMap.set(key, value);
    });

    appendProjectedRewardMap(
      nextRewardMap,
      historicalRewardState.latestHistoryDateKey,
      historicalRewardState.latestRewardDay,
      dailyCheckInList,
      monthStartDate,
      visibleCalendarEndDate,
      todayDateKey,
      isTodayCheckedDay
    );

    appendBackfilledRewardMap(
      nextRewardMap,
      sortedHistoryDates,
      historicalRewardState.historyRewardDayMap,
      dailyCheckInList,
      displayedMonthBackfillStartDate,
      visibleCalendarEndDate
    );

    return nextRewardMap;
  }, [currentMonth, dailyCheckInList, displayedMonthBackfillStartDate, sortedHistoryDateKeys, today, visibleCalendarEndDate]);

  // 把当前月转换成可直接渲染的格子数据，空位用于补齐周视图前导空白
  const calendarCells = useMemo(() => [
    ...Array.from({ length: currentMonthStartDay }, () => null),
    ...Array.from({ length: currentMonthDays }).map((_, index) => {
      const dayNumber = index + 1;
      const cellDate = createUtcDate(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), dayNumber);
      const dateKey = getDateKey(cellDate);
      const reward = rewardMap.get(dateKey);

      return {
        day: cellDate.getUTCDate(),
        dateKey,
        ball: reward?.ball ?? null,
        rewardDay: reward?.rewardDay ?? null,
        isCurrentMonth: true,
      };
    })
  ], [currentMonth, currentMonthDays, currentMonthStartDay, rewardMap]);

  // 控制月份切换按钮是否可点：最多看下个月，最早看有数据的月份或上个月
  const isCurrentSystemMonth = currentMonth.getUTCFullYear() === today.getUTCFullYear() && currentMonth.getUTCMonth() === today.getUTCMonth();
  const canGoToPreviousMonth = currentMonth.getTime() > minMonth.getTime();
  const canGoToNextMonth = currentMonth.getTime() < maxMonth.getTime();

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
    }).catch(() => {
      toast.error(t('toast:check_in_failed'));
    }).finally(() => {
      setIsCheckingIn(false);
    });
  };

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const getLocalDateKey = () => getDateKey(new Date());

    let lastDateKey = getLocalDateKey();

    const refreshDailyQueries = () => {
      refetchBuddyBalls();
      lastDateKey = getLocalDateKey();
    };

    const scheduleNextMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
      const delay = Math.max(nextMidnight.getTime() - now.getTime(), 1000);

      timeoutId = setTimeout(() => {
        refreshDailyQueries();
        scheduleNextMidnight();
      }, delay);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      const currentDateKey = getLocalDateKey();

      if (currentDateKey !== lastDateKey) {
        refreshDailyQueries();
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
  }, [refetchBuddyBalls]);

  useEffect(() => {
    const shouldScrollToBottom = sessionStorage.getItem('bonusCheckScrollToBottom') === '1';

    if (!shouldScrollToBottom) {
      return;
    }

    sessionStorage.removeItem('bonusCheckScrollToBottom');

    const frameId = window.requestAnimationFrame(() => {
      bottomAnchorRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className='max-w-[416px] m-auto mb-10 flex flex-col gap-4 px-3 sm:px-0'>
      <div className='font-semibold test-base test-base-center capitalize'>
        {t('bonus:daily_check_in')}
      </div>

      <div className='flex items-center justify-between'>
        <div className="text-sm font-semibold capitalize text-base-content/50">
          <Trans
            i18nKey={"bonus:day_streak"}
            values={{ value: continuousCheckInDaysInPeriod }}
            components={[<span className="text-sm font-semibold" />]}
          />
        </div>

        <div className='flex items-center gap-1'>
          <div className='text-xs font-semibold text-base-content/50'>{t('bonus:available')}:</div>
          <img src={`${getPathInROIBEST()}/images/bonus/ball.png`} alt="" className="w-4 h-4 object-cover " />
          <div className='font-bold text-base test-base-center'>
            {buddyBallsData?.data?.balls || 0}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 items-center ">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`flex items-center gap-1 ${canGoToPreviousMonth ? 'text-base-content' : 'text-base-content/60'}`}
            onClick={() => canGoToPreviousMonth && setCurrentMonth(createUtcDate(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() - 1, 1))}
            disabled={!canGoToPreviousMonth}
          >
            <Iconify icon="custom:date_left" className="w-3 h-3 rtl:rotate-180" />
          </button>
          <div className="text-base font-semibold text-base-content">{`${currentMonth.getUTCFullYear()} ${String(currentMonth.getUTCMonth() + 1).padStart(2, '0')}`}</div>
          <button
            type="button"
            className={`flex items-center ${canGoToNextMonth ? 'text-base-content' : 'text-base-content/60'}`}
            onClick={() => canGoToNextMonth && setCurrentMonth(createUtcDate(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 1))}
            disabled={!canGoToNextMonth}
          >
            <Iconify icon="custom:date_right" className="w-3 h-3 rtl:rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 w-full">
          {weekDays.map((day) => (
            <div key={day} className="text-xs text-center text-base-content/50">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 w-full">
          {
            calendarCells.map((cell, index) => {
              if (!cell) {
                return <div key={`empty-${index}`} className="max-w-[64px] min-w-[48px] h-[64px]" />;
              }

              const isToday = cell.isCurrentMonth && isCurrentSystemMonth && cell.day === today.getUTCDate();
              const isCurrentCellTodayCheckedDay = isToday && isTodayCheckedDay;
              const isCheckedDay = checkedDateKeys.has(cell.dateKey);
              const missedStartDate = displayedMonthBackfillStartDate ?? firstCheckInDate;
              const isMissedDay = !!missedStartDate
                && cell.isCurrentMonth
                && cell.dateKey >= getDateKey(missedStartDate)
                && cell.dateKey < todayDateKey
                && !isCheckedDay;
              const ballIconSrc = getBallIconSrc(cell.ball);
              const showMoreBallBg = !!cell.ball && cell.ball > 2;

              return (
                <div
                  key={`${cell.isCurrentMonth ? 'current' : 'adjacent'}-${index}-${cell.day}`}
                  className={`
                    ${(isToday && !isCurrentCellTodayCheckedDay) ?
                      'bg-primary-content border-primary' :
                      'bg-base-200 border-base-100'}
                    max-w-[64px] min-w-[48px] h-[64px] border rounded-lg flex flex-col items-center justify-end overflow-hidden relative
                  `}
                >
                  {(isCheckedDay || isCurrentCellTodayCheckedDay) &&
                    (
                      <div className="bg-base-100 rounded-bl-sm absolute top-0 right-0 w-4 h-4 flex items-center justify-center z-50">
                        <Iconify icon="custom:check_in" width={8} height={6} className="text-primary" />
                      </div>
                    )
                  }

                  {
                    (isToday && !isTodayCheckedDay) && (
                      <div className="bg-primary rounded-full absolute top-1.5 right-1 w-1 h-1 z-40" />
                    )
                  }

                  {
                    isMissedDay ? (
                      <div className={"text-[8px] font-semibold absolute top-0.5 left-0 capitalize w-full text-center text-warning z-50"}>{t('bonus:missed_key')}</div>
                    ) : (
                      <div className={`text-[8px] font-semibold absolute top-1 left-1 z-50 ${isToday ? 'text-base-content' : 'text-base-content/50'}`}>{String(cell.day).padStart(2, '0')}</div>
                    )
                  }

                  <div className="flex-1 w-full relative z-20">
                    {showMoreBallBg && (
                      <img src={`${getPathInROIBEST()}/images/bonus/more-ball-bg.png`} alt="" className={`object-cover w-full h-full absolute top-0 left-0 ${(!isToday && cell.dateKey < todayDateKey) || isCurrentCellTodayCheckedDay ? 'opacity-50' : ''}`} />
                    )}
                    {ballIconSrc && (
                      <img src={`${getPathInROIBEST()}${ballIconSrc}`} alt="" className={`h-[30px] object-cover absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 ${(!isToday && cell.dateKey < todayDateKey) || isCurrentCellTodayCheckedDay ? 'opacity-50' : ''}`} />
                    )}
                  </div>

                  <div className={`
                    ${isToday || showMoreBallBg ? `text-primary-content ${(!isToday && cell.dateKey < todayDateKey) ? 'bg-primary/50' : 'bg-primary'}` : 'bg-base-100 text-base-content/50'} 
                    text-[8px] font-semibold h-3.5 w-full flex items-center justify-center capitalize
                  `}>
                    {isToday ? `+${cell.ball}` : `${cell.ball ? `+${cell.ball}` : ''}`}
                  </div>
                </div>
              )
            })
          }
        </div>
      </div>

      <div className="flex flex-col gap-2 py-4 max-w-[303px] m-auto w-full">
        <button className="btn btn-primary btn-md capitalize w-full"
          onClick={checkIn} disabled={isBuddyBallsLoading || isCheckingIn || (isTodayCheckedDay && !isUtcResetExpired)}>
          {isCheckingIn
            ? <Iconify icon="mdi:loading" className="animate-spin" />
            : (isTodayCheckedDay && !isUtcResetExpired)
              ? `${t('bonus:daily_reset', { time: dailyResetLocalTime })}`
              : t('bonus:check_in_today')}
        </button>
        <button className="btn btn-primary btn-md btn-outline capitalize w-full" onClick={() => void navigate({ to: "/buddy-balls" })}>{t('gameDetail:play')}</button>
      </div>

      <div className='bg-base-200 rounded-2xl p-2.5 flex flex-col gap-4'>
        <p className='text-sm font-semibold text-base-content'>{t('popup:buddy_ball_modal.get_more_buddy_balls')}</p>
        <div className="bg-base-300 h-16 rounded-xl flex items-center px-4"
          style={{
            backgroundImage:
              `repeating-linear-gradient(
                -45deg,
                oklch(from var(--color-base-200) l c h / 0.1) 0px,
                oklch(from var(--color-base-200) l c h / 0.1) 6px,
                oklch(from var(--color-base-300) l c h / 0.3) 6px,
                oklch(from var(--color-base-300) l c h / 0.3) 12px,
                oklch(from var(--color-base-200) l c h / 0.1) 12px,
                oklch(from var(--color-base-200) l c h / 0.1) 18px
              )`
          }}
        >
          <div className="w-full flex flex-row items-center h-8 gap-2">
            <div className="rounded-field flex-1 min-w-0 h-10 sm:h-full bg-base-400 flex items-center px-2 sm:px-4 gap-2 sm:gap-3">
              <div className="flex-1 min-w-0 overflow-x-auto hide-scrollbar">
                <span className="text-base-content/50 text-xs sm:text-base font-semibold whitespace-nowrap">
                  {referralLink || t("referral:loadingLink", "Loading link...")}
                </span>
              </div>
            </div>
            <button
              className="btn btn-primary h-8 shrink-0 justify-center gap-2"
              onClick={() => setIsShareModalOpen(true)}
            >
              <Iconify icon="custom:share" />
              <span>{t("bonus:share")}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center bg-base-300 rounded-lg h-10 px-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-base-content/50 font-semibold">{t("popup:buddy_ball_modal.refer_a_friend")}</span>
            </div>
            <span className="flex items-center">
              <span className="text-sm text-primary font-semibold">1x</span>
              <img src={`${getPathInROIBEST()}/images/bonus/ball.png`} loading="lazy" decoding="async" className="w-4.5 h-4.5" />
            </span>
          </div>
          <div className="flex justify-between items-center bg-base-300 rounded-lg h-10 px-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-base-content/50 font-semibold">{t("popup:buddy_ball_modal.referral_first_deposit")}</span>
            </div>
            <span className="flex items-center">
              <span className="text-sm text-primary font-semibold">5x</span>
              <img src={`${getPathInROIBEST()}/images/bonus/ball.png`} alt="" className="w-4.5 h-4.5" />
            </span>
          </div>
        </div>
      </div>

      {isShareModalOpen && <ReferralShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)}
        referralLink={referralLink} />}
      <div ref={bottomAnchorRef} />
    </div>
  )
}
