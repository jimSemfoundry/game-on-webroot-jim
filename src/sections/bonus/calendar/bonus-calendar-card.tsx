import { Carousel, CarouselArrowBasicButtons, useCarousel } from "@/components/carousel";
import Iconify from "@/components/iconify";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useTipsModal } from "@/contexts/ModalsProvider";
import { useCalendarBonus, useClaimCalendarBonusMutation } from "@/hooks/api/useAuth";
import type { CalendarBonus, CalendarItem, CountdownTime, NextUnlockingBonus } from "@/types/bonus";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { gradientStyles } from "../styles";

/**
 * 截断数字到指定小数位数（不四舍五入）
 * 例如: 0.003108 截断到4位 → 0.0031
 */
const truncateToDecimals = (num: number, decimals: number): number => {
  const multiplier = Math.pow(10, decimals);
  return Math.floor(num * multiplier) / multiplier;
};

/**
 * 格式化小数值 - 截断式4位小数
 * 避免四舍五入造成的金融误导
 */
const formatSmallNumber = (amount: number, currency: string): string => {
  // 截断到4位小数
  const truncated = truncateToDecimals(amount, 4);
  
  // 格式化显示，移除末尾的零
  const formatted = truncated.toFixed(4).replace(/\.?0+$/, '');
  
  return `${formatted} ${currency}`;
};

// Helper function to safely format currency with conversion from BUCK to display currency
const safeFormatCurrency = (formatWithConversion: any, amount: string | number, fallback = "0.00") => {
  if (!amount || isNaN(parseFloat(amount.toString()))) {
    return fallback;
  }
  const numAmount = parseFloat(amount.toString());
  if (numAmount < 0) { // 只过滤负数，不过滤小的正数
    return fallback;
  }
  
  try {
    // 将BUCK转换为用户的显示货币
    const options = { minimizeDecimals: true };
    const result = formatWithConversion(numAmount, "BUCK", options);
    
    // 对于转换后的非常小数字，检查是否需要特殊处理
    if (result.value < 0.01 && result.value > 0) {
      // 如果转换后的金额很小，使用截断式显示
      const displayCurrency = result.currency || "USD";
      return formatSmallNumber(result.value, displayCurrency);
    }
    
    return result.formatted;
  } catch (error) {
    console.warn("Error formatting currency:", error);
    return formatSmallNumber(numAmount, "BUCK");
  }
};

