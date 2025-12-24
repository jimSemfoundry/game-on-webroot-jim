import { CurrencySelector } from "@/components/ui/CurrencySelector";
import { useFinanceModal } from "@/contexts/ModalsProvider";
import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext";
import { useLocation } from "@tanstack/react-router";
import Iconify from "../iconify";
import { useTranslation } from "react-i18next";
import { ComponentProps, useMemo } from "react";
import { useUserBalance } from "@/hooks/api/useAuth.ts";
import classNames from "classnames";

export const WalletFinance = () => {
  const { selectedCurrency, updateSettlementCurrency } = useSettlementCurrency();
  const location = useLocation();

  const handleCurrencySelect = async (currency: string) => {
    try {
      await updateSettlementCurrency(currency);
    } catch (error) {
      console.error("Failed to update settlement currency:", error);
    }
  };

  // Check if current route is a game detail page
  const isGameDetailPage = location.pathname.startsWith("/games/");

  return (
    <div
      className="flex items-center py-1 md:py-1 bg-base-200 rounded-lg px-1 rtl:pr-1 rtl:md:pr-1 rtl:md:pl-1 relative z-[1002]">
      <div className="flex items-center gap-2 justify-between">
        {!isGameDetailPage && (
          <div className="flex-1">
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onCurrencySelect={handleCurrencySelect}
              showBalance={true}
              className="w-full"
            />
          </div>
        )}

        <InnerGuideDeposits />
      </div>
    </div>
  );
};

/**
 * FIXME:
 *  用户无充值，则引导用户去充值
 */
const InnerGuideDeposits = () => {
  const { t } = useTranslation();

  const { data: balances = [], isLoading } = useUserBalance();

  const is_all_zero = useMemo(() => {
    if (balances.length === 0) return true;
    return balances.every((b: { balance: string }) => Number(b.balance) === 0);
  }, [balances]);

  return useMemo(() => {
    if (!isLoading && is_all_zero) {
      return (<InnerWalletButton className={`text-[11px] font-bold pr-0.5 pl-1 w-auto`}>
        {t("common:common.deposit")}
      </InnerWalletButton>);
    }
    if (!isLoading && !is_all_zero) {
      return (<InnerWalletButton className={"btn-square"} />);
    }
    return null
  }, [is_all_zero, isLoading]);
};

const InnerWalletButton = (props: ComponentProps<"button">) => {
  const location = useLocation();

  const { openUserFinanceModal } = useFinanceModal();

  // Check if current route is a game detail page
  const isGameDetailPage = location.pathname.startsWith("/games/");

  return <button
    className={classNames(`btn btn-primary h-6 w-6 md:h-8 md:w-8 rounded-md ${isGameDetailPage ? "ml-auto" : ""}`, props.className)}
    onClick={openUserFinanceModal}>
    {props.children}
    <Iconify icon="custom:wallet" className="w-5 h-5" />
  </button>;
};
