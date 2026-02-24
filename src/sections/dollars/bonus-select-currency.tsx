import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useSupportedCurrencyV2 } from "@/components/modal/UserFinanceModal/helper.ts";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";

export const BonusSelectCurrency = (
  {
    onSelected
  }: {
    onSelected: (v: string) => void;
  }) => {
  const ref = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  const { user } = useAuth();

  const { data: currencyV2, isLoading } = useSupportedCurrencyV2();

  const currency_data = (currencyV2?.data ?? [])

  const [currency, selectedCurrency] = useState<string>("");

  const options = useMemo(() => {
    const filter_condition = new Set(["REWARDS", "BONUS", "SPORT"]);
    return currency_data
      .filter((currency: { currency_type: string; }) => !filter_condition.has(currency?.currency_type))
      .map((currency: { icon: string; currency: string; }) => ({
        icon: currency?.icon,
        value: currency?.currency,
        label: currency?.currency,
        search: [currency?.currency]
      }));
  }, [currency_data]);

  /**
   * 优先匹配用户选择的“显示法币”，和index_V2匹配到了则说明支持结算，则保持一致
   * 如果用户选择的“显示法币”在index_V2中不支结算，则使用用户选择的结算法币
   */
  useEffect(() => {
    const currency_user = user?.currency || "USDT";
    const currency_fiat = user?.currency_fiat || "";
    const currency_fiat_final = currency_fiat === "USD" ? "USDT" : currency_fiat;

    if (currency_fiat && options.length > 0) {
      let find = options.find((option: { value: string; }) => option?.value === currency_fiat_final);
      if (!find) {
        find = options.find((currency: { value: string; }) => currency?.value === currency_user);
      }

      // 数据同步到父级
      onSelected(find?.value);

      selectedCurrency(find?.value);
    }
  }, [user?.currency, user?.currency_fiat, options]);

  return (
    <div className="flex flex-col gap-2 md:flex-1 relative" ref={ref}>
      <div className="relative">
        <SelectDropdown
          title={t("finance:depositCurrency")}
          height="sm"
          options={options}
          value={currency}
          onChange={(v) => {
            const value = currency_data.find((o: Record<string, any>) => o.currency === v);
            onSelected(value?.currency);
            selectedCurrency(value?.currency);
          }}
          dropdownClassName={'h-[200px]'}
          buttonClassName={'!px-3'}
          placeholder={t("common.selectCurrency")}
          showSearch
          loading={isLoading}
        />
      </div>
    </div>
  );
};

// const useBodyScrollLock = (locked: boolean) => {
//   useEffect(() => {
//     if (!locked) return;
//
//     const scrollY = window.scrollY || window.pageYOffset;
//     document.body.style.position = "fixed";
//     document.body.style.top = `-${scrollY}px`;
//     document.body.style.left = "0";
//     document.body.style.right = "0";
//     document.body.style.width = "100%";
//     document.body.dataset.scrollY = String(scrollY);
//
//     return () => {
//       const y = Number(document.body.dataset.scrollY || "0");
//       document.body.style.position = "";
//       document.body.style.top = "";
//       document.body.style.left = "";
//       document.body.style.right = "";
//       document.body.style.width = "";
//       delete document.body.dataset.scrollY;
//       window.scrollTo(0, y);
//     };
//   }, [locked]);
// };