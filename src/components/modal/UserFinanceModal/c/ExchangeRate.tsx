import { CurrencyIconPlaceholder } from "@/components/modal/UserFinanceModal/c/CurrencyIconPlaceholder.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useBoundStore } from "@/store";
import { EqualApproximately } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "@/components/icons/Alert.tsx";

const ExchangeRate = () => {
  const { t } = useTranslation();

  const { user } = useAuth();

  const { depositCrypto, setSyncAction } = useBoundStore();

  const { isLoading, convertCurrency, exchangeRates } = useCurrencyData();

  const exchangeRate = useMemo(() => {
    if (isLoading) return <span className="loading loading-spinner loading-xs" />;
    if (!depositCrypto.currency?.currency || !user?.currency_fiat) return "0";

    return convertCurrency({
      amount: 1,
      fromCurrency: depositCrypto.currency.currency,
      toCurrency: user.currency_fiat,
      exchangeRates,
    }).toLocaleString();
  }, [isLoading, exchangeRates, depositCrypto, user?.currency_fiat]);

  return (
    <div className="flex flex-col gap-2 bg-base-300 p-4 rounded-lg text-base-content/50">
      <div className="flex gap-2">
        <div className="text-xs leading-5 font-semibold">{t("finance:cryptoBalanceDescription")}</div>
        <button className={"btn bg-base-200 btn-sm btn-square text-base-content/50"}>
          <Alert onClick={() => setSyncAction("OPEN_CRYPTO_SETTLEMENT_MODAL")} />
        </button>
      </div>
      <div className="flex items-center gap-2 justify-center font-semibold text-xs">
        <CurrencyIconPlaceholder currency={depositCrypto.currency?.currency} />
        <span className=""> 1 {depositCrypto.currency?.currency}</span>
        <EqualApproximately className="w-4 h-4" />
        <span className="">
          {exchangeRate} {user?.currency_fiat}
        </span>
        <CurrencyIconPlaceholder currency={user?.currency_fiat ?? ""} />
      </div>
    </div>
  );
};

export default ExchangeRate;
