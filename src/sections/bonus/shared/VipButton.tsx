import Iconify from "@/components/iconify";
import { useAuth } from "@/contexts/AuthContext";
import { checkVipAccess, getVipStatusText } from "./config";
import { useTranslation } from "react-i18next";

interface VipButtonProps {
  requiredLevel: number;
  onClick?: () => void;
  className?: string;
}

/**
 * VIP 按钮组件
 * 根据用户 VIP 等级显示不同状态：
 * - 已解锁：显示 "Unlocked" 并可点击
 * - 未解锁：显示 "VIP X" 带锁图标，禁用状态
 */
export function VipButton({ requiredLevel, onClick, className = "" }: VipButtonProps) {
  const { t } = useTranslation()
  const { status } = useAuth();
  
  const userVipLevel = status?.vip || 0;
  const isUnlocked = checkVipAccess(userVipLevel, requiredLevel);
  const buttonText = getVipStatusText(userVipLevel, requiredLevel);

  return (
    <button 
      className={`btn btn-primary btn-soft h-10 min-h-10 text-sm min-w-20 w-auto max-w-20 px-2 font-bold sm:btn-md sm:w-full sm:min-w-24 sm:max-w-none sm:px-6 ${className}`}
      disabled={!isUnlocked}
      onClick={isUnlocked ? onClick : undefined}
    >
      {!isUnlocked && <Iconify icon="custom:lock" />}
      <p>{t(buttonText)}</p>
    </button>
  );
}
