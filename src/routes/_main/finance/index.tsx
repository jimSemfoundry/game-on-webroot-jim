import { createFileRoute } from "@tanstack/react-router";
import { InnerTabItems } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { useState, useEffect } from "react";
import { TabItemsType } from "@/contexts/ModalsContext.ts";
import { useTranslation } from "react-i18next";
import { InnerTabDisplay } from "@/components/modal/UserFinanceModal";
import { useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/finance/")({
  component: RouteComponent
});

function RouteComponent() {
  const { t } = useTranslation();
  const location = useLocation();

  const [tab, setTab] = useState<TabItemsType>("deposit");

  // 从 state 读取 activeTab 并设置初始 tab
  useEffect(() => {
    const state = location.state as { activeTab?: string } | null;
    if (state?.activeTab && ["deposit", "swap", "withdraw"].includes(state.activeTab)) {
      setTab(state.activeTab as TabItemsType);
    }
  }, [location.state]);

  return <div className="p-4 pb-20 sm:max-w-[460px] sm:pb-4 sm:m-auto sm:rounded-xl sm:overflow-hidden">
    <div className="flex justify-between">
      <InnerTabItems setTab={setTab} tab={tab} t={t} />
    </div>

    <InnerTabDisplay tab={tab} status={true} />
  </div>;
}
