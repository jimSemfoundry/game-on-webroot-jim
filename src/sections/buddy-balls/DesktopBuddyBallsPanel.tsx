import clsx from "clsx";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import { useNavigate } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useUserBuddyBallsHome } from "@/hooks/api/useAuth.ts";
import { BallsHistory } from "@/sections/buddy-balls/BallsHistory.tsx";
import { RewardsHistory } from "@/sections/buddy-balls/RewardsHistory.tsx";
import { InnerShareLink } from "@/sections/bonus/buddy-ball/share.tsx";

dayjs.extend(isToday);

type DesktopTab = "details" | "balls" | "rewards";
export type DesktopBuddyTab = DesktopTab;

const DesktopDetailsPanel = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["popup", "bonus", "buddyBalls"]);
  const { data: buddy } = useUserBuddyBallsHome();

  const source = buddy?.data?.source_ball_stats ?? [];
  const user = source?.find((s: { source: string }) => s?.source === "user");
  const deposit = source?.find((s: { source: string }) => s?.source === "deposit");

  return (
    <div className="pr-1 text-sm font-semibold">
      <h3 className="text-base font-semibold text-base-content">{t("buddyBalls:moreBalls")}</h3>

      <div className="mt-4 flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-3">
        <DesktopInfoRow title={t("buddyBalls:dailyCheck")} counter="">
          {dayjs((buddy?.data?.continuous_checkin_last_date_ts || 0) * 1000).isToday()
            ? <BadgeCheck className="h-4 w-4 text-base-content/45" strokeWidth={3} />
            : (
              <button
                className="btn btn-primary btn-sm h-9 min-h-0 rounded-lg px-5"
                onClick={() => void navigate({ to: "/bonus/check" })}
              >
                {t("buddyBalls:go")}
              </button>
            )}
        </DesktopInfoRow>

        <DesktopInfoRow title={t("buddyBalls:referFriend")} counter="1">
          <span className="pr-3 font-bold text-base-content/55">+{user?.total_ball || 0}</span>
        </DesktopInfoRow>

        <DesktopInfoRow title={t("buddyBalls:referralDeposit")} counter="5">
          <span className="pr-3 font-bold text-base-content/55">+{deposit?.total_ball || 0}</span>
        </DesktopInfoRow>
        </div>

        <InnerShareLink />
      </div>

      <DesktopSectionTitle className="mt-5" title={t("popup:tournament.expiration")} />
      <DesktopDescription>{t("popup:tournament.expirationDesc")}</DesktopDescription>

      <DesktopSectionTitle className="mt-5" title={t("popup:tournament.generalTerms")} />
      <DesktopDescription>{t("buddyBalls:accumulated")}</DesktopDescription>
      <DesktopDescription>{t("popup:tournament.generalTermsDesc2")}</DesktopDescription>
    </div>
  );
};

const DesktopInfoRow = ({
  title,
  counter,
  children,
}: {
  title: string;
  counter: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex min-h-12 items-center justify-between rounded-xl bg-base-300 pr-1 pl-4 py-1">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-base-content/55">{title}</span>
        <div className="flex shrink-0 items-center text-primary font-bold">
          {counter ? `${counter}x` : ""}
          <img src="/images/bonus/ball.png" alt="" className="h-4 w-4" />
        </div>
      </div>
      {children}
    </div>
  );
};

const DesktopSectionTitle = ({ title, className }: { title: string; className?: string }) => {
  return <h3 className={clsx("text-sm font-semibold text-base-content", className)}>{title}</h3>;
};

const DesktopDescription = ({ children }: { children: React.ReactNode }) => {
  return <p className="mt-3 whitespace-pre-line text-xs leading-5 text-base-content/45">{children}</p>;
};

type DesktopBuddyBallsPanelProps = {
  activeTab?: DesktopBuddyTab;
  onTabChange?: (tab: DesktopBuddyTab) => void;
};

export const DesktopBuddyBallsPanel = ({ activeTab: controlledTab, onTabChange }: DesktopBuddyBallsPanelProps) => {
  const { t } = useTranslation(["buddyBalls", "bonus"]);
  const [internalTab, setInternalTab] = useState<DesktopTab>("details");
  const [isPending, startTransition] = useTransition();
  const activeTab = controlledTab ?? internalTab;

  const tabs: Array<{ key: DesktopTab; label: string }> = [
    { key: "details", label: t("bonus:bonus_details", "Info") },
    { key: "balls", label: t("buddyBalls:buddyBalls") },
    { key: "rewards", label: t("bonus:rewards") },
  ];

  return (
    <section className="hidden w-full flex-col rounded-[1rem] bg-transparent p-6 md:flex">
      <div className="grid shrink-0 grid-cols-3 gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            disabled={isPending}
            className={clsx(
              "h-12 rounded-xl border text-sm font-semibold transition-colors",
              activeTab === tab.key
                ? "border-primary/25 bg-primary/10 text-primary"
                : "border-base-content/10 bg-base-300 text-base-content"
            )}
            onClick={() => {
              startTransition(() => {
                if (onTabChange) {
                  onTabChange(tab.key);
                  return;
                }
                setInternalTab(tab.key);
              });
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={clsx("mt-5", { "pointer-events-none opacity-60": isPending })}>
        <div style={{ display: activeTab === "details" ? "block" : "none" }}>
          <DesktopDetailsPanel />
        </div>
        <div className="pr-1" style={{ display: activeTab === "balls" ? "block" : "none" }}>
          <BallsHistory />
        </div>
        <div className="pr-1" style={{ display: activeTab === "rewards" ? "block" : "none" }}>
          <RewardsHistory />
        </div>
      </div>
    </section>
  );
};
