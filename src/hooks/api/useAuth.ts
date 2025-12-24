import { useAuth } from "@/contexts/AuthContext.tsx";
import { authService } from "@/services/authService";
import type { LoginCredentials } from "@/types/auth";
import type { CreateAdTagParams, GetReferralListParams, SetDefaultAdTagParams } from "@/types/referral";
import { clearAuth, hasAuth } from "@/utils/auth";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import type { KycDetail } from "@/types/profile";
import type { ITournament } from "@/types/tournament";
import type { UserGameListParams, UserGameListResponse } from "@/types/game";
import type { IGetMondayVipBonus } from "@/types/bonus";
import { useTranslation } from "react-i18next";
import { rum_sdk_user_log } from "@/utils/helper.ts";

export const AUTH_QUERY_KEYS = {
  currentUser: ["auth", "currentUser"] as const,
  tournamentList: ["auth", "tournamentList"] as const,
  userBalance: ["auth", "userBalance"] as const,
  cryptoDepositAddress: ["auth", "cryptoDepositAddress"] as const,
  supportedCryptoWithdrawGateways: ["auth", "supportedCryptoWithdrawGateways"] as const,
  supportedCryptoDepositGateways: ["auth", "supportedCryptoDepositGateways"] as const,
  supportedFiatDepositGateways: ["auth", "supportedFiatDepositGateways"] as const,
  withdrawGatewayRequiredFields: ["auth", "withdrawGatewayRequiredFields"] as const,
  claimBonus: ["auth", "claimBonus"] as const,
  fiatGatewayWithdrawParams: ["auth", "fiatGatewayWithdrawParams"] as const,
  fiatGatewayDepositParams: ["auth", "fiatGatewayDepositParams"] as const,
  userBalanceExtension: ["auth", "userBalanceExtension"] as const,
  userClaimBonus: ["auth", "userClaimBonus"] as const,
  conquests: ["auth", "conquests"] as const,
  conquestList: ["auth", "conquestList"] as const,
  calendarBonus: ["auth", "calendarBonus"] as const,
  gameLaunch: ["auth", "gameLaunch"] as const,
  userWithdrawWallet: ["auth", "userWithdrawWallet"] as const,
  userFreeGameRecords: ["auth", "userFreeGameRecords"] as const,
  topWageredGames: ["auth", "topWageredGames"] as const,
  userGameList: ["auth", "userGameList"] as const,
  defaultAdTag: ["auth", "defaultAdTag"] as const,
  userAchievements: ["auth", "userAchievements"] as const,
  myAchievements: ["auth", "myAchievements"] as const,
  vipConfigList: ["auth", "vipConfigList"] as const,
  referralClaim: ["auth", "referralClaim"] as const,
  groupClaim: ["auth", "groupClaim"] as const,
  referralList: ["auth", "referralList"] as const,
  adTagList: ["auth", "adTagList"] as const,
  vipNextLevelData: ["auth", "vipNextLevelData"] as const,
  unreadNotificationCounter: ["auth", "unreadNotificationCounter"] as const,
  kycDetail: ["auth", "kycDetail"] as const,
  tournamentPoolPrize: ["auth", "tournamentPoolPrize"] as const,
  notificationMessage: ["auth", "notificationMessage"] as const,
};

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.signIn(credentials),
    onSuccess: (data) => {
      console.debug("Login success:", data);
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("username", data.data.username);
      // Persist user & status for auth header (userid) and cross-tab sync
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      if (data.status) {
        localStorage.setItem("status", JSON.stringify(data.status));
      }

      // 用户信息上传 rum
      rum_sdk_user_log(data.data)

      queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, data);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
    },
    onError: (error) => {
      console.error("Login failed:", error);
      toast.error(error.message);
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("status");
      localStorage.removeItem("username");

      queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, null);
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("status");
      localStorage.removeItem("username");
      queryClient.clear();
    }
  });
}

