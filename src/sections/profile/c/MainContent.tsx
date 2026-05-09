import { useState } from "react";
import { NavScrollBar, TBar } from "@/sections/profile/c/NavScrollBar.tsx";
import { BetHistory, Dashboard, Security, Rollover, Legal, Transactions, ProfileMsg, FreeSpins } from "@/sections/profile";

export const MainContent = () => {
  const [navIndex, setNavIndex] = useState<TBar>("dashboard");

  return (
    <>
      <NavScrollBar setNavIndex={setNavIndex} />
      {navIndex === "dashboard" && <Dashboard />}
      {navIndex === "transactions" && <Transactions />}
      {navIndex === "rollover" && <Rollover />}
      {navIndex === "free-spin" && <FreeSpins />}
      {navIndex === "bet-history" && <BetHistory />}
      {navIndex === "security" && <Security />}
      {navIndex === "profile" && <ProfileMsg />}
      {/* TODO: 解决多语言导致的刷新页面尝试获取目标内容问题 */}
      <div className={navIndex === "legal" ? "block" : "hidden"}><Legal /></div>
    </>
  );
};
