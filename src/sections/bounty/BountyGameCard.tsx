import { Play } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";

export type BountyCardStatus = "active" | "completed" | "myUnclaimed" | "myClaimed";

export interface BountyCardWinner {
  winner_id: number;
  username: string;
  avatar?: string;
}

interface BountyGameCardProps {
  image: string;
  multiplier: number;
  minBetAmount: number;
  minBetCurrency: string;
  rewardAmount: number;
  rewardCurrency: string;
  // active / completed
  winnerSlots?: number;
  completedCount?: number;
  // completed: 第一名 winner
  firstWinner?: BountyCardWinner;
  // myUnclaimed / myClaimed
  betMultiplier?: number;
  claimAmount?: number;
  claimCurrency?: string;
  claimedAt?: number;
  status: BountyCardStatus;
  onClaim?: () => void;
  onPlay?: () => void;
  rightSlot?: ReactNode;
}

/**
 * BountyGameCard — 严格对齐 Figma:
 *  - Active     node 32913:356303 (PC 5-col grid，纵向卡片)
 *  - Completed  node 32913:345615
 *  - My Completed node 32913:346725
 *
 * 共同骨架：column 纵向, padding 12, gap 16, bg `#181D24`, 16px 圆角.
 *  - 上：游戏 art `aspect-[235/295]` (8px 圆角)
 *  - 下：body column
 *      ① 顶部 Multiplier + Min bet 多行文本（14px SemiBold 白）
 *      ② 中间 Reward 行：左侧 "Reward:" 12px SB 50% 白 + i 按钮；右侧 amount 12px Bold lime
 *      ③ 底部 variant-specific：
 *           - Active: 56px lime Play button
 *           - Completed: 40px winner box bg `#1E242E` + avatar + username
 *           - My Completed: 48px lime Claim button
 *           - My Claimed (设计稿没画，自定义): 灰禁用 Claim 按钮
 *  - 整张卡可点（onPlay 跳详情），按钮区域 stopPropagation 不冒泡触发卡片导航
 *  - 注意：Figma 卡片 **没有** 游戏名 / provider 文字 / status badge / progress bar
 */