export function useCurrentUser() {
  const result = useQuery({
    queryKey: AUTH_QUERY_KEYS.currentUser,
    queryFn: () => authService.getUserProfile(),
    enabled: !!localStorage.getItem("token"),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Handle network errors in useEffect
  useEffect(() => {
    if (result.error) {
      const error = result.error as any;

      // If we get network errors when trying to get user profile, 
      // it likely means the token is invalid
      if (hasAuth() && error.message === "Network Error" && !error.response) {
        clearAuth("network_error_user_profile");
      }
    }
  }, [result.error]);

  return result;
}

// 赛事列表（需登录）
export function useTournamentList() {
  const { user } = useAuth();
  const query = useQuery<{ data: ITournament[]; code: number }>({
    queryKey: [...AUTH_QUERY_KEYS.tournamentList, user?.id],
    queryFn: () => authService.getTournamentList(),
    enabled: !!user,
    refetchOnMount: true,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const list = query.data?.code === 0 ? query.data?.data ?? [] : [];
  const filtered = useMemo(() => {
    const hiddenProviders = new Set(["newbie", "pp"]);
    return list.filter((item) => !hiddenProviders.has((item.game_provider || "").toLowerCase()));
  }, [list]);
  return { tournamentList: filtered, isLoading: query.isLoading };
}

export function useTournamentPoolPrize(
  tournamentId?: number | string,
  tournamentLevel?: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  const { enabled: optionEnabled, refetchInterval, ...restOptions } = options ?? {};
  const enabled = Boolean(tournamentId && tournamentLevel && (optionEnabled ?? true));

  return useQuery<number>({
    queryKey: [...AUTH_QUERY_KEYS.tournamentPoolPrize, tournamentId, tournamentLevel],
    queryFn: async () => {
      const response = await authService.getTournamentPoolPrize({
        tournament_id: tournamentId!,
        tournament_level: tournamentLevel!,
      });
      return response.data ?? 0;
    },
    enabled,
    refetchInterval: refetchInterval ?? 30 * 1000,
    ...restOptions,
  });
}

export function useUserGameList(
  params: UserGameListParams,
  queryOptions?: Omit<UseQueryOptions<UserGameListResponse>, "queryKey" | "queryFn" | "enabled"> & { enabled?: boolean },
) {
  const { user } = useAuth();
  const { enabled: optionEnabled, ...restOptions } = queryOptions ?? {};
  const enabled = !!user && (optionEnabled ?? true);

  return useQuery<UserGameListResponse>({
    queryKey: [...AUTH_QUERY_KEYS.userGameList, user?.id, params],
    queryFn: () => authService.getUserGameList(params),
    enabled,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
    ...restOptions,
  });
}

// 获取特定网络的加密货币存款地址
export const useCryptoDepositAddress = (network: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.cryptoDepositAddress, network],
    queryFn: () => authService.getCryptoDepositAddress(network),
    enabled: !!user && !!network // 只有当用户已登录并且提供了网络参数时才执行查询
  });
};

// 存款取款网关支持
export const useSupportedCryptoWithdrawGateways = (currency: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.supportedCryptoWithdrawGateways, currency],
    queryFn: async () => {
      return authService.getSupportedCryptoWithdrawGateways(currency);
    },
    enabled: !!currency && !!user
  });
};

export const useSupportedCryptoDepositGateways = (currency: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.supportedCryptoDepositGateways, currency],
    queryFn: async () => {
      return authService.getSupportedCryptoDepositGateways(currency);
    },
    enabled: !!currency && !!user
  });
};

// 获取支持法币存款的网关
export const useSupportedFiatDepositGateways = (currency: string) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.supportedFiatDepositGateways, currency],
    queryFn: async () => {
      return authService.getSupportedFiatDepositGateways(currency);
    },
    enabled: !!currency && isAuthenticated
  });
};

// 获取取款网关必填字段
export const useFiatGatewayWithdrawParams = (gateway_id: string, pay_bankcode: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.fiatGatewayWithdrawParams, gateway_id, pay_bankcode],
    queryFn: () => authService.getFiatGatewayWithdrawParams(gateway_id, pay_bankcode),
    enabled: !!user && !!gateway_id && !!pay_bankcode
  });
};

