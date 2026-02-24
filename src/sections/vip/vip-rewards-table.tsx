import { Fragment, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/contexts/AuthContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useVipConfig } from "@/hooks/api/usePublic";
import type { IVipLevelConfig, VipRewardRow } from "@/types/vip";
import { Carousel, useCarousel } from "@/components/carousel";
import { InnerGuardContainer } from "@/sections/vip/vip-faq.tsx";

// 奖励行配置 - 从 API 数据中提取对应字段
const REWARD_ROWS: VipRewardRow[] = [
  {
    icon: "/icons/isometric/2.svg",
    label: "vip:level_up_bonus_cumulative",
    type: "currency",
    field: "level_up",
    getValue: (config: IVipLevelConfig) => {
      const value = config.level_up;
      if (!value) return "-";
      // API 返回的是科学计数法字符串，如 "0E-8"
      const numValue = parseFloat(value);
      return numValue > 0 ? `$${numValue.toFixed(2)}` : "-";
    }
  },
  {
    icon: "/icons/isometric/3.svg",
    label: "vip:referral_commission",
    type: "percentage",
    field: "group",
    getValue: (config: IVipLevelConfig) => {
      const value = config.group;
      if (!value) return "-";
      const numValue = parseFloat(value);
      return numValue > 0 ? `${(numValue * 100).toFixed(2)}%` : "-";
    }
  },
  {
    icon: "/icons/isometric/4.svg",
    label: "vip:daily_cashback",
    type: "percentage",
    field: "cashback_other",
    getValue: (config: IVipLevelConfig) => {
      const value = config.cashback_other;
      if (!value) return "-";
      const numValue = parseFloat(value);
      return numValue > 0 ? `${(numValue * 100).toFixed(2)}%` : "-";
    }
  },
  {
    icon: "/icons/isometric/5.svg",
    label: "vip:super_rakeback",
    type: "percentage",
    field: "rakeback",
    getValue: (config: IVipLevelConfig) => {
      const value = config.rakeback;
      if (!value) return "-";
      const numValue = parseFloat(value);
      return numValue > 0 ? `${(numValue * 100).toFixed(2)}%` : "-";
    }
  },
  {
    icon: "/icons/isometric/gold-cup.svg",
    label: "vip:achievements",
    type: "boolean",
    field: "achievements",
    getValue: (config: IVipLevelConfig) => {
      return config.vip > 1;
    }
  },

  {
    icon: "/icons/isometric/12.svg",
    label: "vip:mystery_box",
    type: "boolean",
    field: "mystery_box",
    getValue: (config: IVipLevelConfig) => {
      return config.vip > 4;
    }
  },
  {
    icon: "/icons/isometric/7.svg",
    label: "vip:lucky_seven",
    type: "boolean",
    field: "lucky_seven",
    getValue: (config: IVipLevelConfig) => {
      return config.vip > 6;
    }
  }
];

type LevelDescriptor = {
  level: number | null;
  label: string;
  headerHint?: string;
  isDynamic?: boolean;
};

