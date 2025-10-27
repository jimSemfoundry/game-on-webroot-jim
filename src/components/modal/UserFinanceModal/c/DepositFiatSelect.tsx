import { DepositMethodSelect } from "@/components/modal/UserFinanceModal/c/DepositMethodSelect.tsx";
import { useSupportedSettlementCurrenciesFilter, useUserLatestDeposit } from "@/components/modal/UserFinanceModal/helper.ts";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useBoundStore } from "@/store";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FormBox } from "@/components/modal/UserFinanceModal/c/FormBox.tsx";

export const DepositFiatSelect = () => {
  const { t } = useTranslation();

  const [l1, originCurrencies, currencies] = useSupportedSettlementCurrenciesFilter("FIAT", "DEPOSIT");

  const { data: latestDeposit, isLoading: l2 } = useUserLatestDeposit();

  // from data store, share common data
  const { depositFiat, setDepositFiat } = useBoundStore();

  // initial default selected option
  useEffect(() => {
    if (l1 || l2) return;
    const v = latestDeposit?.data?.[0];
    if (originCurrencies.length > 0) {
      let find = undefined;
      if (v && v?.network === "FIAT") find = originCurrencies.find((o: { currency: string }) => o?.currency === v?.currency);
      return setDepositFiat({ currency: find || originCurrencies[0] });
    }
  }, [l1, l2, originCurrencies, latestDeposit]);

  return (
    <div className="">
      <div className="grid grid-cols-2 items-center gap-2">
        <FormBox label={t("finance:depositCurrency")}>
          <SelectDropdown
            title={t("finance:depositCurrency")}
            height="sm"
            options={currencies}
            value={depositFiat.currency?.currency}
            onChange={(v) => setDepositFiat({ currency: originCurrencies.find((o: Record<string, any>) => o.currency === v) })}
            placeholder={t("common.selectCurrency")}
            showSearch
            loading={l1}
          />
        </FormBox>
        <DepositMethodSelect
          method={depositFiat.method}
          setMethod={setDepositFiat}
          title={t("finance:depositMethod")}
          currency={depositFiat.currency?.currency}
        />
      </div>
    </div>
  );
};
