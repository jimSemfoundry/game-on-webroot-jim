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
import Iconify from "../iconify";
import Logo from "../Logo";
// import { BonusHub } from "./BonusHub";
import { WalletFinance } from "./WalletFinance";
import { useBoundStore } from "@/store";

function AuthSection() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { openSignInModal, openSignUpModal } = useAuthModals();
  const { t } = useTranslation();

  if (isLoading) {
    return <div className="skeleton h-8 md:h-10 w-24 rounded-lg"></div>;
  }

  return (
    <div className="flex items-center gap-2 rtl:flex-row-reverse">
      {isAuthenticated && user ? (
        <div className="flex flex-row items-center gap-2">
          {/* 站内信 */}
          <InternalMessageEntry />
          <WalletFinance />
          <FastEntry />
        </div>
      ) : (
        <>
          <button className="btn btn-ghost md:btn-md btn-sm" onClick={openSignInModal}>
            {t("login:signIn")}
          </button>
          <button className="btn btn-primary md:btn-md btn-sm" onClick={openSignUpModal}>
            {t("login:signUp")}
          </button>
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

  return (
    <m.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.23, 0.5, 0.32, 1],
      }}
      className={cn(
        "w-full bg-base-300 sticky top-0 z-1001 flex gap-2 justify-between items-center",
        // 移动设备上始终使用移动端高度（即使横屏）
        isMobileDevice ? "h-12" : "h-12 md:h-18"
      )}
      style={{ marginTop: "env(safe-area-inset-top)" }}
    >
      <div className={cn(
        "flex-1 ltr:left-0 rtl:right-0 top-0 h-full flex items-center gap-2",
        isMobileDevice ? "pl-2" : "pl-2 md:pl-6"
      )} style={{ zIndex: 40 }}>
        <button
          className={cn("btn btn-square btn-sm", isMobileDevice ? "" : "sm:hidden")}
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
            <ChevronLeft className="w-5 h-5 pointer-events-none" />
          )}
        </button>
        <div className="ms-0 md:me-12">
          <Link to="/" search={{ openLogin: undefined, redirect: undefined, startapp: undefined }}>
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
            isMobileDevice ? "pr-2" : "pr-2 md:pr-6"
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
    </m.header>
  );
}
