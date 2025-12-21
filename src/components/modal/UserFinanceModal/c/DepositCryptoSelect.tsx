import {
  useSupportedCryptoDepositGatewaysFilter,
  useSupportedCurrencyV2Filter
} from "@/components/modal/UserFinanceModal/helper.ts";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useBoundStore } from "@/store";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FormBox } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

export const DepositCryptoSelect = () => {
  const { t } = useTranslation();

  const [isCurrencyLoading, originCurrencies, currencies] = useSupportedCurrencyV2Filter("CRYPTO", "DEPOSIT");

  // from data store, share common data
  const { depositCrypto, setDepositCrypto } = useBoundStore();

  // 提款的区块链网关列表
  const [isGatewaysLoading, originGateways, networks] = useSupportedCryptoDepositGatewaysFilter(depositCrypto.currency?.currency);

  // 根据加密货币匹配默认网关
  useEffect(() => {
    if (Array.isArray(originGateways) && originGateways.length > 0) setDepositCrypto({ network: originGateways[0] });
  }, [originGateways]);

  return (
    <div className="">
      <div className="grid grid-cols-2 items-center gap-2">
        {/* 支持存款的代币 */}
        <FormBox label={t("finance:depositCurrency")}>
          <SelectDropdown
            title={t("finance:depositCurrency")}
            height="sm"
            options={currencies}
            value={depositCrypto.currency?.currency}
            onChange={(v) => {
              setDepositCrypto({ currency: originCurrencies.find((o: Record<string, any>) => o.currency === v) });
            }}
            placeholder={t("common.selectCurrency")}
            showSearch
            loading={isCurrencyLoading}
          />
        </FormBox>

        {/* 支持存款的代币所属的链 */}
        <FormBox label={t("finance:depositNetwork")}>
          <SelectDropdown
            title={t("finance:depositNetwork")}
            height="sm"
            options={networks}
            value={depositCrypto.network?.network}
            onChange={(v) => {
              setDepositCrypto({ network: originGateways.find((o: Record<string, any>) => o.network === v) });
            }}
            placeholder={t("common.selectNetwork")}
            showSearch
            loading={isGatewaysLoading}
          />
        </FormBox>
      </div>
    </div>
  );
};
