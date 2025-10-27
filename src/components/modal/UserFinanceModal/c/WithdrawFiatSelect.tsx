import {
  useSupportedFiatWithdrawGatewaysV2,
  useSupportedSettlementCurrenciesFilter,
  useUserLatestWithdraw
} from "@/components/modal/UserFinanceModal/helper.ts";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useBoundStore } from "@/store";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FormBox } from "@/components/modal/UserFinanceModal/c/FormBox.tsx";
import { WithdrawMethodSelectV1 } from "@/components/modal/UserFinanceModal/c/WithdrawMethodSelectV1.tsx";
import { DisplayContent } from "@/components/modal/UserFinanceModal";

export const WithdrawFiatSelect = () => {
  const { t } = useTranslation();

  // from data store, share common data
  const { withdrawFiat, setWithdrawFiat } = useBoundStore();

  const [l1, originCurrencies, currencies] = useSupportedSettlementCurrenciesFilter("FIAT", "WITHDRAW");

  // 用户最后一次提现的币种
  const { data: latestWithdraw, isLoading: l2 } = useUserLatestWithdraw();

  // 法币是否支持新版的提币操作
  const { data: gatewaysV2 } = useSupportedFiatWithdrawGatewaysV2(withdrawFiat.currency?.currency);

  // initial default selected option
  useEffect(() => {
    if (l1 || l2) return;
    const v = latestWithdraw?.data?.[0];
    if (originCurrencies.length > 0) {
      let find = undefined;
      if (v && v?.network === "FIAT") find = originCurrencies.find((o: {
        currency: string
      }) => o?.currency === v?.currency);
      return setWithdrawFiat({ currency: find || originCurrencies[0] });
    }
  }, [l1, l2, originCurrencies, latestWithdraw]);

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
        <DisplayContent status={gatewaysV2?.is_new === 0} className={"flex-1"}>
          {/* 此为老版本提币 */}
          <WithdrawMethodSelectV1
            method={withdrawFiat.method}
            setMethod={setWithdrawFiat}
            title={t("finance:withdrawalMethod")}
            currency={withdrawFiat.currency?.currency}
          />
        </DisplayContent>
      </div>
    </div>
  );
};
