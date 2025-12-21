import {
  useSupportedCryptoDepositGateways,
  useSupportedCryptoWithdrawGateways,
  useUserBalance,
  useUserBalanceExtension
} from "@/hooks/api/useAuth.ts";
import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/authService.ts";
import { toHex } from "tron-format-address";
import { ethers } from "ethers";
import { address as tonAddress } from "@ton/core";
import { PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useBoundStore } from "@/store";
import { orderBy } from "lodash-es";
import { emitter } from "@/store/emitter.ts";
import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext.tsx";
import { useCurrencyExchangeRate } from "@/hooks/api/usePublic.ts";

export const useSupportedSwapFromCurrenciesFilter = () => {
  const { data, isLoading } = useSupportedCurrencyV2();
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
      currencies.map((item: { icon: string; currency: string; display_name: string, is_default: number }) => ({
        id: item.currency,
        value: item.currency,
        label: item.display_name,
        icon: item.icon || `/icons/currency/${item.currency.toLowerCase()}.svg`,
        is_default: item.is_default
      }))
    ]; // 返回 [原始数据, 处理后的数据]
  }, [data]);
};

export const useSupportedSwapToCurrenciesFilter = (currency: Record<string, any> | null) => {
  const { data, isLoading } = useSupportedCurrencyV2();
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
      currencies.map((item: { icon: string; currency: string; display_name: string, is_default: number }) => ({
        id: item.currency,
        value: item.currency,
        label: item.display_name,
        icon: item.icon || `/icons/currency/${item.currency.toLowerCase()}.svg`,
        is_default: item.is_default
      }))
    ]; // 返回 [原始数据, 处理后的数据]
  }, [data, currency]);
};

// 加密货币 - 提款的区块链网关列表
export const useSupportedCryptoDepositGatewaysFilter = (currency: string) => {
  const { data, isLoading } = useSupportedCryptoDepositGateways(currency);
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

// 加密货币 - 取款的区块链网关列表
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
    value: 0
  },
  {
    label: "25%",
    value: 0.25
  },
  {
    label: "50%",
    value: 0.5
  },
  {
    label: "Max",
    value: 1
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
      available: open_debug ? "200000000" : "0.00",
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
      locked: lockedBalance.toFixed(18, Decimal.ROUND_UP),
      available: open_debug ? "200000000" : availableAmount.toFixed(18, Decimal.ROUND_DOWN),
      userBalanceLoading,
      userBalanceExtensionLoading,
      userBalanceRefetch,
      userBalanceExtensionRefetch
    };
  }, [currency, userBalance, userBalanceExtension]);
};

export const useAllAvailableBalance = () => {
  const {
    data: userBalance,
    isLoading: userBalanceLoading
  } = useUserBalance();

  const {
    data: userBalanceExtension,
    isLoading: userBalanceExtensionLoading
  } = useUserBalanceExtension();

  const { data: exchangeRate } = useCurrencyExchangeRate();

  return useMemo(() => {
    const output = (userBalance ?? []).map((currency: Record<string, any>) => {
      const token = currency?.currency;
      const balance = currency?.balance || 0;
      const exchange = exchangeRate?.data?.[token] ?? 0;
      const extensionBalance = (userBalanceExtension ?? [])?.find((b: Record<string, any>) => b?.currency === token);
      const totalBalance = new Decimal(balance);
      const withdrawAble = extensionBalance ? new Decimal(extensionBalance?.withdraw_able || 0) : new Decimal(0);
      const lockedBalance = extensionBalance ? new Decimal(extensionBalance?.locked_balance || 0) : new Decimal(0);

      const calculatedAvailable = totalBalance.minus(lockedBalance);
      const availableAmount = Decimal.max(calculatedAvailable, withdrawAble);
      const equivalentU = availableAmount.times(exchange);

      return { token, balance: availableAmount.toString(), equivalentU };
    }).filter((currency: {
      currency_type: string;
    }) => currency?.currency_type === "FIAT" || currency?.currency_type === "CRYPTO");

    return {
      balances: orderBy(output, ["equivalentU"], ["desc"]), // ⚠️orderBy排序要基于数字不是字符串
      isLoading: userBalanceLoading || userBalanceExtensionLoading
    };
  }, [userBalance, userBalanceExtension]);
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

export const useSupportedCurrencyV2 = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["useSupportedCurrencyV2"],
    queryFn: async () => {
      return authService.getSupportedCurrencyV2();
    },
    enabled: !!user,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
};

