import Iconify from "@/components/iconify";
import { useAuth } from "@/contexts/AuthContext";
import { checkVipAccess, getVipStatusText } from "./config";

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
  const { status } = useAuth();
  
  const userVipLevel = status?.vip || 0;
  const isUnlocked = checkVipAccess(userVipLevel, requiredLevel);
  const buttonText = getVipStatusText(userVipLevel, requiredLevel);

  return (
    <button 
      className={`btn btn-md px-0 w-20 max-w-20 btn-primary btn-soft ${className}`}
      disabled={!isUnlocked}
      onClick={isUnlocked ? onClick : undefined}
    >
      {!isUnlocked && <Iconify icon="custom:lock" />}
      <p>{buttonText}</p>
    </button>
  );
}