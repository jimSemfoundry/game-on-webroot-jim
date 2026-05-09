import { Modal } from "@/components/ui/Modal";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useUserClaimBonus } from "@/hooks/api/useAuth";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/cn";
import Decimal from "decimal.js";

interface BonusDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 定义所有 bonus 类型及其显示顺序
const ALL_BONUS_TYPES = [
  // { key: "cashback", label: "bonus:daily_cashback" },
  // { key: "don_lose", label: "bonus:item.don_lose" }, // 归零
  // { key: "don_win", label: "bonus:item.don_win" }, // 翻倍
  // { key: "special_offer_thursday", label: "bonus:item.special_offer_thursday" }, // 加密周四奖励
  // { key: "conquest", label: "bonus:item.conquest_bonus" }, // 征服奖励
  // { key: "manual_bonus", label: "bonus:item.bonus_manual" }, // 手动奖励
  // { key: "BONUS", label: "bonus:item.dollars_bonus" }, // 奖金
  // { key: "special_offer_second_deposit", label: "bonus:item.special_offer_second_deposit" }, // 第二次充值奖励
  // { key: "special_offer_don_deposit", label: "bonus:item.special_offer_don_deposit" }, // 恢复奖金
  { key: "don", label: "bonus:item.don" }, // 征服奖励
  { key: "group", label: "bonus:item.group" },
  { key: "referral", label: "bonus:referral_bonus" },
  { key: "rakeback", label: "bonus:super_rakeback" },
  { key: "level_up", label: "vip:level_up_bonus" },
  { key: "promo_code", label: "bonus:promo_code" }, // 优惠码
  { key: "tournament", label: "bonus:tournament_reward" },
  { key: "achievement", label: "bonus:achievements" },
  { key: "buddy_balls", label: "buddyBalls:buddyBalls" }, // 幸运球
  { key: "free_spin_reward", label: "bonus:item.free_spin_reward" }, // 免费旋转奖金
  { key: "monday_vip_bonus", label: "bonus:item.monday_vip_bonus" }, // 周一VIP奖金
  { key: "special_offer_sunday", label: "bonus:item.special_offer_sunday" }, // 超级周天奖励
  { key: "vip_bonus_mystery_box", label: "bonus:mystery_box" },
  { key: "special_offer_first_deposit", label: "bonus:item.special_offer" } // 第一次充值奖励
] as const;

export function BonusDetailsModal({ isOpen, onClose }: BonusDetailsModalProps) {
  const { t } = useTranslation("vip");
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { data: bonusDetailsData, isLoading } = useUserClaimBonus();

  const bonusDetails = useMemo(() => {
    // 创建一个 Map 来存储 API 返回的数据，方便查找
    const apiDataMap = new Map<string, { sum: number; currency: string }>();

    if (bonusDetailsData?.data?.data && Array.isArray(bonusDetailsData.data.data)) {
      bonusDetailsData.data.data.forEach((item: any) => {
        apiDataMap.set(item.item, {
          sum: parseFloat(item.sum) || 0,
          currency: item.currency || "USDT"
        });
      });
    }

    // 创建完整的 bonus 列表，包含所有类型
    const completeList = ALL_BONUS_TYPES.map((bonusType: Record<string, any>) => {
      const apiData = apiDataMap.get(bonusType.key);

      let amount = 0;

      if (bonusType.key === "don") {
        const don_win = apiDataMap.get("don_win")?.sum ?? 0;
        const don_lose = apiDataMap.get("don_lose")?.sum ?? 0;
        amount = Decimal(don_win).plus(don_lose).toNumber();
      } else if (bonusType.key === "special_offer_first_deposit") {
        const special_offer_don_deposit = apiDataMap.get("special_offer_don_deposit")?.sum ?? 0;
        const special_offer_first_deposit = apiDataMap.get("special_offer_first_deposit")?.sum ?? 0;
        const special_offer_second_deposit = apiDataMap.get("special_offer_second_deposit")?.sum ?? 0;
        amount = Decimal(special_offer_don_deposit).plus(special_offer_first_deposit).plus(special_offer_second_deposit).toNumber();
      } else {
        amount = apiData?.sum || 0;
      }

      return {
        type: bonusType.key,
        label: bonusType.label,
        amount,
        currency: apiData?.currency || "USDT"
      };
    });

    return completeList;
  }, [bonusDetailsData]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("bonus:bonus_details")}
      className="bg-base-400 md:w-[600px] max-w-2xl hide-scrollbar"
    >
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: ALL_BONUS_TYPES.length }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-base-300 rounded-box">
                <div className="skeleton h-4 w-32 rounded"></div>
                <div className="skeleton h-4 w-20 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="grid grid-cols-2 gap-4 p-2  rounded-t-box">
              <p className="text-xs font-bold text-base-content/50 uppercase">{t("transaction:tableHeaders.type")}</p>
              <p
                className="text-xs font-bold text-base-content/50 uppercase text-right rtl:text-left">{t("transaction:tableHeaders.amount")}</p>
            </div>
            <div className="flex flex-col ">
              {bonusDetails.map((detail, index) => (
                // 使用显示货币偏好格式化金额（包含 0 值）
                <div
                  key={detail.type}
                  className={cn("flex gap-3 items-center justify-between px-2 rounded-md hover:bg-base-300/30 transition-colors h-8", index % 2 === 0 && "bg-base-300/50")}
                >
                  <p className="text-[11px] font-bold text-base-content/50 col-span-8 truncate">
                    {t(detail.label)}
                  </p>
                  <p className="text-xs font-bold text-base-content/50 text-right col-span-4">
                    {formatWithConversion(detail.amount, detail.currency, {
                      showCode: false,
                      minimizeDecimals: true
                    }).formatted}
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
