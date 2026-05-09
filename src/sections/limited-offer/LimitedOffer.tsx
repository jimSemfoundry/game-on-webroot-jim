import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "react-i18next";
import { CountdownTimerThree } from "@/components/ui/CountdownTimer";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/utils/cn";
import { X } from "lucide-react";
import { useCurrencyData } from "@/hooks/useCurrency";
import { useSupportedCurrencyV2Filter } from "@/components/modal/UserFinanceModal/helper.ts";
import { useGetPromoByPage } from "@/query/promo.tsx";
import { useNavigate } from "@tanstack/react-router";

// TODO: 满足条件时候会自动弹出
export const LimitedOffer = (
  {
    open,
    data,
    onClose
  }: {
    open: boolean;
    data: any;
    onClose: () => void;
  }) => {
  const navigate = useNavigate();

  const { t } = useTranslation("gameDetail");

  const { user } = useAuth();

  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();

  const { refetch: reftchPromotion } = useGetPromoByPage(open);

  const [, , currencies] = useSupportedCurrencyV2Filter("FIAT", "DEPOSIT");

  const MathCeilFun = (amount: number, currency: string) => {
    const currencyData = currencies.find((c: { value: string }) => c.value.toLowerCase() === currency.toLowerCase());
    if (currencyData) {
      return Math.ceil(amount);
    }
    return amount;
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      className="bg-transparent"
      hideTitle
      closeButtonClassName="hidden"
      position="modal-middle"
    >
      <div className="relative h-[446px] max-w-[351px] pt-[90px] mx-auto">
        <img src="/images/special-offer/specialOffer.png" alt=""
             className="w-[180px] h-[180px] absolute top-0 left-[50%] translate-x-[-50%] z-[1]" />
        <div
          className="h-[356px] w-full flex flex-col items-center justify-center rounded-2xl pt-[90px] relative bg-base-400">
          <div
            className={`absolute top-4 right-4`}
            onClick={onClose}
          >
            {/* <div className='bg-base-200 rounded-lg flex items-center justify-center w-6 h-6'>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.916992 0.916626L9.08311 9.08274" stroke="#A6ADBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M0.91689 9.08274L9.08301 0.916626" stroke="#A6ADBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div> */}
            <button
              type="button"
              className={cn("btn btn-sm btn-square absolute top-4 right-5 rtl:left-4 rtl:right-auto")}
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-2xl font-bold text-base-content">{t("gameDetail:limitedOffer")}</p>
          <p className="text-base font-semibold test-sm pt-1 text-base-content/80">{t("gameDetail:deposit", {
            value: `${(() => {
              const value = convertCurrency({
                amount: data?.min_amount || 0,
                fromCurrency: "USDT",
                toCurrency: user?.currency_fiat || "USDT",
                exchangeRates: exchangeRates
              }) || 0;

              return formatCurrency({
                currency: user?.currency_fiat || "USDT",
                amount: MathCeilFun(value, user?.currency_fiat || "USD"),
                showCode: false,
                showSymbol: true
              }).formatted;
            })()
            }`
          })
          }</p>
          <p className="text-primary text-2xl font-bold leading-5 pt-4">{t("gameDetail:get", {
            value: `${formatWithConversion(data?.bonus_amount, "USDT", {
              showSymbol: true,
              showCode: false
            }).formatted}`
          })}</p>
          <p className="text-base-content font-bold leading-5 pt-6 test-sm">{t("gameDetail:instantCashBonus")} </p>
          <div
            className="text-base font-semibold test-sm pt-1 text-base-content/80 pt-1 flex items-center justify-center gap-1">
            <p>{t("gameDetail:expires")}</p>
            {CountdownTimerThree({ expireTime: data?.expired_at })}
            {/* <div className="flex items-center justify-center gap-1 font-semibold">
              <div>
                <span className="countdown ">
                  <span style={{ '--value': cashbackTimeLeft.hours } as React.CSSProperties}></span>
                </span>
                h
              </div>
              <div>
                <span className="countdown ">
                  <span style={{ '--value': cashbackTimeLeft.minutes } as React.CSSProperties}></span>
                </span>
                m
              </div>
              <div>
                <span className="countdown ">
                  <span style={{ '--value': cashbackTimeLeft.seconds } as React.CSSProperties}></span>
                </span>
                s
              </div>
            </div> */}
          </div>
          <button className="btn btn-primary mt-[10px]" onClick={() => {
            void reftchPromotion();
            void navigate({ to: "/finance" });
            onClose();
          }}
          >{t("gameDetail:depositNow")}</button>
        </div>
      </div>

    </Modal>
  );
};

export default LimitedOffer;