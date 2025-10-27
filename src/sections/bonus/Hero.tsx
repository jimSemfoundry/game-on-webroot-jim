import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useUserClaimBonus } from "@/hooks/api/useAuth";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { BonusCollectorCard } from "./collector";
import { BonusDetailsModal } from "./shared/bonus-details-modal";

interface BonusHeroProps {
  totalBonusClaimed?: number; // 可选，用作fallback
}

export function Hero({ totalBonusClaimed = 0 }: BonusHeroProps) {
  const { t } = useTranslation();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { isInitialized } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // 获取用户的奖励详情数据
  const { data: claimBonusData, isLoading: isDataLoading } = useUserClaimBonus();
  
  // 优化的loading状态：未初始化或数据加载中时显示骨架屏
  const isLoading = !isInitialized || isDataLoading;
  
  // 计算总的已领取奖励金额（所有 bonus 的 sum 总和，统一转换为用户显示货币）
  const calculatedTotalClaimed = useMemo(() => {
    if (!claimBonusData?.data?.data || !Array.isArray(claimBonusData.data.data)) {
      return totalBonusClaimed;
    }
    
    // 将所有 bonus 的 sum 值累加，转换为 USDT（作为基准货币）
    const totalInUSD = claimBonusData.data.data.reduce((acc: number, item: any) => {
      // 这里假设后端已经统一转换为 USDT，如果不同货币需要转换，可以使用 convertToUSD
      return acc + (parseFloat(item.sum) || 0);
    }, 0);
    
    return totalInUSD;
  }, [claimBonusData?.data?.data, totalBonusClaimed]);

  return (
    <div
      className="flex flex-col gap-4 px-5 pt-3 sm:px-12 relative overflow-hidden sm:bg-base-200/50 sm:min-h-[385px] sm:rounded-box sm:justify-center select-none"
      style={{
        backgroundImage: isMobile
          ? undefined
          : `repeating-linear-gradient(
          -45deg,
          oklch(from var(--color-base-200) l c h / 0.1) 0px,
          oklch(from var(--color-base-200) l c h / 0.1) 6px,
          oklch(from var(--color-base-300) l c h / 0.3) 6px,
          oklch(from var(--color-base-300) l c h / 0.3) 12px,
          oklch(from var(--color-base-200) l c h / 0.1) 12px,
          oklch(from var(--color-base-200) l c h / 0.1) 18px
        )`,
      }}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-4 w-full">
          <div className="h-[158px] sm:h-auto flex justify-center flex-col p-3 gap-1 sm:gap-2">
            <p className="text-sm sm:text-xl font-semibold text-base-content/50">
              <span className="block sm:inline">Lifetime Bonus </span>
              <span className="block sm:inline">Claimed</span>
            </p>
            <p className="text-2xl sm:text-5xl text-base-content font-bold z-10">
              {isLoading ? (
                <span className="skeleton w-32 h-8 sm:h-12 rounded"></span>
              ) : (
                formatWithConversion(calculatedTotalClaimed, "USDT", { showSymbol: true, showCode: false }).formatted
              )}
            </p>
            <button 
              className="font-semibold text-base-content/50 flex items-center gap-2 sm:cursor-pointer hover:text-base-content/70 transition-colors"
              onClick={() => setIsDetailsModalOpen(true)}
            >
              <span className="text-sm sm:text-xl">{t("bonus:details")}</span>
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
            {/* CollectorCard - 只在PC端显示 */}
            {!isMobile && (
              <div className="absolute bottom-6 left-6">
                <BonusCollectorCard className="relative z-10" />
              </div>
            )}
          </div>
          <img
            src="/images/illustrations/b12dd722cafd02781363b2dbaaf5c18afa9be2d3.png"
            alt=""
            className="object-cover w-[512px] object-top hidden sm:block absolute left-[224px] rtl:left-auto rtl:right-[224px] top-0"
          />
        </div>
        <img
          src="/images/illustrations/b12dd722cafd02781363b2dbaaf5c18afa9be2d3.png"
          alt=""
          className="absolute top-3 -right-2 rtl:-right-auto rtl:-left-2 object-cover w-[233px] object-top h-[158px] sm:hidden"
        />
      </div>

      <BonusDetailsModal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
      />
    </div>
  );
}
