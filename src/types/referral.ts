export interface ReferralListItem {
  id: string;
  down_line: string;
  down_line_username: string;
  refer_type: "direct" | "indirect";
  vip_level: number;
  reward: number;
  referral_code: string;
  regitration_date: number;
}

export interface GetReferralListParams {
  limit: number;
  last_id?: string;
  period?: "All" | "Today" | "Yesterday" | "This Week" | "Last Week" | "This Month" | "Last Month";
  type?: "All" | "direct" | "indirect";
  keyword?: string;
}

export interface ReferralListResponse {
  code: number;
  data: ReferralListItem[];
  msg?: string;
}

export interface AdTag {
  id: string;
  campaign: string;
  code: string;
  register_count: number;
  is_default: boolean;
  created_at: number;
}

export interface AdTagListResponse {
  code: number;
  data: AdTag[];
  msg?: string;
}

export interface CreateAdTagParams {
  campaign: string;
  code: string;
  is_default?: boolean;
  share?: string;
}

export interface CommissionRecord {
  id: string;
  down_line: string;
  down_line_username: string;
  refer_type: "direct" | "indirect";
  game_type_2: string;
  reward: number;
  created_at: number;
}

export interface GetCommissionListParams {
  limit: number;
  page: number;
  up_line?: string;
}

export interface CommissionListResponse {
  code: number;
  data: CommissionRecord[];
  page: number;
  last_page: number;
  msg?: string;
}

export interface GetReferralRewardsListParams {
  limit: number;
  page: number;
}

export type ReferralRewardsRecord = {
  id: number;
  up_line: number;
  down_line: number;
  down_line_username: string;
  reward: string;
  created_at: number;
  updated_at: number;
  downLineUserStatus: {
    user_id: number;
    vip: number;
  };
  downLineUser: {
    id: number;
    nickname: string;
  };
};

export interface ReferralRewardsListResponse {
  code: number;
  data: {
    code: number;
    data: ReferralRewardsRecord[];
    msg: string;
  };
  page: number;
  last_page: number;
  msg?: string;
}