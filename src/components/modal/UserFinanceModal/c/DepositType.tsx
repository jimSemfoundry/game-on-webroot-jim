import { useBoundStore } from "@/store";
import { cn } from "@/utils/themeMerger.ts";
import { useTranslation } from "react-i18next";

type TabItemsType = "crypto" | "fiat";

const tabItems: { label: TabItemsType }[] = [
  {
    label: "crypto",
  },
  {
    label: "fiat",
  },
];

export const DepositType = () => {
  const { t } = useTranslation("finance");

  const { depositType, setDepositType } = useBoundStore();

  return (
    <div className="flex justify-between gap-2 sticky top-0 bg-base-300 z-11 py-4">
      {tabItems.map(({ label }) => (
        <button
          key={label}
          onClick={() => {
            setDepositType(label);
          }}
          className={cn("flex-1 btn md:btn-md btn-ghost", depositType === label && "btn-soft")}
        >
          {t(label)}
        </button>
      ))}
    </div>
  );
};
