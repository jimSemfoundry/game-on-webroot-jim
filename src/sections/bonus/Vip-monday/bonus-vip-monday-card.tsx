/**
 * @Deprecated-20250926
 */

import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
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
import Iconify from "@/components/iconify";
import { VIP_REQUIREMENTS } from "../shared/config";
import { VipButton } from "../shared/VipButton";
import { useVibrantColor } from "@/hooks/useVibrantColor";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const BASE_SCRIM = "color-mix(in oklch, var(--color-base-300) 60%, transparent)";
const ILLUSTRATION_URL = "/images/rewards/vip-monday.png";
const DEFAULT_ACCENT = "#7C3AED";

const buildBackground = (accentStop: string, isMobile: boolean) =>
  isMobile
    ? `
      radial-gradient(
        95.05% 100% at 0% 35.47%,
        ${accentStop} 0%,
        ${BASE_SCRIM} 100%
      ),
      linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
    `
    : `radial-gradient(72.45% 49.48% at 50% 8.89%, ${accentStop} 0%, rgba(51, 51, 51, 0.08) 100%), var(--color-base-200)`;

export interface ClaimData {
  balance: string,
  bonus_amount: string,
  currency: string,
  claim_time: number
}

export const BonusVipMondayCard = () => {

  const navigate = useNavigate();
  const { t } = useTranslation();

  const [isOpenMysteryBoxModal, setIsOpenMysteryBoxModal] = useState(false);
  const queryClient = useQueryClient();
  const { status } = useAuth();
  const { mondayVipBonus } = useGetMondayVipBonus();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const [isOpenTipsModal, setIsOpenTipsModal] = useState(false);
  const accentStopFallback = useMemo(() => `color-mix(in oklch, ${DEFAULT_ACCENT} 40%, transparent)`, []);
  const fallbackGradient = useMemo(() => buildBackground(accentStopFallback, isMobile), [accentStopFallback, isMobile]);
  const { hex } = useVibrantColor(ILLUSTRATION_URL, {
    fallbackGradient,
    colorTypes: ["DarkMuted"],
    opacity: 0.45,
  });

  const background = useMemo(() => {
    const accentStop = `color-mix(in oklch, ${hex || DEFAULT_ACCENT} 40%, transparent)`;
    return buildBackground(accentStop, isMobile);
  }, [hex, isMobile]);

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

  return (
    <div
      className={`min-h-34 relative flex justify-center w-full flex-col gap-3 overflow-hidden rounded-field border ${isClaimable ? 'border-warning' : 'border-base-200/60'} bg-base-300/30 p-4 shadow-md transition-transform duration-200 hover:-translate-y-1 sm:min-h-[320px] sm:p-5`}
      style={{ background }}
    >
      <button className="btn btn-square btn-xs bg-base-200 absolute right-4 rtl:right-auto rtl:left-4 top-4" onClick={() => setIsOpenTipsModal(true)}>
        <Iconify icon="custom:info" className="text-base-content/50" />
      </button>
      <div className="flex w-full items-center gap-4 sm:flex-1 sm:flex-col sm:items-center sm:gap-3 sm:text-center">
        <div className="w-16 h-16 sm:size-[90px] grid place-items-center rounded-xl">
          <img src={ILLUSTRATION_URL} className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-1 flex-col gap-1 sm:gap-2 sm:items-center">
          <p className="text-sm font-bold sm:text-base text-left w-full">{t('bonus:vip_monday')}</p>
          {!isUnlocked && (
            <p className="text-xs text-base-content/50 text-left w-full leading-5">{t('bonus:vip_monday_description')}</p>
          )}
          {isUnlocked && (
            <p
              className="text-xs text-base-content/50 leading-5 sm:flex-1 text-left"
              dangerouslySetInnerHTML={{
                __html: t('bonus:vip_monday_wager', {
                  amount: `<span class="text-primary">${formatWithConversion(mondayVipBonus?.max_wager ?? 0, 'USD', {
                    showSymbol: true,
                    showCode: false,
                  }).formatted}</span>`,
                }),
              }}
            />
          )}
          {!isUnlocked && (
            <div className="hidden sm:flex sm:w-full sm:justify-center sm:mt-auto">
              <VipButton requiredLevel={requiredVipLevel} />
            </div>
          )}
        </div>
        {!isUnlocked && (
          <div className="flex sm:hidden">
            <VipButton requiredLevel={requiredVipLevel} />
          </div>
        )}
      </div>
      {
        (() => {
          const maxWager = new Decimal(mondayVipBonus?.max_wager ?? 0).toNumber();
          const currentWager = new Decimal(mondayVipBonus?.current_wager ?? 0).toNumber();
          return maxWager > currentWager && (status?.vip ?? 0) >= 2;
        })() && (
          <div className="flex w-full flex-col gap-3 sm:gap-4">
            <div className="flex w-full items-end justify-between gap-4 sm:flex-col sm:items-stretch">
              <div className="flex flex-col flex-1 gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-base-content/40">
                    {t('bonus:progress')}
                  </p>
                  <p className="text-xs font-semibold">
                    <span className="text-primary">
                      {(() => {
                        const currentStr = mondayVipBonus?.current_wager ?? '0';
                        const maxStr = mondayVipBonus?.max_wager ?? '0';

                        // 尝试用 Decimal 解析，如果失败/NaN，就当 0 处理
                        let current: Decimal;
                        let max: Decimal;

                        try {
                          current = new Decimal(currentStr || 0);
                        } catch {
                          current = new Decimal(0);
                        }

                        try {
                          max = new Decimal(maxStr || 0);
                        } catch {
                          max = new Decimal(0);
                        }

                        // max <= 0 时直接返回 0%，避免除 0 或 NaN
                        if (max.lte(0)) {
                          return '0';
                        }

                        // 当前打码量超过目标时，直接认为 100%
                        if (current.gt(max)) {
                          return '100';
                        }

                        const p = current.div(max).mul(100);

                        // 保留两位小数
                        return p.mod(1).isZero()
                          ? p.toString()
                          : p.mul(100).floor().div(100).toFixed(2);
                      })()}%
                    </span>
                  </p>
                </div>

                <progress
                  className="progress progress-primary"
                  value={mondayVipBonus?.current_wager ?? 0}
                  max={mondayVipBonus?.max_wager ?? 0}
                />
              </div>
              <button
                className="btn btn-primary btn-soft h-10 min-h-10 min-w-20 w-auto max-w-20 px-3 font-bold sm:btn-md sm:w-full sm:min-w-24 sm:max-w-none sm:px-6"
                onClick={() => navigate({ to: "/explore" })}
              >
                {t('bonus:go')}
              </button>
            </div>
          </div>
        )
      }
      {
        (() => {
          const nowInSeconds = Math.floor(Date.now() / 1000);
          const maxWager = new Decimal(mondayVipBonus?.max_wager ?? 0).toNumber();
          const currentWager = new Decimal(mondayVipBonus?.current_wager ?? 0).toNumber();
          const weekStartTime = mondayVipBonus?.week_start_time ?? 0;
          const weekEndTime = mondayVipBonus?.week_end_time ?? 0;

          return maxWager <= currentWager && weekStartTime <= nowInSeconds && nowInSeconds <= weekEndTime;
        })() && (
          <div className="flex justify-center">
            <button className="btn btn-primary w-full h-10 min-h-10 w-auto min-w-20 px-3 font-bold sm:btn-md sm:w-full sm:min-w-24 sm:max-w-none sm:px-6">
              {t('bonus:claim_on_monday')}
            </button>
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
          <div className="text-xs flex items-center justify-center gap-2 text-base-content/50">
            {t('bonus:next_claim_in')}
            <CountdownTimerThree expireTime={mondayVipBonus?.week_end_time ?? 0} isEndFun={() => {
              queryClient.resetQueries({ queryKey: ['PromoByPage'] });
            }} />
          </div>
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
          <div className="flex flex-col gap-2 items-center">
            <button className="btn btn-primary h-10 min-h-10 w-full px-3 font-bold sm:btn-md sm:min-w-24 sm:max-w-none sm:px-6" onClick={handleClaimBonus}>
              {t('bonus:claim')}
            </button>
            <div className="text-xs flex items-center justify-center gap-2 text-base-content/50">
              {t('bonus:next_claim_in')}
              <CountdownTimerThree expireTime={mondayVipBonus?.claim_end_time ?? 0} isEndFun={() => {
                queryClient.resetQueries({ queryKey: ['PromoByPage'] });
              }} />
            </div>
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
