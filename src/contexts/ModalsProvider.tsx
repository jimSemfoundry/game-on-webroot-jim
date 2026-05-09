import { Suspense, lazy, useContext, useEffect, useMemo, useState } from "react";
import { useModal } from "../components/ui/Modal";
import { ModalsContext, type TipsModalType, type TabItemsType, ModalsContextType } from "./ModalsContext";
import { useSidebar } from "./SidebarContext";
import { SignInModal } from "../components/modal/SignInModal";
import { SignUpModal } from "../components/modal/SignUpModal";
// Help Modals
import { IDoubledUpProps, ICurrentPromoList, ICurrentPromo } from "@/types/double-or-nothing";
import type { DoubleOrNothingModalProps } from "@/sections/double-or-nothing/DoubleOrNothing";

export type { TabItemsType } from "./ModalsContext";

const LazyThemeSwitcherModal = lazy(() =>
  import("../components/modal/ThemeSwitcherModal.tsx").then((m) => ({ default: m.ThemeSwitcherModal })),
);

const LazyBetSlipModal = lazy(() =>
  import("../components/modal/BetSlipModal").then((m) => ({ default: m.BetSlipModal })),
);

const LazyBonusDepositHelpModal = lazy(() =>
  import("@/sections/bonus/deposit-bonus").then((m) => ({ default: m.BonusDepositHelpModal })),
);

const LazyBonusRakebackHelpModal = lazy(() =>
  import("@/sections/bonus/rakeback").then((m) => ({ default: m.BonusRakebackHelpModal })),
);

const LazyBonusCashbackHelpModal = lazy(() =>
  import("@/sections/bonus/cashback").then((m) => ({ default: m.BonusCashbackHelpModal })),
);

const LazyBonusCalendarHelpModal = lazy(() =>
  import("@/sections/bonus/calendar").then((m) => ({ default: m.BonusCalendarHelpModal })),
);

const LazyBonusCannonHelpModal = lazy(() =>
  import("@/sections/bonus/cannon").then((m) => ({ default: m.BonusCannonHelpModal })),
);

const LazyBonusConquestsModal = lazy(() =>
  import("@/sections/bonus/conquests").then((m) => ({ default: m.BonusConquestsModal })),
);

const LazyBonusTournamentHelpModal = lazy(() =>
  import("@/sections/bonus/tournament/bonus-tournament-help-modal").then((m) => ({ default: m.BonusTournamentHelpModal })),
);

const LazyBonusAchievementsHelpModal = lazy(() =>
  import("@/sections/bonus/achievements").then((m) => ({ default: m.BonusAchievementsHelpModal })),
);

const LazyHelpModalMysteryBox = lazy(() =>
  import("@/sections/bonus/mystery-box/bonus-mystery-box-help-modal").then((m) => ({ default: m.HelpModalMysteryBox })),
);

const LazyBonusLuckyNumberHelpModal = lazy(() =>
  import("@/sections/bonus/lucky-number").then((m) => ({ default: m.BonusLuckyNumberHelpModal })),
);

const LazyBonusJesterHelpModal = lazy(() =>
  import("@/sections/bonus/jester").then((m) => ({ default: m.BonusJesterHelpModal })),
);

const LazyLimitedOffersHelpModal = lazy(() =>
  import("@/sections/limited-offer/limited-offers-help-modal").then((m) => ({ default: m.LimitedOffersHelpModal })),
);

const LazyDoubleOrNothingHelpModal = lazy(() =>
  import("@/sections/double-or-nothing/double-or-nothing-help-modal").then((m) => ({ default: m.DoubleOrNothingHelpModal })),
);

const LazyThursdayBounsHelpModal = lazy(() =>
  import("@/sections/crypto-thursday-bonus/thursday-bouns-help-modal").then((m) => ({ default: m.ThursdayBounsHelpModal })),
);

const LazySundaySuperHelpModal = lazy(() =>
  import("@/sections/sunday-super-bouns/sunday-super-help-modal").then((m) => ({ default: m.SundaySuperHelpModal })),
);

