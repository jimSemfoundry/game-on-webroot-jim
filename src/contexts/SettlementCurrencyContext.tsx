/**
 * 结算货币上下文 (SettlementCurrencyContext)
 *
 * 这个上下文管理用户的结算货币偏好。系统中有两个货币概念：
 *
 * 1. **结算币**: 用户实际充值、提现、游戏投注的货币，可以是法币或加密货币（如USDT、BTC、ETH、USD、CNY等）
 * 2. **显示币/游戏币**: 用户选择的显示和游戏单位（如PHP、VND、USD等）
 *
 * 工作原理：
 * - 用户选择USDT作为结算货币
 * - 用户的钱包余额以USDT为单位进行存储和计算
 * - 充值、提现、游戏投注都使用USDT进行实际结算
 * - 显示时可以通过汇率转换为用户选择的显示货币
 *
 * 主要功能：
 * 1. 管理用户选择的结算货币（支持localStorage持久化）
 * 2. 自动与登录用户的currency设置同步
 * 3. 提供结算货币的更新和持久化功能
 *
 * @example
 * ```typescript
 * // 获取用户的结算货币偏好
 * const { selectedCurrency, setSelectedCurrency } = useSettlementCurrency();
 *
 * // 更新结算货币
 * setSelectedCurrency('USDT');
 * ```
 */

import { authService } from "@/services/authService";
import { getBrowserCurrency } from "@/utils/currency";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useSupportedSettlementCurrencies } from "@/hooks/api/usePublic.ts";
import { useSupportedCurrencyV2 } from "@/components/modal/UserFinanceModal/helper.ts";

interface SettlementCurrencyContextType {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  updateSettlementCurrency: (currency: string) => Promise<void>;
  isLoading: boolean;
}

const SettlementCurrencyContext = createContext<SettlementCurrencyContextType | undefined>(undefined);

interface SettlementCurrencyProviderProps {
  children: ReactNode;
  defaultCurrency?: string;
}

const SETTLEMENT_CURRENCY_STORAGE_KEY = "game-on-settlement-currency";

export const SettlementCurrencyProvider: React.FC<SettlementCurrencyProviderProps> = (
  {
    children,
    defaultCurrency
  }) => {
  const { user, setUser } = useAuth();

  const { data: settlementCurrencies } = useSupportedSettlementCurrencies();

  // FIXME 目的：用户切换结算币的时候，把币种同步到存款页面的默认币种选择
  const { refetch: refetchCurrencyV2  } = useSupportedCurrencyV2()

  // 初始化选择的结算货币
  const [selectedCurrency, setSelectedCurrencyState] = useState<string>(() => {
    // 优先级: defaultCurrency -> localStorage -> 浏览器检测 -> PHP
    if (defaultCurrency) return defaultCurrency;

    try {
      const stored = localStorage.getItem(SETTLEMENT_CURRENCY_STORAGE_KEY);
      if (stored) return stored;
    } catch (error) {
      console.warn("Failed to read settlement currency from localStorage:", error);
    }

    // 使用浏览器检测作为fallback
    return getBrowserCurrency();
  });

  const [isLoading, setIsLoading] = useState(false);

  // 设置货币并持久化（仅本地更新）
  const setSelectedCurrency = (currency: string) => {
    setSelectedCurrencyState(currency);
    try {
      localStorage.setItem(SETTLEMENT_CURRENCY_STORAGE_KEY, currency);
    } catch (error) {
      console.warn("Failed to save settlement currency to localStorage:", error);
    }
  };

  // 更新结算货币（本地+后端同步）
  const updateSettlementCurrency = useCallback(async (currency: string): Promise<void> => {
    if (isLoading) return;

    /**
     * FIXME:
     *  如果用户切换的“结算币”不在服务端提供的/api/Currency列表里：
     *  1. 禁止数据提交
     *  2. 不去设置备用默认值
     */

    const whether_currency_was_matched = (settlementCurrencies?.data ?? []).some((c: { currency: string }) => c.currency.toLowerCase() === currency?.toLowerCase());

    if (!whether_currency_was_matched) {
      console.info(`The provided currency was not matched: ${currency}`);
      return
    }

    try {
      setIsLoading(true);

      // 先更新本地状态
      setSelectedCurrency(currency);

      // 如果用户已登录，同步到后端
      if (user) {
        const response = await authService.updateUserSettlementCurrency(currency);

        // FIXME 目的：用户切换结算币的时候，把币种同步到存款页面的默认币种选择
        void refetchCurrencyV2()

        // 乐观更新 同步本地缓存数据
        setUser({ ...user, currency  })

        if (response.code !== 0) {
          throw new Error(response.msg || "Failed to update settlement currency");
        }

        console.log("Settlement currency updated successfully:", currency);
      }
    } catch (error) {
      console.error("Failed to update settlement currency:", error);
      throw error; // 让调用方处理错误
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, settlementCurrencies?.data, user, refetchCurrencyV2]);

  // 当用户登录或用户结算货币设置更新时，同步到本地选择
  useEffect(() => {
    if (user?.currency && user.currency !== selectedCurrency) {
      console.log("Syncing user settlement currency setting to context:", user.currency);
      setSelectedCurrency(user.currency);
    }
  }, [user?.currency]); // 只依赖user.currency，避免循环

  const contextValue: SettlementCurrencyContextType = {
    selectedCurrency,
    setSelectedCurrency,
    updateSettlementCurrency,
    isLoading
  };

  return <SettlementCurrencyContext.Provider value={contextValue}>{children}</SettlementCurrencyContext.Provider>;
};

export const useSettlementCurrency = (): SettlementCurrencyContextType => {
  const context = useContext(SettlementCurrencyContext);
  if (!context) {
    throw new Error("useSettlementCurrency must be used within a SettlementCurrencyProvider");
  }
  return context;
};
