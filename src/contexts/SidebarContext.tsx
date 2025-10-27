import React, { createContext, useContext, useEffect, useState } from "react";

type SidebarMode = "mini" | "expanded";

interface SidebarContextType {
  // Desktop sidebar state
  mode: SidebarMode;
  toggleMode: () => void;
  setMode: (mode: SidebarMode) => void;

  // Mobile drawer state
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  // Responsive state
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<SidebarMode>("expanded");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Auto-close drawer when switching to desktop
  useEffect(() => {
    if (!isMobile && isDrawerOpen) {
      setIsDrawerOpen(false);
    }
  }, [isMobile, isDrawerOpen]);

  const toggleMode = () => {
    setMode((prev) => (prev === "mini" ? "expanded" : "mini"));
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  const value: SidebarContextType = {
    mode,
    toggleMode,
    setMode,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    isMobile,
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
