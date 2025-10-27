import Iconify from "@/components/iconify";
import { Tabs } from "@/components/ui/Tabs";
import { cn } from "@/utils/cn";
import { useTranslation } from "react-i18next";
import React from "react";

export type TabValue = "dashboard" | "transactions" | "rollover" | "betHistory" | "security" | "settings" | "legal";

type Props = {
  value: TabValue;
  onChange: (value: TabValue) => void;
  className?: string;
};

export const ProfileTabs = ({ value, onChange, className }: Props) => {
  const { t } = useTranslation();

  const tabs = [
    {
      value: "dashboard",
      label: (
        <div className="flex items-center gap-2 justify-center rounded-field min-w-[48px] px-2 sm:px-3 h-8 sm:h-12 py-1 font-semibold">
          <Iconify icon="custom:home" />
          <p>{t("profile:dashboard")}</p>
        </div>
      ),
    },
    {
      value: "transactions",
      label: (
        <div className="flex items-center gap-2 justify-center rounded-field min-w-[48px] px-2 sm:px-3 h-8 sm:h-12 py-1 font-semibold">
          <Iconify icon="custom:transactions" />
          <p>{t("profile:transactions")}</p>
        </div>
      ),
    },
    {
      value: "rollover",
      label: (
        <div className="flex items-center gap-2 justify-center rounded-field min-w-[48px] px-2 sm:px-3 h-8 sm:h-12 py-1 font-semibold">
          <Iconify icon="custom:rollover" />
          <p>{t("profile:rollover")}</p>
        </div>
      ),
    },
    {
      value: "betHistory",
      label: (
        <div className="flex items-center gap-2 justify-center rounded-field min-w-[48px] px-2 sm:px-3 h-8 sm:h-12 py-1 font-semibold">
          <Iconify icon="custom:bet-history" />
          <p>{t("profile:betHistory")}</p>
        </div>
      ),
    },
    {
      value: "security",
      label: (
        <div className="flex items-center gap-2 justify-center rounded-field min-w-[48px] px-2 sm:px-3 h-8 sm:h-12 py-1 font-semibold">
          <Iconify icon="custom:security" />
          <p>{t("profile:security")}</p>
        </div>
      ),
    },
    {
      value: "profile",
      label: (
        <div className="flex items-center gap-2 justify-center rounded-field min-w-[48px] px-2 sm:px-3 h-8 sm:h-12 py-1 font-semibold">
          <Iconify icon="custom:profile" />
          <p>{t("profile:profile")}</p>
        </div>
      ),
    },
    {
      value: "legal",
      label: (
        <div className="flex items-center gap-2 justify-center rounded-field min-w-[48px] px-2 sm:px-3 h-8 sm:h-12 py-1 font-semibold">
          <Iconify icon="custom:legal" />
          <p>{t("profile:legal")}</p>
        </div>
      ),
    },
  ].filter(Boolean) as {
    value: TabValue;
    label: React.ReactNode;
  }[];

  const handleTabClick = (tabValue: string) => {
    onChange(tabValue as TabValue);
  };

  return <Tabs tabs={tabs} size="sm" value={value} onChange={handleTabClick} className={cn("bg-transparent gap-4 p-0", className)} layoutId="profile-tabs" />;
};
