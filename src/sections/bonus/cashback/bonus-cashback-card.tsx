import Iconify from "@/components/iconify";
import { Countdown } from "@/components/ui";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import ImageColorCard from "@/components/ui/ImageColorCard";
import { LazyImage } from "@/components/ui/LazyImage";
import { Select, SelectOption } from "@/components/ui/Select";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useDoubleOrNothingModal, useTipsModal } from "@/contexts/ModalsProvider";
import { useClaimBonus, useClaimBonusMutation } from "@/hooks/api/useAuth";
import { useVibrantColor } from "@/hooks/useVibrantColor";
import { useBoundStore } from "@/store";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";

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
  const { t } = useTranslation("bonus");
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { isInitialized } = useAuth();
  const { openTipsModal } = useTipsModal();
  const { mutate: claimBonus, isPending: isClaimPending } = useClaimBonusMutation();
  // 查询是否有待领取的cashback bonus
  const { data: claimData, isLoading: isDataLoading } = useClaimBonus("cashback");
  const { setSyncAction } = useBoundStore();
  const { openDoubleOrNothingModal } = useDoubleOrNothingModal();
  const ILLUSTRATION_URL = useBonusDetailsImage("cashback", 192);

  // 优化的loading状态：未初始化或数据加载中时显示骨架屏
  const isLoading = !isInitialized || isDataLoading;

  const [background, setBackground] = useState<string>(DEFAULT_GRADIENT);

  const { hex } = useVibrantColor(ILLUSTRATION_URL);

  // 处理cashback选项
  const cashbackOptions = useMemo<CashbackOption[]>(() => {
    const rawItems = (claimData as any)?.data?.data ?? (claimData as any)?.data?.items;
    if (!rawItems) return [];

    const items = Array.isArray(rawItems) ? rawItems : [rawItems];

    return items
      .filter((item: any) => item && item.currency)
      .map((item: any) => ({
        label: item.currency,
        value: item.currency,
        amount: item.value,
        currency: item.currency
      }));
  }, [claimData]);

  // 默认选中第一个有金额的选项
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");

  useEffect(() => {
    if (cashbackOptions.length > 0 && !selectedCurrency) {
      setSelectedCurrency(String(cashbackOptions[0].value));
    }
  }, [cashbackOptions, selectedCurrency]);

  const handleCurrencyChange = (value: string | number) => {
    setSelectedCurrency(String(value));
  };

  const currentCashbackItem = useMemo(() => {
    const rawItems = (claimData as any)?.data?.data ?? (claimData as any)?.data?.items;
    if (!rawItems) return null;
    const items = Array.isArray(rawItems) ? rawItems : [rawItems];
    return items.find((item: any) => item.currency === selectedCurrency);
  }, [claimData, selectedCurrency]);

  useEffect(() => {
    if (hex) {
      const accentStop = `color-mix(in oklch, ${hex} 40%, transparent)`;
      setBackground(`
        radial-gradient(
          95.05% 100% at 0% 35.47%,
          ${accentStop} 0%,
          ${BASE_SCRIM} 100%
        ),
        linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
      `);
    }
  }, [hex]);

  const handleClaim = () => {
    if (currentCashbackItem?.currency) {
      claimBonus(
        { item: "cashback", currency: currentCashbackItem.currency },
        {
          onSuccess: (response: any) => {
            if (response.code !== 0) {
              setSyncAction("OPEN_BONUS_CLAIM_RESPONSE_MODAL", {
                code: response.code,
                tryAgain: () => handleClaim()
              });
              return;
            }
            openDoubleOrNothingModal({
              don_record_id: response?.data?.don_record_id,
              amount: response?.data?.amount
            });
          }
        }
      );
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
        {/* <span className="flex-1">{cashbackOpt.currency}</span> */}
        <span className="text-xs text-base-content/70">
          {
            formatWithConversion(parseFloat(cashbackOpt.amount), cashbackOpt.currency, {
              showCode: false,
              minimizeDecimals: true
            })
              .formatted
          }
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
        <span className="font-semibold">{formatWithConversion(parseFloat(cashbackOpt.amount), cashbackOpt.currency, {
          showCode: false,
          minimizeDecimals: true
        }).formatted}</span>
      </div>
    );
  };

  if (isLoading) return <CardLoading />;

  if (!isLoading && !hasAuth()) {
    return (
      <ImageColorCard
        gradientMode="linear"
        imageUrl={ILLUSTRATION_URL}
        colorOpacity={0.6}
        paletteOrder={["DarkVibrant", "Vibrant", "Muted"]}
        className="flex items-center p-8 gap-2 rounded-field h-[140px] sm:h-[170px] w-full relative overflow-hidden border border-base-200 transition-all duration-500"
      >
        <p className="text-2xl sm:text-4xl font-bold uppercase leading-6 sm:leading-8 text-start">
          <span className="text-base-content block">{t("casino:daily")}</span>
          <span className="block text-primary">{t("bonus:item.cashback")}</span>
        </p>
        <LazyImage
          src={ILLUSTRATION_URL}
          alt="free spins"
          className="w-[150px] h-[150px] sm:w-[170px] sm:h-[170px] -rotate-4 absolute right-0 top-0 rtl:rotate-y-180 rtl:left-0 rtl:right-auto"
        />
      </ImageColorCard>
    );
  }

  // 可领取状态
  const isClaimable = currentCashbackItem?.value && parseFloat(currentCashbackItem?.value || "0") > 0;

  return (
    <div
      className={`flex flex-col p-4 gap-4 rounded-field w-full relative border ${isClaimable ? "border-warning" : "border-base-200"}`}
      style={{
        background
      }}
    >
      <div className="flex items-center gap-2">
        <img src={ILLUSTRATION_URL} alt={t("bonus:daily_cashback")} className="w-15 h-15" loading="lazy"
             decoding="async" />
        <div className="flex flex-col justify-between h-full w-full flex-1">
          <div className="flex justify-between">
            <div>
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
            <Info onClick={handleOpenTips} />
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
            <input type="text" className="grow border-none outline-none font-semibold" readOnly value="0.00" />
          </label>
        )}

        <button
          className="btn btn-primary btn-md px-0 w-20 max-w-20"
          onClick={handleClaim}
          disabled={isClaimPending || !currentCashbackItem?.value || parseFloat(currentCashbackItem?.value || "0") <= 0}
        >
          {isClaimPending ? <span className="loading loading-spinner loading-xs" /> : t("bonus:claim")}
        </button>
      </div>

      <div className="flex items-center justify-center px-1">
        <p className="text-xs text-base-content/50">{t("bonus:next_claim_in")}: &nbsp;</p>
        <Countdown className="text-xs text-base-content/50" target={getNextUTCMidnight()} />
      </div>
    </div>
  );
}

import utc from "dayjs/plugin/utc";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { CardLoading } from "@/sections/bonus/components/CardLoading.tsx";
import { hasAuth } from "@/utils/auth.ts";

dayjs.extend(utc);

// 获取下一个UTC午夜时间
export const getNextUTCMidnight = () => {
  const now = dayjs();
  let nextUtcMidnight = dayjs().utc().endOf("day").add(1, "second");
  if (nextUtcMidnight.isBefore(now)) {
    nextUtcMidnight = nextUtcMidnight.add(1, "day");
  }
  return nextUtcMidnight.valueOf();
};
