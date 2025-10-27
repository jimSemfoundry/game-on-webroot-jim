import { useQuery } from "@tanstack/react-query";
import { publicService } from "@/services/publicService.ts";

export function useCountryCodeByIp() {
  return useQuery({
    queryKey: ['countryCodeByIp'],
    queryFn: () => publicService.getCountryCodeByIp(),
  });
}
