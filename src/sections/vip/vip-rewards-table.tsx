import { Fragment, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import Iconify from "@/components/iconify";
import { useAuth } from "@/contexts/AuthContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, m, type Variants } from "motion/react";

const VIP_LEVELS = Array.from({ length: 125 }, (_, i) => i + 1);

interface RewardRow {
  icon: string;
  label: string;
  type: "currency" | "percentage" | "boolean";
  getValue: (level: number) => string | boolean;
}

const REWARD_ROWS: RewardRow[] = [
  {
    icon: "/icons/isometric/2.svg",
    label: "vip:level_up_bonus_cumulative",
    type: "currency",
    getValue: (level: number) => {
      const baseAmount = 0.8;
      const amount = (baseAmount + level * 0.2).toFixed(2);
      return `$${amount}`;
    },
  },
  {
    icon: "/icons/isometric/3.svg",
    label: "vip:referral_commission",
    type: "percentage",
    getValue: (level: number) => {
      const base = 29.2;
      const percentage = (base + level * 0.1).toFixed(1);
      return `${percentage}%`;
    },
  },
  {
    icon: "/icons/isometric/4.svg",
    label: "vip:daily_cashback",
    type: "percentage",
    getValue: (level: number) => {
      const base = 0.5;
      const percentage = (base + level * 0.1).toFixed(1);
      return `${percentage}%`;
    },
  },
  {
    icon: "/icons/isometric/5.svg",
    label: "vip:super_rakeback",
    type: "percentage",
    getValue: (level: number) => {
      const base = 0.5;
      const percentage = (base + level * 0.1).toFixed(1);
      return `${percentage}%`;
    },
  },
  {
    icon: "/icons/isometric/7.svg",
    label: "vip:conquests",
    type: "boolean",
    getValue: (level: number) => level >= 1,
  },
  {
    icon: "/icons/isometric/8.svg",
    label: "vip:achievements",
    type: "boolean",
    getValue: (level: number) => level >= 1,
  },
  {
    icon: "/icons/isometric/9.svg",
    label: "vip:lucky_seven",
    type: "boolean",
    getValue: (level: number) => level >= 20,
  },
  {
    icon: "/icons/isometric/15.svg",
    label: "vip:jester",
    type: "boolean",
    getValue: (level: number) => level >= 21,
  },
  {
    icon: "/icons/isometric/11.svg",
    label: "vip:weekly_bonus",
    type: "boolean",
    getValue: (level: number) => level >= 22,
  },
  {
    icon: "/icons/isometric/12.svg",
    label: "vip:mystery_box",
    type: "boolean",
    getValue: (level: number) => level >= 23,
  },
];

type LevelDescriptor = {
  level: number | null;
  label: string;
  headerHint?: string;
  isDynamic?: boolean;
};

type TransitionDirection = "forward" | "backward";

const dynamicColumnVariants = {
  initial: (direction: TransitionDirection) => ({
    // opacity: 0,
    x: direction === "forward" ? 24 : -24,
  }),
  animate: {
    // opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 280,
      damping: 26,
    },
  },
  exit: (direction: TransitionDirection) => ({
    opacity: 0,
    x: direction === "forward" ? -24 : 24,
    transition: {
      type: "tween" as const,
      duration: 0.22,
      ease: "easeInOut" as const,
    },
  }),
} satisfies Variants;

