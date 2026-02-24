import Iconify from "@/components/iconify";
import { Countdown } from "@/components/ui";
import { LiquidGlassEffect } from "@/components/ui/LiquidGlassEffect";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useFinanceModal, useTipsModal } from "@/contexts/ModalsProvider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useDepositBonusConfig } from "@/hooks/api/usePublic";
import { m } from "motion/react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { randomString } from "@/components/modal/UserFinanceModal/helper.ts";
import { useClaimBonus } from "@/hooks/api/useAuth.ts";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import clsx from "clsx";

interface BonusStage {
  id: number;
  percentage: string;
  unlocked: boolean;
  current: boolean;
}

export function BonusDepositCard() {
  const { t } = useTranslation('bonus');
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { status, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { openUserFinanceModalWithTab } = useFinanceModal();
  const { openTipsModal } = useTipsModal();
  const { data: depositBonusConfig } = useDepositBonusConfig();
  const { data: claimBonus } = useClaimBonus("rakeback");

  const normalizedConfig = useMemo(() => {
    const configList = Array.isArray(depositBonusConfig?.data)
      ? depositBonusConfig?.data
      : Array.isArray(depositBonusConfig?.data?.data)
        ? depositBonusConfig?.data?.data
        : [];

    if (configList.length === 0) {
      return Array.from({ length: 4 }, (_, index) => ({
        level: index + 1,
        bonus_percent: 0,
        max_bonus_amount: 0,
        currency: "USDT"
      }));
    }

    return [...configList].sort((a: any, b: any) => (a?.level ?? 0) - (b?.level ?? 0));
  }, [depositBonusConfig]);

  // const totalMaxBonusAmount = useMemo(() => {
  //   const amount = normalizedConfig.reduce((acc: number, item: any) => acc + Number(item?.max_bonus_amount ?? 0), 0);
  //   return amount > 0 ? amount : maxBonusAmount;
  // }, [normalizedConfig, maxBonusAmount]);

  const totalCurrency = useMemo(() => {
    const currencyItem = normalizedConfig.find((item: any) => item?.currency);
    return currencyItem?.currency ?? "USDT";
  }, [normalizedConfig]);

  // 基于用户充值次数计算充值奖励数据
  const bonusStages: BonusStage[] = useMemo(() => {
    const depositTimes = status?.deposit_bonus_times ?? 0;

    return normalizedConfig.map((config: any, index: number) => {
      const stageNumber = index + 1; // 1-based indexing
      const percentValue = Number(config?.bonus_percent ?? 0) * 100;
      const formattedPercent = Number.isFinite(percentValue)
        ? `+${percentValue.toLocaleString(undefined, {
          minimumFractionDigits: percentValue % 1 === 0 ? 0 : 2,
          maximumFractionDigits: 2
        })}%`
        : "+0%";

      return {
        id: config.id,
        percentage: formattedPercent,
        unlocked: depositTimes >= stageNumber,
        current: depositTimes + 1 === stageNumber
      };
    });
  }, [normalizedConfig, status?.deposit_bonus_times]);

  // 计算进度条宽度的精确公式
  const calculateProgress = () => {
    const totalStages = bonusStages.length;
    if (totalStages === 0) return 0;
    const unlockedCount = bonusStages.filter((stage) => stage.unlocked).length;
    const currentIndex = bonusStages.findIndex((stage) => stage.current);

    // 每个badge占据的空间百分比
    const stageWidth = 100 / totalStages; // 25% per stage

    // 基础进度 = 已解锁阶段数 * 每阶段宽度
    let progress = unlockedCount * stageWidth;

    // 如果有正在进行的阶段，添加一半进度到该阶段中间
    if (currentIndex !== -1) {
      progress += stageWidth * 0.5; // 进行到当前阶段的中间位置
    }

    return Math.min(progress, 100); // 确保不超过100%
  };

  const currentProgress = calculateProgress();

  if (isAuthLoading) {
    return (
      <div
        className="relative min-h-[252px] z-0 mx-5 sm:mx-0 sm:absolute sm:w-1/2 sm:right-4 sm:rtl:right-auto sm:rtl:left-4 sm:top-4 sm:bottom-2 sm:h-[calc(100%-2rem)] sm:bg-base-300 sm:rounded-box">
        <LiquidGlassEffect className="absolute inset-0 pointer-events-none min-h-full w-full">
          <div className="w-full h-full"></div>
        </LiquidGlassEffect>

        <div
          className="sm:absolute sm:top-0 sm:left-0 sm:right-0 p-3 px-5 sm:p-6 flex flex-col gap-4 pointer-events-auto">
          {/* Header skeleton */}
          <div className="skeleton h-11 sm:h-20 w-full rounded-box"></div>

          {/* Progress section skeleton */}
          <div className="skeleton h-11 sm:h-16 w-full rounded-box"></div>

          {/* Icons section skeleton */}
          <div className="skeleton h-11 sm:h-16 w-full rounded-box"></div>

          {/* Button skeleton */}
          <div className="skeleton h-12 sm:h-14 w-full rounded-btn"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx("relative min-h-auto z-0 mx-5 sm:mx-0 sm:absolute sm:w-1/2 sm:right-4 sm:rtl:right-auto sm:rtl:left-4 sm:top-4 sm:bottom-2 sm:h-[calc(100%-2rem)] sm:bg-base-300 sm:rounded-box",
        { "min-h-[252px]": (status?.deposit_bonus_times ?? 0) < 4 })}>
      <LiquidGlassEffect className="absolute inset-0 pointer-events-none min-h-full w-full">
        <div className="w-full h-full"></div>
      </LiquidGlassEffect>

      <div
        className="sm:absolute sm:top-0 sm:left-0 sm:right-0 p-3 px-5 sm:p-6 flex flex-col gap-3 pointer-events-auto h-full flex flex-col justify-center">
        <div className="flex items-center sm:items-start gap-2 sm:gap-4">
          <img src="/icons/ui/gift-box.png" alt="Bonus" className="w-9 h-9 sm:w-12 sm:h-12" />
          <div className="flex flex-col text-start gap-2">
            <p
              className="text-sm font-semibold sm:font-bold text-base-content sm:text-2xl leading-5">{t("bonus:deposit_bonus")}</p>
            <p className="text-xs font-semibold text-primary sm:text-lg">
              <span className={"text-base-content/50"}>{t("bonus:poolBalance")}{": "}</span>
              {formatWithConversion(claimBonus?.data?.data?.locked || 0, totalCurrency, {
                showSymbol: true,
                showCode: false
              }).formatted}
            </p>
          </div>

          <button className="btn btn-square ml-auto rtl:ml-0 rtl:mr-auto" onClick={() => openTipsModal("depositBonus")}>
            <Iconify icon="custom:info" className="w-4 h-4" />
          </button>
        </div>

        <InnerDisplayContent show={(status?.deposit_bonus_times ?? 0) < 4}>
          <div className="flex items-center gap-3 justify-between sm:mt-6 sm:pl-6">
            <div className="relative w-full">
              {/* 底层进度条 - 绝对定位在badge组中间 */}
              <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 z-0 sm:pr-10 px-4 sm:pl-0">
                <div className="h-1.5 sm:h-2 bg-base-300 rounded-full overflow-hidden relative">
                  {/* 已解锁进度条填充 */}
                  <div className="h-full bg-primary/20 rounded-full relative overflow-hidden"
                       style={{ width: `${currentProgress}%` }}>
                    {/* 斜条纹动画 - 修复连贯性问题 */}
                    <m.div
                      className="absolute inset-0 w-[calc(100%+36px)] -left-[18px]"
                      style={{
                        background: `repeating-linear-gradient(
                        45deg,
                        oklch(from var(--color-primary) l c h / 0.3) 0px,
                        oklch(from var(--color-primary) l c h / 0.3) 4px,
                        transparent 4px,
                        transparent 8px
                      )`
                      }}
                      animate={{
                        x: [0, 11.31] // 8px × √2 ≈ 11.31px (45度对角线距离)
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </div>

                  {/* 未解锁区域的进度条 */}
                  <div
                    className="absolute top-0 right-0 h-full rounded-full overflow-hidden"
                    style={{
                      width: `${100 - currentProgress}%`,
                      backgroundColor: "oklch(from var(--color-base-content) l c h / 0.1)"
                    }}
                  >
                    {/* 未解锁区域的动画斜条纹 */}
                    <m.div
                      className="absolute inset-0 w-[calc(100%+36px)] -left-[18px]"
                      style={{
                        background: `repeating-linear-gradient(
                        45deg,
                        oklch(from var(--color-base-content) l c h / 0.1) 0px,
                        oklch(from var(--color-base-content) l c h / 0.1) 4px,
                        transparent 4px,
                        transparent 8px
                      )`
                      }}
                      animate={{
                        x: [0, 11.31]
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 上层badges组 */}
              <div className="flex items-center justify-between relative z-10 sm:px-8 px-1">
                {bonusStages.map((stage, index) => {
                  if (stage?.id === 5) return;
                  return (
                    <div key={index} className="relative">
                      {stage.unlocked && (
                        <input
                          type="checkbox"
                          className="sm:absolute checkbox checkbox-primary checkbox-sm -left-8 top-1/2 -translate-y-1/2 hidden"
                          checked
                        />
                      )}
                      <div className="absolute inset-0 bg-base-400 rounded-selector -z-10"></div>
                      <div
                        className={`
                    font-semibold text-xs h-7 sm:font-bold sm:badge-lg sm:h-8 px-2
                    ${
                          stage.unlocked
                            ? "badge badge-soft"
                            : stage.current
                              ? "badge badge-primary"
                              : "badge text-base-content/50 bg-base-400 border-none"
                        }
                  `}
                      >
                        {stage.percentage}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-around">
            {bonusStages.map((stage, index) => {
              if (stage?.id === 5) return;

              // 简化底座颜色逻辑：当前解锁的用primary/10，其他用base-300
              const isActive = stage.current;
              const shadowColor = isActive ? "oklch(from var(--color-primary) l c h / 0.1)" : "oklch(from var(--color-base-200) l c h)";

              return (
                <div key={index} className="flex flex-col -space-y-2 items-center min-w-0 sm:-space-y-3">
                  <m.img
                    src={
                      [
                        "/images/illustrations/6c5de6d5987dcf2d6d9a23766fc6e84cb8905f6e.png",
                        "/images/illustrations/d6caa053d94a7f445ed84b0a8ec7020da0cde521.png",
                        "/images/illustrations/1b3144c4560c8db208af436bea293b0fb469752a.png",
                        "/images/illustrations/c0911b0621d20f615c49bc6388e124de517ec7ed.png"
                      ][index]
                    }
                    className={`w-[42px] h-[42px] sm:w-[68px] sm:h-[68px] z-10 object-cover`}
                    {...(stage.current && {
                      animate: {
                        y: [0, -2, 0], // 轻微跳动
                        scale: [1, 1.05, 1], // 呼吸脉冲
                        rotateZ: [0, 1, -1, 0] // 微妙摇摆
                      },
                      transition: {
                        duration: 2.5,
                        repeat: Infinity,
                        ease: [0.4, 0, 0.6, 1], // 自定义缓动，模拟游戏物理效果
                        times: [0, 0.5, 1] // 精确控制动画时间点
                      },
                      style: {
                        filter: "drop-shadow(0 0 8px oklch(from var(--color-primary) l c h / 0.6))" // 发光效果
                      }
                    })}
                  />
                  <svg
                    width="85"
                    height="22"
                    viewBox="0 0 85 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-[68px] h-[22px]"
                    style={{
                      width: isMobile ? "68px" : "135px",
                      height: isMobile ? "22px" : "28px",
                      minWidth: isMobile ? "68px" : "135px",
                      minHeight: isMobile ? "22px" : "28px"
                    }}
                  >
                    <path
                      d="M10.608 1.258C11.0789 0.477 11.924 0 12.8356 0H72.1644C73.076 0 73.9211 0.477 74.392 1.258L84.2748 18.058C85.3189 19.691 84.171 21.8 82.2472 21.8H2.7528C0.829 21.8 -0.3189 19.691 0.7252 18.058L10.608 1.258Z"
                      fill={shadowColor}
                    />
                  </svg>
                </div>
              );
            })}
          </div>
        </InnerDisplayContent>

        {/* `deposit_${randomString()}` 防止切换失效 */}
        <button
          className="btn btn-primary btn-lg text-sm font-bold sm:btn-xl sm:text-base sm:mt-2 z-10 relative pointer-events-auto"
          onClick={() => openUserFinanceModalWithTab(`deposit_${randomString()}`)}
        >
          {t("bonus:deposit_now")}
        </button>

        {isAuthenticated && status?.deposit_bonus_expire && (
          <div className="flex items-center text-base-content/50 text-xs sm:text-sm justify-center -mt-2 font-normal">
            <p>{t("bonus:bonus_ends_in")}: &nbsp;</p>
            <Countdown className="text-xs sm:text-sm" target={status.deposit_bonus_expire} />
          </div>
        )}
      </div>
    </div>
  );
}

