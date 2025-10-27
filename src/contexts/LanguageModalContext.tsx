import { createContext, useContext } from "react";
import { LanguageSelectModal } from "../components/modal/LanguageSelectModal";
import { useModal } from "../components/ui/Modal";

type LanguageModalContextType = {
  openModal: () => void;
};

const LanguageModalContext = createContext<LanguageModalContextType | undefined>(undefined);

export function LanguageModalProvider({ children }: { children: React.ReactNode }) {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <LanguageModalContext.Provider value={{ openModal }}>
      {children}
      <LanguageSelectModal isOpen={isOpen} onClose={closeModal} />
    </LanguageModalContext.Provider>
  );
}

export const useLanguageModal = () => {
  const context = useContext(LanguageModalContext);
  if (context === undefined) {
    throw new Error("useLanguageModal must be used within a LanguageModalProvider");
  }
  return context;
};
