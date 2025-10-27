import { useVipNextLevelData } from "@/hooks/api/useAuth.ts";
import { useMemo } from "react";
import Decimal from "decimal.js";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { DisplayContent } from "@/components/modal/UserFinanceModal";
import { FastFinanceLink, FastViewDataLink } from "@/sections/profile/c/FastFinanceLink.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";

export function LevelUpgrade({ onClick }: { onClick: () => void }) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { status } = useAuth();

  /**
   * 下一级升级数据
   */
  const { data: vip } = useVipNextLevelData();

  /**
   * 计算升级所需经验值
   */
  const nextXP = useMemo(() => {
    if (!vip?.data?.xp || !status) return "";
    const a = vip?.data?.xp; // 下一级等级经验
    const b = status?.xp || 0; // 当前用户等级经验
    return Decimal(a).sub(b).floor().toString();
  }, [vip, status]);

  return (
    <div className="h-full flex flex-col justify-between z-10">
      <img src={`/icons/vip-level/${status?.vip}.png`} className="absolute right-3 top-0 -translate-y-1/3 h-18 md:h-35"
           alt="" />
      <div onClick={onClick}>
        <p className="font-extrabold text-2xl sm:text-4xl">VIP {status?.vip}</p>
        <p className="font-semibold text-xs sm:text-xl text-base-content/50">Your VIP
          Progress: {Decimal(status?.xp || 0).div(vip?.data?.xp || 1).mul(100).toFixed(2)}%</p>
      </div>
      <div className="flex items-center flex-1 my-4 sm:my-0">
        <progress
          className="progress progress-primary h-1.5 sm:h-2.5"
          value={status?.xp || 0}
          max={vip?.data?.xp}
        />
      </div>
      <div className="flex justify-between font-semibold text-xs sm:text-xl text-base-content/50">
        <span>{Number(nextXP)} XP Left</span>
        <span>{parseInt(String(status?.xp || 0))}/{parseInt(vip?.data?.xp)} XP</span>
      </div>

      {/* 唤起存款取款操作 */}
      <DisplayContent status={isMobile}><FastFinanceLink /></DisplayContent>

      {/* 快捷跳转操作 */}
      <DisplayContent status={isMobile}><FastViewDataLink /></DisplayContent>
    </div>
  );
}