// 获取用户余额
export const useUserBalance = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.userBalance,
    queryFn: async () => {
      const { data } = await authService.getUserBalance();
      return data;
    },
    enabled: !!user, // 只有当用户已登录时才执行查询
    staleTime: 15 * 1000, // 30秒缓存，余额需要较频繁更新
    refetchInterval: 15 * 1000 // 每分钟自动刷新一次
  });
};

export const useFiatGatewayDepositParams = (gateway_id: string, pay_bankcode: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.fiatGatewayDepositParams, gateway_id, pay_bankcode],
    queryFn: async () => {
      return authService.getFiatGatewayDepositParams(gateway_id, pay_bankcode);
    },
    enabled: !!user && !!gateway_id && !!pay_bankcode,
    retry: 1
  });
};

// 获取当前用户是否有待领取的Bonus
export const useClaimBonus = (item: "cashback" | "rakeback" | "tournament" | "level_up") => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.claimBonus, item],
    queryFn: () => authService.getClaimBonus(item),
    enabled: !!user, // 只有当用户已登录时才执行查询
    staleTime: 30 * 1000, // 30秒缓存
    refetchInterval: 15 * 1000 // 每分钟自动刷新一次
  });
};

/**
 * Hook for fetching user balance extension
 */
export const useUserBalanceExtension = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.userBalanceExtension,
    queryFn: async () => {
      const { data } = await authService.getUserBalanceExtension();
      return data;
    },
    enabled: !!user
  });
};

// 获取用户bonus 领取详细记录
export const useUserClaimBonus = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.userClaimBonus,
    queryFn: () => authService.getUserClaimBonus(),
    enabled: !!user, // 只有当用户已登录时才执行查询
    staleTime: 30 * 1000, // 30秒缓存
    refetchInterval: 60 * 1000, // 每分钟自动刷新一次
    retry: (failureCount, error: any) => {
      // 对于401错误（未授权）不重试，其他错误最多重试2次
      return error?.response?.status !== 401 && failureCount < 2;
    }
  });
};

// 领取bonus的mutation
export const useClaimBonusMutation = (customOnSuccess?: (response: any, variables: any) => void) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ item, currency }: { item: string; currency?: string }) =>
      authService.claimBonus(item, currency),
    onSuccess: (response: any, variables) => {
      // 领取成功后，刷新相关数据
      // 刷新用户bonus详情
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userClaimBonus });
      // 刷新用户余额
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userBalance });
      // 刷新当前用户信息
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
      // 刷新待领取金额
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.claimBonus });

      // 如果是日历奖励，刷新日历数据
      if (variables.item === "calendar") {
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.calendarBonus });
        toast.success(t('toast:calendarBonusClaimedSuccessfully'));
      } else {
        if (response.code === 0) {
          toast.success(t('toast:bonusClaimedSuccessfully'));
        }
        // else {
        //   toast.error(response.msg || "Failed to claim bonus");
        // }
      }

      // 调用自定义的成功回调
      if (customOnSuccess) {
        customOnSuccess(response, variables);
      }
    },
    onError: (error: any) => {
      console.error("Failed to claim bonus:", error);
      toast.error(t('toast:claimBonusFailed'));
    }
  });
};

// Conquest相关查询和操作
export const useConquestsCompleted = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.conquests, "completed"],
    queryFn: () => authService.getConquestsCompleted(),
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    retry: (failureCount, error: any) => {
      return error?.response?.status !== 401 && failureCount < 2;
    }
  });
};

export const useConquestsReward = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.conquests, "reward"],
    queryFn: () => authService.getConquestsReward(),
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    retry: (failureCount, error: any) => {
      return error?.response?.status !== 401 && failureCount < 2;
    }
  });
};

export const useClaimConquestMutation = (customOnSuccess?: (response: any) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.claimConquest(),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.conquests });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userBalance });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userClaimBonus });
      toast.success("Conquest bonus claimed successfully!");

      // 调用自定义的成功回调
      if (customOnSuccess) {
        customOnSuccess(response);
      }
    },
    onError: (error: any) => {
      console.error("Failed to claim conquest:", error);
      toast.error(error.response?.data?.msg || "Failed to claim conquest");
    }
  });
};

// Calendar Bonus 相关查询和操作
export const useCalendarBonus = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.calendarBonus,
    queryFn: () => authService.getCalendarBonus(),
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    retry: (failureCount, error: any) => {
      return error?.response?.status !== 401 && failureCount < 2;
    }
  });
};

