import { useState } from "react";
import { NavScrollBar, TBar } from "@/sections/profile/c/NavScrollBar.tsx";
import { BetHistory, Dashboard, Security, Rollover, Legal, Transactions, ProfileMsg, FreeSpins } from "@/sections/profile";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

export const MainContent = () => {
  const [navIndex, setNavIndex] = useState<TBar>("dashboard");

  return (
    <>
      <NavScrollBar setNavIndex={setNavIndex} />
      <DisplayContent status={navIndex === "dashboard"}><Dashboard /></DisplayContent>
      <DisplayContent status={navIndex === "transactions"}><Transactions /></DisplayContent>
      <DisplayContent status={navIndex === "rollover"}><Rollover /></DisplayContent>
      <DisplayContent status={navIndex === "free-spin"}><FreeSpins /></DisplayContent>
      <DisplayContent status={navIndex === "bet-history"}><BetHistory /></DisplayContent>
      <DisplayContent status={navIndex === "security"}><Security /></DisplayContent>
      <DisplayContent status={navIndex === "profile"}><ProfileMsg /></DisplayContent>
      <DisplayContent status={navIndex === "legal"}><Legal /></DisplayContent>
    </>
  );
};
