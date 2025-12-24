import { LiquidGlassEffect } from "@/components/ui/LiquidGlassEffect";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTranslation } from "react-i18next";

export const TournamentHeroSection = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="flex flex-col gap-0 sm:gap-4">
      {/* Hero Banner */}
      <div
        className="flex flex-col gap-4 px-5 pt-8 pb-4 sm:px-12 relative h-[210px] sm:min-h-[340px] sm:rounded-box sm:justify-center select-none overflow-hidden touch-none"
        style={{
          backgroundImage: isMobile
            ? undefined
            : `repeating-linear-gradient(
                -45deg,
                oklch(from var(--color-base-200) l c h / 0.3) 0px,
                oklch(from var(--color-base-200) l c h / 0.3) 6px,
                oklch(from var(--color-base-200) l c h / 0.5) 6px,
                oklch(from var(--color-base-200) l c h / 0.5) 18px,
                oklch(from var(--color-base-200) l c h / 0.3) 18px,
                oklch(from var(--color-base-200) l c h / 0.3) 24px
              )`,
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full h-full">
          <div className="flex flex-col gap-2 sm:gap-3 z-10 sm:max-w-[48%] h-full pl-4">
            <div className="flex flex-col h-full justify-center">
              <h1 className="text-lg sm:text-[40px] font-black  uppercase leading-[1.05]">
                <h2 className="text-base-content">{t("tournament:explore", "EXPLORE")}</h2>
                <span className="text-primary">{t("tournament:tournaments", "TOURNAMENTS")},</span>
                <br />
                <span className="text-base-content">{t("tournament:dropsAndRaces", "DROPS & RACES")}</span>
              </h1>
            </div>
          </div>

          {/* 角色插画 - 桌面端（置于卡片之上） */}
          <img
            src="/images/illustrations/83d32b6759e32e12ef3b96efdec9a536204ec5c6.png"
            alt="Tournament Character"
            className="hidden sm:block absolute left-[391px] rtl:left-auto rtl:right-[391px] top-0 w-[340px] h-[340px] object-cover object-center drop-shadow-[0px_0px_120px_rgba(255,215,0,0.2)] z-20 pointer-events-none select-none"
            draggable="false"
          />

          {/* 角色插画 - 移动端 */}
          <img
            src="/images/illustrations/83d32b6759e32e12ef3b96efdec9a536204ec5c6.png"
            alt="Tournament Character"
            className="sm:hidden absolute -right-1 rtl:right-auto rtl:left-1 -bottom-1 w-[207px] h-[207px] object-cover object-top opacity-80 drop-shadow-[0px_0px_120px_rgba(255,215,0,0.2)] pointer-events-none select-none"
            draggable="false"
          />

          {/* Enter the Arena - 桌面端右侧覆盖卡片 */}
          <div className="hidden sm:block absolute sm:w-[480px] sm:right-10 rtl:sm:right-auto rtl:sm:left-10 sm:top-8 sm:h-[calc(100%-4rem)] sm:bg-base-300 sm:rounded-box shadow-lg overflow-hidden z-10">
            <LiquidGlassEffect className="absolute inset-0 pointer-events-none min-h-full rounded-2xl w-full -z-10 bg-base-300">
              <div className="w-full h-full"></div>
            </LiquidGlassEffect>
            <div className="relative flex h-full w-full flex-col gap-4 rounded-box p-6 sm:p-8 justify-center">
              <h2 className="text-3xl font-bold text-base-content mb-4">{t("tournament:enterTheArena", "Enter the Arena")}</h2>
              <div className="flex flex-col gap-4 text-base text-base-content/50 leading-relaxed">
                <p>
                  {t(
                    "tournament:enterTheArenaDescription1",
                    "From thrilling tournaments to exclusive promos and bonus drops — everything you need to boost your play is right here.",
                  )}
                </p>
                <p>{t("tournament:enterTheArenaDescription2", "Check back often, stack the perks, and never miss a chance to cash in.")}</p>
                <p>{t("tournament:enterTheArenaDescription3", "Your next big win could be one click away.")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enter the Arena Card - 移动端使用，桌面端已覆盖到上方 */}
      <div className="relative min-h-[280px] sm:min-h-[240px] z-0 mx-5 sm:mx-0 sm:hidden">
        <LiquidGlassEffect className="absolute inset-0 pointer-events-none min-h-full w-full -z-10 bg-base-300 rounded-2xl">
          <div className="w-full h-full"></div>
        </LiquidGlassEffect>

        <div className="w-full h-full p-6 sm:p-8 flex flex-col gap-4 sm:gap-6">
          <h2 className="text-2xl sm:text-4xl font-bold text-base-content">{t("tournament:enterTheArena", "Enter the Arena")}</h2>

          <div className="flex flex-col gap-3 sm:gap-4 text-sm sm:text-base text-base-content/50 leading-5">
            <p>
              {t(
                "tournament:enterTheArenaDescription1",
                "From thrilling tournaments to exclusive promos and bonus drops — everything you need to boost your play is right here.",
              )}
            </p>
            <p>{t("tournament:enterTheArenaDescription2", "Check back often, stack the perks, and never miss a chance to cash in.")}</p>
            <p>{t("tournament:enterTheArenaDescription3", "Your next big win could be one click away.")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