// Free Spins 相关查询和操作
export const useUserFreeGameRecords = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.userFreeGameRecords,
    queryFn: () => authService.getUserFreeGameRecords(),
    enabled: !!user,
    // Return from game pages should always refresh the latest free spin counts
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useActivateBoosterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.activateBooster(),
    onSuccess: () => {
      // Invalidate user profile to refresh battery status
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
      toast.success("Booster activated successfully!");
    },
    onError: (error: any) => {
      console.error("Failed to activate booster:", error);
      toast.error(error.response?.data?.msg || error.message || "Failed to activate booster");
    }
  });
};

export const useClaimCalendarBonusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.claimCalendarBonus(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.calendarBonus });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userBalance });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userClaimBonus });
      toast.success("Calendar bonus claimed successfully!");
    },
    onError: (error: any) => {
      console.error("Failed to claim calendar bonus:", error);
      toast.error(error.response?.data?.msg || "Failed to claim calendar bonus");
    }
  });
};

// 游戏启动相关 hooks
export const useLaunchGameMutation = () => {
  return useMutation({
    mutationFn: (params: {
      inner_game_id: string;
      game_provider: string;
      game_currency: string;
      lang: string;
      name_key?: string;
      home_url?: string;
      close_url?: string;
      deposit_url?: string;
      history_url?: string;
      is_support_demo_game?: string;
    }) => authService.launchGameV2(params),
    onError: (error: any) => {
      console.error("Failed to launch game:", error);
      toast.error(error.response?.data?.msg || "Failed to launch game");
    }
  });
};

// 试玩游戏启动
export const useLaunchDemoGameMutation = () => {
  return useMutation({
    mutationFn: (params: {
      inner_game_id: string;
      game_provider: string;
      game_currency: string;
      lang: string;
      name_key?: string;
      home_url?: string;
      close_url?: string;
      deposit_url?: string;
      history_url?: string;
    }) => authService.launchDemoGame(params),
    onError: (error: any) => {
      console.error("Failed to launch demo game:", error);
      toast.error(error.response?.data?.msg || "Failed to launch demo game");
    }
  });
};

// 检查游戏是否支持演示模式
export const useCheckDemoSupportQuery = (params: {
  inner_game_id: string;
  game_provider: string;
  game_currency?: string;
  lang?: string;
  name_key?: string;
}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['checkDemoSupport', params.inner_game_id, params.game_provider],
    queryFn: () => authService.checkDemoSupport(params),
    enabled: enabled && !!params.inner_game_id && !!params.game_provider,
    staleTime: 5 * 60 * 1000, // 缓存 5 分钟
  });
};

export const useGetUserDefaultCurrencyMutation = () => {
  return useMutation({
    mutationFn: (params: {
      inner_game_id: string;
    }) => authService.getUserDefaultCurrency(params),
    onError: (error: any) => {
      console.error("Failed to get user default currency:", error);
    }
  });
};

export const useLikeGameMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inner_game_id: string) => authService.likeGameV2(inner_game_id),
    onSuccess: (response) => {
      if (response.code === 0) {
        // Invalidate user game list to refresh favorites
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userGameList });
      } else {
        toast.error(response.msg || "Failed to update favorite status");
      }
    },
    onError: (error: any) => {
      console.error("Failed to like/unlike game:", error);
      toast.error(error.response?.data?.msg || "Failed to update favorite status");
    }
  });
};

// 获取用户已添加的加密货币提款地址
export const useUserWithdrawWallet = (network?: string, effect = false) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.userWithdrawWallet, network, effect],
    queryFn: () => authService.getUserWithdrawWallet(network),
    enabled: !!user && !!network,
  });
};

// 获取征服任务列表（仅在登录后请求）
export const useConquestList = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.conquestList,
    queryFn: () => authService.getConquestList(),
    enabled: !!user,
    retry: (failureCount, error: any) => {
      // 对于401错误（未授权）不重试，其他错误最多重试2次
      return error?.response?.status !== 401 && failureCount < 2;
    }
  });
};

