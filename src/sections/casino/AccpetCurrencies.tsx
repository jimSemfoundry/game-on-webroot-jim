import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTranslation } from "react-i18next";

export const AcceptCurrencies = () => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { selectedCurrency } = useDisplayCurrency();
  const { t } = useTranslation();

  const acceptCurrencies = ["USDT", "BTC", "ETH", "TRX", "SOL", "BNB", "USDC", "TON"];

  return (
    <div className="flex flex-col sm:block">
      <div className="flex items-center justify-between sm:hidden">
        <div className="flex items-center gap-2">
          <CurrencyIcon currency={selectedCurrency ?? "USD"} />
          <p className="text-sm font-bold text-base-content">We Accept</p>
        </div>
        <button className="btn btn-sm btn-primary">{t("casino:all")}</button>
      </div>

      <div className="h-[128px] sm:h-[128px] w-full relative overflow-hidden z-20 mt-2 sm:mt-0">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 z-0 rounded-box bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/images/illustrations/75a2f479bdb1a69ccf2140854ec9033038e744a5.png)",
            backgroundPosition: isDesktop ? "0px -160px" : "-12px 0px",
          }}
        />

        {/* Gradient Overlay Layers */}
        <div
          className="absolute inset-0 z-0 rounded-box"
          style={{
            background: "linear-gradient(45deg, transparent 18.45%, color-mix(in oklch, var(--color-base-300), transparent 100%) 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-0 rounded-box"
          style={{
            background: "linear-gradient(270deg, transparent 1.67%, color-mix(in oklch, var(--color-base-300), transparent 40%) 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-0 rounded-box"
          style={{
            background: "linear-gradient(0deg, transparent 0.33%, color-mix(in oklch, var(--color-base-300), transparent 0%) 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-0 rounded-box"
          style={{
            background: "linear-gradient(180deg, transparent 0%, color-mix(in oklch, var(--color-base-300), transparent 20%) 100%)",
          }}
        />

        {/** Content */}
        <div className="absolute inset-0 z-40">
          <div className="flex items-center justify-center flex-col sm:flex-row-reverse sm:justify-around gap-4 h-full w-full">
            <div className="avatar-group -space-x-1.5">
              {acceptCurrencies.map((currency, index) => (
                <div className="avatar border-0 w-8 h-8" key={index}>
                  <CurrencyIcon currency={currency} className="w-8 h-8" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <img className="w-[70px] h-[35px] sm:w-[96px] sm:h-[48px]" src="/images/partners/payment-methods/gcash.svg" alt="GCash" />
              <img className="w-[70px] h-[35px] sm:w-[96px] sm:h-[48px]" src="/images/partners/payment-methods/maya.svg" alt="Maya" />
              <img className="w-[70px] h-[35px] sm:w-[96px] sm:h-[48px]" src="/images/partners/payment-methods/grab.svg" alt="Grab" />
            </div>
            <div className="items-center gap-4 hidden sm:flex">
              <CurrencyIcon currency={selectedCurrency ?? "USD"} className="w-9 h-9" />
              <p className="text-3xl font-bold text-base-content">We Accept</p>
              <button className="btn btn-sm btn-soft btn-primary">
                View All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
