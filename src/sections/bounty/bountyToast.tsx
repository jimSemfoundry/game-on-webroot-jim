import { Trans } from "react-i18next";
import { toast } from "sonner";

/**
 * Toast 设计严格对齐 Figma node 32936:369004 (Completed Bounty vertical):
 * - 335×竖式 / 16px 圆角 / padding 36 24 / bg #070B10
 * - 顶部 287x287 confetti effect 大图（金币爆炸 + trophy）
 * - "CONGRATULATIONS!" 18px SemiBold 白色，居中
 * - 副文案 16px 普通 50% 白，含 lime "100×" 强调
 * - 底部 200×48 lime "Claim now" 按钮（暗绿 #00471F 文字 14px Bold）
 *
 * 也提供横式 small toast（用于一般 success / info），用 Figma node 32936:368986。
 */

interface VerticalParams {
  multiplier: number;
  onClaim: () => void;
}

interface ClaimSuccessParams {
  amount: number;
  currency: string;
  onView?: () => void;
}

/** Bounty 中奖时的庆祝大 toast — 立式 + claim now 按钮。 */
export function showBountyHitToast({ multiplier, onClaim }: VerticalParams) {
  toast.custom(
    (tst) => (
      <div
        className="rounded-2xl flex flex-col items-center gap-4"
        style={{ width: 335, padding: "36px 24px", background: "#070B10", fontFamily: "var(--font-family)" }}
      >
        {/* Hero confetti — using bounty-hit.png as substitute for the layered Figma art */}
        <img
          src="/images/bounty/bounty-hit.png"
          alt=""
          className="w-[200px] h-[200px] object-contain drop-shadow-[0_0_36px_rgba(196,224,44,0.55)]"
        />

        <div className="text-center w-full space-y-2">
          <p className="text-lg font-semibold text-[#EBEBEB] uppercase tracking-wide">
            CONGRATULATIONS!
          </p>
          <p className="text-base text-[#EBEBEB]/50 leading-6">
            <Trans
              i18nKey="bountyBonus:youHitMultiplier"
              values={{ multiplier }}
              defaults="You hit <0>{{multiplier}}×</0>! Bounty completed, claim your reward now！"
              components={[<span key="0" className="font-bold text-primary" />]}
            />
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            toast.dismiss(tst);
            onClaim();
          }}
          className="h-12 rounded-lg text-sm font-bold transition-colors hover:opacity-90"
          style={{ width: 200, background: "#C4E02C", color: "#00471F" }}
        >
          <Trans i18nKey="bountyBonus:claimNow" defaults="Claim now" />
        </button>
      </div>
    ),
    { duration: 8000, position: "top-center" },
  );
}

/** Claim 成功后的小 toast — 横式 + View 按钮。Figma node 32936:368986. */
export function showBountyClaimToast({ amount, currency, onView }: ClaimSuccessParams) {
  toast.custom(
    (tst) => (
      <div
        className="rounded-lg p-4 w-[335px] flex items-center gap-2"
        style={{
          background:
            "radial-gradient(circle at 0% 46%, rgba(105, 28, 173, 1) 0%, rgba(16, 20, 25, 0) 100%), #101419",
          fontFamily: "var(--font-family)",
        }}
      >
        <div className="flex flex-1 items-center gap-4 min-w-0">
          <img
            src="/images/bounty/bounty-figma.png"
            alt=""
            className="w-12 h-12 select-none drop-shadow-[0_0_12px_rgba(196,224,44,0.3)] flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#EBEBEB] leading-4">
              <Trans i18nKey="bountyBonus:congratulations" defaults="Congratulations!" />
            </p>
            <p className="text-xs text-[#EBEBEB]/50 leading-[18px] mt-1">
              <Trans
                i18nKey="bountyBonus:claimSuccessDetail"
                values={{ amount, currency }}
                defaults="<0>{{amount}} {{currency}}</0> added to your wallet."
                components={[<span key="0" className="text-primary font-bold" />]}
              />
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            toast.dismiss(tst);
            onView?.();
          }}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/20 text-primary hover:bg-primary/30 transition-colors flex-shrink-0"
          aria-label="View"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    ),
    { duration: 6000, position: "top-right" },
  );
}
