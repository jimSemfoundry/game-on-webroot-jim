import Iconify from "@/components/iconify";
import { useTranslation } from "react-i18next";
import { useFinanceModal } from "@/contexts/ModalsProvider.tsx";
import { emitter } from "@/store/emitter.ts";
import { ComponentProps } from "react";

export function FastFinanceLink() {
  const { t } = useTranslation();

  const { openUserFinanceModalWithTab } = useFinanceModal();

  return (
    <div className="flex items-center gap-2 mt-4">
      <button className="btn btn-primary btn-md sm:btn-lg flex-1"
              onClick={() => openUserFinanceModalWithTab("deposit")}>
        <Iconify icon="custom:deposit" width={20} height={20} />
        <span>{t("common:common.deposit")}</span>
      </button>
      <button className="btn btn-ghost btn-md sm:btn-lg z-10 flex-1"
              onClick={() => openUserFinanceModalWithTab("withdraw")}>
        <Iconify icon="custom:withdraw" className="text-primary" width={20} height={20} />
        <span>{t("common:common.withdraw")}</span>
      </button>
    </div>
  );
}

export function FastViewDataLink() {
  // const { t } = useTranslation();

  const { openUserFinanceModalWithTab } = useFinanceModal();

  const items = [
    {
      event: () => openUserFinanceModalWithTab("swap"),
      id: "swap",
      label: "Swap"
    },
    {
      event: () => emitter.emit("SYNC_TABS_INDEX", "Transactions"),
      id: "transactions",
      label: "Transactions"
    },
    {
      event: () => emitter.emit("SYNC_TABS_INDEX", "Rollover"),
      id: "rollover",
      label: "Rollover"
    },
    {
      event: () => emitter.emit("SYNC_TABS_INDEX", "BetHistory"),
      id: "bet-history",
      label: "Bet History"
    }
  ];

  return (
    <StopPropagation className="flex justify-between mt-4">
      {items.map((item: Record<string, any>) => (<div
        key={item.id}
        onClick={() => item.event()}
        className="cursor-pointer h-15 font-semibold flex flex-col items-center justify-center gap-1 text-base-content/50">
        <Iconify icon={`custom:${item.id}`} className="w-6 h-6" />
        <span className="text-[10px] font-bold whitespace-nowrap">{item.label}</span>
      </div>))}
    </StopPropagation>
  );
}

const StopPropagation = (props: ComponentProps<"div">) => {
  return (<div {...props}
    onClick={(e) => e.stopPropagation()}>
    {props.children}
  </div>);
};

