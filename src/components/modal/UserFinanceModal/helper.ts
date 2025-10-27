import {
  useSupportedCryptoWithdrawGateways,
  useUserBalance,
  useUserBalanceExtension
} from "@/hooks/api/useAuth.ts";
import { useSupportedSettlementCurrencies } from "@/hooks/api/usePublic.ts";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/authService.ts";
import { toHex } from "tron-format-address";
import { ethers } from "ethers";
import { address as tonAddress } from "@ton/core";
import { PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";
import { useAuth } from "@/contexts/AuthContext.tsx";

export const useSupportedSettlementCurrenciesFilter = (
  type: "CRYPTO" | "FIAT" = "CRYPTO",
  direction: "WITHDRAW" | "DEPOSIT" = "DEPOSIT"
) => {
  const { data, isLoading } = useSupportedSettlementCurrencies();
  /**
   * 1. 权重排序
   * 2. 代币类型
   * 3. 支持存款
   */
  return useMemo(() => {
    const transform = data?.data ?? [];
    const currencies = transform
      .filter(
        (item: { can_withdraw: number; currency_type: string; can_deposit: number }) =>
          item.currency_type === type && (direction === "DEPOSIT" ? item.can_deposit : item.can_withdraw) === 1
      )
      .sort((a: { weight: number }, b: { weight: number }) => (b.weight ?? 0) - (a.weight ?? 0));
    return [
      isLoading,
      currencies,
      currencies.map((item: { icon: string; currency: string; display_name: string }) => ({
        id: item.currency,
        value: item.currency,
        label: item.display_name,
        icon: item.icon || `/icons/currency/${item.currency.toLowerCase()}.svg`
      }))
    ]; // 返回 [原始数据, 处理后的数据]
  }, [data]);
};

export const useSupportedSwapFromCurrenciesFilter = () => {
  const { data, isLoading } = useSupportedSettlementCurrencies();
  return useMemo(() => {
    const transform = data?.data ?? [];
    const currencies = transform
      .filter((item: {
        can_swap_from: number;
        currency_type: string
      }) => item.currency_type !== "FIAT" && item.can_swap_from === 1)
      .sort((a: { weight: number }, b: { weight: number }) => (b.weight ?? 0) - (a.weight ?? 0));
    return [
      isLoading,
      currencies,
      currencies.map((item: { icon: string; currency: string; display_name: string }) => ({
        id: item.currency,
        value: item.currency,
        label: item.display_name,
        icon: item.icon || `/icons/currency/${item.currency.toLowerCase()}.svg`
      }))
    ]; // 返回 [原始数据, 处理后的数据]
  }, [data]);
};

export const useSupportedSwapToCurrenciesFilter = (currency: Record<string, any> | null) => {
  const { data, isLoading } = useSupportedSettlementCurrencies();
  return useMemo(() => {
    const transform = data?.data ?? [];
    const currencies = transform
      .filter(
        (item: { currency: string; can_swap_to: number; currency_type: string }) =>
          (currency?.currency_type === "REWARDS" ? item.currency_type !== "REWARDS" : !["REWARDS", "FIAT"].includes(item?.currency_type)) &&
          item.can_swap_to === 1 &&
          item.currency !== currency?.currency
      )
      .sort((a: { weight: number }, b: { weight: number }) => (b.weight ?? 0) - (a.weight ?? 0));
    return [
      isLoading,
      currencies,
      currencies.map((item: { icon: string; currency: string; display_name: string }) => ({
        id: item.currency,
        value: item.currency,
        label: item.display_name,
        icon: item.icon || `/icons/currency/${item.currency.toLowerCase()}.svg`
      }))
    ]; // 返回 [原始数据, 处理后的数据]
  }, [data, currency]);
};

export const useSupportedCryptoWithdrawGatewaysFilter = (currency: string) => {
  const { data, isLoading } = useSupportedCryptoWithdrawGateways(currency);
  return useMemo(() => {
    const transform = data?.data ?? [];
    return [
      isLoading,
      transform,
      transform.map((item: { icon: string; network: any; can_withdraw: number }) => ({
        id: item.network,
        value: item.network,
        label: item.network,
        disabled: item.can_withdraw !== 1,
        icon: item.icon || `/icons/currency/${item.network.toLowerCase()}.svg`
      }))
    ];
  }, [data]);
};

export function useUserLatestDeposit() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["useUserLatestDeposit"],
    queryFn: () => authService.getUserDepositOrders({ limit: 1 }),
    enabled: !!user
  });
}

