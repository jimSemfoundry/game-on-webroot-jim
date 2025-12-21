import { Modal } from "@/components/ui/Modal";
import { useState, useEffect } from "react";
import { useVibrantColor } from "@/hooks/useVibrantColor";
import { useTranslation } from "react-i18next";

const BASE_SCRIM = "color-mix(in oklch, var(--color-base-300) 60%, transparent)";
const DEFAULT_GRADIENT = `
  radial-gradient(
    95.05% 100% at 0% 35.47%,
    color-mix(in oklch, #F0AA1E 40%, transparent) 0%,
    ${BASE_SCRIM} 100%
  ),
  linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
`;

const ILLUSTRATION_URL = "/images/rewards/redeem-code.png";

export function BonusPromoCodeCard() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [background, setBackground] = useState<string>(DEFAULT_GRADIENT);

  const { hex } = useVibrantColor(ILLUSTRATION_URL);

  useEffect(() => {
    if (hex) {
      const accentStop = `color-mix(in oklch, ${hex} 40%, transparent)`;
      setBackground(`
        radial-gradient(
          95.05% 100% at 0% 35.47%,
          ${accentStop} 0%,
          ${BASE_SCRIM} 100%
        ),
        linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
      `);
    }
  }, [hex]);

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
          src={ILLUSTRATION_URL}
          alt="Promo Code"
          className="w-15 h-15"
          loading="lazy"
          decoding="async"
        />
        <div className="flex flex-col justify-center h-full w-full">
          <p className="text-sm font-bold sm:text-base">{t("bonus:promo_code")}</p>
          <p className="text-xs text-base-content/50">{t("bonus:got_a_code")}</p>
        </div>
        <button className="btn btn-primary btn-soft btn-md flex-1 w-20 min-w-20" onClick={handleOpenModal}>
          {t("bonus:redeem")}
        </button>
      </div>

      {/* Redeem Code Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t("bonus:promo_code")}
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
              {isRedeeming ? <span className="loading loading-spinner loading-sm" /> : t('common:common.continue')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
