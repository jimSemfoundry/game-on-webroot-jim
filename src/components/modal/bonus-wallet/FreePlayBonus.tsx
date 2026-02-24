import { Trans, useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal.tsx";
import {
  EBonus,
  InnerHeader,
  InnerLabel
} from "@/components/modal/bonus-wallet/components.tsx";
import { useBonusConfigList } from "@/hooks/api/useAuth.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { InnerDescription } from "@/sections/dollars/components.tsx";
import { parser } from "@/components/header/message-v2/c/InnerMsgLink.tsx";

export default function FreePlayBonusModal(
  {
    open,
    onClose
  }: {
    open: boolean;
    onClose: () => void;
  }) {
  const { t } = useTranslation();

  // 彩金活动配置列表
  const { data: bonusConfig } = useBonusConfigList();

  const { user } = useAuth();

  const { convertCurrency, formatCurrency, exchangeRates } = useCurrencyData();

  const match = parser((bonusConfig?.data ?? []).find((bonus: Record<string, any>) => bonus?.name?.includes(EBonus.FREE))?.extra_data);

  const currency_fiat = (user?.currency_fiat ?? "USD");

  const claim_min_value = formatCurrency({
    amount: convertCurrency({
      amount: match?.claim_min_value || 0,
      fromCurrency: "USDT",
      toCurrency: currency_fiat,
      exchangeRates
    }),
    currency: currency_fiat,
    showSymbol: true, showCode: false
  }).formatted;

  const claim_max_value = formatCurrency({
    amount: convertCurrency({
      amount: match?.claim_max_value || 0,
      fromCurrency: "USDT",
      toCurrency: currency_fiat,
      exchangeRates
    }),
    currency: currency_fiat,
    showSymbol: true, showCode: false
  }).formatted;

  const wager_require_multiplier = match?.wager_require_multiplier || 0

  return (
    <Modal
      title={<InnerHeader />}
      isOpen={open}
      onClose={onClose}
      className="h-[75vh] max-h-[75vh] md:w-[500px] hide-scrollbar bg-base-400"
      position="modal-middle"
    >
      <section className={"text-xs font-semibold"}>
        <h1 className={"uppercase text-lg font-bold mb-4"}>
          {t("bonus:freePlayBonus")}
        </h1>

        <div className={"grid grid-cols-2 gap-2"}>
          <InnerLabel title={t("popup:minimum_deposit")} subTitle={t("bonus:free")} />
          <InnerLabel title={t("bonus:wagerRequired")} subTitle={wager_require_multiplier + "x"} />
          <InnerLabel title={t("bonus:minimumCashout")} subTitle={claim_min_value} />
          <InnerLabel title={t("bonus:maximumCashout")} subTitle={claim_max_value} />
        </div>

        <div className={"whitespace-pre-line text-base-content/50 mt-4"}>
          <Trans i18nKey={"bonus:bonus_rules_desc.free"} />

          <div className="bg-base-200 rounded-field p-3 mt-4">
            {t("bonus:bonus_rules_desc.cashout")}
          </div>
        </div>

        {/* 非数据描述 */}
        <InnerDescription hideId={0} bonusKey={EBonus.FREE} currency={EBonus.TOKEN} className={"!p-0 mt-4"} />
      </section>
    </Modal>
  );
}