import { createFileRoute } from "@tanstack/react-router";
import clsx from "clsx";
import { useState, useTransition } from "react";
import { useRTLContext } from "@/contexts/RTLContext.tsx";
import { useTranslation } from "react-i18next";
import { InnerBuddyBallsContainer, InnerBuddyBallsSlogan } from "@/sections/buddy-balls/components.tsx";
import { BallsHistory } from "@/sections/buddy-balls/BallsHistory.tsx";
import { RewardsHistory } from "@/sections/buddy-balls/RewardsHistory.tsx";

export const Route = createFileRoute("/_main/buddy-balls/history" as any)({
  component: History
});

type TabType = "rewards" | "balls";

function History() {
  const { t } = useTranslation(["buddyBalls"]);

  const { isRTL } = useRTLContext();

  const [activeTab, setActiveTab] = useState<TabType>("rewards");

  const [isPending, startTransition] = useTransition();

  return (
    <div className="m-auto max-w-[500px] pb-[calc(5rem+var(--safe-area-inset-bottom)+var(--android-nav-offset,0px))] sm:min-h-[calc(100vh-100px)] sm:overflow-hidden sm:rounded-xl sm:bg-base-400 sm:pb-0">
      <InnerBuddyBallsContainer
        className={clsx("h-38 px-5 pt-20", { "-scale-x-100": isRTL })}>
        <InnerBuddyBallsSlogan />
      </InnerBuddyBallsContainer>

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
              "btn-primary btn-soft": activeTab === "balls",
              "btn-ghost": activeTab !== "balls"
            })}
            onClick={() => {
              startTransition(() => {
                setActiveTab("balls");
              });
            }}
            disabled={isPending}
          >
            {t("buddyBalls:buddyBalls")}
          </button>
        </div>

        <div className={clsx({ "opacity-60 pointer-events-none": isPending })}>
          <div style={{ display: activeTab === "rewards" ? "block" : "none" }}>
            <RewardsHistory />
          </div>
          <div style={{ display: activeTab === "balls" ? "block" : "none" }}>
            <BallsHistory />
          </div>
        </div>
      </div>
    </div>
  );
}

