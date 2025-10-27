/**
 * 显示货币/游戏货币上下文 (DisplayCurrencyContext)
 *
 * 这个上下文管理用户的显示货币偏好。系统中有两个货币概念：
 *
 * 1. **结算币**: 用户实际充值、提现的货币，可以是法币或加密货币（如USDT、BTC、ETH、USD、CNY等）
 * 2. **显示币/游戏币**: 用户选择的显示和游戏单位（如PHP、VND、USD等）
 *
 * 工作原理：
 * - 用户选择PHP作为显示货币
 * - 用户充值的结算币（USDT、BTC、USD等）会通过实时汇率自动转换成PHP进行显示
 * - 进入游戏时，所有金额都以PHP为单位进行计算和显示
 * - 如果某个游戏不支持用户选择的显示货币，系统会通过 getUserDefaultCurrency 接口返回该游戏支持的默认货币
 * - 提现时再转换回对应的结算币
 *
 * 主要功能：
 * 1. 管理用户选择的显示货币/游戏货币（支持localStorage持久化）
 * 2. 自动与登录用户的currency_fiat设置同步
 * 3. 提供智能的货币转换和格式化功能（结算币 ↔ 显示币）
 * 4. 使用最新的汇率数据进行实时转换
 *
 * 使用建议：
 * - 大部分UI组件应该使用 useDisplayCurrency() 和 useDisplayCurrencyFormatter()
 * - formatWithConversion: 自动转换到用户选择的显示货币（如 BTC → PHP）
 * - formatWithoutConversion: 只格式化原始货币，不进行转换（如直接显示 BTC）
 * - 如果需要任意货币间转换而不依赖用户偏好，可以直接使用 @/hooks/useCurrency 中的 convertCurrency 和 formatCurrency
 *
 * @example
 * ```typescript
 * // 获取用户的显示货币/游戏货币偏好
 * const { selectedCurrency, setSelectedCurrency } = useDisplayCurrency();
 *
 * // 将结算币(USDT)自动转换并格式化为显示币(PHP)
 * const { formatWithConversion } = useDisplayCurrencyFormatter();
 * const formatted = formatWithConversion(100, 'USDT', { showSymbol: true }); // 显示为PHP金额
 * ```
 */

import { useAuth } from "@/contexts/AuthContext";
import { useCurrencyData } from "@/hooks/useCurrency";
import { authService } from "@/services/authService";
import type { Currency } from "@/types/currency";
import { getDisplayCurrency } from "@/utils/currency";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface DisplayCurrencyContextType {
  // 当前选择的显示货币
  selectedCurrency: string;
  // 设置显示货币（仅本地）
  setSelectedCurrency: (currency: string) => void;
  // 更新显示货币（本地+后端同步）
  updateDisplayCurrency: (currency: string) => Promise<void>;
  // 获取当前选择的货币信息
  getSelectedCurrencyInfo: () => Currency | undefined;
  // 是否正在加载
  isLoading: boolean;
  // 货币相关工具函数
  formatCurrency: ReturnType<typeof useCurrencyData>["formatCurrency"];
  convertCurrency: ReturnType<typeof useCurrencyData>["convertCurrency"];
  getCurrencySymbol: ReturnType<typeof useCurrencyData>["getCurrencySymbol"];
  groupedCurrencies: ReturnType<typeof useCurrencyData>["groupedCurrencies"];
  exchangeRates: ReturnType<typeof useCurrencyData>["exchangeRates"];
}

const DisplayCurrencyContext = createContext<DisplayCurrencyContextType | undefined>(undefined);

interface DisplayCurrencyProviderProps {
  children: ReactNode;
  defaultCurrency?: string;
}

const CURRENCY_STORAGE_KEY = "game-on-selected-currency";

