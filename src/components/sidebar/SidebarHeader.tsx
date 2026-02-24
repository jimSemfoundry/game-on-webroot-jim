import { useSidebar } from "@/contexts/SidebarContext";
import Iconify from "../iconify/iconify";
import { SmoothTabs } from "../ui/SmoothTabs";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";

export const SidebarHeader = () => {
  const location = useLocation();
  const [active, setActive] = useState<"casino" | "sport">(() => (location.pathname.startsWith("/sports") ? "sport" : "casino"));
  const { mode, setActiveTab } = useSidebar();
  const isMini = mode === "mini";
  const navigate = useNavigate();

  useEffect(() => {
    const newTab = location.pathname.startsWith("/sports") ? "sport" : "casino";
    setActive(newTab);
    setActiveTab(newTab); // 同步更新 SidebarContext
  }, [location.pathname, setActiveTab]);

  const { t } = useTranslation(['explore']);

  const handleChange = (value: string) => {
    const newTab = value as "casino" | "sport";
    setActive(newTab);
    setActiveTab(newTab); // 同步更新 SidebarContext
    if (value === "casino") {
      navigate({ to: "/casino", search: { openLogin: undefined, openSignUp: undefined, redirect: undefined, startapp: undefined, openFinance: undefined } });
    } else if (value === "sport") {
      navigate({ to: "/sports", search: { "bt-path": "/" } });
    }
  };

  const items = [
    {
      id: "casino",
      label: (
        <div className="flex items-center gap-x-2 whitespace-nowrap">
          <Iconify icon="custom:casino" className="w-5 h-5" />
          {!isMini && <span>{t("explore:casino")}</span>}
        </div>
      ),
    },
    {
      id: "sport",
      label: (
        <div className="flex items-center gap-x-2 whitespace-nowrap">
          <Iconify icon="custom:sports" className="w-5 h-5" />
          {!isMini && <span>{t("explore:sport")}</span>}
        </div>
      ),
    },
  ];

  return (
    <div className={`flex items-center justify-center overflow-hidden ${isMini ? "" : "w-full"}`}>
      <SmoothTabs
        size={'md'}
        items={items}
        value={active}
        onChange={handleChange}
        layoutId={isMini ? "mini-sidebar" : "desktop-sidebar"}
        orientation={isMini ? "vertical" : "horizontal"}
        className={isMini ? "w-12" : "w-full"}
      />
    </div>
  );
};
