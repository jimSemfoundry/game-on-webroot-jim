import {
  useSupportedCurrencyV2Filter,
  useSupportedFiatWithdrawGatewaysV2
} from "@/components/modal/UserFinanceModal/helper.ts";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useBoundStore } from "@/store";
import { useTranslation } from "react-i18next";
import { WithdrawMethodSelectV1 } from "@/components/modal/UserFinanceModal/c/WithdrawMethodSelectV1.tsx";
import { FormBox } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

export const WithdrawFiatSelect = () => {
  const { t } = useTranslation();

  // from data store, share common data
  const { withdrawFiat, setWithdrawFiat } = useBoundStore();

  const [l1, originCurrencies, currencies] = useSupportedCurrencyV2Filter("FIAT", "WITHDRAW");

  // 法币是否支持新版的提币操作
  const { data: gatewaysV2 } = useSupportedFiatWithdrawGatewaysV2(withdrawFiat.currency?.currency);

  return (
    <div className="">
      <div className="flex items-center gap-2">
        <FormBox label={t("finance:withdrawCurrency")}>
          <SelectDropdown
            title={t("finance:withdrawCurrency")}
            height="sm"
            options={currencies}
            value={withdrawFiat.currency?.currency}
            onChange={(v) => {
              setWithdrawFiat({ currency: originCurrencies.find((o: Record<string, any>) => o.currency === v) });
            }}
            placeholder={t("common.selectCurrency")}
            showSearch
            loading={l1}
          />
        </FormBox>
        {/* 法币是否支持新版提币 is_new = 1 支持 is_new = 0 不支持 */}
        {gatewaysV2?.is_new === 0 && <div className={"flex-1"}>
          {/* 此为老版本提币 */}
          <WithdrawMethodSelectV1
            method={withdrawFiat.method}
            setMethod={setWithdrawFiat}
            title={t("finance:withdrawalMethod")}
            currency={withdrawFiat.currency?.currency}
          />
        </div>}
      </div>
    </div>
  );
};
