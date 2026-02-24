import { useAuth } from "@/contexts/AuthContext";
import { AUTH_QUERY_KEYS } from "@/hooks/api/useAuth.ts";
import { authService } from "@/services/authService";
import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ========== Type Definitions ==========

/**
 * Game item interface
 */
export interface Game {
  inner_game_id: string;
  game_provider: string;
  image: string;
  display_game_name: string;
  [key: string]: any;
}

/**
 * Currency interface
 */
export interface Currency {
  code: string;
  name: string;
  symbol?: string;
  [key: string]: any;
}

/**
 * Free spin record interface
 */
export interface FreeSpinRecord {
  id: string;
  bet_count: number;
  status: "pending" | "active" | "completed";
  created_at?: string;
  expires_at?: string;
  [key: string]: any;
}

/**
 * Hook for enabling free spins for a selected game
 * @returns Mutation hook for enabling free spins
 */
export const useEnableRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => authService.enableFreeSpinRecord(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["enableRecord"],
      });
      queryClient.invalidateQueries({
        queryKey: ["activeRecords"],
      });
      queryClient.invalidateQueries({
        queryKey: ["gameDetailsByUserFreeSpinRecord"],
      });

      if (result.code === 0) {
        toast.success("Free spin record enabled successfully!");
      } else {
        toast.error(result.msg || "Failed to enable free spin record");
      }
    },
    onError: (error: any) => {
      console.error("Failed to enable free spin record:", error);
      toast.error(error.response?.data?.msg || "Failed to enable free spin record");
    },
  });
};

/**
 * Hook for fetching the earliest pending free spins record
 * @returns Query hook with pending free spins data
 */
export const useEarliestPendingRecord = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["earliestPendingRecord"],
    queryFn: async () => {
      const result = await authService.getEarliestPendingRecord();
      return result.data;
    },
    enabled: !!user,
    refetchOnMount: true
  });
};

/**
 * Hook for claiming free spins reward
 * @returns Mutation hook for claiming free spins
 */
export const useClaimReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // 二选一，free_spin_code 和 record_id 只能传一个
    mutationFn: (params: { free_spin_code?: string; record_id?: string }) => authService.claimFreeSpinReward(params),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["activeRecords"],
      });
      queryClient.invalidateQueries({
        queryKey: ["gameDetailsByUserFreeSpinRecord"],
      });
      queryClient.invalidateQueries({
        queryKey: ["earliestPendingRecord"],
      });
      queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEYS.userFreeGameRecords,
      });

      if (result.code === 0) {
        toast.success("Free spin reward claimed successfully!");
      } else {
        toast.error(result.msg || "Failed to claim reward");
      }
    },
    onError: (error: any) => {
      console.error("Failed to claim free spin reward:", error);
      toast.error(error.response?.data?.msg || "Failed to claim reward");
    },
  });
};

/**
 * Response type for supported games
 */
export interface SupportedGamesResponse {
  code: number;
  msg?: string;
  data: {
    currencies: string;
    games: Game[];
    total: number;
    page?: number;
    page_size?: number;
    total_pages?: number;
    has_next?: boolean;
    has_prev?: boolean;
  };
}

export interface SupportedGamesParams {
  record_id: string;
  page?: number;
  page_size?: number;
}

/**
 * Hook for fetching supported games for free spins with infinite loading
 * @param params - Query parameters including record_id
 * @returns Infinite query hook with paginated games data
 */
