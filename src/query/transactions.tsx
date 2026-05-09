import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { bountyService } from "@/services/bountyService";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export interface TransactionParams {
  status?: string;
  page?: number;
  end_timestamp?: number;
  last_created_at?: number;
  currency?: string;
  limit?: number;
  last_id?: string | number;
}

export interface ClaimLogTransactionParams {
  end_timestamp?: number;
  currency?: string;
  limit?: number;
  page?: number;
  item: "referral" | "group";
}

export interface UseTransactionOptions {
  enabled?: boolean;
}

export const TRANSACTION_PAGE_SIZE = 10;

const buildQueryParams = (params: TransactionParams, options: { includeStatus?: boolean } = { includeStatus: true }) => {
  const size = params.limit ?? TRANSACTION_PAGE_SIZE;
  const queryParams: Record<string, string> = {
    limit: String(size),
  };

  if (params.page) {
    queryParams.page = String(params.page ?? 0);
  }

  if (params.last_id) {
    queryParams.last_id = String(params.last_id ?? 0);
  }

  if (params.last_created_at) {
    queryParams.last_created_at = String(params.last_created_at ?? 0);
  }

  if (options.includeStatus !== false && params.status) {
    queryParams.status = params.status;
  }

  if (params.end_timestamp) {
    queryParams.end_timestamp = String(params.end_timestamp);
  }

  if (params.currency) {
    queryParams.currency = params.currency;
  }

  return queryParams;
};

const buildClaimLogQueryParams = (params: ClaimLogTransactionParams) => {
  const queryParams: Record<string, string> = {
    item: params.item,
    limit: String(params.limit ?? TRANSACTION_PAGE_SIZE),
  };

  if (params.page) {
    queryParams.page = String(params.page);
  }
  if (params.end_timestamp) {
    queryParams.end_timestamp = String(params.end_timestamp);
  }
  if (params.currency) {
    queryParams.currency = params.currency;
  }

  return queryParams;
};

export const useDepositRecords = (params: TransactionParams, options?: UseTransactionOptions) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["depositRecords", params, user?.id],
    queryFn: () => authService.getUserDepositOrders(buildQueryParams(params)),
    enabled: !!user && (options?.enabled ?? true),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useWithdrawRecords = (params: TransactionParams, options?: UseTransactionOptions) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["withdrawRecords", params, user?.id],
    queryFn: () => authService.getUserWithdrawOrders(buildQueryParams(params)),
    enabled: !!user && (options?.enabled ?? true),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useBonusRecords = (params: TransactionParams, options?: UseTransactionOptions) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["bonusRecords", params, user?.id],
    queryFn: () => authService.getUserBonusRecords(buildQueryParams(params)),
    enabled: !!user && (options?.enabled ?? true),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useBountyClaimRecords = (params: TransactionParams, options?: UseTransactionOptions) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["bountyClaimRecords", params, user?.id],
    queryFn: async () => {
      const response = await bountyService.getMyWinList({
        page: params.page ?? 1,
        limit: params.limit ?? TRANSACTION_PAGE_SIZE,
        claim_status: 1, // 仅已领取的 bounty 进入 Claim History
      });
      // 把 bounty MyWinListResponse 归一化为 transactions 列表期望的形状：
      // - extractTransactionPayload 期望 records 数组里每条有 id / created_at / amount / currency / status
      // - bounty 的 winner_id 用作 id；claimed_at 用作 created_at；claim_amount/claim_currency 用作 amount/currency
      const data = response.data?.data;
      const list = (data?.list ?? []).map((w) => ({
        id: w.winner_id,
        created_at: w.claimed_at,
        amount: w.claim_amount,
        currency: w.claim_currency,
        status: w.claim_status,
        bounty_name: w.bounty_name,
        display_game_name: w.display_game_name,
        // 保留原始 winner 数据，给详情对话框使用
        _bounty: w,
      }));
      return {
        code: response.data?.code ?? 0,
        msg: response.data?.msg ?? "",
        data: {
          list,
          total: data?.count ?? list.length,
          page: data?.page ?? 1,
          limit: data?.limit ?? params.limit ?? TRANSACTION_PAGE_SIZE,
        },
      };
    },
    enabled: !!user && (options?.enabled ?? true),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useBonusWalletRecords = (params: TransactionParams, options?: UseTransactionOptions) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["bonusWalletRecords", params, user?.id],
    queryFn: () => authService.getBonusWalletRecords(buildQueryParams(params)),
    enabled: !!user && (options?.enabled ?? true),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useSportsBonusWalletRecords = (params: TransactionParams, options?: UseTransactionOptions) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sportsBonusWalletRecords", params, user?.id],
    queryFn: () => authService.getSportsBonusWalletRecords(buildQueryParams(params)),
    enabled: !!user && (options?.enabled ?? true),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useSwapRecords = (params: TransactionParams, options?: UseTransactionOptions) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["swapRecords", params, user?.id],
    queryFn: () => authService.getUserSwapRecords(buildQueryParams(params)),
    enabled: !!user && (options?.enabled ?? true),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useReferralRecords = (params: Omit<ClaimLogTransactionParams, "item">, options?: UseTransactionOptions) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["referralRecords", params, user?.id],
    queryFn: () => authService.getUserReferralRecords(buildClaimLogQueryParams({ ...params, item: "referral" })),
    enabled: !!user && (options?.enabled ?? true),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useCommissionRecords = (params: Omit<ClaimLogTransactionParams, "item">, options?: UseTransactionOptions) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["commissionRecords", params, user?.id],
    queryFn: () => authService.getUserCommissionRecords(buildClaimLogQueryParams({ ...params, item: "group" })),
    enabled: !!user && (options?.enabled ?? true),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useUserBalance = () => {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ["userBalance", user?.id],
    queryFn: async () => {
      const response = await authService.getUserBalance();
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: () => undefined,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};

export const useLastTournamentInfo = (tournament_id: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["lastTournamentInfo", tournament_id],
    queryFn: () => authService.getUserLastTournamentInfo(tournament_id),
    enabled: !!user,
  });
};
