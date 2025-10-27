import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { useQuery } from "@tanstack/react-query";

export interface RolloverParams {
  limit?: number;
  last_id?: number | string;
  type?: string;
  statuses?: string;
}

export interface UseRolloverOptions {
  enabled?: boolean;
}

export const ROLLOVER_PAGE_SIZE = 10;

const buildParams = (params: RolloverParams) => {
  const payload: Record<string, any> = {
    limit: params.limit ?? ROLLOVER_PAGE_SIZE,
    last_id: params.last_id ?? 0,
  };

  if (params.type) {
    payload.type = params.type;
  }

  if (params.statuses) {
    payload.statuses = params.statuses;
  }

  return payload;
};

export const useRolloverRecords = (params: RolloverParams, options?: UseRolloverOptions) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["rolloverRecords", params, user?.id],
    queryFn: () => authService.getUserRolloverRecords(buildParams(params)),
    enabled: !!user && (options?.enabled ?? true),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};
