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
import { SpecialOffersModal } from "@/sections/bonus/specialOffers/SpecialOffersModal.tsx";
import { DoubleOrNothingHelpModal } from "@/sections/double-or-nothing/double-or-nothing-help-modal";
import { LimitedOffersHelpModal } from "@/sections/limited-offer/limited-offers-help-modal";
import { DoubleOrNothingModal } from "@/sections/double-or-nothing/DoubleOrNothing";
import type { DoubleOrNothingModalProps } from "@/sections/double-or-nothing/DoubleOrNothing";
import { ThursdayBounsHelpModal } from "@/sections/crypto-thursday-bonus/thursday-bouns-help-modal";
import { SundaySuperHelpModal } from "@/sections/sunday-super-bouns/sunday-super-help-modal";
import { IDoubledUpProps, ICurrentPromoList, ICurrentPromo } from "@/types/double-or-nothing";
import { DoubledUp } from "@/sections/double-or-nothing/DoubledUp";
import { Nothing } from "@/sections/double-or-nothing/Nothing";
import { Boost } from "@/sections/double-or-nothing/Boost";

export type TabItemsType = "deposit" | "withdraw" | "swap" | `deposit_${string}` | `withdraw_${string}` | `swap_${string}`;
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
  | "depositBonus"
  | "doubleOrNothing"
  | "limitedOffers"
  | "sundaySuperBouns"
  | "cryptoThursdayBouns";

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
  isUserFinanceOpen: boolean;
  userFinanceInitialTab: TabItemsType;
  setUserFinanceInitialTab: (tab: TabItemsType) => void;
  // Tips Modals
  openTipsModal: (type: TipsModalType, promo?: ICurrentPromoList) => void;
  closeTipsModal: () => void;
  // Mystery Box Modal
  openMysteryBoxModal: () => void;
  closeMysteryBoxModal: () => void;
  // Theme Modal
  openThemeSwitcherModal: () => void;
  closeThemeSwitcherModal: () => void;
  // Special Offers Modal
  openSpecialOffersModal: () => void;
  closeSpecialOffersModal: () => void;

  openDoubleOrNothingModal: (modalData: DoubleOrNothingModalProps["modalData"]) => void;
  closeDoubleOrNothingModal: () => void;

  openDoubledUpModal: (donData: IDoubledUpProps) => void;
  closeDoubledUpModal: () => void;

  openNothingModal: (don_record_id: string) => void;
  closeNothingModal: () => void;

  openBoostModal: (modalData: any) => void;
  closeBoostModal: () => void;
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
      {currentTipsModal === "limitedOffers" && currentPromo && <LimitedOffersHelpModal open={isTipsModalOpen} onClose={handleCloseTipsModal} currentPromo={currentPromo} />}
      {currentTipsModal === "doubleOrNothing" && currentPromo && <DoubleOrNothingHelpModal open={isTipsModalOpen} onClose={handleCloseTipsModal} currentPromo={currentPromo} />}
      {currentTipsModal === "cryptoThursdayBouns" && currentPromo && <ThursdayBounsHelpModal open={isTipsModalOpen} onClose={handleCloseTipsModal} currentPromo={currentPromo} />}
      {currentTipsModal === "sundaySuperBouns" && currentPromo && <SundaySuperHelpModal open={isTipsModalOpen} onClose={handleCloseTipsModal} currentPromo={currentPromo} />}


      <BonusDepositHelpModal isOpen={currentTipsModal === "depositBonus"} onClose={handleCloseTipsModal} />

      {/* Mystery Box Modal */}
      <MysteryBoxModal isOpen={isMysteryBoxOpen} onClose={closeMysteryBoxModal} />

      {/* Special Offers Modal */}
      <SpecialOffersModal
        open={isSpecialOffersOpen}
        onClose={closeSpecialOffersModal}
      />

      {/* Double Or Nothing Related pop-ups */}
      {isDoubleOrNothingOpen && doubleOrNothingModalData && doubleOrNothingModalData?.don_record_id && (
        <DoubleOrNothingModal open={isDoubleOrNothingOpen} onClose={closeDoubleOrNothingBase} modalData={doubleOrNothingModalData} />
      )}
      {isDoubledUpOpen && doubledUpModalData && (
        <DoubledUp open={isDoubledUpOpen} onClose={closeDoubledUpModal} donData={doubledUpModalData} />
      )}
      {isNothingOpen && nothingModalData && (
        <Nothing open={isNothingOpen} onClose={closeNothingModal} don_record_id={nothingModalData} />
      )}
      {isBoostOpen && boostModalData && (
        <Boost open={isBoostOpen} onClose={closeBoostModal} modalData={boostModalData} />
      )}
      {/* Double Or Nothing Related pop-ups */}

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