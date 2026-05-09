import { Trans } from "react-i18next";
import { Modal } from "@/components/ui/Modal";

interface BountyHitModalProps {
  isOpen: boolean;
  multiplier: number;
  onClose: () => void;
  onClaim: () => void;
}

function formatMultiplier(m: number): string {
  if (!isFinite(m)) return "0";
  return Number.isInteger(m) ? String(m) : m.toFixed(2).replace(/\.?0+$/, "");
}

/**
 * Bounty 命中后中央弹窗 — 严格对齐 Figma node 32964:12467:
 *  - 全屏遮罩 + 居中 modal
 *  - X 关闭按钮（右上）
 *  - 287×287 trophy + 金币爆炸 hero 图
 *  - "CONGRATULATIONS!" 标题
 *  - 两行 body：You hit {mult}×! Bounty completed, claim your reward now !
 *  - 大 lime "Claim now" 按钮
 */
export function BountyHitModal({ isOpen, multiplier, onClose, onClaim }: BountyHitModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideTitle
      position="modal-middle"
      className="!p-0 !bg-transparent !shadow-none !w-full !max-w-[335px]"
      classNameModal="!bg-transparent"
      closeButtonClassName="!hidden"
    >
      <div
        className="rounded-2xl flex flex-col items-center gap-4 relative"
        style={{ padding: "36px 24px", background: "#070B10" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <img
          src="/images/bounty/bounty-hit.png"
          alt=""
          className="w-[260px] h-[260px] object-contain drop-shadow-[0_0_36px_rgba(196,224,44,0.55)]"
        />

        <div className="text-center w-full space-y-2">
          <p className="text-lg font-semibold text-[#EBEBEB] uppercase tracking-wide">
            <Trans i18nKey="bountyBonus:congratulations" defaults="CONGRATULATIONS!" />
          </p>
          <p className="text-base text-[#EBEBEB]/60 leading-6">
            <Trans
              i18nKey="bountyBonus:youHitMultiplier"
              values={{ multiplier: formatMultiplier(multiplier) }}
              defaults="You hit <0>{{multiplier}}×</0>! Bounty completed, claim your reward now !"
              components={[<span key="0" className="font-bold text-primary" />]}
            />
          </p>
        </div>

        <button
          type="button"
          onClick={onClaim}
          className="h-12 rounded-lg text-sm font-bold transition-colors hover:opacity-90"
          style={{ width: 240, background: "#C4E02C", color: "#00471F" }}
        >
          <Trans i18nKey="bountyBonus:claimNow" defaults="Claim now" />
        </button>
      </div>
    </Modal>
  );
}
