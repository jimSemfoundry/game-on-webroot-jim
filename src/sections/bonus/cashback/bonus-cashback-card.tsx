import Iconify from "@/components/iconify";
import { Countdown } from "@/components/ui";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { Select, SelectOption } from "@/components/ui/Select";
import { BonusClaimConfirmationModal } from "@/sections/bonus/shared/double-or-nothing/bonus-claim-confirmation-modal";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useTipsModal } from "@/contexts/ModalsProvider";
import { useClaimBonus, useClaimBonusMutation } from "@/hooks/api/useAuth";
import { useBonusClaimConfirmation } from "@/sections/bonus/shared/use-bonus-claim-confirmation";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FastAverageColor } from "fast-average-color";
import { authService } from "@/services/authService";
import { IDoubledUpProps } from "@/types/double-or-nothing";
import { DoubledUp } from "../shared/double-or-nothing/DoubledUp";
import { Nothing } from "../shared/double-or-nothing/Nothing";

const BASE_SCRIM = "color-mix(in oklch, var(--color-base-300) 60%, transparent)";
const DEFAULT_GRADIENT = `
  radial-gradient(
    95.05% 100% at 0% 35.47%,
    color-mix(in oklch, #F0AA1E 40%, transparent) 0%,
    ${BASE_SCRIM} 100%
  ),
  linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
`;

// 定义扩展的Option类型，包含amount字段
interface CashbackOption extends SelectOption {
  amount: string;
  currency: string;
}

