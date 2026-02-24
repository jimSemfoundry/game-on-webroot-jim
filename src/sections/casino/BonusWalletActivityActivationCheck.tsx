import { PropsWithChildren, useEffect } from "react";
import { useBoundStore } from "@/store";
import { useBonusWallet } from "@/query/dollars.ts";
import { useCurrentUser, useUserBonusLatestHistory } from "@/hooks/api/useAuth.ts";
import { hasAuth } from "@/utils/auth.ts";

export const BonusWalletActivityActivationCheck = (props: PropsWithChildren) => {
  const openModal = useBoundStore((state) => state.openModal);

  const current_user = useCurrentUser();

  // 彩金钱包数据
  const { data: bonusWallet, isLoading: l1 } = useBonusWallet();

  const { data: bonusLatest, isLoading: l2 } = useUserBonusLatestHistory();

  const total_records = bonusWallet?.total_records;

  const bonus_latest = bonusLatest?.data;

  useEffect(() => {
    const current_user_data = current_user?.data;
    const bet_times = current_user_data?.status?.bet_times as number;
    const recent_game = current_user_data?.status?.recents_game as number;
    const deposit_times = current_user_data?.status?.deposit_times as number;
    const bonus_wallet_name = current_user_data?.status?.bonus_wallet_name;

    if (!hasAuth()) return;
    if (current_user?.isLoading || !current_user_data || l1 || l2) return;
    if (!bonusLatest) return;
    if (!bonusWallet) return;
    if (bonus_latest) return;
    if (total_records > 0) return;
    if (bonus_wallet_name !== "") return;
    if (bet_times > 0 || deposit_times > 0 || recent_game > 0) return;

    openModal("OPEN_OPTIONAL_BONUS_MODAL");
  }, [
    l1, l2,
    bonusLatest?.data,
    bonusWallet?.total_records,
    current_user?.isLoading,
    current_user?.data?.status?.bet_times,
    current_user?.data?.status?.deposit_times,
    current_user?.data?.status?.bonus_wallet_name,
    openModal
  ]);

  return props.children;
};