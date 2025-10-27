import { useAuth } from "@/contexts/AuthContext";
import { useAuthModals } from "@/contexts/ModalsProvider";
import { useSidebar } from "@/contexts/SidebarContext";
import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { m } from "motion/react";
import { useTranslation } from "react-i18next";

import Iconify from "../iconify";
import Logo from "../Logo";
import { BonusHub } from "./BonusHub";
import { WalletFinance } from "./WalletFinance";
import { cn } from "@/utils/cn";
import { FastEntry } from "@/components/header/c/FastEntry.tsx";
import InternalMessageCounter from "@/components/header/c/InternalMessageCounter.tsx";

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
          {/* 站内信统计数 */}
          <InternalMessageCounter />
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
  const { toggleDrawer } = useSidebar();

  return (
    <m.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.23, 0.5, 0.32, 1]
      }}
      className="w-full bg-base-300 h-12 md:h-18 sticky top-0 z-30"
    >
      <div className="absolute ltr:left-0 rtl:right-0 top-0 h-full flex items-center px-2 md:px-6"
           style={{ zIndex: 40 }}>
        <button
          className={cn("btn btn-square btn-sm sm:hidden")}
          onClick={(e) => {
            e.preventDefault();
            if (location.pathname === "/casino") {
              toggleDrawer();
            } else {
              router.history.back();
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
        <div className="ms-3 md:ms-0 md:me-12">
          <Link to="/" search={{ openLogin: undefined, redirect: undefined, startapp: undefined }}>
            <Logo />
          </Link>
        </div>

        {/* Desktop BonusHub */}
        <div className="hidden md:block">
          <BonusHub />
        </div>
      </div>

      {/* 主要内容容器 - 与内容区域对齐 */}
      <div className="relative h-full">
        <div className="container mx-auto md:max-w-7xl h-full flex items-center justify-end">
          <div className="flex items-center gap-2 px-2 md:px-6">
            {/* Mobile BonusHub */}
            <div className="md:hidden">
              <BonusHub />
            </div>

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

