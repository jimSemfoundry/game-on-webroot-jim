import { useVipNextLevelData } from "@/hooks/api/useAuth.ts";
import Decimal from "decimal.js";
import { useAuth } from "@/contexts/AuthContext.tsx";

export function LevelUpgrade() {
  const { status } = useAuth();

  /**
   * 下一级升级数据
   */
  const { data: vip } = useVipNextLevelData();

  return (
    <div className="flex flex-col bg-base-400 p-3 relative rounded-lg border-1 border-base-100">
      <img src={`/icons/vip-level/${status?.vip}.png`} className="absolute right-3 top-0 -translate-y-1/3 w-10"
           alt="" />
      <div>
        <p className="font-extrabold text-xl">VIP {status?.vip}</p>
        <div className='flex my-3'>
          <progress
            className="progress progress-primary h-1.5"
            value={status?.xp || 0}
            max={vip?.data?.xp}
          />
        </div>
        <p
          className="font-semibold text-xs text-base-content/50">Progress: {Decimal(status?.xp || 0).div(vip?.data?.xp || 1).mul(100).toFixed(2)}%</p>
      </div>
    </div>
  );
}
