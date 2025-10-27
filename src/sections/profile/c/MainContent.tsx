import { useState } from "react";
import { NavScrollBar, TBar } from "@/sections/profile/c/NavScrollBar.tsx";
import { DisplayContent } from "@/components/modal/UserFinanceModal";
import { BetHistory, Dashboard, Security, Rollover, Legal, Transactions, ProfileMsg } from "@/sections/profile";

export const MainContent = () => {
  const [navIndex, setNavIndex] = useState<TBar>("Dashboard");

  return (
    <>
      <NavScrollBar setNavIndex={setNavIndex} />
      <DisplayContent status={navIndex === "Dashboard"}><Dashboard /></DisplayContent>
      <DisplayContent status={navIndex === "Transactions"}><Transactions /></DisplayContent>
      <DisplayContent status={navIndex === "Rollover"}><Rollover /></DisplayContent>
      <DisplayContent status={navIndex === "BetHistory"}><BetHistory /></DisplayContent>
      <DisplayContent status={navIndex === "Security"}><Security /></DisplayContent>
      <DisplayContent status={navIndex === "Profile"}><ProfileMsg /></DisplayContent>
      <DisplayContent status={navIndex === "Legal"}><Legal /></DisplayContent>
    </>
  );
};
