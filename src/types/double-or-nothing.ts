export type IDoubledUpProps = {
  don_record_id: string;
  is_win: boolean;
  final_amount: number;
}

export interface ICurrentPromo {
  promo_code: string;
  promo_type: number;
  expired_at: number;
  min_amount: string;
  bonus_amount: string;
  total_deposit: string;
}
