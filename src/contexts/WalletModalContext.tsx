import { createContext, useContext } from "react";
import { GameCurrencySelectModal } from "../components/modal/GameCurrencySelectModal";
import { useModal } from "../components/ui/Modal";

type WalletModalContextType = {
  openModal: () => void;
};

const WalletModalContext = createContext<WalletModalContextType | undefined>(undefined);

export function WalletModalProvider({ children }: { children: React.ReactNode }) {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <WalletModalContext.Provider value={{ openModal }}>
      {children}
      <GameCurrencySelectModal isOpen={isOpen} onClose={closeModal} />
    </WalletModalContext.Provider>
  );
}

export const useWalletModal = () => {
  const context = useContext(WalletModalContext);
  if (context === undefined) {
    throw new Error("useWalletModal must be used within a WalletModalProvider");
  }
  return context;
};
