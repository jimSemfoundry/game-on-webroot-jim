import { useTranslation } from "react-i18next";
import { useBonusWallet } from "@/query/dollars.ts";
import {
  BONUS_WALLET_INFO_MAP,
  EBonus, TBonus
} from "@/components/modal/bonus-wallet/components.tsx";
import { PropsWithChildren } from "react";
import { useBonusConfigList, useCurrentUser } from "@/hooks/api/useAuth.ts";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useRTLContext } from "@/contexts/RTLContext.tsx";
import { Decimal } from "decimal.js";
import { parser } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";

export const SpecialOffersGuard = (props: PropsWithChildren) => {
  const user: any = useCurrentUser();

  const isMobile = useMediaQuery("(max-width: 768px)");

  // 彩金钱包数据
  const { data: bonusWallet } = useBonusWallet();

  const have_bonus = bonusWallet?.data;

  const bonus_wallet_name = user?.data?.status?.bonus_wallet_name;

  return ((bonus_wallet_name?.includes(EBonus.MINI) || bonus_wallet_name?.includes(EBonus.MEGA)) && !have_bonus && bonusWallet?.total_records === 0)
    ? (isMobile ? <BonusWalletEntryH5 /> : <BonusWalletEntryPC />)
    : props.children;
};

export const BonusWalletEntryH5 = () => {
  const user: any = useCurrentUser();

  const { t } = useTranslation();

  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();

  const { isRTL } = useRTLContext();

  const bonus_wallet_name = user?.data?.status?.bonus_wallet_name;

  // 彩金活动配置列表
  const { data: bonusConfig } = useBonusConfigList();

  const target_bonus = parser((bonusConfig?.data ?? []).find((bonus: Record<string, any>) => bonus?.name.includes(bonus_wallet_name))?.extra_data);

  const target_currency = (user?.currency_fiat ?? "USD");

  return (
    <div className="w-full h-[138px] rounded-lg relative overflow-hidden border border-primary"
         style={{
           isolation: "isolate",
           background:
             `linear-gradient(120deg,
  var(--color-base-200) 0%,
  var(--color-base-400) 52.8%,
  
  color-mix(in oklch, var(--color-primary) 10%, transparent) 53.2%,
  color-mix(in oklch, var(--color-primary) 10%, transparent) 81.8%,
  
  color-mix(in oklch, var(--color-primary) 40%, transparent) 82.2%,
  color-mix(in oklch, var(--color-primary) 40%, transparent) 87.8%,
  
  color-mix(in oklch, var(--color-primary) 20%, transparent) 88.2%,
  color-mix(in oklch, var(--color-primary) 20%, transparent) 92.8%,
  
  color-mix(in oklch, var(--color-primary) 10%, transparent) 93.2%,
  color-mix(in oklch, var(--color-primary) 10%, transparent) 100%
)`
         }}>
      <div className="relative px-4 h-full">
        <div className={"flex flex-col justify-center h-full rtl:items-end"}>
          <p className="text-[18px] font-extrabold">
            {t(BONUS_WALLET_INFO_MAP[target_bonus?.type as TBonus]?.title)}
          </p>
          <p className="text-[12px] font-bold text-primary break-word">
            {t(BONUS_WALLET_INFO_MAP[target_bonus?.type as TBonus]?.subTitle, {
              value: Decimal(target_bonus?.bonus_rate || 0).times(100).toFixed(0) + "%",
              amount: Number(target_bonus?.bonus_value) >= 0 ? formatCurrency({
                amount: convertCurrency({
                  amount: target_bonus?.bonus_value || 0,
                  fromCurrency: "USDT",
                  toCurrency: target_currency,
                  exchangeRates
                }),
                currency: target_currency,
                showSymbol: true, showCode: false
              }).formatted : ""
            })}
          </p>
        </div>
        <img src="/images/dollars/tiger.png" className="absolute top-0"
             style={{
               [isRTL ? "left" : "right"]: "0px",
               transform: isRTL ? "scaleX(-1)" : "none"
             }}
        />
      </div>
    </div>
  );
};

export const BonusWalletEntryPC = () => {
  const user: any = useCurrentUser();

  const { t } = useTranslation();

  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();

  const { isRTL } = useRTLContext();

  const bonus_wallet_name = user?.data?.status?.bonus_wallet_name;

  // 彩金活动配置列表
  const { data: bonusConfig } = useBonusConfigList();

  const target_bonus = parser((bonusConfig?.data ?? []).find((bonus: Record<string, any>) => bonus?.name.includes(bonus_wallet_name))?.extra_data);

  const target_currency = (user?.currency_fiat ?? "USD");

  return (
    <div className="w-[208px] h-[244px] rounded-lg relative overflow-hidden border border-primary"
         style={{
           isolation: "isolate",
           background:
             `linear-gradient(120deg,
  var(--color-base-200) 0%,
  var(--color-base-400) 52.8%,
  
  color-mix(in oklch, var(--color-primary) 10%, transparent) 53.2%,
  color-mix(in oklch, var(--color-primary) 10%, transparent) 81.8%,
  
  color-mix(in oklch, var(--color-primary) 40%, transparent) 82.2%,
  color-mix(in oklch, var(--color-primary) 40%, transparent) 87.8%,
  
  color-mix(in oklch, var(--color-primary) 20%, transparent) 88.2%,
  color-mix(in oklch, var(--color-primary) 20%, transparent) 92.8%,
  
  color-mix(in oklch, var(--color-primary) 10%, transparent) 93.2%,
  color-mix(in oklch, var(--color-primary) 10%, transparent) 100%
)`
         }}>
      <div className="relative p-4 h-full">
        <div className={"flex flex-col h-full rtl:items-end"}>
          <p className="text-[18px] font-extrabold">
            {t(BONUS_WALLET_INFO_MAP[target_bonus?.type as TBonus]?.title)}
          </p>
          <p className="text-[12px] font-bold text-primary break-word">
            {t(BONUS_WALLET_INFO_MAP[target_bonus?.type as TBonus]?.subTitle, {
              value: Decimal(target_bonus?.bonus_rate || 0).times(100).toFixed(0) + "%",
              amount: Number(target_bonus?.bonus_value) >= 0 ? formatCurrency({
                amount: convertCurrency({
                  amount: target_bonus?.bonus_value || 0,
                  fromCurrency: "USDT",
                  toCurrency: target_currency,
                  exchangeRates
                }),
                currency: target_currency,
                showSymbol: true, showCode: false
              }).formatted : ""
            })}
          </p>
        </div>
        <img src="/images/dollars/tiger.png" className="w-[172px] absolute bottom-[0px]"
             style={{
               [isRTL ? "left" : "right"]: "0px",
               transform: isRTL ? "scaleX(-1)" : "none"
             }}
        />
      </div>
    </div>
  );
};