// 倒计时显示组件
const CountdownDisplay = ({ targetTime }: { targetTime: number }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const targetTimeRef = useRef(targetTime);
  const timeLeftRef = useRef("");

  const updateDisplay = useCallback(() => {
    if (timeLeftRef.current !== timeLeft) {
      setTimeLeft(timeLeftRef.current);
    }
  }, [timeLeft]);

  const calculateTimeLeft = useCallback(() => {
    const now = dayjs();
    const startTime = dayjs(targetTimeRef.current);
    const diffHours = startTime.diff(now, "hour");
    const diffMinutes = startTime.diff(now, "minute") % 60;

    const newTimeLeft = `${diffHours}h ${diffMinutes}m`;

    if (newTimeLeft !== timeLeftRef.current) {
      timeLeftRef.current = newTimeLeft;
      updateDisplay();
    }
  }, [updateDisplay]);

  useEffect(() => {
    calculateTimeLeft();
    timerRef.current = setInterval(() => {
      calculateTimeLeft();
    }, 60000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [calculateTimeLeft]);

  return (
    <p className="bg-base-300 flex items-center gap-1 rounded-full px-1 py-1 text-xs font-semibold">
      <svg width="15" height="14" viewBox="0 0 15 14" fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.50002 12.6004C10.5928 12.6004 13.1 10.0932 13.1 7.00039C13.1 3.9076 10.5928 1.40039 7.50002 1.40039C4.40723 1.40039 1.90002 3.9076 1.90002 7.00039C1.90002 10.0932 4.40723 12.6004 7.50002 12.6004ZM8.25002 3.50039C8.25002 3.08618 7.91424 2.75039 7.50002 2.75039C7.08581 2.75039 6.75002 3.08618 6.75002 3.50039V7.00039C6.75002 7.4146 7.08581 7.75039 7.50002 7.75039H10.3C10.7142 7.75039 11.05 7.4146 11.05 7.00039C11.05 6.58618 10.7142 6.25039 10.3 6.25039H8.25002V3.50039Z"
          className="fill-base-content"
        />
      </svg>
      <span>{timeLeft}</span>
    </p>
  );
};

export function BonusCalendarCard() {
  const { t } = useTranslation();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { openTipsModal } = useTipsModal();

  // API hooks
  const { data: calendarBonusResponse, isLoading: isCalendarLoading, error: calendarError } = useCalendarBonus();
  const { mutate: claimCalendarBonus, isPending: isClaimPending } = useClaimCalendarBonusMutation();

  // 使用 useMemo 避免每次渲染创建新数组
  const calendarBonus = useMemo(() => calendarBonusResponse?.data || [], [calendarBonusResponse?.data]);

  // 状态管理
  const [dateCards, setDateCards] = useState<CalendarItem[]>([]);

  // 倒计时状态
  const [depositBonusTimeLeft, setDepositBonusTimeLeft] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // 全局下一个要解锁的奖励
  const [globalNextUnlockingBonus, setGlobalNextUnlockingBonus] = useState<NextUnlockingBonus | null>(null);

  const handleOpenTips = () => {
    openTipsModal("bonusCalendar");
  };

  // 数据处理函数 - 基于参考代码
  const parseCalendarBonus = (calendarBonus: CalendarBonus[]) => {
    // 根据start_time 分组, 如果start_time是一样的，则累加amount
    const groupedBonus = calendarBonus.reduce((acc: any, item: CalendarBonus) => {
      const date = dayjs(item.start_time * 1000);
      const dateKey = date.format("YYYY-MM-DD HH:mm:ss");

      if (acc[dateKey]) {
        // 如果该时间已存在条目，累加amount值
        acc[dateKey].amount = (parseFloat(acc[dateKey].amount) + parseFloat(item.amount)).toString();
      } else {
        // 如果该时间不存在条目，创建新条目
        acc[dateKey] = { ...item };
      }

      return acc;
    }, {});

    return groupedBonus;
  };

  // 根据日期分组，每个日期最多包含3个奖励元素
  const groupBonusByDate = (groupedBonus: any) => {
    const dateGrouped: Record<string, CalendarBonus[]> = {};

    Object.entries(groupedBonus).forEach(([timeKey, bonusData]: [string, any]) => {
      const dateKey = timeKey.split(" ")[0];

      if (!dateGrouped[dateKey]) {
        dateGrouped[dateKey] = [];
      }

      if (dateGrouped[dateKey].length < 3) {
        dateGrouped[dateKey].push({
          ...bonusData,
          time: timeKey.split(" ")[1],
        });
      }
    });

    return dateGrouped;
  };

  // 根据分组后的奖励数据生成日期卡片
  const generateDateCards = (dateGroupedBonus: Record<string, CalendarBonus[]>) => {
    const cards: CalendarItem[] = [];
    const today = dayjs();
    const dateMap: Record<string, boolean> = {};

    // 首先处理有数据的日期
    Object.entries(dateGroupedBonus).forEach(([dateKey, bonuses]) => {
      if (bonuses.length > 0) {
        const date = dayjs(dateKey);
        const dateStr = date.format("YYYY-MM-DD");
        dateMap[dateStr] = true;

        const day = date.date();
        const dayNameEn = date.format("dddd");
        const monthEn = date.format("MMMM");
        const dayName = t(`common.days.${dayNameEn}`);
        const month = t(`common.months.${monthEn}`);

        const completed = bonuses.filter(
          (bonus) => bonus.status === 1 || bonus.handle_status === 1 || dayjs(bonus.end_time * 1000).isBefore(dayjs()),
        ).length;

        const claimAmount = bonuses
          .filter((bonus) => bonus.status === 0 && bonus.handle_status === 0)
          .reduce((sum, bonus) => sum + parseFloat(bonus.amount), 0)
          .toFixed(8);

        const totalAmount = bonuses.reduce((sum, bonus) => sum + parseFloat(bonus.amount), 0).toFixed(8);

        const isActive = bonuses.some(
          (bonus) =>
            bonus.status === 0 &&
            bonus.handle_status === 0 &&
            dayjs(bonus.start_time * 1000).isBefore(dayjs()) &&
            dayjs(bonus.end_time * 1000).isAfter(dayjs()),
        );

        cards.push({
          date: date.toDate(),
          day,
          dayName,
          dayOfWeek: dayName, // 兼容原有字段
          month,
          isPast: date.isBefore(today, "day"),
          isCurrent: date.isSame(today, "day"),
          isFuture: date.isAfter(today, "day"),
          isActive,
          claimAmount: claimAmount.toString(),
          totalAmount: totalAmount.toString(),
          completed,
          bonuses,
          hasBonus: true,
          claimTime: bonuses[0]?.time || "08:00", // 兼容原有字段
          amount: parseFloat(totalAmount), // 兼容原有字段
        });
      }
    });

    // 生成今日前后三天的日期卡片，如果还没有生成
    for (let i = -3; i <= 3; i++) {
      const date = today.add(i, "day");
      const dateStr = date.format("YYYY-MM-DD");

      if (!dateMap[dateStr]) {
        const day = date.date();
        const dayNameEn = date.format("dddd");
        const monthEn = date.format("MMMM");
        const dayName = t(`common.days.${dayNameEn}`);
        const month = t(`common.months.${monthEn}`);

        cards.push({
          date: date.toDate(),
          day,
          dayName,
          dayOfWeek: dayName,
          month,
          isPast: date.isBefore(today, "day"),
          isCurrent: date.isSame(today, "day"),
          isFuture: date.isAfter(today, "day"),
          isActive: false,
          claimAmount: "0.00",
          totalAmount: "0.00",
          completed: 0,
          bonuses: [],
          hasBonus: false,
          claimTime: undefined,
          amount: undefined,
        });
      }
    }

    cards.sort((a, b) => a.date.getTime() - b.date.getTime());
    setDateCards(cards);
  };

  // 处理并更新可领取的calendar bonus总额 - 使用useMemo优化性能
  const processedData = useMemo(() => {
    if (!calendarBonus || !Array.isArray(calendarBonus) || calendarBonus.length === 0) {
      return {
        totalClaimable: 0,
        totalPoolAmount: 0,
        expiringAmount: 0,
        timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 },
        groupedBonus: {},
        dateGroupedBonus: {}
      };
    }

    // 直接计算，不依赖先前的state值

    const groupedBonus = parseCalendarBonus(calendarBonus);
    const now = dayjs();

    // 计算所有可领取的bonus总额 (已开始但未结束的)
    const totalClaimable = Object.values(groupedBonus)
      .filter((bonus: any) => {
        return (
          bonus.status === 0 &&
          bonus.handle_status === 0 &&
          dayjs(bonus.start_time * 1000).isBefore(now) &&
          dayjs(bonus.end_time * 1000).isAfter(now)
        );
      })
      .reduce((sum: number, bonus: any) => sum + parseFloat(bonus.amount), 0);

    // 计算所有未领取的bonus总额 (排除已过期的)
    const totalPoolAmount = Object.values(groupedBonus)
      .filter((bonus: any) => {
        return bonus.status === 0 && bonus.handle_status === 0 && dayjs(bonus.end_time * 1000).isAfter(now);
      })
      .reduce((sum: number, bonus: any) => sum + parseFloat(bonus.amount), 0);

    // 找到未领取的奖励中最早将要过期的那个
    const unclaimedBonuses = Object.values(groupedBonus).filter((bonus: any) => {
      return (
        bonus.status === 0 &&
        bonus.handle_status === 0 &&
        dayjs(bonus.start_time * 1000).isBefore(now) &&
        dayjs(bonus.end_time * 1000).isAfter(now)
      );
    });

    let expiringAmount = 0;
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (unclaimedBonuses.length > 0) {
      unclaimedBonuses.sort((a: any, b: any) => a.end_time - b.end_time);
      const earliestToExpire = unclaimedBonuses[0] as any;
      expiringAmount = parseFloat(earliestToExpire.amount);

      const expireTime = dayjs(earliestToExpire.end_time * 1000);
      const diff = expireTime.diff(now, "second");

      if (diff > 0) {
        const days = Math.floor(diff / (24 * 60 * 60));
        const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((diff % (60 * 60)) / 60);
        const seconds = diff % 60;
        timeLeft = { days, hours, minutes, seconds };
      }
    }

    const dateGroupedBonus = groupBonusByDate(groupedBonus);
    console.log(totalPoolAmount, totalClaimable)
    return {
      totalClaimable,
      totalPoolAmount,
      expiringAmount,
      timeLeft,
      groupedBonus,
      dateGroupedBonus
    };
  }, [calendarBonus]);


  // 倒计时逻辑 - 合并初始化和更新
  useEffect(() => {
    // 只有当有即将过期的奖励时才启动倒计时
    if (processedData.expiringAmount > 0) {
      // 初始设置
      const initialTimeLeft = processedData.timeLeft;
      const hasTime = initialTimeLeft.days > 0 || initialTimeLeft.hours > 0 || initialTimeLeft.minutes > 0 || initialTimeLeft.seconds > 0;
      
      if (!hasTime) {
        setDepositBonusTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      // 设置初始值
      setDepositBonusTimeLeft(initialTimeLeft);

      // 启动倒计时
      const timer = setInterval(() => {
        setDepositBonusTimeLeft((prev) => {
          let totalSeconds = prev.days * 24 * 60 * 60 + prev.hours * 60 * 60 + prev.minutes * 60 + prev.seconds - 1;

          if (totalSeconds <= 0) {
            clearInterval(timer);
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
          }

          const days = Math.floor(totalSeconds / (24 * 60 * 60));
          const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
          const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
          const seconds = totalSeconds % 60;

          return { days, hours, minutes, seconds };
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      // 没有即将过期的奖励时，重置倒计时
      setDepositBonusTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  }, [
    // 直接依赖原始数据，避免processedData的对象引用问题
    calendarBonus
  ]);

  // 生成日期卡片 - 只在 calendarBonus 改变时更新
  useEffect(() => {
    // 始终生成日期卡片，即使没有奖励数据
    generateDateCards(processedData.dateGroupedBonus || {});
  }, [calendarBonus, t]); // 只依赖原始数据和翻译函数

  // 在dateCards更新后，找出下一个要解锁的奖励
  useEffect(() => {
    if (dateCards.length > 0) {
      const now = dayjs();
      let nextBonus = null;
      let earliestStartTime = Infinity;

      // 先找今天的卡片
      const todayCard = dateCards.find((card) => dayjs(card.date).isSame(now, "day"));
      const todayCardIndex = dateCards.findIndex((card) => dayjs(card.date).isSame(now, "day"));

      // 检查今天是否有未解锁的奖励
      let hasTodayUnlockedBonus = false;
      if (todayCard) {
        todayCard.bonuses.forEach((bonus, bonusIndex) => {
          if (
            bonus &&
            bonus.status === 0 &&
            dayjs(bonus.start_time * 1000).isAfter(now) &&
            bonus.start_time * 1000 < earliestStartTime
          ) {
            earliestStartTime = bonus.start_time * 1000;
            nextBonus = {
              cardIndex: todayCardIndex,
              bonusIndex,
              bonusId: bonus.id,
              startTime: bonus.start_time * 1000,
            };
            hasTodayUnlockedBonus = true;
          }
        });
      }

      // 如果今天没有未解锁的奖励，则查找明天的第一个奖励
      if (!hasTodayUnlockedBonus) {
        const tomorrowCard = dateCards.find((card) => dayjs(card.date).isSame(now.add(1, "day"), "day"));
        const tomorrowCardIndex = dateCards.findIndex((card) => dayjs(card.date).isSame(now.add(1, "day"), "day"));

        if (tomorrowCard && tomorrowCard.bonuses.length > 0) {
          earliestStartTime = Infinity;

          tomorrowCard.bonuses.forEach((bonus, bonusIndex) => {
            if (bonus && bonus.status === 0 && bonus.start_time * 1000 < earliestStartTime) {
              earliestStartTime = bonus.start_time * 1000;
              nextBonus = {
                cardIndex: tomorrowCardIndex,
                bonusIndex,
                bonusId: bonus.id,
                startTime: bonus.start_time * 1000,
              };
            }
          });
        }
      }

      setGlobalNextUnlockingBonus(nextBonus);
    }
  }, [dateCards]);

  // 使用处理后的数据，如果没有真实数据则回退到原始逻辑
  const calendarData = useMemo(() => {
    if (dateCards.length > 0) {
      return dateCards;
    }

    // Generate default calendar cards (3 days before, today, 3 days after)
    // even when there's no bonus data
    const items: CalendarItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthNameKeys = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const dayNameKeys = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    for (let offset = -3; offset <= 3; offset++) {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);

      const monthKey = monthNameKeys[date.getMonth()];
      const dayKey = dayNameKeys[date.getDay()];

      items.push({
        date,
        day: date.getDate(),
        month: t(`common.months.${monthKey}`),
        dayOfWeek: dayKey,
        dayName: t(`common.days.${dayKey}`),
        isPast: offset < 0,
        isCurrent: offset === 0,
        isFuture: offset > 0,
        isActive: offset === 0,
        claimTime: offset <= 0 ? "08:00" : undefined,
        amount: offset <= 0 ? 3 : undefined,
        claimAmount: offset <= 0 ? "3" : "0",
        totalAmount: "3",
        completed: offset < 0 ? 3 : 0,
        bonuses: [],
        hasBonus: offset <= 0,
      });
    }

    return items;
  }, [dateCards, isCalendarLoading, calendarBonus]);

  const carousel = useCarousel({
    slidesToShow: 2,
    startIndex: 3, // Start at today (index 3 since we have 3 past days)
    dragFree: false,
    slideSpacing: "8px",
    align: "start",
    loop: false,
    containScroll: "trimSnaps",
  });

  // 自动滚动到今天的日期
  const [hasInitialScroll, setHasInitialScroll] = useState(false);
  useEffect(() => {
    if (dateCards.length > 0 && !hasInitialScroll && carousel.mainApi) {
      setTimeout(() => {
        carousel.mainApi?.scrollTo(3); // 滚动到今天（索引3）
        setHasInitialScroll(true);
      }, 100);
    }
  }, [carousel.mainApi, dateCards.length, hasInitialScroll]);

  // Show error state if API fails
  if (calendarError) {
    return (
      <div
        className="flex flex-col p-4 gap-2 row-span-2 rounded-field w-full relative overflow-hidden border border-base-200"
        style={{
          background: gradientStyles.purple,
        }}
      >
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <Iconify icon="custom:warning" className="w-8 h-8 mx-auto mb-2 text-error" />
            <p className="text-sm text-error">{t("common:error_loading_data")}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isCalendarLoading) {
    return (
      <div
        className="flex flex-col p-4 gap-2 row-span-2 rounded-field w-full relative overflow-hidden border border-base-200"
        style={{
          background: gradientStyles.purple,
        }}
      >
        <div className="flex items-center gap-2 h-15">
          <div className="skeleton w-15 h-15"></div>
          <div className="flex flex-col h-full w-full gap-2 justify-center">
            <div className="skeleton h-4 w-32"></div>
            <div className="skeleton h-3 w-24"></div>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-10 w-full"></div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="skeleton h-16 w-32"></div>
          <div className="skeleton h-16 w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col p-4 gap-2 row-span-2 rounded-field w-full relative overflow-hidden border border-base-200"
      style={{
        background: gradientStyles.purple,
      }}
    >
      <button className="btn btn-square btn-xs bg-base-200 absolute right-4 rtl:right-auto rtl:left-4 top-4" onClick={handleOpenTips}>
        <Iconify icon="custom:info" className="text-base-content/50" />
      </button>
      <div className="flex items-center gap-2 h-15">
        <img src="/images/illustrations/calendar.svg" alt={t("bonus:bonus_calendar")} className="w-15 h-15" />
        <div className="flex flex-col h-full w-full gap-2 justify-center">
          <p className="text-sm font-bold sm:text-base">{t("bonus:bonus_calendar")}</p>
          <p className="text-xs text-primary">{t("bonus:claim_every_8_hours")}</p>
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-base-content/50">{t("common:bonus_pool")}</p>
          <p className="text-xs font-semibold text-base-content/50">
            {safeFormatCurrency(formatWithConversion, processedData.totalPoolAmount)}
          </p>
        </div>
        <div className="flex items-center gap-1 w-full">
          <label className="input input-md disabled:bg-base-300 bg-base-300 border-none flex-1">
            <Iconify icon="custom:cash" />
            <input
              type="text"
              className="grow border-none outline-none"
              readOnly
              value={safeFormatCurrency(formatWithConversion, processedData.totalClaimable)}
            />
          </label>

          <button
            className="btn btn-primary btn-soft btn-md px-0 w-20 max-w-20"
            onClick={() => claimCalendarBonus()}
            disabled={isClaimPending || processedData.totalClaimable <= 0}
          >
            {isClaimPending ? <span className="loading loading-spinner loading-xs" /> : t("bonus:claim")}
          </button>
        </div>
      </div>

      {/* 倒计时显示 - 只有当有即将过期的奖励时才显示 */}
      {(depositBonusTimeLeft.days > 0 || depositBonusTimeLeft.hours > 0 || depositBonusTimeLeft.minutes > 0 || depositBonusTimeLeft.seconds > 0) && (
        <div className="flex items-center justify-center gap-1 text-center text-xs font-bold">
          <p className="flex items-center gap-1 font-normal">
            <span className="text-primary font-semibold">
              {safeFormatCurrency(formatWithConversion, processedData.expiringAmount)}
            </span>
            <span className="text-xs text-base-content/50">expires in:</span>
          </p>
          <div className="flex items-center justify-center gap-1">
            {depositBonusTimeLeft.days > 0 && <span className="text-xs text-base-content/50">{depositBonusTimeLeft.days}d</span>}
            <span className="text-xs text-base-content/50">{depositBonusTimeLeft.hours}h</span>
            <span className="text-xs text-base-content/50">{depositBonusTimeLeft.minutes}m</span>
            <span className="text-xs text-base-content/50">{depositBonusTimeLeft.seconds}s</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 user-select-none">
        <div className="flex items-center px-1 justify-between">
          <div className="flex items-center gap-2">
            <Iconify icon="custom:calendar" className="text-base-content/50" />
            <p className="text-xs font-semibold text-base-content/50">{t("bonus:release_schedule")}</p>
          </div>
          <CarouselArrowBasicButtons {...carousel.arrows} />
        </div>
        <Carousel carousel={carousel}>
          {calendarData.length === 0 && isCalendarLoading ? (
            <div className="flex items-center justify-center w-full h-32">
              <div className="text-center">
                <span className="loading loading-spinner loading-md"></span>
                <p className="text-sm text-base-content/50 mt-2">Loading calendar...</p>
              </div>
            </div>
          ) : (
            calendarData.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col gap-3 px-4 py-3 rounded-xl border ${
                item.isCurrent ? "bg-base-300 border-primary" : "bg-base-300 border-base-100"
              } min-w-[calc(50%-4px)]`}
            >
              {/* Date Header */}
              <div className="flex items-center gap-3">
                <div className="bg-base-200 flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold">{item.day}</div>
                <div className="flex flex-col gap-1">
                  <p className="text-base-content text-sm font-bold">{item.dayName}</p>
                  <p className="text-base-content/70 text-xs">{item.month}</p>
                </div>
              </div>

              {/* Gift Boxes Status */}
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: 3 }).map((_, boxIndex) => {
                  const bonus = item.bonuses[boxIndex];
                  const isClaimed = bonus && bonus.status === 1;
                  const isExpired = bonus && bonus.status === 0 && dayjs(bonus.end_time * 1000).isBefore(dayjs());
                  const isFuture = bonus && bonus.status === 0 && dayjs(bonus.start_time * 1000).isAfter(dayjs());
                  const isAvailable = bonus && bonus.status === 0 && !isExpired && !isFuture;

                  // 使用全局状态来决定是否显示倒计时
                  const showCountdown =
                    bonus &&
                    globalNextUnlockingBonus &&
                    globalNextUnlockingBonus.cardIndex === index &&
                    globalNextUnlockingBonus.bonusIndex === boxIndex;

                  if (showCountdown) {
                    const countdownKey = `${index}-${boxIndex}-${bonus.id}`;
                    return <CountdownDisplay key={`countdown-${countdownKey}`} targetTime={bonus.start_time * 1000} />;
                  }

                  return (
                    <div
                      key={boxIndex}
                      className={`div flex items-center justify-center rounded-full ${
                        isClaimed ? "bg-secondary" : isExpired ? "bg-base-300" : isAvailable ? "bg-secondary bg-opacity-30" : "bg-base-200"
                      } !w-6 !h-6 !p-0`}
                    >
                      {isClaimed ? (
                        // Check mark for claimed
                        <svg width="15" height="14" viewBox="0 0 15 14" fill="none">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M13.0004 4.36333L6.17398 11.5L2 7.32602L3.90615 5.41987L6.13115 7.64487L11.0523 2.5L13.0004 4.36333Z"
                            fill="#E7FB78"
                            fillOpacity="0.8"
                          />
                        </svg>
                      ) : isExpired ? (
                        // Clock icon for expired
                        <svg width="15" height="14" viewBox="0 0 15 14" fill="none">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.50002 12.6004C10.5928 12.6004 13.1 10.0932 13.1 7.00039C13.1 3.9076 10.5928 1.40039 7.50002 1.40039C4.40723 1.40039 1.90002 3.9076 1.90002 7.00039C1.90002 10.0932 4.40723 12.6004 7.50002 12.6004ZM8.25002 3.50039C8.25002 3.08618 7.91424 2.75039 7.50002 2.75039C7.08581 2.75039 6.75002 3.08618 6.75002 3.50039V7.00039C6.75002 7.4146 7.08581 7.75039 7.50002 7.75039H10.3C10.7142 7.75039 11.05 7.4146 11.05 7.00039C11.05 6.58618 10.7142 6.25039 10.3 6.25039H8.25002V3.50039Z"
                            fill="#F55F71"
                          />
                        </svg>
                      ) : isAvailable ? (
                        // Gift icon for available
                        <svg width="15" height="14" viewBox="0 0 15 14" fill="none">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M10.3002 4.20039C10.5198 3.90791 10.65 3.54435 10.65 3.15039C10.65 2.18389 9.86653 1.40039 8.90003 1.40039C8.32757 1.40039 7.8193 1.67526 7.50002 2.10022C7.18074 1.67526 6.67249 1.40039 6.10002 1.40039C5.13353 1.40039 4.35002 2.18389 4.35002 3.15039C4.35002 3.54435 4.48021 3.90791 4.6999 4.20039H2.77502C2.29178 4.20039 1.90002 4.59214 1.90002 5.07539V5.42539C1.90002 5.90864 2.29178 6.30039 2.77502 6.30039H6.97502V4.20039H8.02502V6.30039H12.225C12.7083 6.30039 13.1 5.90864 13.1 5.42539V5.07539C13.1 4.59214 12.7083 4.20039 12.225 4.20039H10.3002ZM9.60003 3.15039C9.60003 3.53699 9.28663 3.85039 8.90003 3.85039H8.20003L8.20003 3.15039C8.20003 2.76379 8.51343 2.45039 8.90003 2.45039C9.28663 2.45039 9.60003 2.76379 9.60003 3.15039ZM5.40002 3.15039C5.40002 3.53699 5.71343 3.85039 6.10002 3.85039H6.80002V3.15039C6.80002 2.76379 6.48662 2.45039 6.10002 2.45039C5.71343 2.45039 5.40002 2.76379 5.40002 3.15039Z"
                            fill="#E7FB78"
                            fillOpacity="0.8"
                          />
                          <path
                            d="M6.97502 7.35039H2.60002V10.6754C2.60002 11.7385 3.46188 12.6004 4.52502 12.6004H6.97502V7.35039Z"
                            fill="#E7FB78"
                            fillOpacity="0.8"
                          />
                          <path
                            d="M8.02502 12.6004V7.35039H12.4V10.6754C12.4 11.7385 11.5382 12.6004 10.475 12.6004H8.02502Z"
                            fill="#E7FB78"
                            fillOpacity="0.8"
                          />
                        </svg>
                      ) : (
                        // Clock icon for future/locked
                        <svg width="15" height="14" viewBox="0 0 15 14" fill="none">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.50002 12.6004C10.5928 12.6004 13.1 10.0932 13.1 7.00039C13.1 3.9076 10.5928 1.40039 7.50002 1.40039C4.40723 1.40039 1.90002 3.9076 1.90002 7.00039C1.90002 10.0932 4.40723 12.6004 7.50002 12.6004ZM8.25002 3.50039C8.25002 3.08618 7.91424 2.75039 7.50002 2.75039C7.08581 2.75039 6.75002 3.08618 6.75002 3.50039V7.00039C6.75002 7.4146 7.08581 7.75039 7.50002 7.75039H10.3C10.7142 7.75039 11.05 7.4146 11.05 7.00039C11.05 6.58618 10.7142 6.25039 10.3 6.25039H8.25002V3.50039Z"
                            fill="#A6ADBB"
                          />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Amount Display */}
              <p className="text-center text-xs">
                {item.hasBonus ? (
                  <>
                    <span className="text-base-content">
                      {safeFormatCurrency(formatWithConversion, item.claimAmount || "0")}
                    </span>
                    <span className="text-base-content/50">
                      {" / " + safeFormatCurrency(formatWithConversion, item.totalAmount || "0")}
                    </span>
                  </>
                ) : (
                  <span className="text-base-content/60">No bonus</span>
                )}
              </p>
            </div>
            ))
          )}
        </Carousel>
      </div>
    </div>
  );
}
