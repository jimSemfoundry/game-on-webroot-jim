import {
  useSupportedCryptoWithdrawGatewaysFilter,
  useSupportedSettlementCurrenciesFilter,
  useUserLatestWithdraw,
} from "@/components/modal/UserFinanceModal/helper.ts";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useBoundStore } from "@/store";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FormBox } from "@/components/modal/UserFinanceModal/c/FormBox.tsx";

export const WithdrawCryptoSelect = () => {
  const { t } = useTranslation();

  const [l1, originCurrencies, currencies] = useSupportedSettlementCurrenciesFilter("CRYPTO", "WITHDRAW");

  const { data: latestWithdraw, isLoading: l2 } = useUserLatestWithdraw();

  // from data store, share common data
  const { withdrawCrypto, setWithdrawCrypto } = useBoundStore();

  const [l3, originNetworks, networks] = useSupportedCryptoWithdrawGatewaysFilter(withdrawCrypto.currency?.currency);

  // initial default selected option
  useEffect(() => {
    if (l1 || l2) return;
    const v = latestWithdraw?.data?.[0];
    if (originCurrencies.length > 0) {
      let find = undefined;
      if (v && v?.network === "CRYPTO") find = originCurrencies.find((o: { currency: string }) => o?.currency === v?.currency);
      setWithdrawCrypto({ currency: find || originCurrencies[0] });
    }
  }, [l1, l2, originCurrencies, latestWithdraw]);

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
