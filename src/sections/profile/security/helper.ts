import { useQuery } from "@tanstack/react-query";
import { publicService } from "@/services/publicService.ts";
import { getAggregationPayload, useAggregationConfig } from "@/hooks/api/usePublic";

export function useCountryCodeByIp() {
  const { data: aggregationResponse, isFetching: isAggregationFetching } = useAggregationConfig();
  const aggregationPayload = getAggregationPayload(aggregationResponse);
  const hasAggregatedCountryCode = aggregationPayload?.country_code?.code === 0;

  return useQuery({
    queryKey: ['countryCodeByIp'],
    queryFn: () => publicService.getCountryCodeByIp(),
    enabled: !isAggregationFetching && !hasAggregatedCountryCode,
  });
}
