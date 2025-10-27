import { Modal } from "@/components/ui/Modal";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useUserClaimBonus } from "@/hooks/api/useAuth";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface BonusDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 定义所有 bonus 类型及其显示顺序
const ALL_BONUS_TYPES = [
  { key: "rakeback", label: "bonus:super_rakeback" },
  { key: "cashback", label: "bonus:daily_cashback" },
  { key: "vip_bonus_mystery_box", label: "bonus:mystery_box" },
  { key: "level_up", label: "bonus:level_up_bonus" },
  { key: "achievement", label: "bonus:achievements" },
  { key: "conquest", label: "bonus:conquests" },
  { key: "tournament", label: "bonus:tournament_reward" },
  { key: "referral", label: "bonus:referral_bonus" },
  { key: "group", label: "bonus:team_commission" },
  { key: "calendar", label: "bonus:calendar_bonus" },
  { key: "free_spins", label: "bonus:free_spins" },
] as const;

export function BonusDetailsModal({ isOpen, onClose }: BonusDetailsModalProps) {
  const { t } = useTranslation();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { data: bonusDetailsData, isLoading } = useUserClaimBonus();

  const bonusDetails = useMemo(() => {
    // 创建一个 Map 来存储 API 返回的数据，方便查找
    const apiDataMap = new Map<string, { sum: number; currency: string }>();
    
    if (bonusDetailsData?.data?.data && Array.isArray(bonusDetailsData.data.data)) {
      bonusDetailsData.data.data.forEach((item: any) => {
        apiDataMap.set(item.item, {
          sum: parseFloat(item.sum) || 0,
          currency: item.currency || "USDT",
        });
      });
    }
    
    // 创建完整的 bonus 列表，包含所有类型
    const completeList = ALL_BONUS_TYPES.map((bonusType) => {
      const apiData = apiDataMap.get(bonusType.key);
      return {
        type: bonusType.key,
        label: bonusType.label,
        amount: apiData?.sum || 0,
        currency: apiData?.currency || "USDT",
      };
    });
    
    return completeList;
  }, [bonusDetailsData]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("bonus:bonus_details")}
      className="bg-base-400 md:w-[600px] max-w-2xl overflow-hidden"
    >
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[...Array(11)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-base-300 rounded-box">
                <div className="skeleton h-4 w-32 rounded"></div>
                <div className="skeleton h-4 w-20 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="grid grid-cols-2 gap-4 p-4 bg-base-300/50 rounded-t-box">
              <p className="text-sm font-semibold text-base-content/70 uppercase">{t("bonus:type")}</p>
              <p className="text-sm font-semibold text-base-content/70 uppercase text-right">{t("bonus:amount")}</p>
            </div>
            <div className="flex flex-col">
              {bonusDetails.map((detail) => (
                <div
                  key={detail.type}
                  className="grid grid-cols-2 gap-4 p-4 border-b border-base-300 last:border-b-0 hover:bg-base-300/30 transition-colors"
                >
                  <p className="text-sm font-medium text-base-content/80">
                    {t(detail.label)}
                  </p>
                  <p className="text-sm font-semibold text-base-content text-right">
                    {detail.amount > 0 
                      ? formatWithConversion(detail.amount, detail.currency, { showCode: false }).formatted 
                      : `${detail.currency} 0.00`
                    }
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
