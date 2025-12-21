import { DepositMethodSelect } from "@/components/modal/UserFinanceModal/c/DepositMethodSelect.tsx";
import {
  useSupportedCurrencyV2Filter
} from "@/components/modal/UserFinanceModal/helper.ts";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useBoundStore } from "@/store";
import { useTranslation } from "react-i18next";
import { FormBox } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

export const DepositFiatSelect = () => {
  const { t } = useTranslation();

  // from data store, share common data
  const { depositFiat, setDepositFiat } = useBoundStore();

  const [l1, originCurrencies, currencies] = useSupportedCurrencyV2Filter("FIAT", "DEPOSIT");

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
