import { Select, type SelectOption } from "@/components/ui/Select";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { cn } from "@/utils/cn";
import type { BetHistoryFilterGroup, BetHistoryFilterOption } from "@/types/bet-history";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import type { BetHistoryFiltersState } from "./types";

interface BetHistoryFiltersProps {
  filters: BetHistoryFiltersState;
  onChange: (next: BetHistoryFiltersState) => void;
  filterGroup?: BetHistoryFilterGroup;
  availableAssets?: string[];
  isDisabled?: boolean;
}

const PERIOD_OPTIONS: Array<{ value: BetHistoryFiltersState["period"]; labelKey: string; fallback: string }> = [
  { value: "Past 24 Hours", labelKey: "transaction:filters.period1d", fallback: "1D" },
  { value: "Past 7 Days", labelKey: "transaction:filters.period7d", fallback: "7D" },
  { value: "Past 30 Days", labelKey: "transaction:filters.period30d", fallback: "30D" },
];

const normalizeGameOptions = (options?: BetHistoryFilterOption[]): SelectOption[] => {
  if (!options?.length) {
    return [];
  }

  return options.map((option) => ({
    value: option.value,
    label: option.label,
  }));
};

export function BetHistoryFilters({ filters, onChange, filterGroup, availableAssets, isDisabled }: BetHistoryFiltersProps) {
  const { t } = useTranslation();

  const gameOptions = useMemo<SelectOption[]>(() => {
    const normalized = normalizeGameOptions(filterGroup?.games);
    const baseOption: SelectOption = {
      value: "all",
      label: t("transaction:filters.all", "All"),
    };

    const options = [baseOption];
    normalized.forEach((option) => {
      if (!options.some((existing) => existing.value === option.value)) {
        options.push(option);
      }
    });

    return options;
  }, [filterGroup?.games, t]);

  const assetOptions = useMemo<SelectOption[]>(() => {
    const baseOption: SelectOption = {
      value: "all",
      label: `${t("transaction:filters.all", "All")} ${t("transaction:filters.asset", "Asset")}`,
    };

    const assets = availableAssets ?? filterGroup?.assets ?? [];
    const options =
      assets?.map((currency) => ({
        value: currency,
        label: currency,
        icon: <CurrencyIcon currency={currency} className="w-4 h-4" />,
      })) ?? [];

    return [baseOption, ...options];
  }, [availableAssets, filterGroup?.assets, t]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
      <div className="flex flex-col gap-2">
        <label className="text-xs sm:text-sm font-medium text-base-content/50">
          {t("transaction:filters.games", "Games")}
        </label>
        <Select
          options={gameOptions}
          value={filters.game}
          onChange={(value) =>
            onChange({
              ...filters,
              game: String(value),
            })
          }
          size="md"
          variant="base"
          disabled={isDisabled}
          className="w-full h-10 sm:h-10 bg-base-300 rounded-field"
          dropdownClassName="bg-base-300"
          placeholder={t("transaction:filters.games", "Games")}
          renderValue={(option) => <span className="font-semibold text-sm">{option?.label ?? option?.value}</span>}
          renderOption={(option) => (
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold text-sm">{option?.label ?? option?.value}</span>
              {filters.game === option.value && <Check className="w-4 h-4" />}
            </div>
          )}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs sm:text-sm font-medium text-base-content/50">
          {t("transaction:filters.asset", "Asset")}
        </label>
        <Select
          options={assetOptions}
          value={filters.asset}
          onChange={(value) =>
            onChange({
              ...filters,
              asset: String(value),
            })
          }
          size="md"
          variant="base"
          disabled={isDisabled}
          className="w-full h-10 sm:h-10 bg-base-300 rounded-field"
          dropdownClassName="bg-base-300"
          placeholder={t("transaction:filters.asset", "Asset")}
          renderOption={(option) =>
            option && option.value !== "all" ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span className="font-semibold text-sm">{option.label}</span>
                </div>
                {filters.asset === option.value && <Check className="w-4 h-4" />}
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-sm">{option?.label ?? option?.value}</span>
                {filters.asset === option?.value && <Check className="w-4 h-4" />}
              </div>
            )
          }
          renderValue={(option) =>
            option && option.value !== "all" ? (
              <div className="flex items-center gap-2">
                {option.icon}
                <span className="font-semibold text-sm">{option.label}</span>
              </div>
            ) : (
              <span className="font-semibold text-sm">{option?.label ?? option?.value}</span>
            )
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs sm:text-sm font-medium text-base-content/50">
          {t("transaction:filters.period", "Period")}
        </label>
        <div className="flex h-10 sm:h-10 items-center gap-1 rounded-lg bg-base-300 p-[2px] sm:p-1">
          {PERIOD_OPTIONS.map((option) => {
            const isActive = filters.period === option.value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={isDisabled}
                onClick={() =>
                  onChange({
                    ...filters,
                    period: option.value,
                  })
                }
                className={cn(
                  "flex-1 h-full rounded-lg border border-transparent text-xs sm:text-sm font-semibold transition-colors focus:outline-none focus-visible:ring focus-visible:ring-primary/40",
                  isActive ? "bg-primary text-black shadow-sm" : "bg-transparent text-base-content/70 hover:bg-base-300/60",
                  isDisabled && "opacity-50 cursor-not-allowed",
                )}
              >
                {t(option.labelKey, option.fallback)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
