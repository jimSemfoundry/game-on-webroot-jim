import { Modal } from "@/components/ui/Modal";
import { useState, useCallback } from "react";
import { FastAverageColor } from "fast-average-color";

const BASE_SCRIM = "color-mix(in oklch, var(--color-base-300) 60%, transparent)";
const DEFAULT_GRADIENT = `
  radial-gradient(
    95.05% 100% at 0% 35.47%,
    color-mix(in oklch, #F0AA1E 40%, transparent) 0%,
    ${BASE_SCRIM} 100%
  ),
  linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
`;

export function BonusPromoCodeCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [background, setBackground] = useState<string>(DEFAULT_GRADIENT);

  const handleIllustrationLoad = useCallback(async (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const fac = new FastAverageColor();

    try {
      const color = await fac.getColorAsync(img, {
        algorithm: 'sqrt',
        mode: 'precision',
        ignoredColor: [
          [255, 255, 255, 255, 50],
          [0, 0, 0, 255, 150],
          [20, 20, 20, 255, 120],
        ],
      });
      const accentStop = `color-mix(in oklch, ${color.hex} 40%, transparent)`;
      setBackground(`
        radial-gradient(
          95.05% 100% at 0% 35.47%,
          ${accentStop} 0%,
          ${BASE_SCRIM} 100%
        ),
        linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
      `);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("Failed to derive bonus card color", error);
      }
    } finally {
      fac.destroy();
    }
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleRedeem = async () => {
    if (!promoCode.trim()) return;

    setIsRedeeming(true);
    // TODO: 实现兑换逻辑
    setTimeout(() => {
      setIsRedeeming(false);
      setPromoCode("");
      setIsModalOpen(false);
    }, 2000);
  };

  return (
    <div
      className="flex flex-col p-4 gap-2 rounded-field w-full relative overflow-hidden border border-base-200 h-[140px]"
      style={{
        background,
      }}
    >
      <div className="flex items-center gap-4 h-full">
        <img 
          src="/images/rewards/redeem-code.png" 
          alt="Promo Code" 
          className="w-15 h-15" 
          onLoad={handleIllustrationLoad}
          loading="lazy"
          decoding="async"
        />
        <div className="flex flex-col justify-center h-full w-full">
          <p className="text-sm font-bold sm:text-base">Promo Code</p>
          <p className="text-xs text-base-content/50">Got a code? You know what to do!</p>
        </div>
        <button className="btn btn-primary btn-soft btn-md flex-1 w-20" onClick={handleOpenModal}>
          Redeem
        </button>
      </div>

      {/* Redeem Code Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Redeem Code"
        className="bg-base-400 md:w-[480px] max-w-md overflow-hidden !pb-6"
      >
        <div className="flex flex-col items-center gap-6">
          {/* Scroll Illustration */}
          <div className="w-32 h-32 flex items-center justify-center">
            <img src="/images/rewards/redeem-code.png" alt="Promo Code Scroll" className="w-24 h-24" />
          </div>

          {/* Description */}
          <p className="text-center text-base-content/50 px-4">
            Unlock exclusive rewards, discounts, or bonuses by redeeming your promo code!
          </p>

          {/* Input Section */}
          <div className="w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-base-content/70 mb-2">Promo Code</label>
              <input
                type="text"
                placeholder="Enter Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="input input-ghost input-lg bg-base-300 border-base-300 w-full focus:border-primary focus:outline-none"
                maxLength={20}
              />
            </div>

            <button className="btn btn-primary btn-lg w-full" onClick={handleRedeem} disabled={!promoCode.trim() || isRedeeming}>
              {isRedeeming ? <span className="loading loading-spinner loading-sm" /> : "Continue"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
