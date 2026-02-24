import { Modal } from "@/components/ui/Modal";
import { useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { ICommissionDetail, CommissionRecord } from '@/types/referral';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useDisplayCurrencyFormatter } from "@/hooks/currency";

export default function ReferralMyCommissionsDetails({ item, isOpen, onClose }: { item: CommissionRecord | null, isOpen: boolean, onClose: () => void }) {
  const [commissionDetail, setCommissionDetail] = useState<ICommissionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (item) {
      setLoading(true);
      authService.getRewardGroupLogDetail({ id: item.id }).then((res) => {
        setCommissionDetail(res.data);
        setLoading(false);
      });
    }
  }, [item]);

  const { formatWithoutConversion } = useDisplayCurrencyFormatter();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <a>
              <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.02436 3.17544C5.25868 3.40976 5.25868 3.78966 5.02436 4.02397L2.04863 6.99971L5.02436 9.97544C5.25868 10.2098 5.25868 10.5897 5.02436 10.824C4.79005 11.0583 4.41015 11.0583 4.17583 10.824L0.775834 7.42397C0.541519 7.18966 0.541519 6.80976 0.775834 6.57544L4.17583 3.17544C4.41015 2.94113 4.79005 2.94113 5.02436 3.17544ZM10.9758 3.17544C11.2101 2.94113 11.59 2.94113 11.8244 3.17544L15.2244 6.57544C15.4587 6.80976 15.4587 7.18966 15.2244 7.42397L11.8244 10.824C11.59 11.0583 11.2101 11.0583 10.9758 10.824C10.7415 10.5897 10.7415 10.2098 10.9758 9.97544L13.9516 6.99971L10.9758 4.02397C10.7415 3.78966 10.7415 3.40976 10.9758 3.17544Z"
                  fill="#A6ADBB"
                  style={{ fill: 'color(display-p3 0.6510 0.6784 0.7333)', fillOpacity: 1 }}
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.10204 0.608431C9.42859 0.664733 9.64768 0.975098 9.59137 1.30165L7.59137 12.9017C7.53507 13.2282 7.22471 13.4473 6.89815 13.391C6.5716 13.3347 6.35252 13.0243 6.40882 12.6978L8.40882 1.09776C8.46512 0.77121 8.77549 0.552129 9.10204 0.608431Z"
                  fill="#A6ADBB"
                  style={{ fill: 'color(display-p3 0.6510 0.6784 0.7333)', fillOpacity: 1 }}
                />
              </svg>
              {item?.id}
            </a>
          </li>
          <li>
            <a>
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5.9999 5.39961C7.32539 5.39961 8.3999 4.32509 8.3999 2.99961C8.3999 1.67413 7.32539 0.599609 5.9999 0.599609C4.67442 0.599609 3.5999 1.67413 3.5999 2.99961C3.5999 4.32509 4.67442 5.39961 5.9999 5.39961Z"
                  fill="#A6ADBB"
                  style={{ fill: 'color(display-p3 0.6510 0.6784 0.7333)', fillOpacity: 1 }}
                />
                <path
                  d="M0.772039 10.5944C0.616132 11.0009 0.755381 11.4564 1.09926 11.7233C2.45315 12.774 4.15352 13.3996 5.99999 13.3996C7.84836 13.3996 9.55031 12.7728 10.9049 11.7201C11.2486 11.453 11.3875 10.9973 11.2314 10.591C10.424 8.49044 8.38726 6.99961 6.00236 6.99961C3.61616 6.99961 1.57854 8.49207 0.772039 10.5944Z"
                  fill="#A6ADBB"
                  style={{ fill: 'color(display-p3 0.6510 0.6784 0.7333)', fillOpacity: 1 }}
                />
              </svg>
              {commissionDetail?.username}
            </a>
          </li>
        </ul>
      </div>
    }>
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="flex h-[180px] items-center justify-center">
            <span className="loading loading-spinner loading-xl text-primary" />
          </div>
        ) : (
          <>

            <div className="bg-base-100 rounded-xl">
              <div className="flex flex-col gap-1 py-2">
                <div className="flex h-6 items-center justify-between px-4">
                  <div className="text-sm">{t('referral:username')}</div>
                  <div className="text-sm font-semibold">{commissionDetail?.username}</div>
                </div>
                <div className="flex h-6 items-center justify-between px-4">
                  <div className="text-sm">{t('referral:registrationDate')}</div>
                  <div className="text-sm font-semibold">
                    {dayjs((commissionDetail?.regitration_date ?? 0) * 1000).format('YYYY-MM-DD')}
                  </div>
                </div>
                <div className="flex h-6 items-center justify-between px-4">
                  <div className="text-sm">{t('referral:level')}</div>
                  <div className="bg-neutral flex h-5 items-center justify-center rounded-full px-2 text-sm font-semibold">
                    <span>VIP {commissionDetail?.vip_level}</span>
                  </div>
                </div>
                <div className="flex h-6 items-center justify-between px-4">
                  <div className="text-sm">{t('referral:referralType')}</div>
                  <div className="text-sm font-bold">{commissionDetail?.referral_type === 'direct' ? t('referral:directfriend') : t('referral:indirectfriend')}</div>
                </div>
                <div className="flex h-6 items-center justify-between px-4">
                  <div className="text-sm">{t('referral:referralCode')}</div>
                  <div className="text-sm font-bold">{commissionDetail?.referral_code}</div>
                </div>
                <div className="flex h-6 items-center justify-between px-4">
                  <div className="text-sm">{t('referral:rewardsUnlocked')}</div>
                  <div className="text-primary text-sm font-semibold">
                    {/* {convertCurrency(referralDetail?.reward ?? 0, {
                          sourceCurrency: 'USDT',
                          targetCurrency: user?.currency_fiat ?? '',
                          decimalPoint: 8,
                        })} */}
                    {formatWithoutConversion(commissionDetail?.rewards_unlocked ?? 0, "USD", {
                      showSymbol: false,
                      showCode: true,
                      minimizeDecimals: true,
                      displayDecimal: 4,
                    }).formatted}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
