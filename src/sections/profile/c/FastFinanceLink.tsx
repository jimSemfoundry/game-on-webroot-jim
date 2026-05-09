import Iconify from "@/components/iconify";
import { useTranslation } from "react-i18next";
import { emitter } from "@/store/emitter.ts";
import { ComponentProps } from "react";
import { useNavigate } from "@tanstack/react-router";

export function FastFinanceLink() {
  const navigate = useNavigate();

  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 mt-4">
      <button className="btn btn-primary btn-md sm:btn-lg flex-1"
              onClick={() => void navigate({ to: "/finance" })}>
        <Iconify icon="custom:deposit" width={20} height={20} />
        <span>{t("common:common.deposit")}</span>
      </button>
      <button className="btn btn-ghost btn-md sm:btn-lg z-10 flex-1"
              onClick={() => void navigate({ to: "/finance", state: { activeTab: "withdraw" } as any })}>
        <Iconify icon="custom:withdraw" className="text-primary" width={20} height={20} />
        <span>{t("common:common.withdraw")}</span>
      </button>
    </div>
  );
}

export function FastViewDataLink() {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const items = [
    {
      event: () => void navigate({ to: "/finance", state: { activeTab: "swap" } as any }),
      id: "swap",
      label: t("common:common.swap")
    },
    {
      event: () => emitter.emit("SYNC_TABS_INDEX", "transactions"),
      id: "transactions",
      label: t("common:common.transactions")
    },
    {
      event: () => emitter.emit("SYNC_TABS_INDEX", "rollover"),
      id: "rollover",
      label: t("common:common.rollover")
    },
    {
      event: () => emitter.emit("SYNC_TABS_INDEX", "bet-history"),
      id: "bet-history",
      label: t("common:common.betHistory")
    }
  ];

  return (
    <StopPropagation className="grid gap-2 grid-cols-2 mt-4">
      {items.map((item: Record<string, any>) => (<div
        id={item.id}
        key={item.id}
        onClick={() => item.event()}
        className="p-2 rounded-lg truncate cursor-pointer h-10 font-semibold flex gap-1 items-center text-base-content/50 border border-1 border-base-100">
        <Iconify icon={`custom:${item.id}`} className="w-5 h-5" />
        <span
          className="text-[12px] font-bold truncate max-w-full overflow-hidden whitespace-nowrap">{item.label}</span>
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

