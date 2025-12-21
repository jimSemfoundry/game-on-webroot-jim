import {
  useSupportedCryptoWithdrawGatewaysFilter, useSupportedCurrencyV2Filter,
} from "@/components/modal/UserFinanceModal/helper.ts";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useBoundStore } from "@/store";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FormBox } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

export const WithdrawCryptoSelect = () => {
  const { t } = useTranslation();

  const [l1, originCurrencies, currencies] = useSupportedCurrencyV2Filter("CRYPTO", "WITHDRAW");

  // from data store, share common data
  const { withdrawCrypto, setWithdrawCrypto } = useBoundStore();

  const [l3, originNetworks, networks] = useSupportedCryptoWithdrawGatewaysFilter(withdrawCrypto.currency?.currency);

  // initial default selected option
  useEffect(() => {
    if (l1) return;
    if (originCurrencies.length > 0) {
      const find = originCurrencies.find((o: { is_default: number }) => o?.is_default)
      setWithdrawCrypto({ currency: find || originCurrencies[0] });
    }
  }, [l1, originCurrencies]);

  useEffect(() => {
    if (Array.isArray(networks)) setWithdrawCrypto({ network: originNetworks[0] });
  }, [networks]);

  return (
    <div className="">
      <div className="grid grid-cols-2 items-center gap-2">
        <FormBox label={t("finance:withdrawCurrency")}>
          <SelectDropdown
            title={t("finance:withdrawCurrency")}
            height="sm"
            options={currencies}
            value={withdrawCrypto.currency?.currency}
            onChange={(v) => {
              setWithdrawCrypto({ currency: originCurrencies.find((o: Record<string, any>) => o.currency === v) });
            }}
            placeholder={t("common.selectCurrency")}
            showSearch
            loading={l1}
          />
        </FormBox>

        <FormBox label={t("finance:withdrawalNetwork")}>
          <SelectDropdown
            title={t("finance:withdrawalNetwork")}
            height="sm"
            options={networks}
            value={withdrawCrypto.network?.network}
            onChange={(v) => {
              setWithdrawCrypto({ network: originNetworks.find((o: Record<string, any>) => o.network === v) });
            }}
            placeholder={t("common.selectNetwork")}
            showSearch
            loading={l3}
          />
        </FormBox>
      </div>
    </div>
  );
};
