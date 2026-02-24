import { Trans, useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal.tsx";
import {
  EBonus,
  InnerHeader,
  InnerLabel
} from "@/components/modal/bonus-wallet/components.tsx";
import { InnerDescription } from "@/sections/dollars/components.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useBonusConfigList } from "@/hooks/api/useAuth.ts";
import Decimal from "decimal.js";
import { parser } from "@/components/header/message-v2/c/InnerMsgLink.tsx";

export default function MegaSlotBonusModal(
  {
    open,
    onClose
  }: {
    open: boolean;
    onClose: () => void;
  }) {
  const { t } = useTranslation();

  const { user } = useAuth();

  const { convertCurrency, formatCurrency, exchangeRates } = useCurrencyData();

  // 彩金活动配置列表
  const { data: bonusConfig } = useBonusConfigList();

  const currency_fiat = (user?.currency_fiat ?? "USD");

  const match = parser((bonusConfig?.data ?? []).find((bonus: Record<string, any>) => bonus?.name?.includes(EBonus.MEGA))?.extra_data);

  const min_deposit_require_value = formatCurrency({
    amount: convertCurrency({
      amount: match?.min_deposit_require_value || 0,
      fromCurrency: "USDT",
      toCurrency: currency_fiat,
      exchangeRates
    }),
    currency: currency_fiat,
    showSymbol: true, showCode: false
  }).formatted;

  const wager_require_multiplier = match?.wager_require_multiplier || 0

  const claim_max_multiplier = match?.claim_max_multiplier || 0

  const bonus_rate = Decimal(match?.bonus_rate || 0).times(100).toFixed(0);

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
          {t("bonus:megaSlotBonus")}
        </h1>

        <div className={"grid grid-cols-2 gap-2"}>
          <InnerLabel title={t("popup:minimum_deposit")} subTitle={min_deposit_require_value} />
          <InnerLabel title={t("bonus:slotBonus")} subTitle={`${bonus_rate}%`} />
          <InnerLabel title={t("bonus:wagerRequired")}
                      subTitle={`(${t("bonus:deposit")} + ${t("bonus:bonus")}) x ${wager_require_multiplier}`}
                      className={"col-span-2"} />
        </div>

        <div className={"whitespace-pre-line text-base-content/50 mt-4"}>
          <Trans i18nKey={"bonus:bonus_rules_desc.mega"} />

          <div className="bg-base-200 rounded-field p-3 mt-4 flex flex-col gap-4">
            {t("bonus:maximumCashout")}
            <span
              className={"text-sm font-extrabold text-primary"}>{`(${t("bonus:deposit")} + ${t("bonus:bonus")}) x ${claim_max_multiplier}`}</span>
            {t("bonus:bonus_rules_desc.cashout")}
          </div>

          <div className={"mt-4"}><Trans i18nKey={"bonus:bonus_rules_desc.approximately"} values={{ value: "65%" }}
                                         components={[<span className={"text-primary"} />]} /></div>
        </div>

        {/* 非数据描述 */}
        <InnerDescription hideId={0} bonusKey={EBonus.MEGA} currency={EBonus.TOKEN} className={"!p-0 mt-4"} />
      </section>
    </Modal>
  );
}