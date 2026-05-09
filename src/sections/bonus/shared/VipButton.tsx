import Iconify from "@/components/iconify";
import { useAuth } from "@/contexts/AuthContext";
import { checkVipAccess, getVipStatusText } from "./config";
import { useTranslation } from "react-i18next";

interface VipButtonProps {
  requiredLevel: number;
  onClick?: () => void;
  className?: string;
  claimable?: boolean;
  useClaimStateWhenUnlocked?: boolean;
}

/**
 * VIP 按钮组件
 * 根据用户 VIP 等级与可领取状态显示不同按钮状态
 */
export function VipButton({ requiredLevel, onClick, className = "", claimable = false, useClaimStateWhenUnlocked = false }: VipButtonProps) {
  const { t } = useTranslation()
  const { status } = useAuth();

  const userVipLevel = status?.vip || 0;
  const isUnlocked = checkVipAccess(userVipLevel, requiredLevel);
  const showClaimState = useClaimStateWhenUnlocked && isUnlocked;
  const buttonText = showClaimState ? "bonus:claim" : getVipStatusText(userVipLevel, requiredLevel);
  const isDisabled = !isUnlocked || (showClaimState && !claimable);

  const variantClassName = (() => {
    if (showClaimState) {
      return claimable ? "btn-primary" : "btn-disabled";
    }

    return "btn-primary btn-soft";
  })();

  return (
    <button
      className={`btn ${variantClassName} h-10 min-h-10 min-w-20 w-auto px-3 font-bold btn-md sm:w-full sm:min-w-24 sm:max-w-none ${className}`}
      disabled={isDisabled}
      onClick={!isDisabled ? onClick : undefined}
    >
      {!isUnlocked && <Iconify icon="custom:lock" />}
      <p>{t(buttonText)}</p>
    </button>
  );
}
