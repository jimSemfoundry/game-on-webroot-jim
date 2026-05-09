import { createFileRoute } from "@tanstack/react-router";
import clsx from "clsx";
import { useState, useTransition } from "react";
import { useRTLContext } from "@/contexts/RTLContext.tsx";
import { useTranslation } from "react-i18next";
import { RewardsHistory } from "@/sections/lucky-spin/RewardsHistory.tsx";
import { SpinsHistory } from "@/sections/lucky-spin/SpinsHistory.tsx";
import { InnerBonusContainer, InnerBonusSlogan } from "@/sections/lucky-spin/components.tsx";

export const Route = createFileRoute("/_main/lucky-spin/me" as any)({
  component: History
});

type TabType = "rewards" | "spins";

function History() {
  const { t } = useTranslation(["luckySpin"]);

  const { isRTL } = useRTLContext();

  const [activeTab, setActiveTab] = useState<TabType>("rewards");

  const [isPending, startTransition] = useTransition();

  return (
    <div className="sm:min-h-[calc(100vh-100px)] max-w-[500px] m-auto sm:bg-base-400 sm:rounded-xl overflow-hidden">
      <InnerBonusContainer
        className={clsx("h-40 px-5 pt-18", { "-scale-x-100": isRTL })}>
        <InnerBonusSlogan />
      </InnerBonusContainer>

      <div className={"flex flex-col gap-3 p-3 m-5 rounded-xl bg-base-200 mb-10"}>
        <div className={"flex gap-2"}>
          <button
            className={clsx("btn flex-1", {
              "btn-primary btn-soft": activeTab === "rewards",
              "btn-ghost": activeTab !== "rewards"
            })}
            onClick={() => {
              startTransition(() => {
                setActiveTab("rewards");
              });
            }}
            disabled={isPending}
          >
            {t("bonus:rewards")}
          </button>
          <button
            className={clsx("btn flex-1", {
              "btn-primary btn-soft": activeTab === "spins",
              "btn-ghost": activeTab !== "spins"
            })}
            onClick={() => {
              startTransition(() => {
                setActiveTab("spins");
              });
            }}
            disabled={isPending}
          >
            {t("luckySpin:spin")}
          </button>
        </div>

        <div className={clsx({ "opacity-60 pointer-events-none": isPending })}>
          <div style={{ display: activeTab === "rewards" ? "block" : "none" }}>
            <RewardsHistory />
          </div>
          <div style={{ display: activeTab === "spins" ? "block" : "none" }}>
            <SpinsHistory />
          </div>
        </div>
      </div>
    </div>
  );
}

