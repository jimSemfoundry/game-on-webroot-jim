import { LiquidGlassEffect } from "@/components/ui/LiquidGlassEffect";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { authService } from "@/services/authService";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Decimal from "decimal.js";
import { useVipNextLevelData } from "@/hooks/api/useAuth.ts";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";

// 未登录用户的Hero组件
function UnauthenticatedVipHero() {
  const { t } = useTranslation();

  return (
    <div
      className="relative overflow-hidden rounded-box min-h-[500px] sm:min-h-[400px] flex items-start mx-5 sm:mx-0 select-none"
      style={{ isolation: "isolate" }}
    >
      <div className="container mx-auto px-0 sm:px-20 py-6 sm:py-12">
        <div
          className="absolute sm:w-[659px] sm:h-[659px] bg-primary rounded-full blur-[215px] left-[-45px] bottom-0 -translate-y-[268px] -translate-x-full" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex-1 z-10">
            <h1
              className="text-3xl sm:text-5xl font-bold text-base-content mb-4 whitespace-pre-wrap">{t("vip:exclusive_vip_system")}</h1>
            <p className="text-sm sm:text-lg text-base-content/50 mb-3 max-w-md">{t("vip:step_into_world")}</p>
            <p className="text-sm sm:text-lg text-base-content/50 mb-6 max-w-md">{t("vip:every_bet")}</p>
            <button
              className="btn btn-primary btn-lg sm:btn-xl text-base ml-2.5 sm:ml-0 px-8 w-[130px]">{t("vip:participate")}</button>
          </div>
        </div>

        <img
          src="/images/illustrations/463f8314ce7d0466e5c028410fc517a52b6343e0.png"
          className="w-[114px] h-[114px] sm:w-[252px] sm:h-[252px] rotate-[-15deg] absolute right-[81px] sm:left-auto bottom-[85px] sm:top-[25px] sm:right-[180px] origin-bottom-right z-40 drop-shadow-2xl pointer-events-none select-none"
          draggable="false"
        />

        <img
          src="/images/illustrations/00c1dc7493acb88558ddaacde45133378d09973d.png"
          className="w-[241px] h-[241px] right-[17px] bottom-[0px] translate-y-[100px] sm:translate-y-0 sm:w-[534px] sm:h-[534px] opacity-30 sm:left-auto absolute sm:right-[38px] sm:top-[150px] object-contain pointer-events-none select-none"
          draggable="false"
        />

        <img
          src="/images/illustrations/58f4a6bfd06fc43064eff747c6489124fff520a2.png"
          className="w-[35px] h-[35px] right-[46px] bottom-[115px] sm:w-[78px] sm:h-[78px] absolute sm:left-auto sm:top-[146px] sm:right-[102px] z-40 object-cover pointer-events-none select-none"
          draggable="false"
        />

        <img
          src="/images/illustrations/58f4a6bfd06fc43064eff747c6489124fff520a3.png"
          className="w-[70px] h-[70px] right-[207px] bottom-[45px] sm:w-[155px] sm:h-[155px] absolute sm:left-auto sm:top-[224px] sm:right-[460px] z-40 pointer-events-none select-none"
          draggable="false"
        />
        <img
          src="/images/illustrations/44285e1a15e8a0743705e017bbcef43e8bc2546d.png"
          className="w-[41px] h-[41px] bottom-[30px] right-[33px] sm:w-[90px] sm:h-[90px] rotate-[18deg] absolute sm:right-[73px] sm:top-[295px] pointer-events-none select-none"
          draggable="false"
        />
        <div
          className="absolute hidden sm:block w-[659px] h-[659px] right-[-87px] top-[336px] bg-primary blur-[215px] rounded-full transform-gpu" />
        <div
          className="absolute block sm:hidden w-[297px] h-[297px] right-[-40px] bottom-0 translate-y-[229px] blur-[97px] bg-primary opacity-50 transform-gpu" />
        <div
          className="absolute sm:top-[243px] sm:right-[175px] shrink-0 origin-bottom-right text-base-300 hidden sm:block">
          <svg xmlns="http://www.w3.org/2000/svg" width="266" height="81" viewBox="0 0 266 81" fill="none">
            <g filter="url(#filter0_f_16309_118674)">
              <ellipse cx="133" cy="40.5" rx="110" ry="17.5" fill="currentColor" />
            </g>
            <defs>
              <filter
                id="filter0_f_16309_118674"
                x="0.799999"
                y="0.799999"
                width="264.4"
                height="79.4"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="11.1" result="effect1_foregroundBlur_16309_118674" />
              </filter>
            </defs>
          </svg>
        </div>

        <div className="absolute bottom-[60px] right-[76px] shrink-0 text-base-300 block sm:hidden">
          <svg width="120" height="37" viewBox="0 0 120 37" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_f_16309_119165)">
              <ellipse
                cx="60.1129"
                cy="18.4556"
                rx="49.7301"
                ry="7.91161"
                fill="currentColor"
              />
            </g>
            <defs>
              <filter
                id="filter0_f_16309_119165"
                x="0.346375"
                y="0.507508"
                width="119.534"
                height="35.8961"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="5.01822" result="effect1_foregroundBlur_16309_119165" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}