// 热门游戏
export const useTopWageredGames = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.topWageredGames,
    queryFn: () => authService.getTopWageredGames(),
    enabled: !!user
  });
};

// 获取用户的广告参数
export const useDefaultAdTag = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.defaultAdTag,
    queryFn: () => authService.getDefaultAdTag(),
    enabled: !!user
  });
};

// 获取VIP等级信息
export const useVipConfigList = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.vipConfigList,
    queryFn: () => authService.getVipConfig(),
    enabled: !!user
  });
};

export const useVipNextLevelData = () => {
  const { status } = useAuth();
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.vipNextLevelData,
    queryFn: () => authService.getVipConfig(status?.vip ? status?.vip + 1 : 1),
    enabled: !!status,
  });
};

// 获取用户的成就列表
export const useUserAchievements = (sort: 'asc' | 'desc' = 'asc') => {
  const { user } = useAuth();
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.userAchievements,
    queryFn: () => authService.getUserAchievementsV2(sort),
    enabled: !!user,
    staleTime: 60 * 1000, // 1分钟缓存
    refetchInterval: 5 * 60 * 1000 // 5分钟自动刷新
  });
};

// 获取用户已参与的成就记录
export const useMyAchievements = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.myAchievements,
    queryFn: () => authService.getMyAchievements(),
    enabled: !!user,
    staleTime: 60 * 1000, // 1分钟缓存
    refetchInterval: 2 * 60 * 1000, // 2分钟自动刷新
    select: (data) => {
      // 处理数据，返回更友好的格式
      if (!data?.data || !Array.isArray(data.data)) {
        return { achievements: [], inProgress: [], completed: [] }
      }

      const achievements = data.data
      const inProgress = achievements.filter((_record: any) => {
        // 这里需要根据具体业务逻辑判断是否完成
        // 暂时认为所有记录都是进行中的
        return true
      })
      const completed = achievements.filter((_record: any) => {
        // 完成的成就判断逻辑
        return false // 需要根据实际业务逻辑调整
      })

      return {
        achievements,
        inProgress,
        completed
      }
    }
  });
};

// 获取推荐奖励 Claim 数据（基础 API Hook）
export const useReferralClaim = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.referralClaim,
    queryFn: () => authService.getClaimBonus("referral"),
    enabled: !!user,
    staleTime: 30 * 1000,
  });
};

// 获取团队佣金 Claim 数据（基础 API Hook）
export const useGroupClaim = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.groupClaim,
    queryFn: () => authService.getClaimBonus("group"),
    enabled: !!user,
    staleTime: 30 * 1000,
  });
};

export const useReferralList = (params: Omit<GetReferralListParams, 'last_id'>) => {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: [...AUTH_QUERY_KEYS.referralList, params],
    queryFn: ({ pageParam }) =>
      authService.getReferralList({
        ...params,
        last_id: pageParam,
      }),
    initialPageParam: '',
    getNextPageParam: (lastPage) =>
      lastPage.data?.length > 0 ? lastPage.data[lastPage.data.length - 1].id : undefined,
    enabled: !!user,
    staleTime: 30 * 1000,
  });
};

export const useAdTagList = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.adTagList,
    queryFn: () => authService.getAdTagList(),
    enabled: !!user,
    staleTime: 30 * 1000,
  });
};

export const useCreateAdTag = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (params: CreateAdTagParams) => authService.createAdTag(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.adTagList });
      toast.success(t("referral:campaignCreateSuccess", "Campaign created successfully!"));
    },
    onError: (error: any) => {
      console.error("Failed to create campaign:", error);
      const rawMessage =
        error?.response?.data?.data ||
        error?.response?.data?.msg ||
        error?.message ||
        "";
      const normalized = String(rawMessage).toLowerCase();

      if (normalized.includes("campaign already exists")) {
        toast.error(t("referral:campaignAlreadyExists", "Campaign already exists"));
        return;
      }

      toast.error(rawMessage || t("referral:campaignCreateFailed", "Failed to create campaign"));
    }
  });
};

