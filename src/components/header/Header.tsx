import { useAuth } from "@/contexts/AuthContext";
import { useAuthModals } from "@/contexts/ModalsProvider";
import { useSidebar } from "@/contexts/SidebarContext";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { m } from "motion/react";
import { useTranslation } from "react-i18next";

import { FastEntry } from "@/components/header/c/FastEntry.tsx";
import { InternalMessageEntry } from "@/components/header/message-v2/InternalMessageEntry.tsx";
import { cn } from "@/utils/cn";
import { isTelegramWebApp } from "@/utils/telegramWebApp";
import Iconify from "../iconify";
import Logo from "../Logo";
// import { BonusHub } from "./BonusHub";
import { WalletFinance } from "./WalletFinance";
import { useBoundStore } from "@/store";
import { MqttSubscriptionsEntry } from "@/contexts/mqtt/MqttSubscriptions.tsx";
import { useRumSdkUserLog } from "@/utils/helper.ts";
import { useEffect } from "react";
import FinanceModalManager from "@/components/modal/UserFinanceModal/c/FinanceModalManager.tsx";

function AuthSection() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { openSignInModal, openSignUpModal } = useAuthModals();
  const { t } = useTranslation();

  const isTelegram = isTelegramWebApp();

  if (isLoading) {
    return <div className="skeleton h-10 w-40 bg-base-200/60 rounded-lg"></div>;
  }

  return (
    <div className="flex items-center gap-2 rtl:flex-row-reverse">
      {!isLoading && isAuthenticated && user ? (
        <div className="flex flex-row items-center gap-1 md:gap-2">
          {/* 站内信 */}
          <InternalMessageEntry />
          <WalletFinance />
          <FastEntry />
        </div>
      ) : (
        <>
          {!isTelegram && (
            <>
              <button className="btn btn-ghost md:btn-md btn-sm h-10 font-bold" onClick={openSignInModal}>
                {t("login:signIn")}
              </button>
              <button className="btn btn-primary md:btn-md btn-sm h-10 font-bold" onClick={openSignUpModal}>
                {t("login:signUp")}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function Header() {
  // const { openModal: openLanguageModal } = useLanguageModal();
  const router = useRouter();
  const location = useLocation();
  const { toggleDrawer, isMobileDevice } = useSidebar();

  // TODO: 添加全局日志信息
  const { rumSetConfig } = useRumSdkUserLog();
  useEffect(() => {
    rumSetConfig();
  }, [rumSetConfig]);

  return (
    <m.header
      // TODO: 有时候动画会失效,待排查
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.23, 0.5, 0.32, 1]
      }}
      className={cn(
        "app-header",
        "w-full bg-base-300 fixed top-0 left-0 right-0 z-[1001] pt-[var(--safe-area-inset-top)]"
      )}
      style={{ touchAction: "none" }}
    >
      <div
        className={cn(
          "w-full flex gap-1 justify-between items-center",
          // 移动设备上始终使用移动端高度（即使横屏）
          isMobileDevice ? "h-12" : "h-12 md:h-18"
        )}
      >
        <div className={cn(
          "flex-1 ltr:left-0 rtl:right-0 top-0 h-full flex items-center gap-1",
          isMobileDevice ? "pl-1 rtl:pr-1" : "pl-2 md:pl-6 rtl:md:pr-6"
        )} style={{ zIndex: 40 }}>
          <button
            className={cn("btn btn-square btn-md", isMobileDevice ? "" : "sm:hidden")}
            onClick={(e) => {
              e.preventDefault();
              if (location.pathname === "/casino") {
                toggleDrawer();
              } else {
                const { headerBackAction } = useBoundStore.getState();
                if (headerBackAction) {
                  headerBackAction();
                } else {
                  router.history.back();
                }
              }
            }}
            onTouchStart={() => console.log("Touch start")}
            type="button"
            style={{ position: "relative", zIndex: 50 }}
          >
            {location.pathname === "/casino" ? (
              <Iconify icon="custom:menu-2" className="w-5 h-5 pointer-events-none" />
            ) : (
              <ChevronLeft className="w-5 h-5 pointer-events-none rtl:rotate-y-180" />
            )}
          </button>
          <div className="ms-0 md:me-12">
            <Link
              to="/casino"
              search={{
                openLogin: undefined,
                openSignUp: undefined,
                redirect: undefined,
                startapp: undefined,
                openFinance: undefined
              }}
            >
              <Logo />
            </Link>
          </div>

          {/* Desktop BonusHub */}
          {/* {isAuthenticated && (
          <div className="hidden md:block">
            <BonusHub />
          </div>
        )} */}
        </div>

        {/* 主要内容容器 - 与内容区域对齐 */}
        <div className="relative h-full">
          <div className={cn(
            "container mx-auto h-full flex items-center justify-end",
            isMobileDevice ? "" : "md:max-w-7xl"
          )}>
            <div className={cn(
              "flex items-center gap-2",
              isMobileDevice ? "pr-1 rtl:pl-1" : "pr-2 md:pr-6 rtl:md:pl-6"
            )}>
              {/* Mobile BonusHub */}
              {/* {isAuthenticated && (
              <div className="md:hidden">
                <BonusHub />
              </div>
            )} */}

              {/* Auth Section */}
              <div className="md:block">
                <AuthSection />
              </div>

              {/* Settings and Language buttons */}
              {/*<div className="hidden md:flex items-center overflow-hidden bg-base-200 h-10 w-20 rounded-lg">*/}
              {/*  <button className="btn btn-ghost h-full flex-1 items-center justify-center p-0 rounded-lg">*/}
              {/*    <Iconify icon="custom:setting" className="w-4 h-4" />*/}
              {/*  </button>*/}
              {/*  <div className="h-5 w-px bg-base-100" />*/}
              {/*  <button className="btn btn-ghost h-full flex-1 items-center justify-center p-0 rounded-lg"*/}
              {/*          onClick={openLanguageModal}>*/}
              {/*    <Iconify icon="custom:global" className="w-4 h-4" />*/}
              {/*  </button>*/}
              {/*</div>*/}

              {/*<ThemeSwitcher />*/}
            </div>
          </div>
        </div>
      </div>

      {/* wss全局订阅入口 */}
      <MqttSubscriptionsEntry />

      {/*懒加载弹窗管理*/}
      <FinanceModalManager />
    </m.header>
  );
}