// 已登录用户的Hero组件
function AuthenticatedVipHero() {
  const { t } = useTranslation();
  const { status } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { formatCurrency, selectedCurrency, convertCurrency, exchangeRates } = useDisplayCurrency();

  const currentVip = status?.vip || 1;

  const { data: claimData } = useQuery({
    queryKey: ["userClaimBonus"],
    queryFn: async () => {
      const response = await authService.getUserClaimBonus();
      console.debug("ClaimData response:", response);
      return response;
    },
    enabled: !!status
  });

  /**
   * 下一级升级数据
   */
  const { data: vip, isLoading } = useVipNextLevelData();

  const fullXP = useMemo(() => Number(vip?.data?.xp || 0), [vip]);

  const userXP = useMemo(() => Number(status?.xp || 0), [status]);

  const progress = useMemo(() => Decimal(Math.min((userXP / (fullXP || 1)) * 100, 100)).toFixed(2, Decimal.ROUND_DOWN).toString(), [userXP, fullXP]);

  const lifetimeRewards = useMemo(() => {
    if (claimData?.code === 0 && claimData?.data && Array.isArray(claimData?.data?.data)) {
      const levelUpClaim = claimData?.data?.data?.find((item: any) => item.item === "level_up");
      return Number(levelUpClaim?.sum || 0);
    }
    return 0;
  }, [claimData]);

  const eligibleCount = useMemo(() => {
    if (claimData?.code === 0 && claimData?.data && Array.isArray(claimData.data)) {
      const levelUpClaim = claimData.data.find((item: any) => item.item === "level_up");
      return levelUpClaim?.count || 0;
    }
    return 0;
  }, [claimData]);

  // 计算升级所需经验值
  const xpToNextVip = useMemo(() => {
    if (!fullXP || !status) return [0, 0];
    const a = Decimal(fullXP);
    const b = Decimal(userXP);
    const c = a.sub(b);
    return [
      b.div(a).toNumber(), // 当前XP进度
      c.toDP(0, Decimal.ROUND_UP).toNumber()
    ];
  }, [fullXP, userXP]);

  return (
    <div
      className="relative sm:mt-18 rounded-box sm:bg-base-200/50 min-h-[368px] sm:min-h-[234px] select-none touch-none"
      style={{
        backgroundImage: isMobile
          ? undefined
          : `repeating-linear-gradient(
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
      <div className="relative w-full h-full">
        {/* 左侧：Lifetime VIP Rewards */}
        <div
          className="flex-1 flex flex-col lg:flex-row items-center lg:items-start gap-4 sm:gap-6 absolute left-[30px] sm:left-[50px] top-1/2 translate-y-1/2">
          {/* Rewards Info */}
          <div className="text-left flex flex-col gap-1 sm:gap-2">
            <p className="text-sm sm:text-xl font-semibold text-base-content/50">{t("vip:lifetime_vip_rewards")}</p>
            <h1 className="text-3xl sm:text-5xl font-bold text-base-content">
              {formatCurrency({
                currency: selectedCurrency,
                amount: convertCurrency({
                  amount: lifetimeRewards,
                  fromCurrency: "USDT",
                  toCurrency: selectedCurrency,
                  exchangeRates
                }),
                showSymbol: true,
                showCode: false
              }).formatted}
            </h1>
            <button className="btn btn-sm btn-ghost gap-2 mt-1 flex justify-start px-0 invisible">
              <span className="text-sm font-semibold">{t("vip:eligible")}</span>
              <div
                className="w-4 h-4 rounded-full bg-success flex items-center justify-center text-success-content text-xs font-bold">
                {eligibleCount}
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-base-content/50">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Character Illustration */}
        <div
          className="w-[225px] h-[169px] right-[-6px] sm:w-[312px] sm:h-[234px] flex items-end justify-center absolute lg:left-[350px] lg:top-0 pointer-events-none select-none">
          <img
            src="/images/illustrations/b12dd722cafd02781363b2dbaaf5c18afa9be2d3.png"
            alt="VIP Character"
            className="w-full h-full object-contain drop-shadow-[0px_0px_100px_rgba(172,0,255,0.3)]"
            draggable="false"
          />
        </div>

        {/* 右侧：VIP Progress */}
        <div
          className="min-h-[200px] top-[167px] left-0 right-0 z-0 mx-5 sm:mx-0 absolute sm:w-[600px] sm:right-4 sm:left-auto sm:rtl:right-auto sm:rtl:left-4 sm:top-4 sm:bottom-2 sm:h-[calc(100%-2rem)] sm:bg-base-300 sm:rounded-box">
          <LiquidGlassEffect
            className="absolute inset-0 pointer-events-none min-h-full rounded-2xl w-full -z-10 bg-base-300">
            <div className="w-full h-full"></div>
          </LiquidGlassEffect>

          <div className="relative flex h-full w-full flex-col gap-4 rounded-box p-5 sm:p-6">
            {/* VIP Badge - 右上角 */}
            <div
              className="absolute top-3 right-6 sm:top-6 sm:right-10 -translate-y-1/2 pointer-events-none select-none">
              <img
                src={`/images/vip/levels/${currentVip}.png`}
                alt={`VIP ${currentVip}`}
                className="h-19.5 w-19.5 sm:h-40 sm:w-40 object-contain drop-shadow-lg"
                loading="lazy"
                decoding="async"
                draggable="false"
              />
            </div>

            {/* VIP Level */}
            <h2 className="text-3xl sm:text-4xl font-bold text-base-content">VIP {currentVip}</h2>

            {/* Progress Info */}
            <SmallLoading loading={isLoading} className={"!bg-base-200 w-30 h-[20px]"} content={
              <p className="text-sm sm:text-lg text-base-content/50 font-semibold">
              {t("vip:your_vip_progress")}: {progress}%
            </p>}></SmallLoading>

            {/* Progress Bar */}
            <div className="w-full rounded-full bg-base-200/70 h-2.5 sm:h-3 overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-success via-success to-success/80 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* XP Info */}
            <SmallLoading loading={isLoading} className={"!bg-base-200 w-30 h-[20px]"} content={<div
              className="flex justify-between text-sm sm:text-base text-base-content/50 font-semibold">
              {t("vip:lessThan")} {xpToNextVip[1]}XP to VIP {(status?.vip || 0) + 1}
            </div>}>
            </SmallLoading>
          </div>
        </div>
      </div>
    </div>
  );
}

// 主导出组件 - 根据登录状态选择显示哪个Hero
export function VipHero() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <AuthenticatedVipHero /> : <UnauthenticatedVipHero />;
}
