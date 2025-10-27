import { CurrencySelector } from "@/components/ui/CurrencySelector";
import { useFinanceModal } from "@/contexts/ModalsProvider";
import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext";
import { useLocation } from "@tanstack/react-router";
import Iconify from "../iconify";

export const WalletFinance = () => {
  const { openUserFinanceModal } = useFinanceModal();
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
    <div className="flex items-center py-0.5 md:py-1 bg-base-200 rounded-lg pl-1 md:pl-1 pr-0.5 md:pr-1 rtl:pr-1 rtl:md:pr-1 rtl:pl-0.5 rtl:md:pl-1 relative">
      <div className="flex items-center gap-1 max-w-[140px] sm:max-w-[200px] justify-between">
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

        <button
          className={`btn btn-primary btn-square h-7 w-7 md:h-8 md:w-8 rounded-md ${isGameDetailPage ? "ml-auto" : ""}`}
          onClick={openUserFinanceModal}
        >
          <Iconify icon="custom:wallet" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
