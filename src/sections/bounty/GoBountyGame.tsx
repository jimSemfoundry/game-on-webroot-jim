import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";

interface GoBountyGameProps {
  bounty?: {
    has_active_challenge?: boolean;
    bounty_name?: string | null;
    multiplier?: number | null;
    reward_amount?: number | null;
    reward_currency?: string | null;
    /** Bug #7：后端 buildBountyInfoForGame 注入；user 已赢过 bounty 时是 winner.id，否则 null */
    user_won_winner_id?: number | null;
  } | null;
  className?: string;
}

const TROPHY = "/images/bounty/bounty-figma.png";

/**
 * Game detail page bounty entry pill — Figma node 32913:347148.
 *
 * 当游戏有 active bounty 挑战时（getGameV2 返回 bounty.has_active_challenge=true），
 * 在游戏详情页显示一个胶囊按钮：左奖杯 + "Win {{reward}} {{currency}}" 大字 + 圆形 lime "GO".
 *
 * 跳转规则 (Bug #7)：
 * - bounty.user_won_winner_id 有值（user 已赢过该 bounty）→ 跳 /bounty?tab=myWin
 * - 否则 → 跳 /bounty?tab=active
 *
 * 金额跟随 user.display_currency (Bug #1 同款 ride along)。
 */
export function GoBountyGame({ bounty, className }: GoBountyGameProps) {
  const { t } = useTranslation("bountyBonus");
  const navigate = useNavigate();
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  if (!bounty?.has_active_challenge) return null;

  const reward = bounty.reward_amount ?? 0;
  const fromCurrency = bounty.reward_currency ?? "USDT";
  const r = formatWithConversion(reward, fromCurrency, {
    showSymbol: false,
    showCode: false,
    minimizeDecimals: true,
  });

  const targetTab: "active" | "myWin" = bounty.user_won_winner_id ? "myWin" : "active";

  return (
    <button
      type="button"
      onClick={() => navigate({ to: "/bounty", search: { tab: targetTab } })}
      className={
        "flex items-center justify-between gap-3 p-2 pr-2 rounded-full transition-colors hover:opacity-90 " +
        (className ?? "")
      }
      style={{ background: "#181D24" }}
    >
      <span className="flex items-center gap-2 pl-2 truncate">
        <img src={TROPHY} alt="" className="w-7 h-7 object-contain" />
        <span className="text-base font-bold truncate" style={{ color: "#EBEBEB" }}>
          {t("winAmount", "Win {{amount}} {{currency}}", { amount: r.formatted, currency: r.currency })}
        </span>
      </span>
      <span
        className="flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
        style={{ width: 48, height: 48, background: "#C4E02C", color: "#00471F" }}
      >
        {t("go", "GO").toUpperCase()}
      </span>
    </button>
  );
}
