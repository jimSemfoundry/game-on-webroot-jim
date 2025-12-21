import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export interface TransactionParams {
  status?: string;
  end_timestamp?: number;
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
    last_id: String(params.last_id ?? 0),
  };

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
