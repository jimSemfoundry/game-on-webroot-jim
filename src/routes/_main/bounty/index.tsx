import { Select, type SelectOption } from "@/components/ui/Select";
import { useAuth } from "@/contexts/AuthContext";
import { useBountyStatus, useChallengeList, useMyWinList } from "@/hooks/api/useBounty";
import { BountyClaimModal } from "@/sections/bounty/BountyClaimModal";
import { BountyGameCard } from "@/sections/bounty/BountyGameCard";
import { BountyInfoModal } from "@/sections/bounty/BountyInfoModal";
import { showBountyClaimToast } from "@/sections/bounty/bountyToast";
import type { BountyChallenge, BountyMyWin } from "@/services/bountyService";
import { cn } from "@/utils/themeMerger";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type Tab = "active" | "completed" | "myWin";

type BountySearch = { tab?: Tab };

export const Route = createFileRoute("/_main/bounty/")({
  component: BountyPage,
  validateSearch: (s: Record<string, unknown>): BountySearch => ({
    tab:
      s.tab === "active" || s.tab === "completed" || s.tab === "myWin"
        ? (s.tab as Tab)
        : undefined,
  }),
});

const TROPHY = "/images/bounty/bounty-figma.png";

function BountyPage() {
  const { t } = useTranslation(["bountyBonus", "common"]);
  const { isAuthenticated } = useAuth();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(search.tab ?? "active");
  // 当 URL ?tab= 改变时同步本地 state（譬如从游戏详情页 GoBountyGame 跳进来）
  useEffect(() => {
    if (search.tab && search.tab !== tab) setTab(search.tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.tab]);
  const [claimWinner, setClaimWinner] = useState<BountyMyWin | null>(null);
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState<"created" | "reward">("created");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [infoOpen, setInfoOpen] = useState(false);

  const status = useBountyStatus(isAuthenticated);

  const allTabs: { value: Tab; label: string; visible: boolean }[] = [
    { value: "active", label: t("bountyBonus:activeTab", "Active"), visible: true },
    { value: "completed", label: t("bountyBonus:completedTab", "Completed"), visible: true },
    { value: "myWin", label: t("bountyBonus:myCompletedTab", "My Completed"), visible: isAuthenticated },
  ];
  const tabs = allTabs.filter((t) => t.visible);

  const sortOptions: SelectOption[] = [
    { value: "created", label: t("bountyBonus:sortByCreated", "Newly Added") },
    { value: "reward", label: t("bountyBonus:sortByReward", "Highest Reward") },
  ];

  return (
    <div className="px-3 pb-8 pt-3 max-w-screen-xl mx-auto">
      {status.data && status.data.branch_enabled === false && (
        <div className="alert alert-warning mb-3 text-sm">
          <span>{t("bountyBonus:branchDisabled", "Bounty challenges are not available right now.")}</span>
        </div>
      )}
      {status.data?.is_forbidden && (
        <div className="alert alert-error mb-3 text-sm">
          <span>{t("bountyBonus:forbidden", "Your account is currently restricted from bounty rewards.")}</span>
        </div>
      )}

      {/* Tabs (sticky) — 48px, lime 10% border on all tabs, active gets lime 10% fill + lime text. Figma 32913:347632 */}
      <div className="flex items-stretch gap-2 sticky top-0 bg-base-300 z-20 py-2 -mx-3 px-3">
        {tabs.map(({ value, label }) => (
          <button
            type="button"
            key={value}
            onClick={() => {
              setTab(value);
              navigate({ to: "/bounty", search: { tab: value }, replace: true });
            }}
            className={cn(
              "flex-1 h-12 rounded-lg text-xs font-semibold transition-colors border shadow-sm",
              "border-[rgba(196,224,44,0.1)]",
              tab === value ? "bg-[rgba(196,224,44,0.1)] text-[#C4E02C]" : "bg-transparent text-[#EBEBEB] hover:bg-base-200",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sort + Search row (per Figma 33486:322064 search section) — only Active/Completed */}
      {tab !== "myWin" && (
        <div className="grid grid-cols-[auto_1fr_auto] gap-2 mt-3 mb-3">
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={(value) => setSortBy(value as "created" | "reward")}
            variant="base"
            className="h-12 min-w-[160px] bg-base-100 rounded-lg text-sm font-semibold"
            dropdownClassName="bg-base-100"
          />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="search"
              placeholder={t("bountyBonus:searchPlaceholder", "Search games...")}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-lg bg-base-100 text-sm font-semibold placeholder:text-base-content/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
            className="h-12 w-12 rounded-lg bg-base-100 flex items-center justify-center hover:bg-base-200 transition-colors"
            aria-label={t("bountyBonus:sortOrder", "Sort order")}
          >
            {sortOrder === "desc" ? (
              <ArrowDown className="w-4 h-4 text-base-content/70" />
            ) : (
              <ArrowUp className="w-4 h-4 text-base-content/70" />
            )}
          </button>
        </div>
      )}

      <section className="mt-3">
        {tab === "active" && <ActiveTab keyword={keyword} sortBy={sortBy} sortOrder={sortOrder} />}
        {tab === "completed" && <CompletedTab keyword={keyword} sortBy={sortBy} sortOrder={sortOrder} />}
        {tab === "myWin" && isAuthenticated && <MyWinTab onClaim={(w) => setClaimWinner(w)} />}
      </section>

      <BountyClaimModal
        winner={claimWinner}
        onClose={() => setClaimWinner(null)}
        onSuccess={(amt, cur) => showBountyClaimToast({ amount: amt, currency: cur })}
      />
      <BountyInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}

function ActiveTab({ keyword, sortBy, sortOrder }: { keyword: string; sortBy: "created" | "reward"; sortOrder: "asc" | "desc" }) {
  const { t } = useTranslation("bountyBonus");
  const navigate = useNavigate();
  const { data, isLoading } = useChallengeList({
    tab: "active",
    page: 1,
    limit: 50,
    keyword: keyword || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });
  if (isLoading) return <Loading />;
  if (!data || data.list.length === 0) {
    return <EmptyState text={t("noActiveChallenges", "No active challenges right now.")} />;
  }
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {data.list.map((c: BountyChallenge) => (
        <BountyGameCard
          key={c.id}
          image={c.image}
          multiplier={c.multiplier}
          minBetAmount={c.min_bet_amount}
          minBetCurrency={c.min_bet_currency}
          rewardAmount={c.reward_amount}
          rewardCurrency={c.reward_currency}
          winnerSlots={c.winner_slots}
          completedCount={c.completed_count}
          status="active"
          onPlay={() => navigate({ to: `/games/${c.game_provider}:${c.inner_game_id}` })}
        />
      ))}
    </div>
  );
}

function CompletedTab({ keyword, sortBy, sortOrder }: { keyword: string; sortBy: "created" | "reward"; sortOrder: "asc" | "desc" }) {
  const { t } = useTranslation("bountyBonus");
  const navigate = useNavigate();
  const { data, isLoading } = useChallengeList({
    tab: "completed",
    page: 1,
    limit: 50,
    keyword: keyword || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });
  if (isLoading) return <Loading />;
  if (!data || data.list.length === 0) {
    return <EmptyState text={t("noCompletedChallenges", "No completed challenges yet.")} />;
  }
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {data.list.map((c: BountyChallenge) => (
        <BountyGameCard
          key={c.id}
          image={c.image}
          multiplier={c.multiplier}
          minBetAmount={c.min_bet_amount}
          minBetCurrency={c.min_bet_currency}
          rewardAmount={c.reward_amount}
          rewardCurrency={c.reward_currency}
          winnerSlots={c.winner_slots}
          completedCount={c.completed_count}
          firstWinner={
            c.winners && c.winners.length > 0
              ? {
                  winner_id: c.winners[0].winner_id,
                  username: c.winners[0].username,
                }
              : undefined
          }
          status="completed"
          onPlay={() => navigate({ to: `/games/${c.game_provider}:${c.inner_game_id}` })}
        />
      ))}
    </div>
  );
}

function MyWinTab({ onClaim }: { onClaim: (w: BountyMyWin) => void }) {
  const { t } = useTranslation("bountyBonus");
  const [claimFilter, setClaimFilter] = useState<"all" | "claimable" | "claimed">("all");
  const claimStatusParam = claimFilter === "claimable" ? 0 : claimFilter === "claimed" ? 1 : "";
  const { data, isLoading } = useMyWinList({
    page: 1,
    limit: 50,
    claim_status: claimStatusParam,
  });

  const filterOptions: SelectOption[] = [
    { value: "all", label: t("filterAll", "All") },
    { value: "claimable", label: t("filterClaimable", "Claimable") },
    { value: "claimed", label: t("filterClaimed", "Claimed") },
  ];

  const isEmpty = !isLoading && (!data || data.list.length === 0);

  return (
    <div className={cn("flex flex-col", isEmpty && "min-h-[60vh] justify-start")}>
      {/* Claimable / Claimed sub-filter — Figma 32913:347662 Variant3 */}
      <div className="mb-3">
        <Select
          options={filterOptions}
          value={claimFilter}
          onChange={(value) => setClaimFilter(value as "all" | "claimable" | "claimed")}
          variant="base"
          className="h-12 w-full max-w-[200px] bg-base-100 rounded-lg text-sm font-semibold"
          dropdownClassName="bg-base-100"
        />
      </div>

      {isLoading ? (
        <Loading />
      ) : !data || data.list.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState text={t("noMyChallenges", "You haven't completed any bounty")} large />
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {data.list.map((w) => (
            <BountyGameCard
              key={w.winner_id}
              image={w.image}
              multiplier={w.multiplier ?? 0}
              minBetAmount={w.min_bet_amount}
              minBetCurrency={w.min_bet_currency}
              rewardAmount={w.reward_amount}
              rewardCurrency={w.reward_currency}
              winnerSlots={w.winner_slots ?? undefined}
              betMultiplier={w.bet_multiplier}
              claimAmount={w.claim_amount}
              claimCurrency={w.claim_currency}
              claimedAt={w.claimed_at}
              status={w.claim_status === 1 ? "myClaimed" : "myUnclaimed"}
              onClaim={w.claim_status === 0 ? () => onClaim(w) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Empty state — large trophy + bold white text per Figma node 32913:346723. */
function EmptyState({ text, large }: { text: string; large?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <img
        src={TROPHY}
        alt=""
        className={cn("opacity-90 drop-shadow-[0_0_24px_rgba(196,224,44,0.3)]", large ? "w-32 h-32" : "w-24 h-24")}
      />
      <p className="text-sm font-bold text-base-content text-center max-w-xs">{text}</p>
    </div>
  );
}

function Loading() {
  const { t } = useTranslation("common");
  return (
    <div className="flex items-center justify-center py-12 text-base-content/50 text-sm">
      <span className="loading loading-spinner loading-md mr-2" />
      {t("common.loading", "Loading...")}
    </div>
  );
}
