/**
 * @Deprecated-20250926
 */
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useNavigate } from "@tanstack/react-router";
import { CountdownTimerThree } from "@/components/ui/CountdownTimer";
import { BonusVipMondayHelpModal } from './bonus-vip-monday-help-modal';
import { MysteryBoxModal } from './bonus-mystery-box-modal';
import { useGetMondayVipBonus } from '@/hooks/api/useAuth';
import { Decimal } from 'decimal.js';
import { VIP_REQUIREMENTS } from "../shared/config";
import { VipButton } from "../shared/VipButton";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { useDisplayCurrencyFormatter } from '@/contexts/DisplayCurrencyContext';
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";


export interface ClaimData {
  balance: string,
  bonus_amount: string,
  currency: string,
  claim_time: number
}

export const BonusVipMondayCardV2 = () => {

  const navigate = useNavigate();
  const { t } = useTranslation();

  const [isOpenMysteryBoxModal, setIsOpenMysteryBoxModal] = useState(false);
  const queryClient = useQueryClient();
  const { status } = useAuth();
  const { mondayVipBonus } = useGetMondayVipBonus();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const ILLUSTRATION_URL = useBonusDetailsImage("vip_monday", 96);

  const [isOpenTipsModal, setIsOpenTipsModal] = useState(false);

  const handleClaimBonus = () => {
    setIsOpenMysteryBoxModal(true)
  }

  const requiredVipLevel = VIP_REQUIREMENTS.vipMonday.requiredLevel;
  const isUnlocked = (status?.vip ?? 0) >= requiredVipLevel;

  // 可领取状态
  const isClaimable = useMemo(() => {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const maxWager = new Decimal(mondayVipBonus?.max_wager ?? 0).toNumber();
    const currentWager = new Decimal(mondayVipBonus?.current_wager ?? 0).toNumber();
    const claimEndTime = mondayVipBonus?.claim_end_time ?? 0;
    const claimStartTime = mondayVipBonus?.claim_start_time ?? 0;
    return maxWager <= currentWager && claimStartTime <= nowInSeconds && nowInSeconds <= claimEndTime;
  }, [mondayVipBonus]);

  const formattedCurrentWager = formatWithConversion(mondayVipBonus?.current_wager ?? 0, "USDT", {
    showSymbol: true,
    showCode: false,
  });

  const formattedMaxWager = formatWithConversion(mondayVipBonus?.max_wager ?? 0, "USDT", {
    showSymbol: true,
    showCode: false,
  });

  return (
    <div
      className={`relative flex w-full items-center overflow-hidden rounded-xl border ${isClaimable ? "border-warning" : "border-base-200/60"} bg-base-200 p-4 shadow-md transition-transform duration-200 hover:-translate-y-1 h-[104px] sm:h-[214px] sm:flex-col sm:items-center`}
    >
      <Info className="absolute right-4 rtl:right-auto rtl:left-4 top-4" onClick={() => setIsOpenTipsModal(true)} />
      <div className="flex w-full h-full items-center gap-4 sm:flex-1 sm:flex-col sm:items-center sm:gap-3 sm:text-center sm:pt-8 ">
        <div className="w-12 h-12">
          <img src={ILLUSTRATION_URL} className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-1 gap-4 sm:gap-0 sm:flex-col items-center justify-between h-full w-full">
          <div className="flex-1 w-full">
            <p className="text-sm font-bold sm:text-base text-left w-full sm:text-center">{t('bonus:vip_monday')}</p>
            {
              (() => {
                const maxWager = new Decimal(mondayVipBonus?.max_wager ?? 0).toNumber();
                const currentWager = new Decimal(mondayVipBonus?.current_wager ?? 0).toNumber();
                return (status?.vip ?? 0) >= 2 && maxWager > currentWager;
              })() && (
                // <progress
                //   className="progress progress-primary"
                //   value={mondayVipBonus?.current_wager ?? 0}
                //   max={mondayVipBonus?.max_wager ?? 0}
                // />
                <div className='text-xs font-semibold text-base-content/50'>
                  <span className='text-primary'>
                    {formattedCurrentWager.formatted}
                  </span>
                  <span className='mx-1'>/</span>
                  <span>
                    {formattedMaxWager.formatted}
                  </span>
                </div>
              )
            }
          </div>

          <div className="flex flex-col items-end justify-end self-stretch">
            {
              (() => {
                const maxWager = new Decimal(mondayVipBonus?.max_wager ?? 0).toNumber();
                const currentWager = new Decimal(mondayVipBonus?.current_wager ?? 0).toNumber();
                return maxWager > currentWager && (status?.vip ?? 0) >= 2;
              })() && (
                <button
                  className="btn btn-primary btn-soft h-10 min-h-10 min-w-20 w-auto max-w-20 px-3 font-bold sm:btn-md sm:w-full sm:min-w-24 sm:max-w-none sm:px-6"
                  onClick={() => navigate({ to: "/explore" })}
                >
                  {t('bonus:go')}
                </button>
              )
            }

            {!isUnlocked && (
              <VipButton requiredLevel={requiredVipLevel} />
            )}

            {
              (() => {
                const nowInSeconds = Math.floor(Date.now() / 1000);
                const maxWager = new Decimal(mondayVipBonus?.max_wager ?? 0).toNumber();
                const currentWager = new Decimal(mondayVipBonus?.current_wager ?? 0).toNumber();
                const weekStartTime = mondayVipBonus?.week_start_time ?? 0;
                const weekEndTime = mondayVipBonus?.week_end_time ?? 0;

                return maxWager <= currentWager && weekStartTime <= nowInSeconds && nowInSeconds <= weekEndTime;
              })() && (
                <button className="btn btn-primary w-full h-10 min-h-10 min-w-20 w-auto font-bold leading-4">
                  {t('bonus:claim_on_monday')}
                </button>
              )
            }

            {
              (() => {
                const nowInSeconds = Math.floor(Date.now() / 1000);
                const maxWager = new Decimal(mondayVipBonus?.max_wager ?? 0).toNumber();
                const currentWager = new Decimal(mondayVipBonus?.current_wager ?? 0).toNumber();
                const claimEndTime = mondayVipBonus?.claim_end_time ?? 0;
                const claimStartTime = mondayVipBonus?.claim_start_time ?? 0;

                return maxWager <= currentWager && claimStartTime <= nowInSeconds && nowInSeconds <= claimEndTime;
              })() && (
                <button className="btn btn-primary h-10 min-h-10 w-full px-3 font-bold sm:btn-md sm:min-w-24 sm:max-w-none sm:px-6" onClick={handleClaimBonus}>
                  {t('bonus:claim')}
                </button>
              )
            }
          </div>
        </div>
      </div>

      {
        (() => {
          const nowInSeconds = Math.floor(Date.now() / 1000);
          const maxWager = new Decimal(mondayVipBonus?.max_wager ?? 0).toNumber();
          const currentWager = new Decimal(mondayVipBonus?.current_wager ?? 0).toNumber();
          const claimEndTime = mondayVipBonus?.claim_end_time ?? 0;
          const claimStartTime = mondayVipBonus?.claim_start_time ?? 0;

          return maxWager <= currentWager && claimStartTime <= nowInSeconds && nowInSeconds <= claimEndTime;
        })() && (
          <div className="text-[10px] flex flex-nowrap items-center text-left absolute top-0 rtl:left-0 right-0 rtl:right-auto w-fit max-w-full bg-primary text-primary-content font-semibold pl-2 rtl:pr-2 rtl:pl-0 rounded-tl-[4px] rounded-bl-[4px] rtl:rounded-tl-[0px] rtl:rounded-bl-[0px] rtl:rounded-tr-[4px] rtl:rounded-br-[4px]">
            <div className="min-w-0 whitespace-normal break-words leading-2.5 text-right rtl:text-left">{t('bonus:next_claim_in')}</div>:
            <CountdownTimerThree className="!gap-0 justify-start" timeClassName="w-[24px] text-center whitespace-nowrap" expireTime={mondayVipBonus?.claim_end_time ?? 0} isEndFun={() => {
              queryClient.resetQueries({ queryKey: ['PromoByPage'] });
            }} />
          </div>
        )
      }

      {
        (() => {
          const nowInSeconds = Math.floor(Date.now() / 1000);
          const weekStartTime = mondayVipBonus?.week_start_time ?? 0;
          const weekEndTime = mondayVipBonus?.week_end_time ?? 0;

          return (status?.vip ?? 0) >= 2 && weekStartTime <= nowInSeconds && nowInSeconds <= weekEndTime;
        })() && (
          <div className="text-[10px] flex flex-nowrap items-center text-left absolute top-0 rtl:left-0 right-0 rtl:right-auto w-fit max-w-full bg-primary text-primary-content font-semibold pl-2 rtl:pr-2 rtl:pl-0 rounded-tl-[4px] rounded-bl-[4px] rtl:rounded-tl-[0px] rtl:rounded-bl-[0px] rtl:rounded-tr-[4px] rtl:rounded-br-[4px]">
            <div className="min-w-0 whitespace-normal break-words leading-2.5 text-right rtl:text-left">{t('bonus:next_claim_in')}</div>:
            <CountdownTimerThree className="!gap-0 justify-start" timeClassName="w-[24px] text-center whitespace-nowrap" expireTime={mondayVipBonus?.week_end_time ?? 0} isEndFun={() => {
              queryClient.resetQueries({ queryKey: ['PromoByPage'] });
            }} />
          </div>
        )
      }

      <BonusVipMondayHelpModal isOpen={isOpenTipsModal} onClose={() => setIsOpenTipsModal(false)} />

      <MysteryBoxModal
        id={mondayVipBonus?.id}
        isOpen={isOpenMysteryBoxModal}
        onClose={() => {
          setIsOpenMysteryBoxModal(false)
        }} />
    </div >
  );
};
