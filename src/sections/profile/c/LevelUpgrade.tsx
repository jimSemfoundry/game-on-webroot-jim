import { useVipNextLevelData } from "@/hooks/api/useAuth.ts";
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { FastFinanceLink, FastViewDataLink } from "@/sections/profile/c/FastFinanceLink.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { useTranslation } from "react-i18next";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import Decimal from "decimal.js";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";

export function LevelUpgrade({ onClick }: { onClick: () => void }) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { t } = useTranslation();

  const { status } = useAuth();

  /**
   * 下一级升级数据
   */
  const { data: vip, isLoading } = useVipNextLevelData();

  const fullXP = useMemo(() => Number(vip?.data?.xp || 0), [vip]);

  const userXP = useMemo(() => Number(status?.xp || 0), [status]);

  const progress = useMemo(() => Decimal(Math.min((userXP / (fullXP || 1)) * 100, 100)).toFixed(2, Decimal.ROUND_DOWN).toString(), [userXP, fullXP]);

  // 计算升级所需经验值
  const xpToNextVip = useMemo(() => {
    if (!fullXP || !status) return [0, 0];
    const a = Decimal(fullXP);
    const b = Decimal(userXP);
    const c = a.sub(b);
    return [
      b.div(a).toNumber(), // 当前XP进度
      c.toDP(0, Decimal.ROUND_UP).toNumber()
    ];
  }, [fullXP, userXP]);

  return (
    <div className="h-full flex flex-col justify-between z-10">
      <img src={`/images/vip/levels/${status?.vip}.png`}
           className="absolute right-3 top-0 -translate-y-1/3 h-18 md:h-35"
           alt="" />
      <div onClick={onClick}>
        <p className="font-extrabold text-2xl sm:text-4xl">VIP {status?.vip}</p>
        <SmallLoading loading={isLoading} className={"!bg-base-200 w-30"} content={<p
          className="font-semibold text-xs sm:text-xl text-base-content/50">
          {t("vip:your_vip_progress")}: {progress}%</p>}></SmallLoading>
      </div>
      <div className="flex items-center flex-1 my-4 sm:my-0">
        <progress
          className="progress progress-primary h-1.5 sm:h-2.5"
          value={progress}
          max={100}
        />
      </div>
      <SmallLoading loading={isLoading} className={"!bg-base-200 w-30"} content={<div
        className="flex justify-between font-semibold text-xs sm:text-xl text-base-content/50">
        {t("vip:lessThan")} {xpToNextVip[1]}XP to VIP {(status?.vip || 0) + 1}
      </div>}></SmallLoading>

      {/* 唤起存款取款操作 */}
      <DisplayContent status={isMobile}><FastFinanceLink /></DisplayContent>

      {/* 快捷跳转操作 */}
      <DisplayContent status={isMobile}><FastViewDataLink /></DisplayContent>
    </div>
  );
}
