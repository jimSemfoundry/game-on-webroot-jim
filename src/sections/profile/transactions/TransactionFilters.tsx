import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { Select, type SelectOption } from "@/components/ui/Select";
import { cn } from "@/utils/cn";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import type { TransactionFilters as TFilters } from "./types";

interface TransactionFiltersProps {
  filters: TFilters;
  onFiltersChange: (filters: TFilters) => void;
  userBalance: any[];
}

export function TransactionFilters({ filters, onFiltersChange, userBalance }: TransactionFiltersProps) {
  const { t } = useTranslation();

  const typeOptions: SelectOption[] = [
    { value: "Deposit", label: t("transaction:transactionTypes.deposit") },
    { value: "Withdraw", label: t("transaction:transactionTypes.withdrawal") },
    { value: "Bonus", label: t("transaction:transactionTypes.bonus") },
    { value: "Swap", label: t("finance:swap", "Swap") },
    { value: "Referral", label: t("transaction:transactionTypes.referral") },
    { value: "Commission", label: t("transaction:transactionTypes.commission") },
  ];

  const statusOptions: SelectOption[] = [
    { value: "All", label: t("transaction:transactionStatus.allStatus") },
    { value: "Processing", label: t("transaction:transactionStatus.pending") },
    { value: "Success", label: t("transaction:transactionStatus.completed") },
    { value: "Failed", label: t("transaction:transactionStatus.failed") },
  ];

  const periodOptions = [
    { id: "1", value: "Past 24 Hours", label: t("transaction:filters.period1d", "1D") },
    { id: "2", value: "Past 7 Days", label: t("transaction:filters.period7d", "7D") },
    { id: "3", value: "Past 30 Days", label: t("transaction:filters.period30d", "30D") },
  ];

  const currencyOptions: SelectOption[] = useMemo(() => {
    const allOption: SelectOption = {
      value: "all",
      label: t("transaction:filters.allAssets"),
    };

    const options =
      userBalance?.map((item: any) => ({
        value: item.currency,
        label: item.currency,
        icon: <CurrencyIcon currency={item.currency} className="w-4 h-4" />,
      })) || [];

    return [allOption, ...options];
  }, [userBalance, t]);

  const showStatusFilter = !["Referral", "Commission"].includes(filters.type);
  const isReferralOrCommission = !showStatusFilter;

  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:gap-3", showStatusFilter && "sm:grid-cols-4")}>
      <div className={cn("flex flex-col gap-2", isReferralOrCommission && "col-span-2")}>
        <label className="text-xs sm:text-sm font-medium text-base-content/50">{t("transaction:filters.type", "Type")}</label>
        <Select
          options={typeOptions}
          value={filters.type}
          size="md"
          variant="base"
          className="w-full h-10 sm:h-10 bg-base-300 rounded-field"
          dropdownClassName="bg-base-300"
          onChange={(value) => {
            const nextType = value as string;
            const shouldResetStatus = ["Referral", "Commission"].includes(nextType);
            onFiltersChange({
              ...filters,
              type: nextType,
              status: shouldResetStatus ? "All" : filters.status,
            });
          }}
          placeholder={t("transaction:filters.type", "Type")}
        />
      </div>

      {showStatusFilter && (
        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm font-medium text-base-content/50">{t("transaction:filters.status", "Status")}</label>
          <Select
            options={statusOptions}
            value={filters.status}
            size="md"
            renderOption={(option) => (
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold">{option.label}</span>
                {filters.status === option.value && <Check className="w-4 h-4" />}
              </div>
            )}
            renderValue={(option) => (
              <div className="flex items-center gap-2">
                <span className="font-semibold">{option.label}</span>
              </div>
            )}
            variant="base"
            className="w-full h-10 sm:h-10 bg-base-300 rounded-field"
            dropdownClassName="bg-base-300"
            onChange={(value) => onFiltersChange({ ...filters, status: value as string })}
            placeholder={t("transaction:filters.status", "Status")}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-xs sm:text-sm font-medium text-base-content/50">{t("transaction:filters.asset", "Asset")}</label>
        <Select
          options={currencyOptions}
          value={filters.asset}
          size="md"
          variant="base"
          className="w-full h-10 sm:h-10 bg-base-300 rounded-field"
          dropdownClassName="bg-base-300"
          onChange={(value) => onFiltersChange({ ...filters, asset: value as string })}
          placeholder={t("transaction:filters.asset", "Asset")}
          renderOption={(option) =>
            option && option.value !== "all" ? (
              <div className="flex items-center gap-2">
                <CurrencyIcon currency={option.value as string} className="w-4 h-4" />
                <span className="font-semibold">{option.value}</span>
              </div>
            ) : option ? (
              <span className="font-semibold">{t("transaction:filters.allAssets")}</span>
            ) : null
          }
          renderValue={(option) =>
            option && option.value !== "all" ? (
              <div className="flex items-center gap-2">
                <CurrencyIcon currency={option.value as string} className="w-4 h-4" />
                <span className="font-semibold">{option.value}</span>
              </div>
            ) : option ? (
              <span className="font-semibold">{t("transaction:filters.allAssets")}</span>
            ) : null
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs sm:text-sm font-medium text-base-content/50">{t("transaction:filters.period", "Period")}</label>
        <div className="flex rounded-lg bg-base-300 p-[2px] gap-1 sm:gap-[6px] h-10 sm:h-10">
          {periodOptions.map((option) => {
            const isActive = filters.period === option.value;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onFiltersChange({ ...filters, period: option.value })}
                className={cn(
                  "flex-1 h-full rounded-lg border border-transparent text-sm font-semibold transition-colors focus:outline-none focus-visible:ring focus-visible:ring-primary/40",
                  isActive ? "bg-primary text-black shadow-sm" : "bg-transparent text-base-content/70 hover:bg-base-300/40",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
