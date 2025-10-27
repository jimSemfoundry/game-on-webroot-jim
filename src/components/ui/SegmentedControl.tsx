import { m } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/utils/themeMerger";

export interface SegmentedControlOption {
  value: string;
  label: ReactNode;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  layoutId?: string;
  orientation?: "horizontal" | "vertical";
  buttonClassName?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
  layoutId = "segmented-control",
  orientation = "horizontal",
  buttonClassName,
}: SegmentedControlProps) {
  const isVertical = orientation === "vertical";
  
  return (
    <div className={cn(
      "relative p-1",
      isVertical ? "flex flex-col w-full space-y-1" : "flex w-full",
      className
    )}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "relative flex items-center justify-center rounded-field transition-colors btn btn-sm md:btn-md bg-transparent border-0",
            isVertical ? "w-full" : "flex-1",
            value === option.value
              ? "text-primary-content"
              : "text-base-content/70 hover:text-primary",
            buttonClassName
          )}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <span className="relative z-10">{option.label}</span>

          {value === option.value && (
            <m.div
              layoutId={`${layoutId}-highlight`}
              className="absolute inset-0 z-0 rounded-field bg-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{ transform: "translateZ(0)" }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
