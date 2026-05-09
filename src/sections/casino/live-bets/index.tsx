import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ChevronRight } from "lucide-react";
import { Suspense, lazy, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BetRowSkeleton } from "@/sections/casino/live-bets/components.tsx";

const LatestWins = lazy(() =>
  import("@/sections/casino/live-bets/LatestWins.tsx").then((m) => ({ default: m.LatestWins }))
);
const LatestBets = lazy(() =>
  import("@/sections/casino/live-bets/LatestBets.tsx").then((m) => ({ default: m.LatestBets }))
);
const GreatestBets = lazy(() =>
  import("@/sections/casino/live-bets/GreatestBets.tsx").then((m) => ({ default: m.GreatestBets }))
);

export const LiveBets = () => {
  const { t } = useTranslation();

  const [category, setCategory] = useState<string>("latestWins");
  const [mountedTabs, setMountedTabs] = useState<Record<string, boolean>>({
    latestWins: true,
    latestBets: false,
    greatestBets: false
  });

  const segments = useMemo(
    () => [
      {
        value: "latestWins",
        label: (
          <span className="flex items-center gap-2 whitespace-nowrap overflow-hidden">
            <p className={"truncate"}>{t("casino:latestWins")}</p>
          </span>
        )
      },
      {
        value: "greatestBets",
        label: (
          <span className="flex items-center gap-2 whitespace-nowrap overflow-hidden">
            <p className={"truncate"}>{t("casino:greatestBets")}</p>
          </span>
        )
      },
      {
        value: "latestBets",
        label: (
          <span className="flex items-center gap-2 whitespace-nowrap overflow-hidden">
            <p className={"truncate"}>{t("casino:latestBets")}</p>
          </span>
        )
      }
    ],
    [t]
  );

  const suspenseFallback = useMemo(
    () => (
      <>
        {Array.from({ length: 10 }).map((_, i) => (
          <BetRowSkeleton key={`live-bets-suspense-skeleton-${i}`} />
        ))}
      </>
    ),
    []
  );

  const tabContents = useMemo(
    () => [
      { key: "latestWins", Component: LatestWins },
      { key: "latestBets", Component: LatestBets },
      { key: "greatestBets", Component: GreatestBets }
    ],
    []
  );

  const handleSelect = (value: string) => {
    setCategory(value);
    setMountedTabs((prev) => (prev[value] ? prev : { ...prev, [value]: true }));
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="inline-grid *:[grid-area:1/1]">
            <div className="status status-md sm:status-lg status-primary animate-ping"></div>
            <div className="status status-md sm:status-lg status-primary"></div>
          </div>
          <p className="text-sm sm:text-base font-bold">{t("casino:bets")}</p>
        </div>
        <div className="hidden sm:block">
          <SegmentedControl
            options={segments}
            value={category}
            onChange={handleSelect}
          />
        </div>
        <div className="block sm:hidden">
          <div className="dropdown dropdown-center">
            <div tabIndex={0} role="button" className="btn m-1 btn-sm w-auto flex items-center justify-between">
              {segments.find((segment) => segment.value === category)?.label}
              <ChevronRight className="w-4 h-4 text-base-content rtl:rotate-180" />
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-200 rounded-field z-1 w-38 p-2 shadow-sm">
              {segments.map((segment) => (
                <li key={segment.value}>
                  <a
                    className="text-xs font-semibold"
                    onClick={() => {
                      handleSelect(segment.value as any);
                      if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                      }
                    }}
                  >
                    {segment.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-box">
        {/* 表头 */}
        <div className="px-3 sm:px-6 py-2 sm:py-3 mb-1">
          <div
            className="grid grid-cols-3 sm:grid-cols-5 sm:grid-cols-[1.8fr_1.5fr_1fr_0.5fr_1fr] gap-4 font-semibold text-base-content/50 text-xs sm:text-sm">
            <div className="font-bold text-start">{t("casino:game")?.toUpperCase()}</div>
            <div className="font-bold text-start">{t("casino:user")?.toUpperCase()}</div>
            <div className="font-bold hidden sm:block text-start">{t("casino:bet")?.toUpperCase()}</div>
            <div className="font-bold hidden sm:block text-start">{t("transaction:tableHeaders.multiplier")?.toUpperCase()}</div>
            <div className="font-bold text-end">{t("casino:profit")?.toUpperCase()}</div>
          </div>
        </div>

        <div style={{ overflowAnchor: "none" }}>
          {tabContents.map(({ key, Component }) =>
            mountedTabs[key] ? (
              <div key={key} className={category === key ? "block" : "hidden"}>
                <Suspense fallback={suspenseFallback}>
                  <Component />
                </Suspense>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};