export const useSetDefaultAdTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: SetDefaultAdTagParams) => authService.setDefaultAdTag(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.adTagList });
      toast.success("Campaign set as default successfully!");
    },
    onError: (error: any) => {
      console.error("Failed to set campaign as default:", error);
      toast.error(error.response?.data?.msg || error.message || "Failed to set campaign as default");
    },
  });
};

export const QueryKycDetail = () => {
  const { user } = useAuth();
  const defaultKycDetail: KycDetail = {
    id: 0,
    team_id: 0,
    user_id: 0,
    first_name: '',
    middle_name: '',
    last_name: '',
    birthday: '',
    country: '',
    state: '',
    city: '',
    address: '',
    zip_code: '',
    document_type: 0,
    document_url: '',
    status: 0,
    created_at: 0,
    updated_at: 0,
    email: '',
    nickname: '',
    phone: '',
  };

  const { data = { data: defaultKycDetail, code: 0 }, refetch } = useQuery<{ data: KycDetail, code: number }>({
    queryKey: AUTH_QUERY_KEYS.kycDetail,
    queryFn: () => authService.getKycDetail(),
    enabled: !!user,
  });
  return {
    data: data && data.code === 0 ? (data?.data ?? defaultKycDetail) : defaultKycDetail,
    refetch
  };
};

export const useNotificationMessage = (params: {
  read: number
}) => {
  const { user } = useAuth()
  return useInfiniteQuery({
    queryKey: [...AUTH_QUERY_KEYS.notificationMessage, params.read],
    queryFn: async ({ pageParam = 0 }) => {
      return await authService.getNotificationMessage({
        last_id: pageParam,
        limit: 30,
        has_read: params.read,
      })
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return !lastPage?.meta?.has_more ? undefined : lastPage?.meta?.next_last_id
    },
    enabled: !!user
  });
};

// 未读取的站内信
export const useUnreadNotificationCounter = () => {
  const { user } = useAuth()
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.unreadNotificationCounter,
    queryFn: () => authService.getNotificationMessage({
      last_id: 0,
      limit: 1,
      has_read: 0,
    }),
    enabled: !!user,
    refetchInterval: 20_000
  });
};

/**
 * 钱包设置中的法币列表
 */
export const useWalletSettingsCurrency = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['walletSettingsCurrency'],
    queryFn: async () => {
      return authService.getWalletSettingsCurrency();
    },
    enabled: !!user,
    refetchOnMount: true,
  });
};

export const useBonusClaimCount = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['useBonusClaimCount'],
    queryFn: () => authService.getClaimCount(),
    enabled: !!user,
    refetchInterval: 15_000
  });
};

export const useMondayVipBonus = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['useMondayVipBonus'],
    queryFn: () => authService.getMondayVipBonus(),
    enabled: !!user,
    refetchOnWindowFocus: 'always'
  });
};


export const useGetMondayVipBonus = () => {
  const { user } = useAuth();
  const { data: mondayVipBonus = { data: {} as IGetMondayVipBonus, code: 0 }, refetch } = useQuery<{
    data: IGetMondayVipBonus;
    code: number;
  }>({
    queryKey: ['getMondayVipBonus'],
    queryFn: () => authService.getMondayVipBonus(),
    enabled: !!user,
    refetchOnMount: true,
  });

  return {
    mondayVipBonus: mondayVipBonus.code === 0 ? mondayVipBonus.data : undefined,
    refetch,
  };
};

export const useBonusSwitch = () => {
  const { user } = useAuth();

  const { data: switchData = { data: {}, code: 0 }, refetch, isLoading } = useQuery<{ data: { [key: string]: any }; code: number }>({
    queryKey: ['bonusSwitch'],
    queryFn: () => authService.bonusSwitch(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!user,
  });

  const parsedSwitchData: { [key: string]: any } = switchData?.code === 0 ? switchData?.data ?? {} : {};

  const bonusSwitchData = {
    ...(parsedSwitchData?.bonus_switch ?? {}),
    monday_vip_bonus: (parsedSwitchData?.bonus_switch?.monday_vip_bonus ?? 1),// 即使返回null 或者没有也要 1，除非确定返回 0
  };

  return {
    switchData: {
      bonus_switch: bonusSwitchData,
    },
    refetch,
    isLoading,
  };
};
