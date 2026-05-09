import {
  useSupportedCurrencyV2Filter
} from "@/components/modal/UserFinanceModal/helper.ts";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useBoundStore } from "@/store";
import { useTranslation } from "react-i18next";
import { FormBox } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { DepositFiatSelectAML } from "@/components/modal/UserFinanceModal/c/DepositFiatSelectAML.tsx";
import { ChannelClassOptions } from "@/components/modal/UserFinanceModal/c/ChannelClassOptions.tsx";

export const DepositFiatSelect = () => {
  const { t } = useTranslation();

  // from data store, share common data
  const { depositFiat, setDepositFiat } = useBoundStore();

  const [l1, originCurrencies, currencies] = useSupportedCurrencyV2Filter("FIAT", "DEPOSIT");

  return (
    <div className="flex flex-col gap-4">
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
        {/* 一些法币需要做一下前置的提示给用户 */}
        <DepositFiatSelectAML />
      </FormBox>

      {/* TODO: 法币存款通道分类 */}
      <ChannelClassOptions />
    </div>
  );
};
