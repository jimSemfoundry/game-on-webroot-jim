import { Select, type SelectOption } from "@/components/ui/Select";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import type { RolloverStatusKey, RolloverTypeKey } from "./types";

interface RolloverFiltersProps {
  selectedType: RolloverTypeKey;
  selectedStatus: RolloverStatusKey;
  onTypeChange: (value: RolloverTypeKey) => void;
  onStatusChange: (value: RolloverStatusKey) => void;
}

export function RolloverFilters({
  selectedType,
  selectedStatus,
  onTypeChange,
  onStatusChange,
}: RolloverFiltersProps) {
  const { t } = useTranslation();

  const typeOptions: SelectOption[] = [
    { value: "All", label: t("transaction:filters.allTypes") },
    { value: "Deposit", label: t("transaction:transactionTypes.deposit") },
    { value: "Bonus", label: t("transaction:transactionTypes.bonus") },
  ];

  const statusOptions: SelectOption[] = [
    { value: "All Statuses", label: t("transaction:filters.allStatuses") },
    { value: "Not Started", label: t("transaction:transactionStatus.notStarted") },
    { value: "Ongoing", label: t("transaction:transactionStatus.ongoing") },
    { value: "Done", label: t("transaction:transactionStatus.done") },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-2">
        <label className="text-xs sm:text-sm font-medium text-base-content/50">
          {t("transaction:filters.type", "Type")}
        </label>
        <Select
          options={typeOptions}
          value={selectedType}
          size="md"
          variant="base"
          className="w-full h-10 sm:h-10 bg-base-300 rounded-field"
          dropdownClassName="bg-base-300"
          renderValue={(option) => option && <span className="font-semibold">{option.label}</span>}
          renderOption={(option) => (
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold">{option.label}</span>
              {selectedType === option.value && <Check className="w-4 h-4" />}
            </div>
          )}
          onChange={(value) => onTypeChange(value as RolloverTypeKey)}
          placeholder={t("transaction:filters.type", "Type")}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs sm:text-sm font-medium text-base-content/50">
          {t("transaction:filters.status", "Status")}
        </label>
        <Select
          options={statusOptions}
          value={selectedStatus}
          size="md"
          variant="base"
          className="w-full h-10 sm:h-10 bg-base-300 rounded-field"
          dropdownClassName="bg-base-300"
          renderValue={(option) => option && <span className="font-semibold">{option.label}</span>}
          renderOption={(option) => (
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold">{option.label}</span>
              {selectedStatus === option.value && <Check className="w-4 h-4" />}
            </div>
          )}
          onChange={(value) => onStatusChange(value as RolloverStatusKey)}
          placeholder={t("transaction:filters.status", "Status")}
        />
      </div>
    </div>
  );
}
