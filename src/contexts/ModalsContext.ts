import { createContext } from "react";
import type { DoubleOrNothingModalProps } from "@/sections/double-or-nothing/DoubleOrNothing";
import type { IDoubledUpProps, ICurrentPromoList } from "@/types/double-or-nothing";

export type TabItemsType = "deposit" | "withdraw" | "swap" | `deposit_${string}` | `withdraw_${string}` | `swap_${string}`;

export type TipsModalType =
  | "superRakeback"
  | "dailyCashback"
  | "bonusCalendar"
  | "cannon"
  | "conquest"
  | "tournament"
  | "achievement"
  | "mysteryBox"
  | "luckyNumber"
  | "jester"
  | "limitedOffers"
  | "doubleOrNothing"
  | "sundaySuperBonus"
  | "cryptoThursdayBouns"
  | "depositBonus";

export type ModalsContextType = {
  openSignInModal: () => void;
  closeSignInModal: () => void;
  openSignUpModal: () => void;
  closeSignUpModal: () => void;
  openLanguageModal: () => void;
  openWalletModal: () => void;
  openBetSlipModal: (order: any) => void;
  closeBetSlipModal: () => void;
  openUserFinanceModal: () => void;
  openUserFinanceModalWithTab: (tab: TabItemsType) => void;
  closeUserFinanceModal: () => void;
  isUserFinanceOpen: boolean;
  userFinanceInitialTab: TabItemsType;
  setUserFinanceInitialTab: (tab: TabItemsType) => void;
  openTipsModal: (type: TipsModalType, promo?: ICurrentPromoList) => void;
  closeTipsModal: () => void;
  openMysteryBoxModal: () => void;
  closeMysteryBoxModal: () => void;
  openThemeSwitcherModal: () => void;
  closeThemeSwitcherModal: () => void;
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

export const ModalsContext = createContext<ModalsContextType | undefined>(undefined);