export const useSupportedCurrencyV2Filter = (
  type: "CRYPTO" | "FIAT" = "CRYPTO",
  direction: "WITHDRAW" | "DEPOSIT" = "DEPOSIT"
) => {
  const { data, isLoading } = useSupportedCurrencyV2();
  /**
   * 1. 权重排序
   * 2. 代币类型
   * 3. 支持存款
   * 4. 是否支持存/取/换
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
      currencies.map((item: { icon: string; currency: string; display_name: string, is_default: number }) => ({
        id: item.currency,
        value: item.currency,
        label: item.display_name,
        icon: item.icon || `/icons/currency/${item.currency.toLowerCase()}.svg`,
        is_default: item.is_default
      }))
    ]; // 返回 [原始数据, 处理后的数据]
  }, [data]);
};

/*******************************/
/*******************************/
/*******************************/

/**
 * 存款 - 操作面板 crypto - 加密货币存款时候默认选中的币种
 */
export const useDepositCryptoCurrencySelectedFirstTime = () => {
  const [, originCurrencies] = useSupportedCurrencyV2Filter("CRYPTO", "DEPOSIT");

  // from data store, share common data
  const { setDepositCrypto } = useBoundStore();

  // initial default selected option
  useEffect(() => {
    if (originCurrencies.length > 0) {
      const find = originCurrencies.find((o: { is_default: number }) => o?.is_default);
      setDepositCrypto({ currency: find || originCurrencies[0] });
    }
  }, [originCurrencies]);
};

/*******************************/
/*******************************/
/*******************************/

/**
 * 存款 - 操作面板 fiat - 法币存款时候的默认选中法币
 */
export const useDepositFiatCurrencySelectedFirstTime = () => {
  const [, originCurrencies] = useSupportedCurrencyV2Filter("FIAT", "DEPOSIT");

  // from data store, share common data
  const { setDepositFiat } = useBoundStore();

  useEffect(() => {
    if (originCurrencies.length > 0) {
      const find = originCurrencies.find((o: {
        is_default: number,
      }) => o?.is_default) ?? originCurrencies[0];
      setDepositFiat({ currency: find });
    }
  }, [originCurrencies]);
};

/*******************************/
/*******************************/
/*******************************/

/**
 * 存款 - 操作面板选中 crypto / fiat
 */
export const useDepositTokenTypesSelectedFirstTime = () => {
  // 用户的结算币种
  const { selectedCurrency: CURRENCY } = useSettlementCurrency();

  // from data store, share common data
  const { setDepositType } = useBoundStore();

  const [, originCurrencies] = useSupportedCurrencyV2Filter("FIAT", "DEPOSIT");

  useEffect(() => {
    if (CURRENCY === "USD") {
      setDepositType("crypto");
      return;
    }
    if (originCurrencies.length > 0) {
      const some = originCurrencies.some((o: { currency: string }) => o?.currency === CURRENCY);
      if (some) {
        setDepositType("fiat");
      } else {
        setDepositType("crypto");
      }
    }
  }, [originCurrencies, CURRENCY]);
};

/*******************************/
/*******************************/
/*******************************/

export const useWithdrawSelectedFirstTime = () => {
  // 只需要初始化的时候执行一次币种选中操作
  const hasRunOnce = useRef(false);

  // 用户的结算币种
  const { selectedCurrency: CURRENCY } = useSettlementCurrency();

  // from data store, share common data
  const { setWithdrawType, setWithdrawFiat, setWithdrawCrypto } = useBoundStore();

  // 按照U的价值排好序的数据
  const { balances } = useAllAvailableBalance();

  const { data: currencies } = useSupportedCurrencyV2();

  useEffect(() => {
    // console.info(`CURRENCY=${CURRENCY}`);
    // console.info(`hasRunOnce.current=${hasRunOnce.current}`);

    if (hasRunOnce.current || !currencies?.data || (Array.isArray(currencies?.data) && currencies?.data?.length === 0)) return;

    // 对等U价值最高的代币
    const most_valuable_currency = balances[0];

    // 支持 提现 操作的币种【加密货币 & 法币】
    const can_withdraw_currencies = currencies.data.filter((o: { can_withdraw: number }) => o.can_withdraw === 1);

    let the_chosen_one; // 天选之子

    if (Decimal(most_valuable_currency?.equivalentU || 0).eq(0)) {
      // 👀
      // 如果任何balance都没有余额，则选择当前设置的结算钱包的币种

      // USD的特殊处理
      if (CURRENCY === "USD") {
        the_chosen_one = can_withdraw_currencies.find((o: { currency: string }) => o?.currency === "USDT");
      } else {
        // ⚠️新用户注册的账号默认的结算币可能不在我们支持的结算币列表之中，此时需要设置默认值【 ?? can_withdraw_currencies[0]】
        the_chosen_one = can_withdraw_currencies.find((o: {
          currency: string
        }) => o?.currency === CURRENCY) ?? can_withdraw_currencies[0];
      }
    } else {
      // 👀👀
      // 任何时候，自动跳到金额最多的法币钱包（按U换算）
      // 如果法币结算币钱包都没钱，而虚拟币有钱，这个时候自动变为虚拟币取款，并选择金额最多的虚拟币

      // USD的特殊处理
      if (most_valuable_currency?.token === "USD") {
        the_chosen_one = can_withdraw_currencies.find((o: { currency: string }) => o?.currency === "USDT");
      } else {
        the_chosen_one = can_withdraw_currencies.find((o: {
          currency: string
        }) => o?.currency === most_valuable_currency?.token);
      }
    }

    const currency_type = the_chosen_one?.currency_type === "FIAT" ? "fiat" : "crypto";

    // 设置Tab选中 Crypto or Fiat 组件
    setWithdrawType(currency_type);

    if (currency_type === "fiat") {
      // 当匹配到了法币货币的时候，需要给加密货币也给一个默认币种
      const DEFAULT_CRYPTO = can_withdraw_currencies.find((o: {
        currency_type: string
      }) => o?.currency_type === "CRYPTO");

      setWithdrawFiat({ currency: the_chosen_one });
      setWithdrawCrypto({ currency: DEFAULT_CRYPTO });

      hasRunOnce.current = true;
    }

    if (currency_type === "crypto") {
      // 当匹配到了加密货币的时候，需要给法币也给一个默认币种
      const DEFAULT_FIAT = can_withdraw_currencies.find((o: {
        currency_type: string
      }) => o?.currency_type === "FIAT");

      setWithdrawFiat({ currency: DEFAULT_FIAT });
      setWithdrawCrypto({ currency: the_chosen_one });

      hasRunOnce.current = true;
    }

  }, [CURRENCY, balances, currencies]);
};

/*******************************/
/*******************************/
/*******************************/

/**
 * 兑换
 *
 * 条件：
 * from: BUCK优先级最高
 * to:   用户选择的结算币种
 */
export const useSwapCurrencySelectedFirstTime = () => {
  // 用户的结算币种
  const { selectedCurrency: CURRENCY } = useSettlementCurrency();

  // from data store, share common data
  const { setSwapTo, setSwapFrom, swapFrom } = useBoundStore();

  // 支持swap from的币种
  const [, swap_from_currencies] = useSupportedSwapFromCurrenciesFilter();

  // 平台币 BUCK - 最高优先级
  const platform_currency = useMemo(() => swap_from_currencies.find((o: {
    currency: string
  }) => "BUCK" === o?.currency), [swap_from_currencies]);

  // 支持swap to的币种
  const [, swap_to_currencies] = useSupportedSwapToCurrenciesFilter(swapFrom.currency);

  // 设置默认的 swap to
  useEffect(() => {
    if (swap_to_currencies?.length === 0) return;

    setSwapTo({
      currency: swap_to_currencies.find((o: {
        currency: string
      }) => CURRENCY === o?.currency) ?? swap_to_currencies[0]
    });
  }, [swap_to_currencies, CURRENCY]);

  // 设置默认的 swap from = BUCK
  useEffect(() => {
    if (swap_from_currencies?.length === 0) return;

    setSwapFrom({ currency: platform_currency });
  }, [swap_from_currencies, platform_currency]);

  // 支持用户指定的兑换代币默认选中
  useEffect(() => {
    if (swap_from_currencies?.length === 0) return;
    emitter.addListener("SWAP", (currency: string) => {
      const target_currency = swap_from_currencies.find((o: { currency: string }) => currency === o?.currency);
      setSwapFrom({ currency: target_currency });
    });
  }, [swap_from_currencies]);
};

export function randomString() {
  const timestamp = Date.now();
  const random = Math.random().toString(16).slice(2, 8);
  return `${timestamp}-${random}`;
}

export const open_debug = false;