export function VipRewardsTable() {
  const { t } = useTranslation();
  const { status } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const currentVip = Math.max(1, Math.min(status?.vip ?? 1, VIP_LEVELS.length));
  const currentIndex = currentVip - 1;

  const staticColumnCount = isMobile ? 1 : 4;

  const staticLevels: LevelDescriptor[] = useMemo(() => {
    const descriptors: LevelDescriptor[] = [];
    for (let offset = 0; offset < staticColumnCount; offset += 1) {
      const level = VIP_LEVELS[currentIndex + offset] ?? null;
      descriptors.push({
        level,
        label:
          level != null
            ? t("vip:vip_level_label", { level, defaultValue: `VIP ${level}` })
            : t("vip:vip_level_unknown", { defaultValue: "VIP --" }),
        headerHint:
          offset === 0
            ? t("vip:current_level", { defaultValue: "Current level" })
            : t("vip:next_level_step", {
                count: offset,
                defaultValue: offset === 1 ? "+1 level" : `+${offset} levels`,
              }),
      });
    }
    return descriptors;
  }, [currentIndex, staticColumnCount, t]);

  const dynamicCandidates = useMemo(() => VIP_LEVELS.slice(currentIndex + staticColumnCount), [currentIndex, staticColumnCount]);
  const [dynamicOffset, setDynamicOffset] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState<TransitionDirection>("forward");

  useEffect(() => {
    const initialOffset = isMobile ? 0 : 0;
    setDynamicOffset(initialOffset);
    setTransitionDirection("forward");
  }, [currentIndex, isMobile]);

  useEffect(() => {
    setDynamicOffset((prev) => Math.min(prev, Math.max(dynamicCandidates.length - 1, 0)));
  }, [dynamicCandidates.length]);

  const dynamicLevel = dynamicCandidates[dynamicOffset] ?? null;

  const levelColumns: LevelDescriptor[] = [
    ...staticLevels,
    {
      level: dynamicLevel ?? null,
      label:
        dynamicLevel != null
          ? t("vip:vip_level_label", { level: dynamicLevel, defaultValue: `VIP ${dynamicLevel}` })
          : t("vip:vip_level_unknown", { defaultValue: "VIP --" }),
      headerHint:
        dynamicLevel != null
          ? t("vip:dynamic_level_hint", {
              index: dynamicOffset + 1,
              defaultValue: "Explore more",
            })
          : t("vip:max_level_reached", { defaultValue: "All rewards unlocked" }),
      isDynamic: true,
    },
  ];

  const canShiftBackward = dynamicOffset > 0;
  const canShiftForward = dynamicOffset < dynamicCandidates.length - 1;

  const shiftBackward = () => {
    if (!canShiftBackward) return;
    setTransitionDirection("backward");
    setDynamicOffset((prev) => Math.max(prev - 1, 0));
  };

  const shiftForward = () => {
    if (!canShiftForward) return;
    setTransitionDirection("forward");
    setDynamicOffset((prev) => Math.min(prev + 1, dynamicCandidates.length - 1));
  };

  const renderCellValue = (row: RewardRow, value: string | boolean | null) => {
    if (value == null) return <span>-</span>;

    if (row.type === "boolean") {
      return value ? <Iconify icon="mingcute:check-fill" width={16} height={16} className="text-success" /> : <span>-</span>;
    }

    return <span className="font-medium">{value}</span>;
  };

  const gridColsClass = isMobile
    ? "grid-cols-[minmax(120px,1fr)_repeat(2,minmax(100px,1fr))]"
    : "grid-cols-[minmax(200px,1.1fr)_repeat(5,minmax(120px,1fr))]";

  return (
    <div className="rounded-box bg-base-200">
      <div className={cn("grid gap-x-2 gap-y-0", gridColsClass)}>
        <div className="rounded-md px-3 py-3 sm:px-4 sm:py-4 font-semibold text-base-content/50 text-xs sm:text-sm">
          {t("vip:bonus_type")}
        </div>

        {levelColumns.map((descriptor, index) => (
          <div
            key={`header-${index}`}
            className={cn(
              "rounded-md px-2 py-2 sm:px-3 sm:py-3 text-center text-xs sm:text-sm text-base-content/50 flex flex-col items-center justify-center gap-1 sm:gap-2",
              descriptor.level != null ? "" : "opacity-60",
            )}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              {descriptor.isDynamic && (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-circle p-0 min-h-0 h-6 w-6"
                  onClick={shiftBackward}
                  disabled={!canShiftBackward}
                  aria-label={t("vip:shift_previous_level", { defaultValue: "Previous level" })}
                >
                  <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              )}
              <AnimatePresence initial={false} mode="wait">
                <m.div
                  key={descriptor.level ?? "none"}
                  custom={transitionDirection}
                  variants={dynamicColumnVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
                >
                  {descriptor.level != null && (
                    <img
                      src={`/images/vip/levels/${descriptor.level}.png`}
                      alt={descriptor.label}
                      className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
                    />
                  )}
                  <span className="font-semibold text-base-content/50 text-xs sm:text-sm whitespace-nowrap">{descriptor.label}</span>
                </m.div>
              </AnimatePresence>
              {descriptor.isDynamic && (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-circle p-0 min-h-0 h-6 w-6"
                  onClick={shiftForward}
                  disabled={!canShiftForward}
                  aria-label={t("vip:shift_next_level", { defaultValue: "Next level" })}
                >
                  <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}

        {REWARD_ROWS.map((row, rowIndex) => (
          <Fragment key={rowIndex}>
            <div className="flex items-center gap-2 sm:gap-3 rounded-md px-2 py-2 sm:px-4 sm:py-3">
              <img src={row.icon} className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" alt="" aria-hidden />
              <span className="whitespace-pre-line text-xs sm:text-sm font-semibold text-base-content/50 leading-tight">
                {t(row.label)}
              </span>
            </div>

            {levelColumns.map((descriptor, columnIndex) => {
              const rawValue = descriptor.level != null ? row.getValue(descriptor.level) : null;
              const isBooleanActive = row.type === "boolean" && rawValue === true;

              return (
                <div
                  key={`cell-${rowIndex}-${columnIndex}`}
                  className={cn(
                    "flex items-center justify-center rounded-md px-2 py-2 sm:px-3 sm:py-3 text-base-content/50 text-xs sm:text-sm",
                    isBooleanActive && "bg-success/20 text-success",
                  )}
                >
                  {descriptor.isDynamic ? (
                    <AnimatePresence initial={false} mode="wait">
                      <m.div
                        key={`cell-${rowIndex}-${descriptor.level ?? "none"}`}
                        custom={transitionDirection}
                        variants={dynamicColumnVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex items-center justify-center"
                      >
                        {renderCellValue(row, rawValue)}
                      </m.div>
                    </AnimatePresence>
                  ) : (
                    renderCellValue(row, rawValue)
                  )}
                </div>
              );
            })}

            {rowIndex < REWARD_ROWS.length - 1 && (
              <div className={cn("h-px bg-base-300", isMobile ? "col-span-3" : "col-span-6")} />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
