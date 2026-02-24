import { useTranslation } from "react-i18next";
import { BannerListForPc, BannerList } from "@/sections/bonus/specialOffers/BannerList.tsx";
import { useGetPromoByPage } from "@/query/promo.tsx";
import { useFinanceModal, useModals } from "@/contexts/ModalsProvider.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useBonusWallet } from "@/query/dollars.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { EBonus } from "@/components/modal/bonus-wallet/components.tsx";
// import { useMemo } from "react";
// import { useTodayDepositCount } from "@/hooks/api/useAuth.ts";

export const SpecialOffersPC = () => {
  const { t } = useTranslation();
  const { isUserFinanceOpen } = useFinanceModal();
  const { currentPromo, total } = useGetPromoByPage(isUserFinanceOpen);
  const { openSpecialOffersModal } = useModals();

  const { status } = useAuth();

  // 彩金钱包数据
  const { data: bonusWallet } = useBonusWallet();

  // 彩金活动
  const mini_bonus = bonusWallet?.data?.bonus_wallet_name?.includes(EBonus.MINI);
  const mega_bonus = bonusWallet?.data?.bonus_wallet_name?.includes(EBonus.MEGA);
  const deposit_times = status?.deposit_times === 1;

  return ((!mini_bonus && !mega_bonus) || ((mini_bonus || mega_bonus) && deposit_times)) && (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2">
          <p className="text-sm leading-3 text-base">{t("finance:specialOffers")}</p>
          <span
            className="indicator-item badge badge-primary z-11 rounded-full p-0 font-bold h-4 w-4 text-xs">{total}</span>
        </div>
        <button
          className={"btn btn-square bg-base-200"}
          onClick={() => openSpecialOffersModal()}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd"
                  d="M10 3C10.2086 3 10.4077 3.08684 10.5496 3.23966L13.7996 6.73966C14.0815 7.04319 14.0639 7.51774 13.7603 7.7996C13.4568 8.08145 12.9823 8.06387 12.7004 7.76034L10 4.85221L7.2996 7.76034C7.01775 8.06387 6.5432 8.08145 6.23966 7.79959C5.93613 7.51774 5.91856 7.04319 6.20041 6.73966L9.45041 3.23966C9.59232 3.08684 9.79145 3 10 3ZM6.23967 12.2004C6.5432 11.9186 7.01775 11.9361 7.2996 12.2397L10 15.1478L12.7004 12.2397C12.9823 11.9361 13.4568 11.9186 13.7603 12.2004C14.0639 12.4823 14.0815 12.9568 13.7996 13.2603L10.5496 16.7603C10.4077 16.9132 10.2086 17 10 17C9.79145 17 9.59232 16.9132 9.45041 16.7603L6.20041 13.2603C5.91856 12.9568 5.93613 12.4823 6.23967 12.2004Z"
                  fill="var(--color-primary)" />
          </svg>
        </button>
      </div>
      <div className="border border-primary rounded-lg">
        <BannerListForPc currentPromo={currentPromo} />
      </div>
    </div>
  );
};

export const SpecialOffersH5 = () => {
  const { isUserFinanceOpen } = useFinanceModal();
  const { currentPromo, total } = useGetPromoByPage(isUserFinanceOpen);
  const { openSpecialOffersModal } = useModals();
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { status } = useAuth();

  // 彩金钱包数据
  const { data: bonusWallet } = useBonusWallet();

  // 统计今日充值次数
  // const { data: todayDepositCount } = useTodayDepositCount();

  // 彩金活动
  const mini_bonus = bonusWallet?.data?.bonus_wallet_name?.includes(EBonus.MINI);
  const mega_bonus = bonusWallet?.data?.bonus_wallet_name?.includes(EBonus.MEGA);
  const deposit_times = status?.deposit_times === 1;

  // 权重排序
  // 彩金 Bonus
  // Everyday Bonus
  // 1 Limit Offers
  // 2 Limit Offers
  // Recovery Bonus
  // Pool Bonus

  return (isMobile && ((!mini_bonus && !mega_bonus) || ((mini_bonus || mega_bonus) && deposit_times))) ? (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2">
          <p className="text-sm leading-3 text-base">{t("finance:specialOffers")}</p>
          <span className="indicator-item badge badge-primary rounded-full p-0 font-bold h-4 w-4 text-xs">{total}</span>
        </div>
        <button
          className={"btn btn-square bg-base-200"}
          onClick={() => openSpecialOffersModal()}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd"
                  d="M10 3C10.2086 3 10.4077 3.08684 10.5496 3.23966L13.7996 6.73966C14.0815 7.04319 14.0639 7.51774 13.7603 7.7996C13.4568 8.08145 12.9823 8.06387 12.7004 7.76034L10 4.85221L7.2996 7.76034C7.01775 8.06387 6.5432 8.08145 6.23966 7.79959C5.93613 7.51774 5.91856 7.04319 6.20041 6.73966L9.45041 3.23966C9.59232 3.08684 9.79145 3 10 3ZM6.23967 12.2004C6.5432 11.9186 7.01775 11.9361 7.2996 12.2397L10 15.1478L12.7004 12.2397C12.9823 11.9361 13.4568 11.9186 13.7603 12.2004C14.0639 12.4823 14.0815 12.9568 13.7996 13.2603L10.5496 16.7603C10.4077 16.9132 10.2086 17 10 17C9.79145 17 9.59232 16.9132 9.45041 16.7603L6.20041 13.2603C5.91856 12.9568 5.93613 12.4823 6.23967 12.2004Z"
                  fill="var(--color-primary)" />
          </svg>
        </button>
      </div>
      <div className="border border-primary rounded-lg">
        <BannerList currentPromo={currentPromo} />
      </div>
    </div>
  ) : <></>;
};