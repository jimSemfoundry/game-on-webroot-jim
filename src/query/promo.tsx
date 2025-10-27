import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { useQuery } from "@tanstack/react-query";

export const useCurrentPromo = () => {
  const { user } = useAuth();

  // 先请求 getCurrentPromo
  const {
    data: currentPromoData = { data: null },
    isFetching: isFetchingCurrentPromo,
  } = useQuery<any>({     
    queryKey: ['currentPromo'],
    queryFn: async () => {
      return authService.getCurrentPromo();
    },
    enabled: !!user,
    refetchOnMount: true,
    retry: (failureCount: number, error: any) => {
      // 对于400错误不重试，其他错误最多重试2次
      return error?.response?.status !== 400 && failureCount < 2;
    },
  });

  return {
    currentPromo: currentPromoData?.data,
    isFetching: isFetchingCurrentPromo,
  };
};