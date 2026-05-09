import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUserClaimBonus } from "@/hooks/api/useAuth";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
// import { BonusCollectorCard } from "./collector";
import { BonusDetailsModal } from "@/sections/bonus/shared";
import { CheckInCard } from "./check_in";

interface BonusHeroProps {
  type?: "totalBonus" | "achievementBonus";
  disabled?: boolean;
  totalBonusClaimed?: number; // 可选，用作fallback
}

const rewardsNotRequireStatistics = new Set([
  "don",
  "BONUS",
  "conquest",
  "bonus_manual",
  "special_offer_thursday"
]);

const bonusHeroImage = import.meta.env.VITE_BONUS_HERO_IMAGE || "/images/illustrations/b12dd722cafd02781363b2dbaaf5c18afa9be2d3.png";

export function Hero({ disabled, totalBonusClaimed = 0 }: BonusHeroProps) {
  const { t } = useTranslation("bonus");

  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const { isInitialized, isAuthenticated } = useAuth();

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // 获取用户的奖励详情数据
  const { data: claimBonusData, isLoading } = useUserClaimBonus();

  // 优化的loading状态：未初始化或数据加载中时显示骨架屏
  const loading = isAuthenticated && (!isInitialized || isLoading);

  // 计算总的已领取奖励金额（所有 bonus 的 sum 总和，统一转换为用户显示货币）
  const calculatedTotalClaimed = useMemo(() => {
    if (!claimBonusData?.data?.data || !Array.isArray(claimBonusData.data.data)) {
      return totalBonusClaimed;
    }

    // 将所有 bonus 的 sum 值累加，转换为 USDT（作为基准货币）
    return claimBonusData.data.data.reduce((acc: number, item: any) => {
      if (rewardsNotRequireStatistics.has(item.item)) return acc; // 不符合 => 跳过
      // 这里假设后端已经统一转换为 USDT，如果不同货币需要转换，可以使用 convertToUSD
      return acc + (parseFloat(item.sum) || 0);
    }, 0);
  }, [claimBonusData?.data?.data, totalBonusClaimed]);

  return (
    <div
      className="flex items-center justify-center rounded-box  sm:px-7 relative overflow-hidden bg-base-200 h-[209px] sm:h-[300px] sm:rounded-box sm:justify-center select-none">
      <div className="flex items-center w-full h-full z-100">
        <div className="flex flex-col justify-center p-3 gap-1 sm:gap-2">
          {(isAuthenticated && !disabled) && (
            <>
              <p className="text-sm sm:text-xl font-semibold text-base-content/50">
                <span className="block sm:inline">{t("bonus:lifetime_bonus")}</span>
                <span className="block sm:inline sm:ml-1">{t("bonus:claimed")}</span>
              </p>
              <p className="text-2xl sm:text-5xl text-base-content font-bold z-10">
                {loading
                  ? "0.00"
                  : formatWithConversion(calculatedTotalClaimed, "USDT", {
                    showSymbol: true,
                    showCode: false
                  }).formatted}
              </p>
              <button
                className="font-semibold text-base-content/50 flex items-center gap-2 sm:cursor-pointer hover:text-base-content/70 transition-colors"
                onClick={() => setIsDetailsModalOpen(true)}
              >
                <span className="text-sm sm:text-xl">{t("bonus:details")}</span>
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </>
          )}
          {(!isAuthenticated || disabled) && (
            <p
              className="text-2xl sm:text-5xl text-base-content font-black leading-6 sm:leading-11 whitespace-pre-line uppercase">
              <span className="text-base-content block">{t("bonus:enjoy")}</span>
              <span className="text-primary block">{t("casino:exclusive")}</span>
              <span className="text-primary">{t("bonus:rewards")}</span>
            </p>
          )}
        </div>
      </div>

      <div className="hidden sm:block z-100 sm:pr-10">
        <div className="w-[355px] rounded-2xl bg-base-300/50 p-2.5 hidden xl:block" >
          <CheckInCard />
        </div>
      </div>

      <img
        src={bonusHeroImage}
        alt=""
        className="object-cover w-auto h-full object-top hidden sm:block absolute left-1/2 -translate-x-1/2 top-0 z-50 rtl:rotate-y-180"
      />
      <img
        src={bonusHeroImage}
        alt=""
        className="absolute -right-8 rtl:right-auto rtl:-left-8 object-cover w-auto object-top h-full sm:hidden rtl:rotate-y-180 z-50"
      />
      <div
        className="absolute right-0 top-0 w-[209px] sm:w-[285px] h-full bg-gradient-to-b from-[#BEE100] to-[#00481A] rtl:rotate-y-180 rtl:right-auto rtl:left-0"
        style={{
          clipPath: "polygon(46% 0%, 100% 0%, 100% 100%, 0% 100%)"
        }}
      />

      <BonusDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
}
