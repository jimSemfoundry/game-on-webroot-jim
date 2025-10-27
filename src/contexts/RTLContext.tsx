import { useRTL } from "@/hooks/useRTL";
import React, { createContext, useContext } from "react";

interface RTLContextType {
  isRTL: boolean;
  direction: "ltr" | "rtl";
  checkIsRTL: (language: string) => boolean;
  RTL_LANGUAGES: string[];
}

const RTLContext = createContext<RTLContextType>({
  isRTL: false,
  direction: "ltr",
  checkIsRTL: () => false,
  RTL_LANGUAGES: [],
});

export const useRTLContext = () => {
  const context = useContext(RTLContext);
  if (!context) {
    throw new Error("useRTLContext must be used within RTLProvider");
  }
  return context;
};

interface RTLProviderProps {
  children: React.ReactNode;
}

export const RTLProvider: React.FC<RTLProviderProps> = ({ children }) => {
  const rtlState = useRTL();

  return <RTLContext.Provider value={rtlState}>{children}</RTLContext.Provider>;
};
