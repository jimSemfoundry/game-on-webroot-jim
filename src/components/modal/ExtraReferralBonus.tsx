import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import { Gift, X } from "lucide-react";
import { ComponentProps, ReactNode, useEffect, useState } from "react";
import classNames from "classnames";
import { Modal } from "@/components/ui/Modal.tsx";
import { useBoundStore } from "@/store";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";

export default function ExtraReferralBonusModal() {
  const { t } = useTranslation();

  const { user } = useAuth();

  const { syncAction } = useBoundStore();

  const [status, setStatus] = useState<boolean>(false);

  const { formatCurrency, convertCurrency, exchangeRates } = useCurrencyData();

  // 事件通知
  useEffect(() => {
    if (syncAction.type === "OPEN_EXTRA_REFERRAL_BONUS_MODAL") setStatus(true);
  }, [syncAction]);

  return (
    <Modal
      hideTitle
      isOpen={status}
      onClose={() => setStatus(false)}
      className="p-0 h-[75vh] max-h-[75vh] md:w-[500px] hide-scrollbar bg-transparent"
      closeButtonClassName="hidden"
      position="modal-middle"
    >
      <RadialGradientContainer className={"relative rounded-2xl mb-1 flex items-center justify-between h-[180px]"}>
        <div className={"text-2xl font-bold pl-8 text-white"}>
          <Trans
            i18nKey="referral:extraReferralBonus:slogan"
            components={[<div className={"text-primary"} />]}
          />
        </div>
        <img src="/images/referral/extra-bonus.png" className={"h-full absolute right-0"} alt={""} />
      </RadialGradientContainer>
      <section className={"text-xs font-semibold bg-base-300 p-4 rounded-t-2xl flex-1 leading-4"}>
        <div className={"flex items-center justify-between mb-4"}>
          <InnerTitle
            className={"!mt-0"}
            title={<><Gift className={"w-4 h-4 text-primary"} strokeWidth={3} />{t("bonus:bonus_details")}</>} />
          <InnerClose onClick={() => setStatus(false)} />
        </div>
        <div className={"hide-scrollbar overflow-y-auto h-[calc(100%-80px)]"}>
          <InnerTitle className={"!mt-0"} title={t("referral:extraReferralBonus:bonusCalculatedTitle")} />
          <p>
            <Trans
              i18nKey="referral:extraReferralBonus:bonusCalculatedDesc"
              components={[<span className="text-primary" />]}
              values={{
                depositAmount: formatCurrency({
                  amount: convertCurrency({
                    amount: 45,
                    fromCurrency: "USDT",
                    toCurrency: user?.currency_fiat ?? "",
                    exchangeRates
                  }),
                  currency: user?.currency_fiat ?? "",
                  showSymbol: true, showCode: false
                }).formatted, bonusAmount: formatCurrency({
                  amount: convertCurrency({
                    amount: 4.5,
                    fromCurrency: "USDT",
                    toCurrency: user?.currency_fiat ?? "",
                    exchangeRates
                  }),
                  currency: user?.currency_fiat ?? "",
                  showSymbol: true, showCode: false
                }).formatted,
                bonusPercent: "10%"
              }}
            />
          </p>
          <p className={"mt-3"}>{t("referral:extraReferralBonus:title", { bonusPercent: "10%" })}</p>
          <InnerTitle title={t("referral:extraReferralBonus:claimDistributionTitle")} />
          <p>{t("referral:extraReferralBonus:claimDistributionDesc")}</p>
          <InnerTitle title={t("referral:extraReferralBonus:expirationTitle")} />
          <p>{t("referral:extraReferralBonus:expirationDesc")}</p>
          <InnerTitle title={t("referral:extraReferralBonus:generalTermsTitle")} />
          <p>
            <Trans
              i18nKey={"referral:extraReferralBonus:generalTermsDesc1"}
              values={{
                bonusCurrency: "BUCK/USDT",
                referralTimes: 4,
                bonusAmount: formatCurrency({
                  amount: convertCurrency({
                    amount: 5,
                    fromCurrency: "USDT",
                    toCurrency: user?.currency_fiat ?? "",
                    exchangeRates
                  }),
                  currency: user?.currency_fiat ?? "",
                  showSymbol: true, showCode: false
                }).formatted
              }}
              components={[<span className={"text-primary"} />]} />
          </p>
          <p className={"mt-3"}>{t("referral:extraReferralBonus:generalTermsDesc2")}</p>
        </div>
      </section>
    </Modal>
  );
}

const InnerTitle = ({ title, className }: { title: ReactNode, className?: string }) => {
  return <h3
    className={classNames("text-lg text-white font-semibold flex items-center gap-1 mt-3", className)}>{title}</h3>;
};

const RadialGradientContainer = styled.div`
    background: radial-gradient(323.83% 141.42% at 100% 0%, color(display-p3 0.2784 0.5176 0.2275 / 0.50) 0%, var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098 / 0.50)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))
`;

const InnerClose = (props: ComponentProps<"button">) => {
  return (<button {...props} className="btn btn-sm btn-square bg-base-100"><X size={16} /></button>);
};