const LazyBoost = lazy(() =>
  import("@/sections/double-or-nothing/Boost").then((m) => ({ default: m.Boost })),
);

const LazyNothing = lazy(() =>
  import("@/sections/double-or-nothing/Nothing").then((m) => ({ default: m.Nothing })),
);

const LazyDoubledUp = lazy(() =>
  import("@/sections/double-or-nothing/DoubledUp").then((m) => ({ default: m.DoubledUp })),
);

const LazyDoubleOrNothingModal = lazy(() =>
  import("@/sections/double-or-nothing/DoubleOrNothing").then((m) => ({ default: m.DoubleOrNothingModal })),
);

const LazyMysteryBoxModal = lazy(() =>
  import("@/sections/bonus/mystery-box/bonus-mystery-box-modal").then((m) => ({ default: m.MysteryBoxModal })),
);

const LazySpecialOffersModal = lazy(() =>
  import("@/sections/bonus/specialOffers/SpecialOffersModal.tsx").then((m) => ({ default: m.SpecialOffersModal })),
);


const LazyLanguageSelectModal = lazy(() =>
  import("../components/modal/LanguageSelectModal").then((m) => ({ default: m.LanguageSelectModal })),
);

const LazyGameCurrencySelectModal = lazy(() =>
  import("../components/modal/GameCurrencySelectModal").then((m) => ({ default: m.GameCurrencySelectModal })),
);

const LazyUserFinanceModal = lazy(() =>
  import("../components/modal/UserFinanceModal").then((m) => ({ default: m.UserFinanceModal })),
);


