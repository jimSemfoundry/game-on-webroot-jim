import { LiquidGlassEffect } from "@/components/ui/LiquidGlassEffect.tsx";
// import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { LevelUpgrade } from "@/sections/profile/c/LevelUpgrade.tsx";
import { FastFinanceLink } from "@/sections/profile/c/FastFinanceLink.tsx";
import { useTranslation } from "react-i18next";
// import { useState } from "react";
// import Iconify from "@/components/iconify";
// import { BetHistory, Dashboard, Security, Settings, Rollover, Legal, Transactions } from "@/sections/profile";
import Copy from "@/components/ui/Copy.tsx";
import { MainContent } from "@/sections/profile/c/MainContent.tsx";
import { ChevronRight } from "lucide-react";
import { emitter } from "@/store/emitter.ts";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { useEffect } from "react";
import { ProfileSearch } from "@/sections/profile/c/NavScrollBar.tsx";
import { getImgCompressParams, getPathInROIBEST, pickImageWithEnv } from "@/utils/helper.ts";

export const Route = createFileRoute("/_main/_authenticated/profile")({
  component: ProfilePage
});

function ProfilePage() {
  const navigate = useNavigate();

  const { user } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { t } = useTranslation("profile");
  // const [selectedCategory, setSelectedCategory] = useState<
  //   "dashboard" | "transactions" | "rollover" | "betHistory" | "security" | "settings" | "legal"
  // >("dashboard");

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

  // 定位到指定目标区域，来源于 Finance: withdraw & swap 的链接
  const search = useSearch({ from: "/_main/_authenticated/profile" }) as ProfileSearch;

  useEffect(() => {
    if (search?.tab) document.getElementById("NAVS")?.scrollIntoView({
      behavior: "smooth", // 平滑滚动
      block: "start"     // 让目标顶部对齐视口顶部
    });
  }, [search?.tab]);

  if (!user) {
    return <div
      className="p-5 grid grid-rows-3 grid-rows-[1.5fr_1fr_1fr_1fr] gap-4 h-[calc(100vh-48px-72px-var(--safe-area-inset-bottom)-var(--safe-area-inset-top)))]">
      <div className="skeleton bg-base-200/40 rounded-xl" />
      <div className="skeleton bg-base-200/40 rounded-xl" />
      <div className="skeleton bg-base-200/40 rounded-xl" />
      <div className="skeleton bg-base-200/40 rounded-xl" />
    </div>;
  }

  return (
    <div className="flex flex-col gap-4 py-3 sm:pt-8">
      <div
        className="sm:grid sm:grid-cols-2 rounded-box gap-5 p-5 relative sm:bg-base-200/50 sm:rounded-box sm:justify-between select-none"
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
        }}>
        {/* 主要的Hero卡片 - 参考bonus/Hero.tsx */}
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-10 sm:items-center -mt-4 mb-4">
          {/* FIXME: roibest 前缀异常 */}
          <img
            src={getImgCompressParams(pickImageWithEnv("VITE_USER_PROFILE_IMAGE",
              `${getPathInROIBEST()}/images/illustrations/7d9e2a1cab9d27045f7a0364eadc17c01e2b654e.png`), 209, 80)}
            className="absolute rtl:left-5 rtl:right-auto rtl:rotate-y-180 right-5 top-0 w-[209px] h-[209px] drop-shadow-[0_4px_40px_rgba(238,216,92,0.30)] z-10 sm:hidden"
          />

          {/* <img className="w-[170px] h-[170px] shadow-[0px_4px_100px_0px_rgba(238,216,92,0.30)]" src="https://placehold.co/170x170" /> */}
          <div className="avatar">
            <div className="w-12 h-12 sm:w-36 sm:h-36 rounded-full flex items-center justify-center">
              <img src={user?.avatar || "/images/default-avatar.png"} className="w-full h-full rtl:rotate-y-180"
                   alt="Avatar" />
            </div>
          </div>

          <div className="flex flex-col gap-2 overflow-hidden">
            <div className="flex items-center gap-2">
              <p className="text-sm sm:text-lg font-semibold text-base-content/50">ID: {user?.id}</p>
              <Copy text={user?.id?.toString()} className="h-4 w-4" />
            </div>
            <p
              className="text-2xl sm:text-4xl text-base-content font-bold z-10 capitalize truncate max-w-[62%] sm:max-w-full">{user?.nickname}</p>
            <div className="font-semibold text-base-content/50 sm:mb-0">
              <div className="inline-flex items-center gap-2 sm:cursor-pointer"
                   onClick={() => {
                     emitter.emit("SYNC_TABS_INDEX", "profile");
                     setTimeout(() => {
                       document.getElementById("NAVS")?.scrollIntoView({ behavior: "smooth", block: "start" });
                     }, 100);
                   }}>
                <span className="text-sm sm:text-lg text-primary">{t("profile:editProfile")}</span>
                <ChevronRight className="w-3 h-3 rtl:rotate-180" strokeWidth={4} />
              </div>
            </div>

            {/* 唤起存款取款操作 */}
            <DisplayContent status={!isMobile}><FastFinanceLink /></DisplayContent>
          </div>
        </div>

        <div
          onClick={() => !isMobile && navigate({ to: "/vip-club" })}
          className="relative cursor-pointer xs:min-h-[252px] sm:h-[200px] p-4 sm:p-6 z-10 bg-base-300 rounded-box">
          <LiquidGlassEffect className="absolute inset-0 pointer-events-none min-h-full w-full">
            <div className="w-full h-full"></div>
          </LiquidGlassEffect>

          {/* 等级经验 */}
          <LevelUpgrade onClick={() => isMobile && navigate({ to: "/vip-club" })} />
        </div>
      </div>

      <div className="px-5 sm:px-0 flex flex-col gap-4" id={"NAVS"}>

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
