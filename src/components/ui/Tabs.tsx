import { m } from "motion/react";
import type { ReactNode } from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/utils/themeMerger";

export interface TabItem {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export type TabsVariant = 
  | "primary" 
  | "secondary" 
  | "accent" 
  | "neutral" 
  | "info" 
  | "success" 
  | "warning" 
  | "error";

export type TabsSize = "xs" | "sm" | "md" | "lg";

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  className?: string;
  tabClassName?: string;
  layoutId?: string;
  orientation?: "horizontal" | "vertical";
}

const variantClasses: Record<TabsVariant, { bg: string; text: string; hover: string }> = {
  primary: {
    bg: "bg-primary",
    text: "text-primary-content",
    hover: "hover:text-primary"
  },
  secondary: {
    bg: "bg-secondary",
    text: "text-secondary-content", 
    hover: "hover:text-secondary"
  },
  accent: {
    bg: "bg-accent",
    text: "text-accent-content",
    hover: "hover:text-accent"
  },
  neutral: {
    bg: "bg-neutral",
    text: "text-neutral-content",
    hover: "hover:text-neutral"
  },
  info: {
    bg: "bg-info",
    text: "text-info-content",
    hover: "hover:text-info"
  },
  success: {
    bg: "bg-success", 
    text: "text-success-content",
    hover: "hover:text-success"
  },
  warning: {
    bg: "bg-warning",
    text: "text-warning-content", 
    hover: "hover:text-warning"
  },
  error: {
    bg: "bg-error",
    text: "text-error-content",
    hover: "hover:text-error"
  }
};

const sizeClasses: Record<TabsSize, string> = {
  xs: "btn-xs text-xs",
  sm: "btn-sm text-sm", 
  md: "btn-md text-base",
  lg: "btn-lg text-lg"
};

export function Tabs({
  tabs,
  value,
  onChange,
  variant = "primary",
  size = "md", 
  className,
  tabClassName,
  layoutId = "tabs",
  orientation = "horizontal"
}: TabsProps) {
  const isVertical = orientation === "vertical";
  const variantStyles = variantClasses[variant];
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 当选中值变化时，自动滚动使当前选中项尽量居中可见（仅水平方向）
  useEffect(() => {
    if (isVertical || !containerRef.current) return;
    const container = containerRef.current;
    const active = container.querySelector('[role="tab"][aria-selected="true"]') as HTMLElement | null;
    if (!active) return;

    const activeLeft = active.offsetLeft;
    const activeRight = activeLeft + active.offsetWidth;
    const viewLeft = container.scrollLeft;
    const viewRight = viewLeft + container.clientWidth;

    if (activeLeft < viewLeft || activeRight > viewRight) {
      const targetLeft = activeLeft - (container.clientWidth - active.offsetWidth) / 2;
      container.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
    }
  }, [value, isVertical]);

  // Handle wheel event for horizontal scrolling
  const handleWheel = (e: React.WheelEvent) => {
    if (isVertical || !containerRef.current) return;
    
    // Prevent vertical scrolling and enable horizontal scrolling
    if (e.deltaY !== 0) {
      containerRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isVertical || !containerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    
    // 防止文本选择
    e.preventDefault();
  }, [isVertical]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || isVertical || !containerRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // 拖拽速度倍数
    containerRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, isVertical, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);


  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || isVertical || !containerRef.current) return;
      
      const x = e.pageX - containerRef.current.offsetLeft;
      const walk = (x - startX);
      containerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isVertical, startX, scrollLeft]);

  const handleHeaderTouchMove = useCallback((e: React.TouchEvent) => {
    console.log("handleHeaderTouchMove", e);
    if (isDragging) {
      e.preventDefault();
    }
  }, [isDragging]);
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative p-1 rounded-field bg-base-200/50",
        isVertical ? "flex flex-col w-fit space-y-1" : "flex overflow-x-auto hide-scrollbar",
        isDragging && "cursor-grabbing",
        !isDragging && "cursor-grab",
        className
      )}
      onTouchMove={handleHeaderTouchMove}
  style={{ touchAction: "pan-x" }}
      role="tablist"
      aria-orientation={orientation}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={(e) => {if (isDragging) {
            e.preventDefault();
            return;
          }!tab.disabled && onChange(tab.value)}}
          disabled={tab.disabled}
          className={cn(
            "relative flex items-center justify-center rounded-field transition-all duration-200",
            "border-0 bg-transparent font-medium",
            sizeClasses[size],
            isVertical ? "w-full" : "min-w-fit px-1 flex-shrink-0",
            value === tab.value
              ? cn("text-current", variantStyles.text)
              : cn(
                  "text-base-content/70",
                  !tab.disabled && variantStyles.hover,
                  tab.disabled && "opacity-50 cursor-not-allowed"
                ),
            tabClassName,
            tab.className
          )}
          style={{ WebkitTapHighlightColor: "transparent" }}
          role="tab"
          aria-selected={value === tab.value}
          aria-disabled={tab.disabled}
        >
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon}
            {tab.label}
          </span>

          {value === tab.value && (
            isMounted ? (
              <m.div
                layoutId={`${layoutId}-highlight`}
                className={cn(
                  "absolute inset-0 z-0 rounded-field shadow-sm",
                  variantStyles.bg
                )}
                initial={false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 25,
                  duration: 0.2 
                }}
                style={{ transform: "translateZ(0)" }}
              />
            ) : (
              <div
                className={cn(
                  "absolute inset-0 z-0 rounded-field shadow-sm",
                  variantStyles.bg
                )}
                style={{ transform: "translateZ(0)" }}
              />
            )
          )}
        </button>
      ))}
    </div>
  );
}