export function BountyGameCard(props: BountyGameCardProps) {
  const { t } = useTranslation("bountyBonus");
  const {
    image,
    multiplier,
    minBetAmount,
    minBetCurrency,
    rewardAmount,
    rewardCurrency,
    winnerSlots,
    completedCount,
    firstWinner,
    claimAmount,
    claimCurrency,
    claimedAt,
    status,
    onClaim,
    onPlay,
    rightSlot,
  } = props;

  // i 按钮在所有 4 态都展示（Active / Completed / My Completed Claimable / My Completed Claimed）— Figma 32913:345388
  const showInfoButton = true;

  // 整张卡片可点击跳转详情：所有形态只要提供 onPlay 都启用整卡跳转
  const cardClickable = !!onPlay;

  return (
    <article
      className={
        "flex flex-row gap-4 p-3 rounded-2xl transition-transform sm:flex-col sm:gap-2 " +
        (cardClickable ? "cursor-pointer hover:-translate-y-0.5 hover:ring-1 hover:ring-primary/40" : "")
      }
      style={{ background: "#181D24" }}
      onClick={cardClickable ? onPlay : undefined}
      role={cardClickable ? "button" : undefined}
      tabIndex={cardClickable ? 0 : undefined}
      onKeyDown={
        cardClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPlay?.();
              }
            }
          : undefined
      }
    >
      {/* Mobile: image 139×188 left fixed; PC (sm+): full-width column-top, aspect 235:295 */}
      <div
        className="shrink-0 overflow-hidden rounded-lg w-[139px] h-[188px] sm:w-full sm:h-auto sm:aspect-[235/295]"
        style={{ background: "#1A1F26" }}
      >
        {image ? (
          <img
            src={image}
            alt=""
            className="w-full h-full object-contain"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img src="/images/bounty/bounty-figma.png" alt="" className="w-16 h-16 opacity-60" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 min-w-0 justify-between sm:flex-none sm:justify-start sm:mt-1">
        {/* Top: Multiplier + Min bet multi-line text */}
        <div className="text-sm font-semibold leading-4" style={{ color: "#EBEBEB" }}>
          <div className="truncate">
            <span style={{ color: "#EBEBEB" }}>{t("multiplierLabel", "Multiplier")}: </span>
            {multiplier}×
          </div>
          {minBetCurrency !== "" && minBetAmount > 0 && (
            <div className="truncate mt-0.5">
              <span>{t("minBetLabel", "Min Bet")}: </span>
              {minBetAmount} {minBetCurrency}
            </div>
          )}
        </div>

        {/* Middle: Reward block — label row + amount row (per Figma node 32913:345022) */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold" style={{ color: "rgba(235, 235, 235, 0.5)" }}>
              {t("rewardLabel", "Reward")}:
            </span>
            {showInfoButton && (
              <RewardInfoTooltip slots={winnerSlots} multiplier={multiplier} minBetAmount={minBetAmount} minBetCurrency={minBetCurrency} />
            )}
          </div>
          <RewardDisplay rewardAmount={rewardAmount} rewardCurrency={rewardCurrency} />
        </div>

        {/* Bottom: variant-specific */}
        {status === "active" && (
          <>
            <ActiveProgress winnerSlots={winnerSlots} completedCount={completedCount} />
            <ActiveFooter onPlay={onPlay} />
          </>
        )}
        {status === "completed" && <CompletedFooter winner={firstWinner} />}
        {status === "myUnclaimed" && onClaim && <MyClaimButton onClaim={onClaim} />}
        {status === "myClaimed" && <MyClaimedDisabled claimAmount={claimAmount} claimCurrency={claimCurrency} claimedAt={claimedAt} />}
      </div>

      {rightSlot}
    </article>
  );
}

function ActiveFooter({ onPlay }: { onPlay?: () => void }) {
  const { t } = useTranslation("bountyBonus");
  if (!onPlay) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onPlay();
      }}
      className="flex w-full items-center justify-center gap-2 rounded-lg font-bold transition-colors hover:opacity-90 mt-2"
      style={{ height: 56, background: "#C4E02C", color: "#00471F", fontSize: 18 }}
    >
      <Play size={20} fill="currentColor" />
      {t("play", "Play")}
    </button>
  );
}

function CompletedFooter({ winner }: { winner?: BountyCardWinner }) {
  if (!winner) {
    return (
      <div
        className="flex items-center justify-center rounded-lg mt-2 text-xs font-semibold"
        style={{ height: 40, background: "#1E242E", color: "rgba(235, 235, 235, 0.5)" }}
      >
        —
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 px-3 rounded-lg mt-2" style={{ height: 40, background: "#1E242E" }}>
      <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: 20, height: 20, background: "#0E141B" }}>
        {winner.avatar ? (
          <img src={winner.avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold" style={{ color: "#C4E02C" }}>
            {(winner.username || "?").charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <span className="text-xs font-semibold truncate" style={{ color: "#EBEBEB" }}>
        {winner.username}
      </span>
    </div>
  );
}

function MyClaimButton({ onClaim }: { onClaim: () => void }) {
  const { t } = useTranslation("bountyBonus");
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClaim();
      }}
      className="rounded-lg font-bold transition-colors hover:opacity-90 mt-2"
      style={{ height: 48, background: "#C4E02C", color: "#00471F", fontSize: 16 }}
    >
      {t("claimReward", "Claim")}
    </button>
  );
}

function MyClaimedDisabled({
  claimAmount,
  claimCurrency,
  claimedAt,
}: {
  claimAmount?: number;
  claimCurrency?: string;
  claimedAt?: number;
}) {
  const { t } = useTranslation("bountyBonus");
  return (
    <div className="flex flex-col gap-1 mt-2">
      {claimAmount !== undefined && claimCurrency && (
        <div className="text-[11px]" style={{ color: "rgba(235, 235, 235, 0.5)" }}>
          {t("claimed", "Claimed")}:{" "}
          <span style={{ color: "#EBEBEB" }} className="font-semibold">
            {Number(claimAmount).toFixed(2)} {claimCurrency}
          </span>
          {claimedAt && claimedAt > 0 && (
            <div className="text-[10px]" style={{ color: "rgba(235, 235, 235, 0.4)" }}>
              {new Date(claimedAt * 1000).toLocaleString()}
            </div>
          )}
        </div>
      )}
      <div
        className="rounded-lg flex items-center justify-center font-bold cursor-default"
        style={{ height: 48, background: "rgba(30, 36, 46, 0.5)", color: "rgba(255, 255, 255, 0.4)", fontSize: 16 }}
      >
        {t("claimed", "Claimed")}
      </div>
    </div>
  );
}