export function VipRewardsTable() {
  const { t } = useTranslation('vip');
  const { status } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { data: vipConfigResponse, isLoading } = useVipConfig();

  // 从 API 获取并排序 VIP 配置
  const vipLevels = useMemo(() => {
    if (!vipConfigResponse?.data) return [];
    const configs = Array.isArray(vipConfigResponse.data) ? vipConfigResponse.data : [];
    return [...configs].sort((a, b) => a.vip - b.vip);
  }, [vipConfigResponse]);

  const currentVip = Math.max(1, Math.min(status?.vip ?? 1, vipLevels.length || 125));
  const currentIndex = currentVip - 1;

  const staticColumnCount = isMobile ? 1 : 4;

  const staticLevels: LevelDescriptor[] = useMemo(() => {
    const descriptors: LevelDescriptor[] = [];
    for (let offset = 0; offset < staticColumnCount; offset += 1) {
      const config = vipLevels[currentIndex + offset] ?? null;
      const level = config?.vip ?? null;
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
              defaultValue: offset === 1 ? "+1 level" : `+${offset} levels`
            })
      });
    }
    return descriptors;
  }, [currentIndex, staticColumnCount, t, vipLevels]);

  const dynamicCandidates = useMemo(() => vipLevels.slice(currentIndex + staticColumnCount), [currentIndex, staticColumnCount, vipLevels]);

  const carousel = useCarousel({
    slidesToShow: 1,
    slidesToScroll: 1,
    axis: "x",
    loop: false
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!carousel.mainApi) return;

    const onSelect = () => {
      setSelectedIndex(carousel.mainApi!.selectedScrollSnap());
    };

    carousel.mainApi.on("select", onSelect);
    carousel.mainApi.on("reInit", onSelect);

    return () => {
      carousel.mainApi?.off("select", onSelect);
      carousel.mainApi?.off("reInit", onSelect);
    };
  }, [carousel.mainApi]);

  const renderCellValue = (row: VipRewardRow, value: string | boolean | null) => {
    if (value == null || value === "-") return <span>-</span>;

    if (row.type === "boolean") {
      return value ? <input type="checkbox" defaultChecked
                            className="checkbox checkbox-primary checkbox-xs sm:checkbox-sm"></input> : <span>-</span>;
    }

    return <span className="font-medium">{value}</span>;
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="rounded-box bg-base-200 p-8 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // 无数据状态
  if (vipLevels.length === 0) {
    return (
      <div className="rounded-box bg-base-200 p-8 flex items-center justify-center">
        <span
          className="text-base-content/50">{t("vip:no_config_data", { defaultValue: "No VIP configuration available" })}</span>
      </div>
    );
  }

  return (
    <div className="rounded-box bg-base-200 overflow-hidden">
      <div className="flex w-full">
        {/* Left Side: Static Columns */}
        <div className={cn("shrink-0 grid gap-y-0", isMobile ? "w-[calc(100%-120px)]" : "flex-[5.1]")}>
          <div
            className={cn("grid", isMobile ? "grid-cols-[minmax(120px,1fr)_100px]" : "grid-cols-[minmax(200px,1.1fr)_repeat(4,minmax(120px,1fr))]")}>
            {/* Header Row - Label */}
            <div
              className="rounded-md px-3 py-3 sm:px-4 sm:py-4 font-semibold text-base-content/50 text-xs sm:text-sm h-[60px] flex items-center">
              {t("vip:bonus_type")}
            </div>

            {/* Header Row - Static Levels */}
            {staticLevels.map((descriptor, index) => (
              <div
                key={`header-static-${index}`}
                className={cn(
                  "rounded-md px-2 py-2 sm:px-3 sm:py-3 text-center text-xs sm:text-sm text-base-content/50 flex flex-col items-center justify-center gap-1 sm:gap-2 h-[60px]",
                  descriptor.level != null ? "" : "opacity-60"
                )}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  {descriptor.level != null && (
                    <img
                      src={`/images/vip/levels/${descriptor.level}.png`}
                      alt={descriptor.label}
                      className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
                    />
                  )}
                  <span
                    className="font-semibold text-base-content/50 text-xs sm:text-sm whitespace-nowrap">{descriptor.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Data Rows */}
          {REWARD_ROWS.map((row, rowIndex) => (
            <InnerGuardContainer item={row} key={rowIndex}>
              <Fragment key={rowIndex}>
                <div
                  className={cn("grid", isMobile ? "grid-cols-[minmax(120px,1fr)_100px]" : "grid-cols-[minmax(200px,1.1fr)_repeat(4,minmax(120px,1fr))]")}>
                  {/* Label Cell */}
                  <div className="flex items-center gap-2 sm:gap-3 rounded-md px-2 py-2 sm:px-4 sm:py-3 h-[50px]">
                    <img src={row.icon} className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" alt="" aria-hidden />
                    <span
                      className="whitespace-pre-line text-[10px] sm:text-sm font-semibold text-base-content/50 leading-tight">
                    {t(row.label)}
                  </span>
                  </div>

                  {/* Static Level Cells */}
                  {staticLevels.map((descriptor, columnIndex) => {
                    const levelConfig = descriptor.level != null ? vipLevels.find(c => c.vip === descriptor.level) : null;
                    const rawValue = levelConfig ? row.getValue(levelConfig) : null;
                    const isBooleanActive = row.type === "boolean" && rawValue === true;

                    return (
                      <div
                        key={`cell-static-${rowIndex}-${columnIndex}`}
                        className="flex items-center justify-center p-1 h-[50px]"
                      >
                        <div
                          className={cn(
                            "flex w-full h-full items-center justify-center rounded-md px-2 py-2 sm:px-3 sm:py-3 text-base-content/50 text-xs sm:text-sm",
                            isBooleanActive && "bg-primary/10"
                          )}
                        >
                          {renderCellValue(row, rawValue)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {rowIndex < REWARD_ROWS.length - 1 && (
                  <div className="h-px bg-base-300 w-full" />
                )}
              </Fragment>
            </InnerGuardContainer>
          ))}
        </div>

        {/* Right Side: Dynamic Carousel */}
        <div className={cn("flex-grow min-w-0", isMobile ? "w-[120px]" : "flex-1")}>
          <Carousel carousel={carousel} className="h-full">
            {dynamicCandidates.map((config, index) => {
              const dynamicLevel = config.vip;
              const label = t("vip:vip_level_label", { level: dynamicLevel, defaultValue: `VIP ${dynamicLevel}` });

              // Lazy Rendering: Only render content if within range
              const isVisible = Math.abs(index - selectedIndex) <= 2;

              if (!isVisible) {
                return <div key={config.vip} className="h-full" />;
              }

              return (
                <div key={config.vip} className="flex flex-col h-full">
                  {/* Header */}
                  <div className="h-[60px] flex items-center justify-center px-1">
                    <div className="flex items-center justify-center gap-1 w-full">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-circle p-0 min-h-0 h-6 w-4 shrink-0"
                        onClick={carousel.arrows.onClickPrev}
                        disabled={carousel.arrows.disablePrev}
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 rtl:rotate-y-180" />
                      </button>

                      <div className="flex flex-col items-center justify-center min-w-0 flex-1">
                        <div className="flex items-center justify-center gap-1">
                          <img
                            src={`/images/vip/levels/${dynamicLevel}.png`}
                            alt={label}
                            className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
                          />
                          <span
                            className="font-semibold text-base-content/50 text-xs sm:text-sm whitespace-nowrap truncate">{label}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-circle p-0 min-h-0 h-6 w-4 shrink-0"
                        onClick={carousel.arrows.onClickNext}
                        disabled={carousel.arrows.disableNext}
                      >
                        <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 rtl:rotate-y-180" />
                      </button>
                    </div>
                  </div>

                  {/* Data Cells */}
                  {REWARD_ROWS.map((row, rowIndex) => {
                    const rawValue = row.getValue(config);
                    const isBooleanActive = row.type === "boolean" && rawValue === true;

                    return (
                      <InnerGuardContainer item={row} key={rowIndex}>
                        <Fragment key={rowIndex}>
                          <div className="flex items-center justify-center p-1 h-[50px]">
                            <div
                              className={cn(
                                "flex w-full h-full items-center justify-center rounded-md px-2 py-2 sm:px-3 sm:py-3 text-base-content/50 text-xs sm:text-sm",
                                isBooleanActive && "bg-primary/10"
                              )}
                            >
                              {renderCellValue(row, rawValue)}
                            </div>
                          </div>
                          {rowIndex < REWARD_ROWS.length - 1 && (
                            <div className="h-px bg-base-300 w-full" />
                          )}
                        </Fragment>
                      </InnerGuardContainer>
                    );
                  })}
                </div>
              );
            })}
          </Carousel>
        </div>
      </div>
    </div>
  );
}