export function ModalsProvider({ children }: { children: React.ReactNode }) {
  const { isMobile, isDrawerOpen, closeDrawer, openDrawer } = useSidebar();
  const [wasSidebarOpenBeforeModal, setWasSidebarOpenBeforeModal] = useState(false);

  // Auth modals
  const { isOpen: isSignInOpen, openModal: openSignInModal, closeModal: closeSignInModal } = useModal();
  const { isOpen: isSignUpOpen, openModal: openSignUpModal, closeModal: closeSignUpModal } = useModal();

  // Language modal
  const { isOpen: isLanguageOpen, openModal: openLanguageModal, closeModal: closeLanguageModal } = useModal();

  // Wallet modal
  const { isOpen: isWalletOpen, openModal: openWalletModal, closeModal: closeWalletModal } = useModal();

  // Bet Slip modal
  const { isOpen: isBetSlipOpen, openModal: openBetSlipModal, closeModal: closeBetSlipModal } = useModal();
  const [betSlipOrder, setBetSlipOrder] = useState<any>(null);

  // User Finance Modal
  const { isOpen: isUserFinanceOpen, openModal: openUserFinanceModal, closeModal: closeUserFinanceModal } = useModal();
  const [userFinanceInitialTab, setUserFinanceInitialTab] = useState<TabItemsType>("deposit");

  // Tips Modals
  const { isOpen: isTipsModalOpen, openModal: openTipsModalBase, closeModal: closeTipsModal } = useModal();
  const [currentTipsModal, setCurrentTipsModal] = useState<TipsModalType | null>(null);
  const [currentPromo, setCurrentPromo] = useState<ICurrentPromoList | null>(null);

  // Mystery Box Modal
  const { isOpen: isMysteryBoxOpen, openModal: openMysteryBoxModal, closeModal: closeMysteryBoxModal } = useModal();

  // Theme modal
  const { isOpen: isThemeSwitcherOpen, openModal: openThemeSwitcherModal, closeModal: closeThemeSwitcherModal } = useModal();

  // Special Offers Modal
  const { isOpen: isSpecialOffersOpen, openModal: openSpecialOffersModal, closeModal: closeSpecialOffersModal } = useModal();

  // Double or Nothing Modal
  const { isOpen: isDoubleOrNothingOpen, openModal: openDoubleOrNothingBase, closeModal: closeDoubleOrNothingBase } = useModal();
  const [doubleOrNothingModalData, setDoubleOrNothingModalData] = useState<DoubleOrNothingModalProps["modalData"] | null>(null);

  // Doubled Up Modal
  const { isOpen: isDoubledUpOpen, openModal: openDoubledUpModal, closeModal: closeDoubledUpModal } = useModal();
  const [doubledUpModalData, setDoubledUpModalData] = useState<IDoubledUpProps | null>(null);

  // Nothing Modal
  const { isOpen: isNothingOpen, openModal: openNothingModal, closeModal: closeNothingModal } = useModal();
  const [nothingModalData, setNothingModalData] = useState<string | null>(null);

  // Boost Modal
  const { isOpen: isBoostOpen, openModal: openBoostModal, closeModal: closeBoostModal } = useModal();
  const [boostModalData, setBoostModalData] = useState<ICurrentPromo | null>(null);

  // 监听需要管理sidebar的modal状态
  useEffect(() => {
    const isAnyTargetModalOpen = isLanguageOpen || isWalletOpen || isThemeSwitcherOpen;

    if (isMobile) {
      if (isAnyTargetModalOpen) {
        // Modal打开时，如果sidebar是打开的，记录状态并关闭sidebar
        if (isDrawerOpen) {
          setWasSidebarOpenBeforeModal(true);
          closeDrawer();
        }
      } else {
        // Modal关闭时，如果之前sidebar是打开的，重新打开sidebar
        if (wasSidebarOpenBeforeModal) {
          setWasSidebarOpenBeforeModal(false);
          openDrawer();
        }
      }
    }
  }, [isLanguageOpen, isWalletOpen, isThemeSwitcherOpen, isMobile, isDrawerOpen, closeDrawer, openDrawer, wasSidebarOpenBeforeModal]);

  const handleOpenBetSlipModal = (order: any) => {
    setBetSlipOrder(order);
    openBetSlipModal();
  };

  const handleCloseBetSlipModal = () => {
    closeBetSlipModal();
    setBetSlipOrder(null);
  };

  const handleOpenUserFinanceModal = () => {
    setUserFinanceInitialTab("deposit");
    openUserFinanceModal();
  };

  const handleOpenUserFinanceModalWithTab = (tab: TabItemsType) => {
    setUserFinanceInitialTab(tab);
    openUserFinanceModal();
  };

  const handleOpenTipsModal = (type: TipsModalType, promo?: ICurrentPromoList) => {
    setCurrentTipsModal(type);
    openTipsModalBase();
    if (promo) {
      setCurrentPromo(promo)
    }
  };

  const handleCloseTipsModal = () => {
    closeTipsModal();
    setCurrentTipsModal(null);
    setCurrentPromo(null);
  };

  const handleOpenDoubleOrNothingModal = (modalData: DoubleOrNothingModalProps["modalData"]) => {
    setDoubleOrNothingModalData(modalData);
    openDoubleOrNothingBase();
  };

  const handleCloseDoubleOrNothingModal = () => {
    closeDoubleOrNothingBase();
    setDoubleOrNothingModalData(null);
  };

  const handleOpenDoubledUpModal = (donData: IDoubledUpProps) => {
    openDoubledUpModal();
    setDoubledUpModalData(donData);
  };

  const handleCloseDoubledUpModal = () => {
    closeDoubledUpModal();
    setDoubledUpModalData(null);
  };

  const handleOpenNothingModal = (don_record_id: string) => {
    openNothingModal();
    setNothingModalData(don_record_id);
  };

  const handleCloseNothingModal = () => {
    closeNothingModal();
    setNothingModalData(null);
  };

  const handleOpenBoostModal = (modalData: ICurrentPromo) => {
    openBoostModal();
    setBoostModalData(modalData);
  };

  const handleCloseBoostModal = () => {
    closeBoostModal();
    setBoostModalData(null);
  };

  const value = useMemo<ModalsContextType>(
    () => ({
      openSignInModal,
      closeSignInModal,
      openSignUpModal,
      closeSignUpModal,
      openLanguageModal,
      openWalletModal,
      openBetSlipModal: handleOpenBetSlipModal,
      closeBetSlipModal: handleCloseBetSlipModal,
      openUserFinanceModal: handleOpenUserFinanceModal,
      openUserFinanceModalWithTab: handleOpenUserFinanceModalWithTab,
      closeUserFinanceModal,
      isUserFinanceOpen,
      userFinanceInitialTab,
      setUserFinanceInitialTab,
      openTipsModal: handleOpenTipsModal,
      closeTipsModal: handleCloseTipsModal,
      openMysteryBoxModal,
      closeMysteryBoxModal,
      openThemeSwitcherModal,
      closeThemeSwitcherModal,
      openSpecialOffersModal,
      closeSpecialOffersModal,
      openDoubleOrNothingModal: handleOpenDoubleOrNothingModal,
      closeDoubleOrNothingModal: handleCloseDoubleOrNothingModal,
      openDoubledUpModal: handleOpenDoubledUpModal,
      closeDoubledUpModal: handleCloseDoubledUpModal,
      openNothingModal: handleOpenNothingModal,
      closeNothingModal: handleCloseNothingModal,
      openBoostModal: handleOpenBoostModal,
      closeBoostModal: handleCloseBoostModal,
    }),
    [
      openSignInModal,
      closeSignInModal,
      openSignUpModal,
      closeSignUpModal,
      openLanguageModal,
      openWalletModal,
      handleOpenBetSlipModal,
      handleCloseBetSlipModal,
      handleOpenUserFinanceModal,
      handleOpenUserFinanceModalWithTab,
      closeUserFinanceModal,
      isUserFinanceOpen,
      userFinanceInitialTab,
      setUserFinanceInitialTab,
      handleOpenTipsModal,
      handleCloseTipsModal,
      openMysteryBoxModal,
      closeMysteryBoxModal,
      openThemeSwitcherModal,
      closeThemeSwitcherModal,
      openSpecialOffersModal,
      closeSpecialOffersModal,
      handleOpenDoubleOrNothingModal,
      handleCloseDoubleOrNothingModal,
      handleOpenDoubledUpModal,
      handleCloseDoubledUpModal,
      handleOpenNothingModal,
      handleCloseNothingModal,
      handleOpenBoostModal,
      handleCloseBoostModal,
    ],
  );

  return (
    <ModalsContext.Provider value={value}>
      {children}
      {/*
      将 Suspense 提取到外层可能会有一些潜在问题
      1. 代码打包影响
      之前：每个 modal 可以独立打包，按需加载
      现在：所有在同一个 Suspense 中的组件可能会被打包到同一个 chunk
      2. 错误边界处理
      如果一个懒加载组件失败，可能影响整个 Suspense 块内的其他组件
      3. 性能考虑
      同时加载多个 modal 可能会增加初始加载时间 */}

      {/* Auth Modals */}
      <SignInModal isOpen={isSignInOpen} onClose={closeSignInModal} />
      <SignUpModal isOpen={isSignUpOpen} onClose={closeSignUpModal} />

      {/* Language Modal */}
      {isLanguageOpen && (
        <Suspense fallback={null}>
          <LazyLanguageSelectModal isOpen={isLanguageOpen} onClose={closeLanguageModal} />
        </Suspense>
      )}

      {/* Wallet Modal */}
      {isWalletOpen && (
        <Suspense fallback={null}>
          <LazyGameCurrencySelectModal isOpen={isWalletOpen} onClose={closeWalletModal} />
        </Suspense>
      )}

      {/* User Finance Modal */}
      {isUserFinanceOpen && (
        <Suspense fallback={null}>
          <LazyUserFinanceModal isOpen={isUserFinanceOpen} onClose={closeUserFinanceModal} initialTab={userFinanceInitialTab} />
        </Suspense>
      )}

      {/* Bet Slip Modal */}
      {isBetSlipOpen && (
        <Suspense fallback={null}>
          <LazyBetSlipModal isOpen={isBetSlipOpen} onClose={handleCloseBetSlipModal} order={betSlipOrder} />
        </Suspense>
      )}

      {/* User Finance Modal */}
      {isThemeSwitcherOpen && (
        <Suspense fallback={null}>
          <LazyThemeSwitcherModal isOpen={isThemeSwitcherOpen} onClose={closeThemeSwitcherModal} />
        </Suspense>
      )}

      {/* Help Modals */}
      {currentTipsModal === "superRakeback" && (
        <Suspense fallback={null}>
          <LazyBonusRakebackHelpModal isOpen={isTipsModalOpen} onClose={handleCloseTipsModal} />
        </Suspense>
      )}

      {currentTipsModal === "dailyCashback" && (
        <Suspense fallback={null}>
          <LazyBonusCashbackHelpModal isOpen={isTipsModalOpen} onClose={handleCloseTipsModal} />
        </Suspense>
      )}

      {currentTipsModal === "bonusCalendar" && (
        <Suspense fallback={null}>
          <LazyBonusCalendarHelpModal isOpen={isTipsModalOpen} onClose={handleCloseTipsModal} />
        </Suspense>
      )}

      {currentTipsModal === "conquest" && (
        <Suspense fallback={null}>
          <LazyBonusConquestsModal isOpen={isTipsModalOpen} onClose={handleCloseTipsModal} />
        </Suspense>
      )}

      {currentTipsModal === "tournament" && (
        <Suspense fallback={null}>
          <LazyBonusTournamentHelpModal isOpen={isTipsModalOpen} onClose={handleCloseTipsModal} />
        </Suspense>
      )}

      {currentTipsModal === "achievement" && (
        <Suspense fallback={null}>
          <LazyBonusAchievementsHelpModal isOpen={isTipsModalOpen} onClose={handleCloseTipsModal} />
        </Suspense>
      )}

      {currentTipsModal === "mysteryBox" && (
        <Suspense fallback={null}>
          <LazyHelpModalMysteryBox isOpen={isTipsModalOpen} onClose={handleCloseTipsModal} />
        </Suspense>
      )}

      {currentTipsModal === "luckyNumber" && (
        <Suspense fallback={null}>
          <LazyBonusLuckyNumberHelpModal isOpen={isTipsModalOpen} onClose={handleCloseTipsModal} />
        </Suspense>
      )}

      {currentTipsModal === "cannon" && (
        <Suspense fallback={null}>
          <LazyBonusCannonHelpModal isOpen={isTipsModalOpen} onClose={handleCloseTipsModal} />
        </Suspense>
      )}

      {currentTipsModal === "jester" && (
        <Suspense fallback={null}>
          <LazyBonusJesterHelpModal isOpen={isTipsModalOpen} onClose={handleCloseTipsModal} />
        </Suspense>
      )}

      {currentTipsModal === "limitedOffers" && currentPromo && (
        <Suspense fallback={null}>
          <LazyLimitedOffersHelpModal open={isTipsModalOpen} onClose={handleCloseTipsModal} currentPromo={currentPromo} />
        </Suspense>
      )}

      {currentTipsModal === "doubleOrNothing" && currentPromo && (
        <Suspense fallback={null}>
          <LazyDoubleOrNothingHelpModal open={isTipsModalOpen} onClose={handleCloseTipsModal} currentPromo={currentPromo} />
        </Suspense>
      )}

      {currentTipsModal === "cryptoThursdayBouns" && currentPromo && (
        <Suspense fallback={null}>
          <LazyThursdayBounsHelpModal open={isTipsModalOpen} onClose={handleCloseTipsModal} currentPromo={currentPromo} />
        </Suspense>
      )}

      {currentTipsModal === "sundaySuperBonus" && currentPromo && (
        <Suspense fallback={null}>
          <LazySundaySuperHelpModal open={isTipsModalOpen} onClose={handleCloseTipsModal} currentPromo={currentPromo} />
        </Suspense>
      )}

      {currentTipsModal === "depositBonus" && (
        <Suspense fallback={null}>
          <LazyBonusDepositHelpModal isOpen={true} onClose={handleCloseTipsModal} />
        </Suspense>
      )}

      {/* Mystery Box Modal */}
      {isMysteryBoxOpen && (
        <Suspense fallback={null}>
          <LazyMysteryBoxModal isOpen={isMysteryBoxOpen} onClose={closeMysteryBoxModal} />
        </Suspense>
      )}

      {/* Special Offers Modal */}
      {isSpecialOffersOpen && (
        <Suspense fallback={null}>
          <LazySpecialOffersModal
            open={isSpecialOffersOpen}
            onClose={closeSpecialOffersModal}
          />
        </Suspense>
      )}

      {/* Double Or Nothing Related pop-ups */}
      {isDoubleOrNothingOpen && doubleOrNothingModalData && doubleOrNothingModalData?.don_record_id && (
        <Suspense fallback={null}>
          <LazyDoubleOrNothingModal open={isDoubleOrNothingOpen} onClose={closeDoubleOrNothingBase} modalData={doubleOrNothingModalData} />
        </Suspense>
      )}

      {isDoubledUpOpen && doubledUpModalData && (
        <Suspense fallback={null}>
          <LazyDoubledUp open={isDoubledUpOpen} onClose={closeDoubledUpModal} donData={doubledUpModalData} />
        </Suspense>
      )}

      {isNothingOpen && nothingModalData && (
        <Suspense fallback={null}>
          <LazyNothing open={isNothingOpen} onClose={closeNothingModal} don_record_id={nothingModalData} />
        </Suspense>
      )}

      {isBoostOpen && boostModalData && (
        <Suspense fallback={null}>
          <LazyBoost open={isBoostOpen} onClose={closeBoostModal} modalData={boostModalData} />
        </Suspense>
      )}
      {/* Double Or Nothing Related pop-ups */}

    </ModalsContext.Provider>
  );
}

