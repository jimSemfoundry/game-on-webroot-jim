import Iconify from "@/components/iconify";
import { Tabs as TabsComponent } from "@/components/ui/Tabs";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { BonusAchievementsModal } from "./achievements";
import { useAuth } from "@/contexts/AuthContext";
import { useBonusSwitch } from "@/hooks/api/useAuth.ts";

interface BonusTabsProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ value, onChange, className }: BonusTabsProps) {
  const { t } = useTranslation();
  const [showAchievements, setShowAchievements] = useState(false);
  const { isAuthenticated } = useAuth();

  const { switchData } = useBonusSwitch();

  const allTabs = [
    {
      value: "dashboard",
      label: (
        <div className="flex items-center gap-2 justify-center rounded-field min-w-[48px] px-2 h-8 sm:h-12 py-1 font-semibold">
          <Iconify icon="custom:home" width={14} height={14} />
          <span className="text-xs sm:text-base whitespace-nowrap">{t("bonus:dashboard")}</span>
        </div>
      ),
    },
    {
      value: "achievements",
      label: (
        <div className="flex items-center gap-2 justify-center rounded-field min-w-[48px] px-2 h-8 sm:h-12 py-1 font-semibold">
          <Iconify icon="custom:latest-win" width={14} height={14} />
          <span className="text-xs sm:text-base whitespace-nowrap">{t("bonus:achievements")}</span>
        </div>
      ),
    },
  ].filter((x) => switchData?.bonus_switch?.achievement === 0 ? x?.value !== 'achievements' : true);

  // 根据登录状态过滤 tabs - 未登录时隐藏 achievements
  const tabs = isAuthenticated ? allTabs : allTabs.filter(tab => tab.value !== "achievements");

  // Handle tab click - dashboard changes content, others open modals
  const handleTabClick = (tabValue: string) => {
    if (tabValue === "achievements") {
      setShowAchievements(true);
    } else {
      // Only dashboard changes the tab value now
      onChange(tabValue);
    }
  };

  return (
    <>
      <TabsComponent 
        tabs={tabs} 
        size="sm" 
        value={value} 
        onChange={handleTabClick} 
        className={className} 
        layoutId="bonus-tabs" 
      />
      
      {/* Modals */}
      <BonusAchievementsModal 
        isOpen={showAchievements} 
        onClose={() => setShowAchievements(false)} 
      />
    </>
  );
}
