import { Trans, useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal.tsx";
import { InnerLabel } from "@/sections/dollars/components.tsx";
import { InnerSportsDescription } from "@/sections/sports-bonus/components.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import Decimal from "decimal.js";
import { parser } from "@/components/header/message-v2/c/InnerMsgLink.tsx";
import { Store } from "@/components/icons/Store.tsx";

export default function PlaySportsBonusDetailsModal({
  data,
  open,
  onClose
}: {
  data: Record<string, any>;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { convertCurrency, formatCurrency, exchangeRates } = useCurrencyData();

  const currency_fiat = user?.currency_fiat ?? "USD";
  const parsed_data = parser(data?.extra_data);
  const bonus_rate = Decimal(parsed_data?.bonus_rate || 0).times(100).toFixed(0) + "%";
  const claim_max_multiplier = parsed_data?.claim_max_multiplier || 0;
  const wager_require_multiplier = parsed_data?.wager_require_multiplier || 0;
  const min_deposit_require_value = formatCurrency({
    amount: convertCurrency({
      amount: parsed_data?.min_deposit_require_value || 0,
      fromCurrency: "USDT",
      toCurrency: currency_fiat,
      exchangeRates
    }),
    currency: currency_fiat,
    showSymbol: true,
    showCode: false
  }).formatted;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-primary" />
          <span className="text-md font-bold">{t("bonus:sportsBonusStore")}</span>
        </div>
      }
      isOpen={open}
      onClose={onClose}
      className="h-[75vh] max-h-[75vh] md:w-[500px] hide-scrollbar bg-base-400"
      position="modal-middle"
    >
      <section className="text-xs font-semibold">
        <h1 className="text-lg font-bold mb-4">
          {t("bonus:extraBonusGet", { value: bonus_rate })}
        </h1>

        <div className="grid grid-cols-2 gap-2">
          <InnerLabel title={t("bonus:minimumBuy")} subTitle={min_deposit_require_value} />
          <InnerLabel title={t("bonus:sportsBonus")} subTitle={bonus_rate} />
          <InnerLabel
            title={t("bonus:wagerRequired")}
            subTitle={t("bonus:bonusObtained", { value: wager_require_multiplier })}
            className="col-span-2"
          />
          <InnerLabel
            title={t("bonus:periodComplete")}
            subTitle={`${data?.expire_days}d`}
            className="col-span-2"
          />
        </div>

        <div className="whitespace-pre-line text-base-content/50 mt-4">
          <Trans i18nKey={"bonus:sportsBonusGameplay"} />

          <div className="bg-base-200 rounded-field p-3 mt-4 flex flex-col gap-4">
            {t("bonus:maximumCashout")}
            <span className="text-sm font-extrabold text-primary">
              {t("bonus:bonusObtained", { value: claim_max_multiplier })}
            </span>
            {t("bonus:bonus_rules_desc.cashout")}
          </div>
        </div>

        {/* FAQ 描述 */}
        <InnerSportsDescription
          hideId={0}
          data={{ ...data, extra_data: "" }}
          className="!p-0 mt-4"
        />
      </section>
    </Modal>
  );
}