export const useSupportedGamesInfinite = (params: Omit<SupportedGamesParams, "page" | "page_size">) => {
  const PAGE_SIZE = 20; // Default page size

  return useInfiniteQuery<SupportedGamesResponse>({
    queryKey: ["supportedGamesInfinite", params.record_id],
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams: SupportedGamesParams = {
        ...params,
        page: Number(pageParam),
        page_size: PAGE_SIZE,
      };

      const response = await authService.getSupportedFreeSpinGames(queryParams);
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Handle API response structure
      if (lastPage.code === 0 && lastPage.data) {
        // If API returns pagination info
        if (lastPage.data.has_next && lastPage.data.page && lastPage.data.total_pages) {
          return lastPage.data.page < lastPage.data.total_pages ? lastPage.data.page + 1 : undefined;
        }

        // Fallback: check if we have more data based on page size
        const currentPageGames = lastPage.data.games?.length || 0;
        if (currentPageGames === PAGE_SIZE) {
          return allPages.length + 1;
        }
      }

      return undefined;
    },
    enabled: !!params.record_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Parameters for active records query
 */
export interface ActiveRecordsParams {
  page?: number;
  page_size?: number;
}

/**
 * Response type for active records
 */
export interface ActiveRecordsResponse {
  code: number;
  msg?: string;
  data: {
    list: FreeSpinRecord[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * Hook for fetching active free spins records
 * @param params - Pagination parameters
 * @returns Query hook with active free spins data
 */
export const useActiveRecords = (params: ActiveRecordsParams) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["activeRecords", params.page],
    queryFn: async () => {
      const result = await authService.getActiveFreeSpinRecords(params);
      return result.data;
    },
    placeholderData: keepPreviousData,
    refetchOnMount: true,
    enabled: !!user,
  });
};

/**
 * Hook for canceling free spins record
 * @returns Mutation hook for canceling free spins
 */
export const useCancelFreeSpinRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (record_id: string) => authService.cancelFreeSpinRecord(record_id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["activeRecords"],
      });
      queryClient.invalidateQueries({
        queryKey: ["earliestPendingRecord"],
      });

      if (result.code === 0) {
        // toast.success("Free spin record cancelled successfully!");
      } else {
        toast.error(result.msg || "Failed to cancel record");
      }
    },
    onError: (error: any) => {
      console.error("Failed to cancel free spin record:", error);
      toast.error(error.response?.data?.msg || "Failed to cancel record");
    },
  });
};

/**
 * Parameters for game details query
 */
export interface GameDetailsByUserFreeSpinRecordParams {
  page?: number;
  page_size?: number;
}

/**
 * Response type for game details
 */
export interface GameDetailsByUserFreeSpinRecordResponse {
  code: number;
  msg?: string;
  data: {
    games: Game[];
    total: number;
    currencies: Currency[];
    user_free_spin_record: FreeSpinRecord;
    requested_record_id: number;
    found_record_count: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * Hook for fetching free spins game details with infinite loading
 * @param params - Optional query parameters
 * @returns Infinite query hook with paginated game details
 */
export const useGetGameDetailsByUserFreeSpinRecord = (params: Omit<GameDetailsByUserFreeSpinRecordParams, "page" | "page_size"> = {}) => {
  const { user } = useAuth();
  const PAGE_SIZE = 20; // Default page size

  return useInfiniteQuery<GameDetailsByUserFreeSpinRecordResponse>({
    queryKey: ["gameDetailsByUserFreeSpinRecord", params],
    queryFn: async ({ pageParam = 1 }) => {
      // Support page-based pagination
      const queryParams: GameDetailsByUserFreeSpinRecordParams = {
        ...params,
        page: Number(pageParam),
        page_size: PAGE_SIZE,
      };

      const response = await authService.getUserFreeGameRecords(queryParams);
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Handle page-based pagination with pagination object
      if (lastPage.data && lastPage.data.has_next) {
        const currentPage = lastPage.data.page;
        if (lastPage.data.has_next && currentPage < lastPage.data.total_pages) {
          return currentPage + 1;
        }
        return undefined;
      }

      // Handle simple has_more flag without pagination object
      if (lastPage.data && lastPage.data.has_next && lastPage.data.page_size === PAGE_SIZE) {
        // Calculate next page based on the number of pages we've already fetched
        return allPages.length + 1;
      }

      return undefined;
    },
    refetchOnMount: true,
    enabled: !!user,
  });
};
