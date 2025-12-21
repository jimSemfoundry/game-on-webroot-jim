import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { useQuery } from "@tanstack/react-query";
import { useFinanceModal } from "@/contexts/ModalsProvider";
import { useBoundStore } from "@/store";
import { useState, useEffect } from "react";


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

export const useGetPromoByPage = () => {
  // const { user } = useAuth();
  const { isUserFinanceOpen } = useFinanceModal();
  const { depositType } = useBoundStore();
  const [currentPromo, setCurrentPromo] = useState<any>(null);
  const [data, setData] = useState<any>([]);

  // 先请求 getCurrentPromo
  const {
    data: currentPromoData = { data: null },
    isFetching: isFetchingCurrentPromo,
    refetch
  } = useQuery<any>({
    queryKey: ['getPromoByPage'],
    queryFn: async () => {
      return authService.getPromoByPageV2();
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: isUserFinanceOpen && depositType === "crypto" || isUserFinanceOpen && depositType === "fiat",
    // 5 seconds polling interval
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (currentPromoData?.data?.[0]?.promo_code === "special_offer_thursday"
      && isUserFinanceOpen
      && depositType === "fiat") {
      setCurrentPromo(null);
      return;
    }
    setCurrentPromo(currentPromoData?.data?.[0]);
  }, [currentPromoData, isUserFinanceOpen, depositType]);


  useEffect(() => {
    const rawData = currentPromoData?.data || [];
    if (!Array.isArray(rawData)) return;
    // 当 depositType === "fiat" 时，去除 promo_code 为 "special_offer_thursday" 的活动
    if (isUserFinanceOpen && depositType === "fiat") {
      setData(rawData.filter((item: any) => item.promo_code !== "special_offer_thursday"));
    } else {
      setData(rawData);
    }
  }, [currentPromoData?.data, isUserFinanceOpen, depositType]);

  return {
    currentPromo: currentPromo,
    isFetching: isFetchingCurrentPromo,
    total: (data?.length ?? 0) + 1,
    data: data,
    refetch
  };
};