export function DisplayCurrencyProvider({ children, defaultCurrency }: DisplayCurrencyProviderProps) {
  const { user } = useAuth();
  const {
    formatCurrency,
    convertCurrency,
    getCurrency,
    getCurrencySymbol,
    groupedCurrencies,
    exchangeRates,
    isLoading: currencyDataLoading,
  } = useCurrencyData();

  // 初始化选择的货币
  const [selectedCurrency, setSelectedCurrencyState] = useState<string>(() => {
    // 优先级: defaultCurrency -> localStorage -> 浏览器检测 -> USD
    if (defaultCurrency) return defaultCurrency;

    try {
      const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (stored) return stored;
    } catch (error) {
      console.warn("Failed to read currency from localStorage:", error);
    }

    return getDisplayCurrency();
  });

  // 设置货币并持久化（仅本地更新）
  const setSelectedCurrency = (currency: string) => {
    setSelectedCurrencyState(currency);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    } catch (error) {
      console.warn("Failed to save currency to localStorage:", error);
    }
  };

  // 更新显示货币（本地+后端同步）
  const updateDisplayCurrency = async (currency: string): Promise<void> => {
    try {
      // 先更新本地状态
      setSelectedCurrency(currency);

      // 如果用户已登录，同步到后端
      if (user) {
        const response = await authService.updateUserDisplayFiat(currency);

        if (response.code !== 0) {
          throw new Error(response.msg || "Failed to update display currency");
        }

        console.log("Display currency updated successfully:", currency);
      }
    } catch (error) {
      console.error("Failed to update display currency:", error);
      throw error; // 让调用方处理错误
    }
  };

  // 获取当前选择货币的详细信息
  const getSelectedCurrencyInfo = () => {
    return getCurrency(selectedCurrency);
  };

  // 验证选择的货币是否在支持列表中，如果不在则回退到USD
  useEffect(() => {
    if (!currencyDataLoading && groupedCurrencies.all.length > 0) {
      const isSupported = groupedCurrencies.all.some((c) => c.currency === selectedCurrency);
      if (!isSupported) {
        console.warn(`Currency ${selectedCurrency} is not supported, falling back to USD`);
        setSelectedCurrency("USD");
      }
    }
  }, [selectedCurrency, groupedCurrencies.all, currencyDataLoading]);

  // 当用户登录或用户货币设置更新时，同步到本地选择
  useEffect(() => {
    if (user?.currency_fiat && user.currency_fiat !== selectedCurrency) {
      console.log("Syncing user currency setting to context:", user.currency_fiat);
      setSelectedCurrency(user.currency_fiat);
    }
  }, [user?.currency_fiat]); // 只依赖user.currency_fiat，避免循环

  const contextValue: DisplayCurrencyContextType = {
    selectedCurrency,
    setSelectedCurrency,
    updateDisplayCurrency,
    getSelectedCurrencyInfo,
    isLoading: currencyDataLoading,
    formatCurrency,
    convertCurrency,
    getCurrencySymbol,
    groupedCurrencies,
    exchangeRates,
  };

  return <DisplayCurrencyContext.Provider value={contextValue}>{children}</DisplayCurrencyContext.Provider>;
}

export function useDisplayCurrency() {
  const context = useContext(DisplayCurrencyContext);
  if (context === undefined) {
    throw new Error("useDisplayCurrency must be used within a DisplayCurrencyProvider");
  }
  return context;
}

/**
 * 增强版货币格式化hook
 *
 * 提供智能的货币格式化功能，包括：
 * - 自动转换到用户选择的游戏货币
 * - 保持原始货币格式化（不转换）
 * - 访问用户的货币偏好设置
 *
 * @example
 * ```typescript
 * const { formatWithConversion, formatWithoutConversion } = useCurrencyFormatter();
 *
 * // 将BTC转换为用户的游戏货币（如USD）并格式化
 * const converted = formatWithConversion(0.5, 'BTC', { showSymbol: true });
 *
 * // 直接格式化BTC，不进行转换
 * const original = formatWithoutConversion(0.5, 'BTC', { showSymbol: true });
 * ```
 */
export function useDisplayCurrencyFormatter() {
  const { selectedCurrency, formatCurrency, convertCurrency, exchangeRates, isLoading } = useDisplayCurrency();

  const formatWithConversion = (
    amount: number | string,
    fromCurrency: string,
    options?: {
      showSymbol?: boolean;
      showCode?: boolean;
      compact?: boolean;
      minimizeDecimals?: boolean;
    },
  ) => {
    if (isLoading) {
      return {
        value: 0,
        formatted: "...",
        currency: selectedCurrency,
        displayName: selectedCurrency,
      };
    }

    // 转换货币
    const convertedAmount = convertCurrency({
      amount,
      fromCurrency,
      toCurrency: selectedCurrency,
      exchangeRates,
    });

    // 格式化显示
    return formatCurrency({
      currency: selectedCurrency,
      amount: convertedAmount,
      showSymbol: options?.showSymbol ?? true,
      showCode: options?.showCode ?? true,
      compact: options?.compact ?? false,
      minimizeDecimals: options?.minimizeDecimals ?? true,
    });
  };

  const formatWithoutConversion = (
    amount: number | string,
    currency: string,
    options?: {
      showSymbol?: boolean;
      showCode?: boolean;
      compact?: boolean;
      minimizeDecimals?: boolean;
    },
  ) => {
    if (isLoading) {
      return {
        value: 0,
        formatted: "...",
        currency: currency,
        displayName: currency,
      };
    }

    // 直接格式化，不进行货币转换
    return formatCurrency({
      currency: currency,
      amount: amount,
      showSymbol: options?.showSymbol ?? true,
      showCode: options?.showCode ?? true,
      compact: options?.compact ?? false,
      minimizeDecimals: options?.minimizeDecimals ?? true,
    });
  };

  return {
    selectedCurrency,
    formatWithConversion,
    formatWithoutConversion,
    isLoading,
  };
}
