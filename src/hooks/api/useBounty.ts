import { bountyService } from "@/services/bountyService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useChallengeList = (params: Parameters<typeof bountyService.getChallengeList>[0]) =>
  useQuery({
    queryKey: ["bounty", "list", params],
    queryFn: () => bountyService.getChallengeList(params).then((r) => r.data.data),
    staleTime: 30_000,
  });

export const useProviderFilter = () =>
  useQuery({
    queryKey: ["bounty", "providers"],
    queryFn: () => bountyService.getProviderFilter().then((r) => r.data.data),
    staleTime: 5 * 60_000,
  });

export const useMyWinList = (params: Parameters<typeof bountyService.getMyWinList>[0], enabled: boolean = true) =>
  useQuery({
    queryKey: ["bounty", "myWin", params],
    queryFn: () => bountyService.getMyWinList(params).then((r) => r.data.data),
    staleTime: 30_000,
    enabled,
  });

export const useBountyStatus = (enabled: boolean = true) =>
  useQuery({
    queryKey: ["bounty", "status"],
    queryFn: () => bountyService.getStatus().then((r) => r.data.data),
    staleTime: 60_000,
    enabled,
  });

export const useClaimCurrencyList = (enabled: boolean = true) =>
  useQuery({
    queryKey: ["bounty", "claimCurrencyList"],
    queryFn: () => bountyService.getClaimCurrencyList().then((r) => r.data.data),
    staleTime: 5 * 60_000,
    enabled,
  });

export const useClaimReward = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { winner_id: number; claim_currency: string }) => bountyService.claimReward(body).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bounty", "myWin"] });
      qc.invalidateQueries({ queryKey: ["bounty", "list"] });
      qc.invalidateQueries({ queryKey: ["claim", "count"] });
    },
  });
};