export function useUserLatestWithdraw() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["useUserLatestWithdraw"],
    queryFn: () => authService.getUserWithdrawOrders({ limit: 1 }),
    enabled: !!user
  });
}

export const validateAddress = (network: string, address: string) => {
  try {
    if (network === "TRON") {
      // TBH2CfmW4XEqiwA1HKRRTnYDsvHiiadfVf
      return toHex(address);
    }

    if (network === "TON") {
      // Ef9P69sU4AgSWniwHUGts1BYTIyYPVlUCN-2Vb1BmeRxW1sl
      return tonAddress(address);
    }

    if (network === "BSC" || network === "ETH") {
      // 0x058476C57de3Ea691b3EDA45542B38d6886004ba
      return ethers.isAddress(address);
    }

    if (network === "SOL") {
      // 5DHQhk6CocPX14Ww9A797VoLcfxP3DfMbvWc44PeLm5W
      return new PublicKey(address);
    }

    return /^[a-zA-Z0-9]{20,}$/.test(address);
  } catch (error) {
    console.info(error);
    return false;
  }
};

export const perRangeOptions = [
  {
    label: "Min",
    value: "min"
  },
  {
    label: "25%",
    value: "25%"
  },
  {
    label: "50%",
    value: "50%"
  },
  {
    label: "Max",
    value: "max"
  }
];

/**
 * 用户的可操作余额
 * @param currency
 */
export const useAvailableBalance = (currency: string) => {
  const {
    data: userBalance,
    isLoading: userBalanceLoading,
    refetch: userBalanceRefetch
  } = useUserBalance();
  const {
    data: userBalanceExtension,
    isLoading: userBalanceExtensionLoading,
    refetch: userBalanceExtensionRefetch
  } = useUserBalanceExtension();

  return useMemo(() => {
    const balance = userBalance?.find((b: Record<string, any>) => b.currency === currency);

    if (!balance) return {
      locked: "0.00",
      available: "0.00",
      userBalanceLoading,
      userBalanceExtensionLoading,
      userBalanceRefetch,
      userBalanceExtensionRefetch
    };

    const extensionBalance = userBalanceExtension?.find((b: Record<string, any>) => b.currency === currency);

    const totalBalance = new Decimal(balance.balance);
    const withdrawAble = extensionBalance ? new Decimal(extensionBalance.withdraw_able || 0) : new Decimal(0);
    const lockedBalance = extensionBalance ? new Decimal(extensionBalance.locked_balance || 0) : new Decimal(0);

    const calculatedAvailable = totalBalance.minus(lockedBalance);
    const availableAmount = Decimal.max(calculatedAvailable, withdrawAble);

    return {
      locked: lockedBalance.toString(),
      available: availableAmount.toString(),
      // available: '1000000',
      userBalanceLoading,
      userBalanceExtensionLoading,
      userBalanceRefetch,
      userBalanceExtensionRefetch
    };
  }, [currency, userBalance, userBalanceExtension]);
};

/**
 * 法币提现支持的网关V1
 * @param currency
 */
export const useSupportedFiatWithdrawGatewaysV1 = (currency: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["supportedFiatWithdrawGateways", currency],
    queryFn: async () => {
      return authService.getSupportedFiatWithdrawGatewaysV1(currency);
    },
    enabled: !!currency && !!user
  });
};

/**
 * 法币提现支持的网关V2
 * @param currency
 */
export const useSupportedFiatWithdrawGatewaysV2 = (currency: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["supportedFiatWithdrawGatewaysV2", currency],
    queryFn: async () => {
      return authService.getSupportedFiatWithdrawGatewaysV2(currency);
    },
    enabled: !!currency && !!user
  });
};

/**
 * 法币提现用用户添加的快捷信息列表
 * @param currency
 */
export const useUserWithdrawFiatInfo = (currency: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["userWithdrawFiatInfo", currency],
    queryFn: async () => {
      return authService.getUserWithdrawInfo(currency);
    },
    enabled: !!currency && !!user,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
};
