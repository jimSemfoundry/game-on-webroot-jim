import { Select } from "@/components/ui/Select";
import { useTranslation } from "react-i18next";
import type { StatusFilter, StatusOption } from "./types";

interface SpinHistoryFiltersProps {
  statusFilter: StatusFilter;
  statusOptions: StatusOption[];
  onStatusChange: (value: StatusFilter) => void;
}

export const SpinHistoryFilters = ({ statusFilter, statusOptions, onStatusChange }: SpinHistoryFiltersProps) => {
  const { t } = useTranslation('profile');

  return (
    <div className="flex flex-col gap-2 w-full sm:max-w-[220px]">
      <label className="text-xs font-medium text-base-content/60">
        {t("profile:spinHistory.statusFilterLabel", "Status")}
      </label>
      <Select
        options={statusOptions}
        value={statusFilter}
        onChange={(value) => onStatusChange(value as StatusFilter)}
        className="w-full h-10 bg-base-300 rounded-field"
        dropdownClassName="bg-base-300"
        size="md"
        variant="base"
        renderValue={(option) => <span className="font-semibold text-sm">{option?.label ?? option?.value}</span>}
      />
    </div>
  );
};