export function BonusCashbackCard() {
  const { t } = useTranslation();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { isInitialized } = useAuth();
  const { openTipsModal } = useTipsModal();
  const { mutate: claimBonus, isPending: isClaimPending } = useClaimBonusMutation();
  const { modalState, openClaimConfirmation, closeClaimConfirmation } = useBonusClaimConfirmation();
  const [background, setBackground] = useState<string>(DEFAULT_GRADIENT);

  // 查询是否有待领取的cashback bonus
  const { data: claimData, isLoading: isDataLoading } = useClaimBonus("cashback");

  // 优化的loading状态：未初始化或数据加载中时显示骨架屏
  const isLoading = !isInitialized || isDataLoading;

  // 状态管理
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [currentCashbackItem, setCurrentCashbackItem] = useState<any>(null);

  // 处理cashback数据为下拉选项
  const cashbackOptions = useMemo<CashbackOption[]>(() => {
    if (!claimData?.data?.data) return [];

    // 确保data.data是数组
    const data = Array.isArray(claimData.data.data) ? claimData.data.data : [];

    return data.map((item: any) => ({
      value: item.currency,
      label: item.currency,
      amount: item.value,
      currency: item.currency,
      icon: <CurrencyIcon currency={item.currency} className="w-4 h-4" />,
    }));
  }, [claimData?.data?.data]);

  // 设置默认选择的币种
  useEffect(() => {
    if (cashbackOptions.length > 0 && !selectedCurrency) {
      setSelectedCurrency(cashbackOptions[0].value as string);

      if (claimData?.data?.data && Array.isArray(claimData.data.data)) {
        setCurrentCashbackItem(claimData.data.data[0]);
      }
    }
  }, [cashbackOptions, claimData?.data?.data, selectedCurrency]);

  // 处理币种选择变化
  const handleCurrencyChange = (value: string | number) => {
    setSelectedCurrency(value as string);

    if (claimData?.data?.data && Array.isArray(claimData.data.data)) {
      const selectedItem = claimData.data.data.find((item: any) => item.currency === value);
      if (selectedItem) {
        setCurrentCashbackItem(selectedItem);
      }
    }
  };

  // 计算距离UTC 0点的倒计时
  const getNextUTCMidnight = () => {
    const now = new Date();
    const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const nextUTCMidnight = new Date(utcNow);
    nextUTCMidnight.setUTCHours(24, 0, 0, 0);
    return nextUTCMidnight.getTime();
  };

  const handleIllustrationLoad = useCallback(async (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const fac = new FastAverageColor();

    try {
      const color = await fac.getColorAsync(img, {
        algorithm: 'sqrt',
        mode: 'precision',
        ignoredColor: [
          [255, 255, 255, 255, 50],
          [0, 0, 0, 255, 150],
          [20, 20, 20, 255, 120],
        ],
      });
      const accentStop = `color-mix(in oklch, ${color.hex} 40%, transparent)`;
      setBackground(`
        radial-gradient(
          95.05% 100% at 0% 35.47%,
          ${accentStop} 0%,
          ${BASE_SCRIM} 100%
        ),
        linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
      `);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("Failed to derive bonus card color", error);
      }
    } finally {
      fac.destroy();
    }
  }, []);

  const [donRecordId, setDonRecordId] = useState<string | null>(null);
  const [donData, setDonData] = useState<IDoubledUpProps | null>(null);

  const handleClaim = () => {
    if (currentCashbackItem?.currency) {
      openClaimConfirmation({
        bonusType: "Daily Cashback",
        claimableAmount: currentCashbackItem.value,
        onNormalClaim: () => claimBonus({ item: "cashback", currency: currentCashbackItem.currency }),
        onDoubleClaim: () => claimBonus(
          { item: "cashback", currency: currentCashbackItem.currency },
          {
            onSuccess: (response: any) => {
              setDonRecordId(response.data.don_record_id);
              authService.donDeal(response.data.don_record_id).then((res) => {
                if (res.code === 0) {
                  setDonData(res.data);
                }
              });
            }
          }) // TODO: Add double claim support to API
      });
    }
  };

  const handleOpenTips = () => {
    openTipsModal("dailyCashback");
  };

  // 自定义渲染选项
  const renderOption = (option: SelectOption) => {
    const cashbackOpt = option as CashbackOption;
    return (
      <div className="flex items-center gap-2 w-full">
        <CurrencyIcon currency={cashbackOpt.currency} className="w-4 h-4" />
        <span className="flex-1">{cashbackOpt.currency}</span>
        <span className="text-xs text-base-content/70">
          {formatWithConversion(parseFloat(cashbackOpt.amount), cashbackOpt.currency).formatted}
        </span>
      </div>
    );
  };

  // 自定义渲染选中值
  const renderValue = (option: SelectOption) => {
    const cashbackOpt = option as CashbackOption;
    return (
      <div className="flex items-center gap-2">
        <CurrencyIcon currency={cashbackOpt.currency} className="w-4 h-4" />
        <span className="font-semibold">{formatWithConversion(parseFloat(cashbackOpt.amount), cashbackOpt.currency).formatted}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div
        className="flex flex-col p-4 gap-2 rounded-field h-[170px] w-full relative border border-base-200"
        style={{
          background: DEFAULT_GRADIENT,
        }}
      >
        <div className="skeleton w-6 h-6 absolute right-4 rtl:right-auto rtl:left-4 top-4 rounded-btn"></div>
        <div className="flex items-center gap-2 h-15">
          <div className="skeleton w-15 h-15 rounded-box"></div>
          <div className="flex flex-col justify-between h-full w-full">
            <div className="skeleton h-4 w-32 rounded-box"></div>
            <div className="flex items-center gap-1 w-full">
              <div className="skeleton h-4 w-8 rounded-box"></div>
              <div className="skeleton h-4 w-4 rounded-box"></div>
              <div className="skeleton h-4 w-8 rounded-box"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 w-full">
          <div className="flex-1 bg-base-300 rounded-btn h-12 flex items-center px-3 gap-2">
            <div className="skeleton w-4 h-4 rounded-box"></div>
            <div className="skeleton h-4 flex-1 rounded-box"></div>
          </div>
          <div className="skeleton w-20 h-12 rounded-btn"></div>
        </div>

        <div className="flex items-center justify-center px-1">
          <div className="skeleton h-3 w-24 rounded-box"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col p-4 gap-2 rounded-field h-[170px] w-full relative border border-base-200"
      style={{
        background,
      }}
    >
      <button className="btn btn-square btn-xs bg-base-200 absolute right-4 rtl:right-auto rtl:left-4 top-4" onClick={handleOpenTips}>
        <Iconify icon="custom:info" className="text-base-content/50" />
      </button>
      <div className="flex items-center gap-2 h-15">
        <img
          src="/images/illustrations/e344898e01d3ab8d8c618f8f5cb07dcf3bdde883.png"
          alt={t("bonus:daily_cashback")}
          className="w-15 h-15"
          onLoad={handleIllustrationLoad}
          loading="lazy"
          decoding="async"
        />
        <div className="flex flex-col justify-between h-full w-full">
          <p className="text-sm font-bold sm:text-base">{t("bonus:daily_cashback")}</p>
          <div className="flex items-center gap-1 w-full">
            {claimData?.data?.thisMedalVipConfig && claimData?.data?.nextMedalVipConfig && (
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold sm:text-xl text-base-content/50">
                  {(claimData.data.thisMedalVipConfig.cashback_other * 100).toFixed(1)}%
                </span>
                <span className="text-sm font-bold text-primary sm:text-xl">{">>"}</span>
                <span className="text-sm text-primary font-bold  sm:text-xl">
                  {(claimData.data.nextMedalVipConfig.cashback_other * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 w-full">
        {cashbackOptions.length > 0 ? (
          <Select
            options={cashbackOptions}
            value={selectedCurrency}
            onChange={handleCurrencyChange}
            placeholder={t("bonus:select_currency")}
            renderOption={renderOption}
            renderValue={renderValue}
            variant="base"
            size="md"
            className="flex-1 [&>button]:bg-base-300 [&>button]:border-none"
            dropdownClassName="bg-base-300 border-none shadow-lg"
          />
        ) : (
          <label className="input input-md disabled:bg-base-300 bg-base-300 border-none flex-1">
            <Iconify icon="custom:cash" />
            <input type="text" className="grow border-none outline-none" readOnly value="0.00" />
          </label>
        )}

        <button
          className="btn btn-primary btn-soft btn-md px-0 w-20 max-w-20"
          onClick={handleClaim}
          disabled={isClaimPending || !currentCashbackItem?.value || parseFloat(currentCashbackItem?.value || "0") <= 0}
        >
          {isClaimPending ? <span className="loading loading-spinner loading-xs" /> : t("bonus:claim")}
        </button>
      </div>

      <div className="flex items-center justify-center px-1">
        <p className="text-xs text-base-content/50">{t("bonus:next_claim_in")}: &nbsp;</p>
        <Countdown
          className="text-xs text-base-content/50"
          target={getNextUTCMidnight()}
        />
      </div>

      {/* Claim Confirmation Modal */}
      <BonusClaimConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeClaimConfirmation}
        onNormalClaim={modalState.onNormalClaim || (() => { })}
        onDoubleClaim={modalState.onDoubleClaim || (() => { })}
        bonusType={modalState.bonusType}
        claimableAmount={modalState.claimableAmount}
        isLoading={isClaimPending}
      />
      {donData?.is_win === true && <DoubledUp donData={donData} />}
      {donData?.is_win === false && donRecordId && <Nothing don_record_id={donRecordId} />}
    </div>
  );
}
