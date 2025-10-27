import { UserFinanceModal } from "@/components/modal/UserFinanceModal";
import { MysteryBoxModal } from "@/sections/bonus/mystery-box/bonus-mystery-box-modal";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BetSlipModal } from "../components/modal/BetSlipModal";
import { GameCurrencySelectModal } from "../components/modal/GameCurrencySelectModal";
import { LanguageSelectModal } from "../components/modal/LanguageSelectModal";
import { SignInModal } from "../components/modal/SignInModal";
import { SignUpModal } from "../components/modal/SignUpModal";
import { useModal } from "../components/ui/Modal";
import { useSidebar } from "./SidebarContext";
// Help Modals
import { ThemeSwitcherModal } from "@/components/modal/ThemeSwitcherModal.tsx";
import { BonusAchievementsHelpModal } from "@/sections/bonus/achievements";
import { BonusCalendarHelpModal } from "@/sections/bonus/calendar";
import { BonusCannonHelpModal } from "@/sections/bonus/cannon";
import { BonusCashbackHelpModal } from "@/sections/bonus/cashback";
import { BonusConquestsModal } from "@/sections/bonus/conquests";
import { BonusDepositHelpModal } from "@/sections/bonus/deposit-bonus";
import { BonusJesterHelpModal } from "@/sections/bonus/jester";
import { BonusLuckyNumberHelpModal } from "@/sections/bonus/lucky-number";
import { HelpModalMysteryBox } from "@/sections/bonus/mystery-box/bonus-mystery-box-help-modal";
import { BonusRakebackHelpModal } from "@/sections/bonus/rakeback";
import { BonusTournamentHelpModal } from "@/sections/bonus/tournament/bonus-tournament-help-modal";

type TabItemsType = "deposit" | "withdraw" | "swap";
type TipsModalType =
  | "superRakeback"
  | "dailyCashback"
  | "bonusCalendar"
  | "conquest"
  | "tournament"
  | "achievement"
  | "mysteryBox"
  | "luckyNumber"
  | "cannon"
  | "jester"
  | "depositBonus";

type ModalsContextType = {
  // Auth Modals
  openSignInModal: () => void;
  closeSignInModal: () => void;
  openSignUpModal: () => void;
  closeSignUpModal: () => void;
  // Language Modal
  openLanguageModal: () => void;
  // Wallet Modal
  openWalletModal: () => void;
  // Bet Slip Modal
  openBetSlipModal: (order: any) => void;
  closeBetSlipModal: () => void;
  // User Finance Modal
  openUserFinanceModal: () => void;
  openUserFinanceModalWithTab: (tab: TabItemsType) => void;
  closeUserFinanceModal: () => void;
  // Tips Modals
  openTipsModal: (type: TipsModalType) => void;
  closeTipsModal: () => void;
  // Mystery Box Modal
  openMysteryBoxModal: () => void;
  closeMysteryBoxModal: () => void;
  // Theme Modal
  openThemeSwitcherModal: () => void;
  closeThemeSwitcherModal: () => void;
};

