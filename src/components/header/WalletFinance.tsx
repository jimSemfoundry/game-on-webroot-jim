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
    <div
      className="flex items-center py-1 md:py-1 bg-base-200 rounded-lg px-1 rtl:pr-1 rtl:md:pr-1 rtl:md:pl-1 relative z-1000">
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

        <button
          className={`btn btn-primary btn-square h-6 w-6 md:h-8 md:w-8 rounded-md ${isGameDetailPage ? "ml-auto" : ""}`}
          onClick={openUserFinanceModal}
        >
          <Iconify icon="custom:wallet" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
