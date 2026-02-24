import { useMemo } from "react";
import { useBoundStore } from "@/store";
import { useBonusWallet } from "@/query/dollars.ts";
import { useCurrentUser, useUserBonusLatestHistory } from "@/hooks/api/useAuth.ts";
import { hasAuth } from "@/utils/auth.ts";
import { useTranslation } from "react-i18next";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";

export const BonusWalletChooseGuard = () => {
  const openModal = useBoundStore((state) => state.openModal);

  const current_user = useCurrentUser();

  const { t } = useTranslation();

  // 基础配置数据
  const { data: baseConfig, isLoading: l0 } = useBaseConfig();

  // 彩金钱包数据
  const { data: bonusWallet, isLoading: l1 } = useBonusWallet();

  const { data: bonusLatest, isLoading: l2 } = useUserBonusLatestHistory();

  const total_records = bonusWallet?.total_records;

  const bonus_latest = bonusLatest?.data;

  // 彩金钱包的总开关是否开启
  const slot_bonus_wallet = baseConfig?.data?.bonus_switch?.slot_bonus_wallet !== 0;

  return useMemo(() => {
    const current_user_data = current_user?.data;
    const bet_times = current_user_data?.status?.bet_times as number;
    const recent_game = current_user_data?.status?.recents_game as number;
    const deposit_times = current_user_data?.status?.deposit_times as number;
    const bonus_wallet_name = current_user_data?.status?.bonus_wallet_name;

    if (!hasAuth()) return null;
    if (!slot_bonus_wallet) return null;
    if (current_user?.isLoading || !current_user_data || l0 || l1 || l2) return null;
    if (!bonusLatest) return null;
    if (!bonusWallet) return null;
    if (bonus_latest) return null;
    if (total_records > 0) return null;
    if (bonus_wallet_name !== "") return null;
    if (bet_times > 0 || deposit_times > 0 || recent_game) return null;

    return <div className={"flex flex-col gap-4 p-4 text-center border-2 border-base-100 rounded-lg"}>
      <p className={"leading-4 text-primary font-bold text-sm"}>{t("bonus:prepared_for_you")}</p>
      <button onClick={() => {
        openModal("OPEN_OPTIONAL_BONUS_MODAL");
      }} className="btn btn-primary w-full">
        {t("common:choose")}
      </button>
    </div>;
  }, [
    l0, l1, l2,
    bonusLatest?.data,
    bonusWallet?.total_records,
    current_user?.isLoading,
    current_user?.data?.status?.bet_times,
    current_user?.data?.status?.deposit_times,
    current_user?.data?.status?.bonus_wallet_name,
    baseConfig?.data?.bonus_switch?.slot_bonus_wallet,
    openModal
  ]);
};