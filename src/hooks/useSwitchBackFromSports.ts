import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext";
import { authService } from "@/services/authService.ts";
import { ESport } from "@/sections/dollars/components.tsx";

// TODO: 记录上一次的路由
let prePath = typeof window !== "undefined" ? window.location.pathname : "";

export const useSwitchBackFromSports = () => {
  const location = useLocation();

  const { selectedCurrency, updateSettlementCurrency } = useSettlementCurrency();

  useEffect(() => {
    const prev = prePath;
    const next = location.pathname;

    prePath = next;

    const isInSports = next.startsWith("/sports");
    const wasInSports = prev.startsWith("/sports");

    // 只在"刚离开 /sports"那一刻触发
    if (!wasInSports || isInSports) return;

    if (selectedCurrency !== ESport.TOKEN) return;

    try {
      // 切换彩金币种为其他结算币种
      authService.getCurrencyOtherThanBonusCoin()
        .then((currency) => {
          if (currency?.data?.currency) void updateSettlementCurrency(currency?.data?.currency);
        });
    } catch (e) {
    }
  }, [location.pathname, selectedCurrency, updateSettlementCurrency]);
};
