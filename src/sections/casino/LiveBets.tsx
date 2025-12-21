import Iconify from "@/components/iconify";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useModals } from "@/contexts/ModalsProvider";
import { useGreatestBets, useLatestBets, useLatestWins } from "@/hooks/api/usePublic";
import { cn } from "@/utils/cn";
import { ChevronRight } from "lucide-react";
import { useInView } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export const LiveBets = () => {
  const { t, i18n } = useTranslation();
  const { openBetSlipModal } = useModals();
  const currentLanguage = i18n.language.toUpperCase();
  const {
    data: latestWinsResponse,
    refetch: refetchLatestWins,
    isFetching: isFetchingLatestWins,
  } = useLatestWins(currentLanguage);
  const {
    data: latestBetsResponse,
    refetch: refetchLatestBets,
    isFetching: isFetchingLatestBets,
  } = useLatestBets();
  const { data: greatestBetsResponse, isFetching: isFetchingGreatestBets } = useGreatestBets();
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
  const ANIMATION_INTERVAL = 500; // 固定 500ms 显示一行

  const [selectedCategory, setSelectedCategory] = useState<"latestWins" | "latestBets" | "greatestBets">("latestWins");
  const previousCategoryRef = useRef<typeof selectedCategory>("latestWins");

  // 使用 Framer Motion 的 useInView hook
  const isInView = useInView(containerRef, {
    amount: 0.1, // 10% 可见即认为在视口内
    margin: "0px", // 不要提前触发，只在真正可见时触发
  });

  const segments = [
    {
      value: "latestWins",
      label: (
        <span className="flex items-center gap-2 whitespace-nowrap">
          <Iconify icon="custom:latest-win" />
          <p>{t("casino:latestWins")}</p>
        </span>
      ),
    },
    {
      value: "latestBets",
      label: (
        <span className="flex items-center gap-2 whitespace-nowrap">
          <Iconify icon="custom:greatest-win" />
          <p>{t("casino:latestBets")}</p>
        </span>
      ),
    },
    {
      value: "greatestBets",
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

  const resetVisibleRows = useCallback(() => {
    setVisibleRows([]);
    indexRef.current = 0;
    rowKeyCounter.current = 0;
  }, []);

  const scheduleNext = useCallback(() => {
    // 如果组件不在视口内，直接返回
    if (!isInView) {
      return;
    }

    clearTimeoutIfAny();
    timeoutRef.current = window.setTimeout(() => {
      if (!isMountedRef.current) return;
      // 再次检查是否在视口内
      if (!isInView) {
        return;
      }
      const data = dataRef.current;
      if (!data || data.length === 0) return;
      if (indexRef.current >= data.length) {
        // 数据滚动完毕，重置索引并继续滚动相同数据
        indexRef.current = 0;
        // 同时在后台获取新数据（不阻塞当前滚动）
        if (selectedCategory === "latestWins") {
          refetchLatestWins();
        } else if (selectedCategory === "latestBets") {
          refetchLatestBets();
        }
        // 继续滚动
        scheduleNext();
        return;
      }
      const currentIndex = indexRef.current;
      const nextItem = data[currentIndex];
      indexRef.current = currentIndex + 1;
      setVisibleRows((prev) => {
        // 为新项分配稳定的 key
        const itemWithKey = { ...nextItem, _uniqueKey: ++rowKeyCounter.current };
        // 插入到顶部
        const nextRows = [itemWithKey, ...prev].slice(0, MAX_ROWS);
        return nextRows;
      });
      scheduleNext();
    }, ANIMATION_INTERVAL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearTimeoutIfAny, refetchLatestWins, refetchLatestBets, isInView, selectedCategory]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimeoutIfAny();
    };
  }, [clearTimeoutIfAny]);

  useEffect(() => {
    const handleLatestCategory = (list: any[], isFetching: boolean) => {
      const hasData = Array.isArray(list) && list.length > 0;

      if (!hasData) {
        // 如果正在拉取新数据且已有缓存，则保持现有展示避免闪烁
        if (isFetching && dataRef.current.length > 0) {
          return;
        }
        dataRef.current = [];
        resetVisibleRows();
        clearTimeoutIfAny();
        return;
      }

      dataRef.current = list;

      // 只有在首次加载或切换类别时才重启动画
      if (isFirstLoadRef.current || previousCategoryRef.current !== selectedCategory) {
        resetVisibleRows();
        clearTimeoutIfAny();
        if (isInView) {
          scheduleNext();
        }
        isFirstLoadRef.current = false;
      }
    };

    if (selectedCategory === "latestWins") {
      const activeList = latestWinsResponse?.code === 0 ? latestWinsResponse?.data ?? [] : [];
      handleLatestCategory(activeList, isFetchingLatestWins);
    } else if (selectedCategory === "latestBets") {
      const activeList = latestBetsResponse?.code === 0 ? latestBetsResponse?.data ?? [] : [];
      handleLatestCategory(activeList, isFetchingLatestBets);
    } else if (selectedCategory === "greatestBets") {
      clearTimeoutIfAny();
      resetVisibleRows();
      const greatestList = greatestBetsResponse?.code === 0 ? greatestBetsResponse?.data ?? [] : [];
      const greatestWithKeys = greatestList.map((item: any, idx: number) => ({
        ...item,
        _uniqueKey: `greatest-${idx}-${item.id || idx}`,
      }));
      setVisibleRows(greatestWithKeys.slice(0, MAX_ROWS));
      dataRef.current = greatestList;
      isFirstLoadRef.current = true;
    }

    previousCategoryRef.current = selectedCategory;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    latestWinsResponse,
    latestBetsResponse,
    greatestBetsResponse,
    selectedCategory,
    clearTimeoutIfAny,
    isInView,
    resetVisibleRows,
    scheduleNext,
    isFetchingLatestWins,
    isFetchingLatestBets,
    isFetchingGreatestBets,
  ]);

  // 当组件进入/离开视口时控制动画
  useEffect(() => {
    if ((selectedCategory === "latestWins" || selectedCategory === "latestBets") && dataRef.current.length > 0) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, selectedCategory, clearTimeoutIfAny]);

  // 使用 Auto Animate
  const [animationParent] = useAutoAnimate({
    duration: 300,
    easing: 'ease-out'
  });

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
        <div
          key={bet._uniqueKey || `fallback-${bet.id || index}-${bet.nickname}`}
          className="px-3 sm:px-6 py-3 sm:py-3 hover:bg-base-200/90 transition-colors cursor-pointer bg-base-200 rounded-field mb-1"
          onClick={() => openBetSlipModal(bet)}
        >
          <div className="grid grid-cols-3 sm:grid-cols-5 sm:grid-cols-[1.8fr_1.5fr_1fr_0.5fr_1fr] gap-4 items-center">
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
        </div>,
      );
    });

    // 添加空行以确保始终显示8行
    const emptyRowsCount = MAX_ROWS - visibleData.length;
    for (let i = 0; i < emptyRowsCount; i++) {
      rows.push(
        <div
          key={`empty-row-${i}`}
          className="px-3 sm:px-6 py-3 sm:py-3 bg-base-100/50 rounded-field mb-1"
        >
          <div className="grid grid-cols-3 sm:grid-cols-5 sm:grid-cols-[1.8fr_1.5fr_1fr_0.5fr_1fr] gap-4 items-center h-full">
            <div className="text-xs sm:text-base text-base-content/20">-</div>
            <div className="text-xs sm:text-base text-base-content/20">-</div>
            <div className="hidden sm:block text-xs sm:text-base text-base-content/20">-</div>
            <div className="hidden sm:block text-xs sm:text-base text-base-content/20">-</div>
            <div className="text-end text-xs sm:text-base text-base-content/20">-</div>
          </div>
        </div>
      );
    }

    return rows;
  }, [visibleRows, formatWithConversion, openBetSlipModal]);

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
                  <a
                    className="text-xs font-semibold"
                    onClick={() => {
                      setSelectedCategory(segment.value as any);
                      if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                      }
                    }}
                  >
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
          <div className="grid grid-cols-3 sm:grid-cols-5 sm:grid-cols-[1.8fr_1.5fr_1fr_0.5fr_1fr] gap-4 font-semibold text-base-content/50 text-xs sm:text-sm">
            <div className="text-start">{t("casino:game")?.toUpperCase()}</div>
            <div className="text-start">{t("casino:user")?.toUpperCase()}</div>
            <div className="hidden sm:block text-start">{t("casino:bet")?.toUpperCase()}</div>
            <div className="hidden sm:block text-start">{t("casino:multiplier")?.toUpperCase()}</div>
            <div className="text-end">{t("casino:profit")?.toUpperCase()}</div>
          </div>
        </div>

        {/* 内容区域 - 使用 Auto Animate */}
        <div className="relative">
          <div ref={animationParent}>
            {tableRows}
          </div>
          {/* 底部渐变遮罩：从底部到上方的透明渐变，提示可滚动/内容延伸。不阻挡交互 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[75%] bg-linear-to-t from-base-300/90 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};
