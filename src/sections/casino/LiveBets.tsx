import Iconify from "@/components/iconify";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useModals } from "@/contexts/ModalsProvider";
import { useGreatestBets, useLatestBets } from "@/hooks/api/usePublic";
import { cn } from "@/utils/cn";
import { ChevronRight } from "lucide-react";
import { AnimatePresence, m, useInView } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export const LiveBets = () => {
  const { t } = useTranslation();
  const { openBetSlipModal } = useModals();
  const { data: latestBetsResponse, refetch } = useLatestBets();
  const { data: greatestBetsResponse } = useGreatestBets();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  // 初始化时用空数组，让页面立即显示8行空行
  const [visibleRows, setVisibleRows] = useState<any[]>([]);
  const dataRef = useRef<any[]>([]);
  const indexRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const isFirstLoadRef = useRef(true);
  const rowKeyCounter = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const MAX_ROWS = 8;
  const minDelay = 300;
  const maxDelay = 1000;

  const [selectedCategory, setSelectedCategory] = useState<"latest" | "greatest" | "tournaments">("latest");
  
  // 使用 Framer Motion 的 useInView hook
  const isInView = useInView(containerRef, {
    amount: 0.1, // 10% 可见即认为在视口内
    margin: "0px", // 不要提前触发，只在真正可见时触发
  });

  const segments = [
    {
      value: "latest",
      label: (
        <span className="flex items-center gap-2 whitespace-nowrap">
          <Iconify icon="custom:latest-win" />
          <p>{t("casino:latestWins")}</p>
        </span>
      ),
    },
    {
      value: "greatest",
      label: (
        <span className="flex items-center gap-2 whitespace-nowrap">
          <Iconify icon="custom:greatest-win" />
          <p>{t("casino:latestBets")}</p>
        </span>
      ),
    },
    {
      value: "tournaments",
      label: (
        <span className="flex items-center gap-2 whitespace-nowrap">
          <Iconify icon="custom:tournament" />
          <p>{t("casino:greatestBets")}</p>
        </span>
      ),
    },
  ];

  const clearTimeoutIfAny = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback(() => {
    // 如果组件不在视口内，直接返回，不要调度任何定时器
    if (!isInView) {
      return;
    }
    
    const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    clearTimeoutIfAny();
    timeoutRef.current = window.setTimeout(() => {
      if (!isMountedRef.current) return;
      // 再次检查是否在视口内
      if (!isInView) {
        return; // 不再重新调度，等待视口状态改变
      }
      const data = dataRef.current;
      if (!data || data.length === 0) return;
      if (indexRef.current >= data.length) {
        // 数据滚动完毕，重置索引并继续滚动相同数据
        indexRef.current = 0;
        // 同时在后台获取新数据（不阻塞当前滚动）
        refetch();
        // 继续滚动
        scheduleNext();
        return;
      }
      const currentIndex = indexRef.current;
      const nextItem = data[currentIndex];
      indexRef.current = currentIndex + 1;
      setVisibleRows((prev) => {
        // Assign a stable key to the new item for React reconciliation
        const itemWithKey = { ...nextItem, _uniqueKey: ++rowKeyCounter.current };
        // Insert at top with stable keys to avoid flickering
        const nextRows = [itemWithKey, ...prev].slice(0, MAX_ROWS);
        return nextRows;
      });
      scheduleNext();
    }, randomDelay);
  }, [clearTimeoutIfAny, maxDelay, minDelay, refetch, isInView]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimeoutIfAny();
    };
  }, [clearTimeoutIfAny]);

  useEffect(() => {
    if (selectedCategory === "latest") {
      const activeList = latestBetsResponse?.code === 0 ? latestBetsResponse?.data || [] : [];
      const hasData = activeList && activeList.length > 0;

      // 始终更新数据引用（即使是相同数据）
      dataRef.current = activeList || [];

      // 如果没有数据，停止滚动
      if (!hasData) {
        if (isFirstLoadRef.current) {
          setVisibleRows([]);
          clearTimeoutIfAny();
        }
        return;
      }

      // Only clear and restart on first load or category switch
      if (isFirstLoadRef.current) {
        setVisibleRows([]);
        clearTimeoutIfAny();
        indexRef.current = 0;
        // 只有在视口内才开始动画
        if (isInView) {
          scheduleNext();
        }
        isFirstLoadRef.current = false;
      }
      // If already scrolling, just update the data reference and continue
      // The scrolling will pick up new data automatically when current data is exhausted
    } else if (selectedCategory === "greatest") {
      // Stop scrolling for greatest bets and clear latest data
      clearTimeoutIfAny();
      setVisibleRows([]);
      const greatestList = greatestBetsResponse?.code === 0 ? greatestBetsResponse?.data || [] : [];
      // Assign stable keys to greatest data as well
      const greatestWithKeys = greatestList.map((item: any, idx: number) => ({
        ...item,
        _uniqueKey: `greatest-${idx}-${item.id || idx}`,
      }));
      setVisibleRows(greatestWithKeys.slice(0, MAX_ROWS));
      isFirstLoadRef.current = true; // Reset for next latest switch
    }
  }, [latestBetsResponse, greatestBetsResponse, selectedCategory, scheduleNext, clearTimeoutIfAny, isInView]);

  // 当组件进入/离开视口时控制动画
  useEffect(() => {
    if (selectedCategory === "latest" && dataRef.current.length > 0) {
      if (isInView) {
        // 进入视口时，如果没有运行动画，则启动
        if (!timeoutRef.current) {
          scheduleNext();
        }
      } else {
        // 离开视口时，清除所有定时器
        clearTimeoutIfAny();
      }
    }
  }, [isInView, selectedCategory, scheduleNext, clearTimeoutIfAny]);

  // Reset first load flag when switching to latest category
  useEffect(() => {
    if (selectedCategory === "latest") {
      isFirstLoadRef.current = true;
    }
  }, [selectedCategory]);

  const tableRows = useMemo(() => {
    const rows = [] as any[];
    const visibleData = visibleRows.slice(0, MAX_ROWS);
    
    // 渲染实际数据行
    visibleData.forEach((bet: any, index: number) => {
      // Handle different data structures for latest vs greatest bets
      const betAmount = bet.real_bet_amount || bet.bet_amount || 0;
      const winAmount = bet.real_win_amount || bet.win_amount || 0;
      const currency = bet.real_currency || bet.currency || "USD";
      const gameCategory = bet.game_category_1 || bet.game_category || "slots";

      rows.push(
        <m.div
          key={bet._uniqueKey || `fallback-${bet.id || index}-${bet.nickname}`}
          initial={{
            opacity: 0,
            y: -10,
            scale: 1,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: 0,
            scale: 0.95,
          }}
          transition={{
            duration: 0.4,
            ease: "easeOut",
            layout: { duration: 0.3 },
          }}
          layout
          className={`px-3 sm:px-6 py-3 sm:py-3 hover:bg-base-200/90 transition-colors cursor-pointer bg-base-200 rounded-field mb-1`}
          onClick={() => openBetSlipModal(bet)}
        >
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 items-center">
            {/* Game */}
            <div className="font-semibold text-base-content text-xs sm:text-base">
              <div className="flex items-center gap-2">
                <Iconify icon={`custom:${gameCategory}`} className="min-w-4 min-h-4" />
                <p className="truncate">{bet.game_name}</p>
              </div>
            </div>

            {/* User */}
            <div className="text-base-content/70 text-xs sm:text-base font-semibold">
              <div className="flex items-center gap-2">
                <img src={`/images/vip/levels/${bet.vip}.png`} alt="VIP" className="w-4 h-4" />
                <p className="truncate">{bet.nickname}</p>
              </div>
            </div>

            {/* Bet Amount - Hidden on mobile */}
            <div className="hidden sm:block text-base-content/70 text-xs sm:text-base font-semibold">
              <div className="flex items-center gap-1">
                <CurrencyIcon currency={currency} />
                <span className="text-xs sm:text-sm">
                  {formatWithConversion(betAmount, currency, { compact: true, showCode: false }).formatted}
                </span>
              </div>
            </div>

            {/* Multiplier - Hidden on mobile */}
            <div className="hidden sm:block text-base-content/70 text-xs sm:text-base font-semibold">
              <span className="text-xs sm:text-sm">
                {betAmount && Number(betAmount) !== 0 ? Number((winAmount / betAmount).toFixed(1)) : "0.0"}x
              </span>
            </div>

            {/* Profit */}
            <div className="text-end text-xs sm:text-base">
              <div className="flex items-center gap-1 justify-end">
                <span className={cn("text-xs sm:text-sm font-bold", winAmount > 0 ? "text-primary" : "text-base-content/50")}>
                    {winAmount > 0 ? "+" : ""}
                  {formatWithConversion(winAmount, currency, { compact: true, showCode: false }).formatted}
                </span>
                <CurrencyIcon currency={currency} />
              </div>
            </div>
          </div>
        </m.div>,
      );
    });

    // 添加空行以确保始终显示8行
    const emptyRowsCount = MAX_ROWS - visibleData.length;
    for (let i = 0; i < emptyRowsCount; i++) {
      rows.push(
        <m.div
          key={`empty-row-${i}`}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="px-3 sm:px-6 py-3 sm:py-3 bg-base-100/50 rounded-field mb-1"
        >
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 items-center h-full">
            <div className="text-xs sm:text-base text-base-content/20">-</div>
            <div className="text-xs sm:text-base text-base-content/20">-</div>
            <div className="hidden sm:block text-xs sm:text-base text-base-content/20">-</div>
            <div className="hidden sm:block text-xs sm:text-base text-base-content/20">-</div>
            <div className="text-end text-xs sm:text-base text-base-content/20">-</div>
          </div>
        </m.div>
      );
    }

    return rows;
  }, [visibleRows, formatWithConversion]);

  return (
    <div ref={containerRef} className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="inline-grid *:[grid-area:1/1]">
            <div className="status status-md sm:status-lg status-primary animate-ping"></div>
            <div className="status status-md sm:status-lg status-primary"></div>
          </div>
          <p className="text-sm sm:text-base font-bold">{t("casino:bets")}</p>
        </div>
        <div className="hidden sm:block">
          <SegmentedControl options={segments} value={selectedCategory} onChange={(value) => setSelectedCategory(value as any)} />
        </div>
        <div className="block sm:hidden">
          <div className="dropdown dropdown-center">
            <div tabIndex={0} role="button" className="btn m-1 btn-sm w-38 flex items-center justify-between">
              {segments.find((segment) => segment.value === selectedCategory)?.label}
              <ChevronRight className="w-4 h-4 text-base-content rtl:rotate-180" />
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-200 rounded-field z-1 w-38 p-2 shadow-sm">
              {segments.map((segment) => (
                <li key={segment.value}>
                  <a className="text-xs font-semibold" onClick={() => setSelectedCategory(segment.value as any)}>
                    {segment.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-box">
        {/* 表头 */}
        <div className="px-3 sm:px-6 py-2 sm:py-3 mb-1">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 font-semibold text-base-content/50 text-xs sm:text-sm">
            <div className="text-start">{t("casino:game")?.toUpperCase()}</div>
            <div className="text-start">{t("casino:user")?.toUpperCase()}</div>
            <div className="hidden sm:block text-start">{t("casino:bet")?.toUpperCase()}</div>
            <div className="hidden sm:block text-start">{t("casino:multiplier")?.toUpperCase()}</div>
            <div className="text-end">{t("casino:profit")?.toUpperCase()}</div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="relative">
          <AnimatePresence mode="popLayout">{tableRows}</AnimatePresence>
          {/* 底部渐变遮罩：从底部到上方的透明渐变，提示可滚动/内容延伸。不阻挡交互 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[75%] bg-gradient-to-t from-base-300/90 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};
