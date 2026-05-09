import { Trans, useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { InnerConfirmBox } from "@/sections/dollars/components.tsx";
import { BonusSelectCurrency } from "@/sections/dollars/bonus-select-currency.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { Modal } from "@/components/ui/Modal.tsx";

export const BonusClaimModal = (
  {
    open,
    bonus,
    onClick,
    onClose
  }: {
    open: boolean
    bonus: string
    onClick: (v: string) => void
    onClose: () => void
  }) => {
  const { t } = useTranslation();

  const { user } = useAuth();

  const { formatCurrency, convertCurrency, exchangeRates } = useCurrencyData();

  const [status, setStatus] = useState<{
    open: boolean
    currency: string
  }>({
    open: false,
    currency: ""
  });

  // 开启窗口
  useEffect(() => {
    if (open) setStatus((v) => ({ ...v, open }));
  }, [open]);

  return (
    <Modal
      isOpen={status.open}
      hideTitle={true}
      onClose={() => {
        setStatus((v) => ({ ...v, open: false }));
        onClose();
      }}
      position={"modal-middle"}
      className={"overflow-y-visible relative sm:w-[420px]"}
      closeButtonClassName={"z-2"}
    >
      <div className="relative">
        <InnerCoinBox />
        <div className="flex flex-col items-center justify-center rounded-2xl pt-[100px] md:pt-[150px] relative gap-3">
          <div className={"text-center"}>
            <p className="text-xl font-extrabold text-white">{t("bonus:congratulations")}</p>
            <p
              className="text-xs font-extrabold text-base-content/50 mt-1">{t("bonus:your_bonus", "Claim your Bonus now!")}</p>
          </div>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency({
              amount: convertCurrency({
                amount: bonus || 0,
                fromCurrency: "USDT",
                toCurrency: user?.currency_fiat ?? "",
                exchangeRates
              }),
              currency: user?.currency_fiat ?? "",
              showSymbol: true, showCode: false
            }).formatted}
          </div>

          <div className={"w-full flex items-center gap-2 text-base-content/80 font-semibold text-[12px]"}>
            <p className={"flex-1"}>
              <Trans
                i18nKey={user?.currency_fiat === status.currency ? t("bonus:bonus_credited1") : t("bonus:bonus_credited2")}
                values={{
                  bonus: formatCurrency({
                    amount: convertCurrency({
                      amount: bonus || 0,
                      fromCurrency: "USDT",
                      toCurrency: status.currency || "",
                      exchangeRates
                    }),
                    currency: status.currency || "",
                    showSymbol: true, showCode: false
                  }).formatted
                }}
                components={[<span className="text-primary" />]}
              />
            </p>
            <BonusSelectCurrency
              onSelected={(currency) => setStatus((v) => ({ ...v, currency }))} />
          </div>

          <InnerConfirmBox
            className="btn btn-primary w-50"
            onClick={() => {
              onClick(status.currency);
              setStatus((v) => ({ ...v, open: false }));
            }}
          >{t("bonus:continue")}</InnerConfirmBox>
        </div>
      </div>
    </Modal>
  );
};

const InnerCoinBox = () => {
  return <div className="absolute bottom-[210px] z-[1] left-0 right-0">
    <img src="/images/double-nothing/doubled-up.png" alt="" className={"object-cover"} />
  </div>;
};