// Unified hook for all modals
export const useModals = (): ModalsContextType => {
  const context = useContext(ModalsContext);
  if (context === undefined) {
    throw new Error("useModals must be used within a ModalsProvider");
  }
  return context;
};

// Legacy hooks for backward compatibility
export const useAuthModals = () => {
  const { openSignInModal, closeSignInModal, openSignUpModal, closeSignUpModal } = useModals();
  return { openSignInModal, closeSignInModal, openSignUpModal, closeSignUpModal };
};

export const useLanguageModal = () => {
  const { openLanguageModal } = useModals();
  return { openModal: openLanguageModal };
};

export const useWalletModal = () => {
  const { openWalletModal } = useModals();
  return { openModal: openWalletModal };
};

export const useFinanceModal = () => {
  const {
    openUserFinanceModal,
    openUserFinanceModalWithTab,
    closeUserFinanceModal,
    isUserFinanceOpen,
    userFinanceInitialTab,
    setUserFinanceInitialTab,
  } = useModals();
  return {
    openUserFinanceModal,
    openUserFinanceModalWithTab,
    closeUserFinanceModal,
    isUserFinanceOpen,
    userFinanceInitialTab,
    setUserFinanceInitialTab,
  };
};

export const useTipsModal = () => {
  const { openTipsModal, closeTipsModal } = useModals();
  return { openTipsModal, closeTipsModal };
};

export const useMysteryBoxModal = () => {
  const { openMysteryBoxModal, closeMysteryBoxModal } = useModals();
  return { openMysteryBoxModal, closeMysteryBoxModal };
};

export const useThemeSwitcherModal = () => {
  const { openThemeSwitcherModal, closeThemeSwitcherModal } = useModals();
  return { openModal: openThemeSwitcherModal, closeModal: closeThemeSwitcherModal };
};

export const useDoubleOrNothingModal = () => {
  const { openDoubleOrNothingModal, closeDoubleOrNothingModal } = useModals();
  return { openDoubleOrNothingModal, closeDoubleOrNothingModal };
};

export const useDoubledUpModal = () => {
  const { openDoubledUpModal, closeDoubledUpModal } = useModals();
  return { openDoubledUpModal, closeDoubledUpModal };
};

export const useNothingModal = () => {
  const { openNothingModal, closeNothingModal } = useModals();
  return { openNothingModal, closeNothingModal };
};

export const useBoostModal = () => {
  const { openBoostModal, closeBoostModal } = useModals();
  return { openBoostModal, closeBoostModal };
};