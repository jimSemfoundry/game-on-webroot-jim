import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
}

const HERO_BG =
  "radial-gradient(circle at 100% 0%, rgba(105, 28, 173, 1) 0%, rgba(16, 20, 25, 1) 100%), #181D24";

/**
 * BountyInfoModal — 设计严格对齐 Figma node 32913:361981 (Mars).
 *
 * - Hero header: 紫色 radial gradient bg + 18px Bold "BOUNTY" 白 + 126x126 trophy 切片
 * - Body: bg #070B10, 16/16/0/0 rounded top, 5 sections:
 *   1. 描述段（"Bounty challenges reward you with prizes for winning big..."）
 *   2. How It Works
 *   3. Claim Distribution
 *   4. Eligible Bets
 *   5. General Terms
 */
export function BountyInfoModal({ open, onClose }: Props) {
  const { t } = useTranslation("bountyBonus");

  return (
    <Modal
      isOpen={open}
      hideTitle
      onClose={onClose}
      className="p-0 md:w-[420px] hide-scrollbar bg-transparent outline-none"
      closeButtonClassName="hidden"
      position="modal-middle"
    >
      <div className="flex flex-col rounded-2xl overflow-hidden">
        {/* Hero header */}
        <div
          className="flex items-center justify-between px-8 py-4 relative overflow-hidden h-[120px]"
          style={{ background: HERO_BG }}
        >
          <h2 className="text-lg font-extrabold text-white uppercase relative z-1">
            {t("infoModal.title", "Bounty")}
          </h2>
          <img
            src="/images/bounty/bounty-figma.png"
            alt=""
            className="w-32 h-32 object-contain relative -my-4"
          />
        </div>

        {/* Body */}
        <div className="bg-[#070B10] px-5 pt-4 pb-5">
          <header className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-base-content">
              {t("infoModal.detailsHeader", "Bonus Details")}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-base-200 hover:bg-base-content/10 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </header>

          <section className="hide-scrollbar overflow-y-auto max-h-[60vh] space-y-3">
            <p className="text-xs text-base-content/50 leading-[18px]">
              {t(
                "infoModal.intro",
                "Bounty challenges reward you with prizes for winning big. In any of the listed games, simply place a qualifying bet that meets the minimum bet amount that hits the required multiplier — if you're among the first to do it, the reward is yours.",
              )}
            </p>

            <Section
              title={t("infoModal.howItWorks.title", "How It Works")}
              body={t(
                "infoModal.howItWorks.body",
                "  - Each Bounty challenge is tied to a specific game\n  - Place a bet that meets the minimum bet amount\n  - Hit the target multiplier or higher to complete the challenge\n  - The first players to complete the challenge win the reward\n  - You can win multiple times on the same challenge if there are multiple prizes awarded",
              )}
            />
            <Section
              title={t("infoModal.claim.title", "Claim Distribution")}
              body={t(
                "infoModal.claim.body",
                'Rewards will be credited to your wallet in the currency specified for each challenge. You can claim your reward anytime from the "My Completed" tab in the Bounty page. There is no time limit to claim.',
              )}
            />
            <Section
              title={t("infoModal.eligible.title", "Eligible Bets")}
              body={t(
                "infoModal.eligible.body",
                "  - Only real money bets count. Bets placed using Slot Bonus Wallet or Free Spins do not qualify.\n  - Your bet amount must meet or exceed the minimum bet amount shown on the challenge.",
              )}
            />
            <Section
              title={t("infoModal.terms.title", "General Terms")}
              body={t(
                "infoModal.terms.body",
                "  - Bounty rewards are calculated and credited in the currency configured for each challenge, then displayed in your preferred currency for convenience. Please note, currency conversions are approximate.\n  - The casino reserves the right to modify or revoke eligibility at any time, without the obligation to justify. Any abuse or fraudulent activity will lead to disqualification from the promotion.",
              )}
            />
          </section>
        </div>
      </div>
    </Modal>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-base-content">{title}</h4>
      <p className="text-xs text-base-content/50 leading-[18px] whitespace-pre-line">{body}</p>
    </div>
  );
}
