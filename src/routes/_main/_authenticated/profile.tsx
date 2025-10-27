import { LiquidGlassEffect } from "@/components/ui/LiquidGlassEffect.tsx";
// import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LevelUpgrade } from "@/sections/profile/c/LevelUpgrade.tsx";
import { FastFinanceLink } from "@/sections/profile/c/FastFinanceLink.tsx";
import { DisplayContent } from "@/components/modal/UserFinanceModal";
// import { useTranslation } from "react-i18next";
// import { useState } from "react";
// import Iconify from "@/components/iconify";
// import { BetHistory, Dashboard, Security, Settings, Rollover, Legal, Transactions } from "@/sections/profile";
import Copy from "@/components/ui/Copy.tsx";
import { MainContent } from "@/sections/profile/c/MainContent.tsx";
import { ChevronRight } from "lucide-react";
import { emitter } from "@/store/emitter.ts";

export const Route = createFileRoute("/_main/_authenticated/profile")({
  component: ProfilePage
});

function ProfilePage() {
  const navigate = useNavigate();

  const { user } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  // const { t } = useTranslation();
  // const [selectedCategory, setSelectedCategory] = useState<
  //   "dashboard" | "transactions" | "rollover" | "betHistory" | "security" | "settings" | "legal"
  // >("dashboard");

  if (!user) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  // const segments = [
  //   {
  //     value: "dashboard",
  //     label: (
  //       <span className="flex items-center gap-2">
  //         <Iconify icon="custom:home" />
  //         <p>{t("profile:dashboard")}</p>
  //       </span>
  //     )
  //   },
  //   {
  //     value: "transactions",
  //     label: (
  //       <span className="flex items-center gap-2">
  //         <Iconify icon="custom:transactions" />
  //         <p>{t("profile:transactions")}</p>
  //       </span>
  //     )
  //   },
  //   {
  //     value: "rollover",
  //     label: (
  //       <span className="flex items-center gap-2">
  //         <Iconify icon="custom:rollover" />
  //         <p>{t("profile:rollover")}</p>
  //       </span>
  //     )
  //   },
  //   {
  //     value: "betHistory",
  //     label: (
  //       <span className="flex items-center gap-2">
  //         <Iconify icon="custom:bet-history" />
  //         <p>{t("profile:betHistory")}</p>
  //       </span>
  //     )
  //   },
  //   {
  //     value: "security",
  //     label: (
  //       <span className="flex items-center gap-2">
  //         <Iconify icon="custom:security" />
  //         <p>{t("profile:security")}</p>
  //       </span>
  //     )
  //   },
  //   {
  //     value: "settings",
  //     label: (
  //       <span className="flex items-center gap-2">
  //         <Iconify icon="custom:settings" />
  //         <p>{t("profile:settings")}</p>
  //       </span>
  //     )
  //   },
  //   {
  //     value: "legal",
  //     label: (
  //       <span className="flex items-center gap-2">
  //         <Iconify icon="custom:legal" />
  //         <p>{t("profile:legal")}</p>
  //       </span>
  //     )
  //   }
  // ];

  // if (!user) {
  //   return <div className="loading loading-spinner loading-lg"></div>;
  // }

  return (
    <div className="flex flex-col gap-4 py-3 sm:pt-8">
      <div className="relative">
        {/* 主要的Hero卡片 - 参考bonus/Hero.tsx */}
        <div
          className="flex  rounded-box flex-col gap-4 px-8 pb-4 sm:px-12 relative sm:bg-base-200/50 sm:h-[235px] sm:rounded-box sm:justify-center select-none"
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
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-10 sm:items-center">
            {/* 图片层 - 只使用drop-shadow获得统一阴影效果 */}
            <img
              src="/images/illustrations/7d9e2a1cab9d27045f7a0364eadc17c01e2b654e.png"
              className="absolute right-5 top-0 w-[170px] h-[170px] drop-shadow-[0_4px_40px_rgba(238,216,92,0.30)] z-10 sm:hidden"
            />

            {/* <img className="w-[170px] h-[170px] shadow-[0px_4px_100px_0px_rgba(238,216,92,0.30)]" src="https://placehold.co/170x170" /> */}
            <div className="avatar">
              <div className="w-12 h-12 sm:w-36 sm:h-36 rounded-full flex items-center justify-center">
                <img src={user?.avatar || "/images/default-avatar.png"} className="w-full h-full" alt="Avatar" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <p className="text-sm sm:text-lg font-semibold text-base-content/50">ID: {user?.id}</p>
                <Copy text={user?.id?.toString()} className="h-4 w-4" />
              </div>
              <p
                className="text-2xl sm:text-4xl text-base-content font-bold z-10 capitalize truncate">{user?.nickname}</p>
              <div className="font-semibold text-base-content/50">
                <div className='inline-flex items-center gap-2 sm:cursor-pointer' onClick={() => emitter.emit("SYNC_TABS_INDEX", "Profile")}>
                  <span className="text-sm sm:text-lg text-primary">Edit Profile</span>
                  <ChevronRight className="w-3 h-3 rtl:rotate-180" strokeWidth={4} />
                </div>
              </div>

              {/* 唤起存款取款操作 */}
              <DisplayContent status={!isMobile}><FastFinanceLink /></DisplayContent>
            </div>
          </div>
        </div>

        <div
          onClick={() => !isMobile && navigate({ to: "/vip-club" })}
          className="cursor-pointer relative xs:min-h-[252px] sm:h-[200px] p-4 sm:p-6 z-10 bg-base-300 mx-5 sm:mx-0 sm:absolute sm:w-1/2 sm:right-4 sm:rtl:right-auto sm:rtl:left-4 sm:top-4 sm:bottom-2 sm:bg-base-300 sm:rounded-box rounded-box">
          <LiquidGlassEffect className="absolute inset-0 pointer-events-none min-h-full w-full">
            <div className="w-full h-full"></div>
          </LiquidGlassEffect>

          {/* 等级经验 */}
          <LevelUpgrade onClick={() => isMobile && navigate({ to: "/vip-club" })} />
        </div>
      </div>
      <div className="px-5 sm:px-0 flex flex-col gap-4">

        {/* TODO：由于移动端有快捷方式，需要菜单配合自动滚动定位，暂时注释，如果需要调整可以再还原😊 */}
        {/*<SegmentedControl*/}
        {/*  className="gap-4 space-x-1 overflow-x-auto px-5 -mr-5 sm:mx-0 sm:px-0"*/}
        {/*  buttonClassName="flex-0 whitespace-nowrap"*/}
        {/*  options={segments}*/}
        {/*  value={selectedCategory}*/}
        {/*  onChange={(value) => setSelectedCategory(value as any)} />*/}

        {/*{*/}
        {/*  selectedCategory === "dashboard" && (*/}
        {/*    <Dashboard />*/}
        {/*  )*/}
        {/*}*/}
        {/*{*/}
        {/*  selectedCategory === "security" && (*/}
        {/*    <Security />*/}
        {/*  )*/}
        {/*}*/}
        {/*{*/}
        {/*  selectedCategory === "betHistory" && (*/}
        {/*    <BetHistory />*/}
        {/*  )*/}
        {/*}*/}
        {/*{*/}
        {/*  selectedCategory === "rollover" && (*/}
        {/*    <Rollover />*/}
        {/*  )*/}
        {/*}*/}
        {/*{*/}
        {/*  selectedCategory === "settings" && (*/}
        {/*    <Settings />*/}
        {/*  )*/}
        {/*}*/}
        {/*{*/}
        {/*  selectedCategory === "legal" && (*/}
        {/*    <Legal />*/}
        {/*  )*/}
        {/*}*/}
        {/*{*/}
        {/*  selectedCategory === "transactions" && (*/}
        {/*    <Transactions />*/}
        {/*  )*/}
        {/*}*/}

        {/* 菜单的内容 */}
        <MainContent />
      </div>
    </div>
  );
}