const ModalsContext = createContext<ModalsContextType | undefined>(undefined);

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

  // Mystery Box Modal
  const { isOpen: isMysteryBoxOpen, openModal: openMysteryBoxModal, closeModal: closeMysteryBoxModal } = useModal();

  // Theme modal
  const { isOpen: isThemeSwitcherOpen, openModal: openThemeSwitcherModal, closeModal: closeThemeSwitcherModal } = useModal();

  // 监听需要管理sidebar的modal状态
  useEffect(() => {
    const isAnyTargetModalOpen = isLanguageOpen || isWalletOpen;

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
  }, [isLanguageOpen, isWalletOpen, isMobile, isDrawerOpen, closeDrawer, openDrawer, wasSidebarOpenBeforeModal]);

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

  const handleOpenTipsModal = (type: TipsModalType) => {
    setCurrentTipsModal(type);
    openTipsModalBase();
  };

  const handleCloseTipsModal = () => {
    closeTipsModal();
    setCurrentTipsModal(null);
  };

  const value = useMemo(
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
      openTipsModal: handleOpenTipsModal,
      closeTipsModal: handleCloseTipsModal,
      openMysteryBoxModal,
      closeMysteryBoxModal,
      openThemeSwitcherModal,
      closeThemeSwitcherModal,
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
      handleOpenTipsModal,
      handleCloseTipsModal,
      openMysteryBoxModal,
      closeMysteryBoxModal,
      openThemeSwitcherModal,
      closeThemeSwitcherModal,
    ],
  );

  return (
    <ModalsContext.Provider value={value}>
      {children}
      {/* Auth Modals */}
      <SignInModal isOpen={isSignInOpen} onClose={closeSignInModal} />
      <SignUpModal isOpen={isSignUpOpen} onClose={closeSignUpModal} />
      {/* Language Modal */}
      <LanguageSelectModal isOpen={isLanguageOpen} onClose={closeLanguageModal} />
      {/* Wallet Modal */}
      <GameCurrencySelectModal isOpen={isWalletOpen} onClose={closeWalletModal} />
      {/* Bet Slip Modal */}
      <BetSlipModal isOpen={isBetSlipOpen} onClose={handleCloseBetSlipModal} order={betSlipOrder} />
      {/* User Finance Modal */}
      <UserFinanceModal isOpen={isUserFinanceOpen} onClose={closeUserFinanceModal} initialTab={userFinanceInitialTab} />
      {/* User Finance Modal */}
      <ThemeSwitcherModal isOpen={isThemeSwitcherOpen} onClose={closeThemeSwitcherModal} />

      {/* Help Modals */}
      {/* FIXME: 判断模式会导致动画效果丢失 */}
      {currentTipsModal === "superRakeback" && <BonusRakebackHelpModal isOpen={isTipsModalOpen} onClose={handleCloseTipsModal} />}
      {currentTipsModal === "dailyCashback" && <BonusCashbackHelpModal isOpen={isTipsModalOpen} onClose={handleCloseTipsModal} />}
      {currentTipsModal === "bonusCalendar" && <BonusCalendarHelpModal isOpen={isTipsModalOpen} onClose={handleCloseTipsModal} />}
      {currentTipsModal === "conquest" && <BonusConquestsModal isOpen={isTipsModalOpen} onClose={handleCloseTipsModal} />}
      {currentTipsModal === "tournament" && <BonusTournamentHelpModal isOpen={isTipsModalOpen} onClose={handleCloseTipsModal} />}
      {currentTipsModal === "achievement" && <BonusAchievementsHelpModal isOpen={isTipsModalOpen} onClose={handleCloseTipsModal} />}
      {currentTipsModal === "mysteryBox" && <HelpModalMysteryBox isOpen={isTipsModalOpen} onClose={handleCloseTipsModal} />}
      {currentTipsModal === "luckyNumber" && <BonusLuckyNumberHelpModal isOpen={isTipsModalOpen} onClose={handleCloseTipsModal} />}
      {currentTipsModal === "cannon" && <BonusCannonHelpModal isOpen={isTipsModalOpen} onClose={handleCloseTipsModal} />}
      {currentTipsModal === "jester" && <BonusJesterHelpModal isOpen={isTipsModalOpen} onClose={handleCloseTipsModal} />}
      <BonusDepositHelpModal isOpen={currentTipsModal === "depositBonus"} onClose={handleCloseTipsModal} />

      {/* Mystery Box Modal */}
      <MysteryBoxModal isOpen={isMysteryBoxOpen} onClose={closeMysteryBoxModal} />
    </ModalsContext.Provider>
  );
}

// Unified hook for all modals
export const useModals = () => {
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
  const { openUserFinanceModal, openUserFinanceModalWithTab, closeUserFinanceModal } = useModals();
  return { openUserFinanceModal, openUserFinanceModalWithTab, closeUserFinanceModal };
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
