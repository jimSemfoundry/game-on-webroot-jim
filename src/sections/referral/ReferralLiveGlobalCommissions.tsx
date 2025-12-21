import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useGlobalCommissions } from "@/hooks/api/usePublic";
import type { GlobalCommissionRecord } from "@/types/referral";
import { cn } from "@/utils/cn";
import { useInView } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAutoAnimate } from "@formkit/auto-animate/react";

// 扩展类型以包含动画所需的 _uniqueKey
type GlobalCommissionWithKey = GlobalCommissionRecord & { _uniqueKey?: number };

export const ReferralLiveGlobalCommissions = () => {
  const { t } = useTranslation();
  const { data: globalCommissionsResponse, refetch: refetchGlobalCommissions } = useGlobalCommissions();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  
  const [visibleRows, setVisibleRows] = useState<GlobalCommissionWithKey[]>([]);
  const dataRef = useRef<GlobalCommissionWithKey[]>([]);
  const indexRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const isFirstLoadRef = useRef(true);
  const rowKeyCounter = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const MAX_ROWS = 8;
  const ANIMATION_INTERVAL = 500; // 固定 500ms 显示一行

  // 使用 Framer Motion 的 useInView hook
  const isInView = useInView(containerRef, {
    amount: 0.1, // 10% 可见即认为在视口内
    margin: "0px",
  });

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
        refetchGlobalCommissions();
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
  }, [clearTimeoutIfAny, refetchGlobalCommissions, isInView]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimeoutIfAny();
    };
  }, [clearTimeoutIfAny]);

  useEffect(() => {
    const activeList = globalCommissionsResponse?.code === 0 ? globalCommissionsResponse?.data ?? [] : [];
    const hasData = Array.isArray(activeList) && activeList.length > 0;
    dataRef.current = hasData ? activeList : [];

    if (!hasData) {
      resetVisibleRows();
      clearTimeoutIfAny();
      return;
    }

    // 只有在首次加载时才重启动画
    if (isFirstLoadRef.current) {
      resetVisibleRows();
      clearTimeoutIfAny();
      if (isInView) {
        scheduleNext();
      }
      isFirstLoadRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalCommissionsResponse, clearTimeoutIfAny, isInView, resetVisibleRows, scheduleNext]);

  // 当组件进入/离开视口时控制动画
  useEffect(() => {
    if (dataRef.current.length > 0) {
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
  }, [isInView, clearTimeoutIfAny]);

  // 使用 Auto Animate
  const [animationParent] = useAutoAnimate({
    duration: 300,
    easing: 'ease-out'
  });

  const tableRows = useMemo(() => {
    const rows = [] as any[];
    const visibleData = visibleRows.slice(0, MAX_ROWS);
    
    // 渲染实际数据行
    visibleData.forEach((commission: GlobalCommissionWithKey, index: number) => {
      const reward = parseFloat(commission.reward || "0");
      const referType = commission.refer_type;

      rows.push(
        <div
          key={commission._uniqueKey || `fallback-${commission.id || index}-${commission.down_line_username}`}
          className={cn(
            "px-3 sm:px-6 py-3 sm:py-3 hover:bg-base-200/90 transition-colors duration-300 rounded-field mb-1 bg-base-300",
          )}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-center">
            {/* User */}
            <div className="text-base-content/70 text-xs sm:text-base font-semibold">
              <div className="flex items-center gap-2">
                <p className="truncate">{commission.down_line_username}</p>
              </div>
            </div>

            {/* Referral Type - Hidden on mobile */}
            <div className="hidden sm:block text-base-content/70 text-xs sm:text-base font-semibold">
              <span className={cn(
                "px-2 py-1 rounded-full text-xs",
                referType === "direct" ? "bg-primary/20 text-primary" : "bg-base-content/20 text-base-content/70"
              )}>
                {referType === "direct" ? t("referral:direct") : t("referral:indirect")}
              </span>
            </div>

            {/* Reward */}
            <div className="text-end text-xs sm:text-base">
              <div className="flex items-center gap-1 justify-end">
                <span className={cn("text-xs sm:text-sm font-bold", reward > 0 ? "text-primary" : "text-base-content/50")}>
                  {reward > 0 ? "+" : ""}
                  {formatWithConversion(reward, "USD", { compact: true, showCode: false }).formatted}
                </span>
                <CurrencyIcon currency="USD" />
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-center h-full">
            <div className="text-xs sm:text-base text-base-content/20">-</div>
            <div className="hidden sm:block text-xs sm:text-base text-base-content/20">-</div>
            <div className="text-end text-xs sm:text-base text-base-content/20">-</div>
          </div>
        </div>
      );
    }

    return rows;
  }, [visibleRows, formatWithConversion, t]);

  return (
    <div ref={containerRef} className="flex flex-col gap-1 w-full">
      <div className="overflow-hidden rounded-box">
        {/* 表头 */}
        <div className="px-3 sm:px-6 py-2 sm:py-3 mb-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-semibold text-base-content/50 text-xs sm:text-sm">
            <div className="text-start">{t("referral:user")?.toUpperCase()}</div>
            <div className="hidden sm:block text-start">{t("referral:type")?.toUpperCase()}</div>
            <div className="text-end">{t("referral:rewards")?.toUpperCase()}</div>
          </div>
        </div>

        {/* 内容区域 - 使用 Auto Animate */}
        <div className="relative">
          <div ref={animationParent}>
            {tableRows}
          </div>
          {/* <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-linear-to-t from-base-300/90 to-transparent"></div> */}
        </div>
      </div>
    </div>
  );
};
