import { useDefaultAdTag } from "@/hooks/api/useAuth.ts";
import { useMemo } from "react";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";

/**
 * 个人对外的注册推荐链接
 * @returns referralLink: 推荐链接
 * @returns baseConfLoading: 基础配置数据是否加载完毕
 * @returns adTagDataLoading: 推广码配置数据是否加载完毕
 */
export const useReferralLink = (custom_referral_code?: string) => {
  const { data: baseConf, isLoading: baseConfLoading } = useBaseConfig();

  const { data: adTagData, isLoading: adTagDataLoading, refetch: refetchAdTagData } = useDefaultAdTag();

  const referralLink = useMemo(() => {
    if (baseConfLoading || adTagDataLoading) return '🏃......';
    const referral_code = custom_referral_code || adTagData?.data?.code
    return (referral_code ? `${baseConf?.data?.h5}?startapp=${referral_code}` : "- -")
  }, [baseConf, adTagData, custom_referral_code]);

  return {
    referralLink,
    baseConfLoading,
    adTagDataLoading,
    refetchAdTagData
  }
};