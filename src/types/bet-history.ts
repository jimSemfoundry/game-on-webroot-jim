import type { Currency } from "@/types/currency";

export interface BetHistoryQueryParams {
  page?: number;
  page_size?: number;
  asset?: string;
  game?: string;
  game_type?: string;
  provider?: string;
  time_range?: number;
  start_time?: number;
  end_time?: number;
}

export interface BetHistoryRecord {
  id?: number | string;
  bet_id?: string;
  game_order_id?: string | number;
  game_name?: string;
  game_provider?: string;
  order_time?: number | string;
  created_at?: number | string;
  updated_at?: number | string;
  bet_amount?: number | string;
  win_amount?: number | string;
  currency?: string;
  real_currency?: string;
  account_currency?: string;
  game_type?: string;
  asset?: string;
  [key: string]: unknown;
}

export interface BetHistoryPagination {
  current_page?: number;
  last_page?: number;
  has_more?: boolean;
  total?: number;
  per_page?: number;
  page_size?: number;
  next_page?: number;
}

export interface BetHistoryFilterOption {
  label: string;
  value: string;
}

export interface BetHistoryFilterGroup {
  games?: BetHistoryFilterOption[];
  assets?: string[];
  currencies?: string[];
  providers?: BetHistoryFilterOption[];
  [key: string]: unknown;
}

export interface BetHistoryPayload {
  records: BetHistoryRecord[];
  pagination?: BetHistoryPagination | null;
  filters?: BetHistoryFilterGroup;
  currencies?: Currency[];
  [key: string]: unknown;
}

export interface BetHistoryResponse {
  code?: number;
  msg?: string;
  data?: BetHistoryPayload | BetHistoryRecord[];
  pagination?: BetHistoryPagination;
  filters?: BetHistoryFilterGroup;
  [key: string]: unknown;
}
