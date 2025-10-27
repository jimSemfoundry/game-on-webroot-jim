import { createContext, useContext } from "react";
import { SignInModal } from "../components/modal/SignInModal";
import { SignUpModal } from "../components/modal/SignUpModal";
import { useModal } from "../components/ui/Modal";

type AuthModalsContextType = {
  openSignInModal: () => void;
  closeSignInModal: () => void;
  openSignUpModal: () => void;
  closeSignUpModal: () => void;
};

const AuthModalsContext = createContext<AuthModalsContextType | undefined>(undefined);

export function AuthModalsProvider({ children }: { children: React.ReactNode }) {
  const { isOpen: isSignInOpen, openModal: openSignInModal, closeModal: closeSignInModal } = useModal();
  const { isOpen: isSignUpOpen, openModal: openSignUpModal, closeModal: closeSignUpModal } = useModal();

  return (
    <AuthModalsContext.Provider value={{ openSignInModal, closeSignInModal, openSignUpModal, closeSignUpModal }}>
      {children}
      <SignInModal isOpen={isSignInOpen} onClose={closeSignInModal} />
      <SignUpModal isOpen={isSignUpOpen} onClose={closeSignUpModal} />
    </AuthModalsContext.Provider>
  );
}

export const useAuthModals = () => {
  const context = useContext(AuthModalsContext);
  if (context === undefined) {
    throw new Error("useAuthModals must be used within an AuthModalsProvider");
  }
  return context;
};