/**
 * RewardInfoTooltip — i 按钮 + click-to-toggle popover.
 * 严格按 Figma 32913:345388: bg `#C4E02C` lime, top pointer, 4px 圆角, padding 8.
 */
function RewardInfoTooltip({
  slots,
  multiplier,
  minBetAmount,
  minBetCurrency,
}: {
  slots?: number;
  multiplier: number;
  minBetAmount: number;
  minBetCurrency: string;
}) {
  const { t } = useTranslation("bountyBonus");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const tooltipText = t("rewardTooltip", {
    defaultValue: "First {{slots}} to hit {{multiplier}}+ multiplier with min bet {{minBet}} {{currency}} equivalent",
    slots: slots ?? "—",
    multiplier,
    minBet: minBetAmount,
    currency: minBetCurrency,
  });

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 16, height: 16 }}
        aria-label="Reward info"
        aria-expanded={open}
      >
        {/* White circle + black "i" — Figma node 32913:345022 i icon */}
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden focusable="false">
          <circle cx="7" cy="7" r="7" fill="#EBEBEB" />
          <circle cx="7" cy="3.6" r="0.85" fill="#181D24" />
          <rect x="6.15" y="5.6" width="1.7" height="5" rx="0.6" fill="#181D24" />
        </svg>
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute z-30 left-1/2 -translate-x-1/2 top-full mt-1.5 flex flex-col items-center"
          style={{ width: 199 }}
        >
          {/* Top pointer (triangle) */}
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderBottom: "6px solid #C4E02C",
            }}
            aria-hidden
          />
          {/* Body */}
          <div
            className="w-full text-center px-2 py-2 text-[11px] font-semibold leading-snug"
            style={{ background: "#C4E02C", color: "#00471F", borderRadius: 4 }}
          >
            {tooltipText}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * RewardDisplay — 卡片 reward 行：金额按 user.display_currency 自动转换 + 真 currency icon。
 * Bug #1 修复：旧实现用占位 lime 圆 + 首字母字符；展示币种永远 = 后端 reward_currency (USDT)，
 * 不跟随用户选的 display currency。
 */
function RewardDisplay({ rewardAmount, rewardCurrency }: { rewardAmount: number; rewardCurrency: string }) {
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const r = formatWithConversion(rewardAmount, rewardCurrency, {
    showSymbol: false,
    showCode: false,
    minimizeDecimals: true,
  });
  return (
    <div
      className="text-sm font-bold whitespace-nowrap flex items-center gap-1.5 truncate"
      style={{ color: "#EBEBEB" }}
    >
      <CurrencyIcon currency={r.currency} className="w-4 h-4" />
      <span>
        {r.formatted} {r.currency}
      </span>
    </div>
  );
}

/**
 * ActiveProgress — Active tab 卡片右上 X/Y 名额角标。
 * Bug #4 修复：旧实现没有进度展示，玩家不知道还剩几个名额。
 */
function ActiveProgress({ winnerSlots, completedCount }: { winnerSlots?: number; completedCount?: number }) {
  const { t } = useTranslation("bountyBonus");
  if (winnerSlots === undefined || completedCount === undefined) return null;
  const total = Math.max(0, Number(winnerSlots) || 0);
  const done = Math.max(0, Number(completedCount) || 0);
  return (
    <div
      className="self-end px-2 py-0.5 rounded text-[11px] font-semibold"
      style={{ background: "rgba(196, 224, 44, 0.1)", color: "#C4E02C" }}
      aria-label={`${done} of ${total} winners`}
    >
      {t("progress", "{{completed}} / {{total}}", { completed: done, total })}
    </div>
  );
}
