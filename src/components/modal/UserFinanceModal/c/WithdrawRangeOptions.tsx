import { perRangeOptions } from "@/components/modal/UserFinanceModal/helper.ts";
import { cn } from "@/utils/cn.ts";

interface OptionProps {
  label: string;
  value: string;
}

export const WithdrawRangeOptions = ({
  selected,
  onClick,
  disabled,
}: {
  selected: OptionProps | null;
  onClick: (v: OptionProps) => void;
  disabled: boolean;
}) => {
  return (
    <div className="mt-2 grid grid-cols-4 gap-2">
      {perRangeOptions.map((o, index) => (
        <button
          key={index}
          className={cn(
            `btn btn-sm bg-base-300 text-base-content/50 border-0 rounded-sm font-bold`,
            selected?.label === o.label && "bg-primary text-primary-content",
          )}
          onClick={() => onClick(o)}
          disabled={disabled}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
};
