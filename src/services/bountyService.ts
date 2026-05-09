import authAxiosInstance from "@/lib/authAxios";
import publicAxiosInstance from "@/lib/publicAxios";
import type { ApiResponse } from "@/types/auth";

export interface BountyChallenge {
  id: number;
  bounty_name: string;
  inner_game_id: string;
  game_provider: string;
  display_game_name: string;
  image: string;
  multiplier: number;
  min_bet_amount: number;
  min_bet_currency: string;
  winner_slots: number;
  completed_count: number;
  reward_amount: number;
  reward_currency: string;
  wagering_requirement: number;
  status: 1 | 2 | 3;
  status_label: string;
  created_at: number;
  winners?: BountyWinnerSummary[];
}

export interface BountyWinnerSummary {
  winner_id: number;
  username: string;
  slot_no: number;
  bet_multiplier: number;
  bet_amount: number;
  bet_currency: string;
  settle_at: number;
  reward_amount: number;
  reward_currency: string;
}

export interface BountyMyWin {
  winner_id: number;
  bounty_name: string;
  inner_game_id: string;
  game_provider: string;
  display_game_name: string;
  image: string;
  multiplier: number | null;
  winner_slots: number | null;
  completed_count: number | null;
  min_bet_amount: number;
  min_bet_currency: string;
  slot_no: number;
  bet_multiplier: number;
  bet_amount: number;
  bet_currency: string;
  settle_at: number;
  reward_amount: number;
  reward_currency: string;
  claim_amount: number;
  claim_currency: string;
  claim_status: 0 | 1;
  claimed_at: number;
}

export interface ChallengeListResponse {
  count: number;
  page: number;
  limit: number;
  list: BountyChallenge[];
}

export interface MyWinListResponse {
  count: number;
  page: number;
  limit: number;
  list: BountyMyWin[];
}

export interface BountyStatusResponse {
  is_forbidden: boolean;
  branch_enabled: boolean;
}

export interface ClaimCurrencyListResponse {
  default: string;
  list: string[];
}

export interface ClaimRewardResponse {
  winner_id: number;
  reward_amount: number;
  reward_currency: string;
  claim_amount: number;
  claim_currency: string;
  claim_status: 1;
  claimed_at: number;
}

export const bountyService = {
  getChallengeList(body: {
    tab: "active" | "completed";
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
    keyword?: string;
    provider?: string;
  }) {
    return publicAxiosInstance.post<ApiResponse<ChallengeListResponse>>("/Bounty/getChallengeList", body);
  },

  getProviderFilter() {
    return publicAxiosInstance.post<ApiResponse<{ providers: string[] }>>("/Bounty/getProviderFilter", {});
  },

  getMyWinList(body: { page?: number; limit?: number; claim_status?: number | ""; keyword?: string; provider?: string }) {
    return authAxiosInstance.post<ApiResponse<MyWinListResponse>>("/Bounty/getMyWinList", body);
  },

  claimReward(body: { winner_id: number; claim_currency: string }) {
    return authAxiosInstance.post<ApiResponse<ClaimRewardResponse>>("/Bounty/claimReward", body);
  },

  getStatus() {
    return authAxiosInstance.post<ApiResponse<BountyStatusResponse>>("/Bounty/getBountyStatus", {});
  },

  getClaimCurrencyList() {
    return authAxiosInstance.post<ApiResponse<ClaimCurrencyListResponse>>("/Bounty/getClaimCurrencyList", {});
  },
};
