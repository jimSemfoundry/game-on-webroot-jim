import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";

export interface BonusClaimConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNormalClaim: () => void;
  onDoubleClaim?: () => void;
  bonusType: string;
  claimableAmount?: string | number;
  isLoading?: boolean;
  doubleClaimEnabled?: boolean; // Add flag for double claim availability
}

/**
 * Bonus claim confirmation modal component
 */
export function BonusClaimConfirmationModal(
  {
    isOpen,
    onClose,
    onNormalClaim,
    onDoubleClaim,
    bonusType: _bonusType,
    claimableAmount,
    isLoading = false,
    doubleClaimEnabled = true,
  }: BonusClaimConfirmationModalProps
) {
  const { t } = useTranslation("bonus");
  // const [showComingSoon, setShowComingSoon] = useState(false);
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const rawBuckAmount = useMemo(() => {
    if (claimableAmount == null) return null;
    const amountNumber = Number(claimableAmount);
    return Number.isNaN(amountNumber) ? null : amountNumber;
  }, [claimableAmount]);

  const formattedAmount = useMemo(() => {
    if (rawBuckAmount == null) return null;

    try {
      return formatWithConversion(rawBuckAmount, "BUCK", { showCode: true, showSymbol: true });
    } catch (error) {
      console.warn("Failed to format claimable amount", error);
      return null;
    }
  }, [rawBuckAmount, formatWithConversion]);

  const handleNormalClaim = () => {
    onNormalClaim();
    onClose();
  };

  const handleDoubleClaim = () => {
    if (doubleClaimEnabled && onDoubleClaim) {
      onDoubleClaim();
      onClose();
    // } else {
    //   // Show coming soon message
    //   setShowComingSoon(true);
    //   setTimeout(() => setShowComingSoon(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full sm:min-w-md bg-base-400 border-none rounded-2xl"
      title={
        <div className="flex items-center gap-2">
          <Iconify icon="custom:double" className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <h3 className="sm:text-lg text-base font-bold text-white">{t("claimModal.title")}</h3>
        </div>
      }
      style={{
        background: `
          radial-gradient(60.99% 60.23% at 50.15% 31.77%, rgba(20, 155, 255, 0.20) 0%, rgba(0, 0, 0, 0.00) 100%),
          var(--color-base-400)
        `,
      }}
    >
      {/* Main content */}
      <div className="p-6 pt-4 w-full sm:h-[600px] h-[55vh]">
        {/* Visual section with 0x rocket 2x */}
        <div className="flex items-center justify-between mb-6 relative w-full sm:h-[300px] h-[200px]">
          {/* 0x section */}
          <div className="absolute left-4 top-0">
            <div className="text-7xl sm:text-9xl font-bold text-white mb-2">0x</div>
          </div>

          {/* Rocket illustration */}
          <div className="flex flex-col items-center mx-4 relative w-full h-full">
            <img
              src="/images/illustrations/ed73c3faacf48e600a5eaaf43c5048e2854ddae2.png"
              alt="Rocket"
              className="w-45 h-45 sm:h-[240px] sm:w-[240px] object-cover z-10 absolute left-1/2 -translate-x-5/12 top-1/2 -translate-y-1/2"
            />
          </div>

          {/* 2x section */}
          <div className="flex flex-col items-center absolute right-0 bottom-4">
            <div className="text-7xl sm:text-9xl font-bold text-white mb-2">2x</div>
          </div>
        </div>

        {(formattedAmount || rawBuckAmount != null) && (
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="flex items-center justify-center gap-2">
              <img src="/icons/currency/buck.png" className="w-8 h-8" />
              <div className="text-2xl font-bold text-primary">
                {formattedAmount?.formatted ?? rawBuckAmount?.toLocaleString()}
              </div>
            </div>
            {formattedAmount && rawBuckAmount != null && (
              <p className="text-sm text-white/60">
                {t("claimModal.approximateBuck", { amount: rawBuckAmount.toLocaleString() })}
              </p>
            )}
          </div>
        )}

        {/* Description text */}
        <div className="text-center mb-8 font-semibold">
          <p className="text-white text-sm mb-1">{t("claimModal.primaryDescription")}</p>
          <p className="text-sm text-white">
            <Trans
              ns="bonus"
              i18nKey="claimModal.secondaryDescription"
              components={{ highlight: <span className="text-primary font-bold" /> }}
            />
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {/* Claim button */}
          <button
            onClick={handleNormalClaim}
            disabled={isLoading}
            className="btn min-w-20 btn-primary btn-soft sm:btn-lg btn-md sm:text-base text-sm"
          >
            {isLoading && <span className="loading loading-spinner loading-sm" />}
            {t("claim")}
          </button>

          {/* Double claim button */}
          <button
            onClick={handleDoubleClaim}
            disabled={isLoading || !doubleClaimEnabled}
            className="btn flex-1 min-w-25 btn-primary border-none font-bold sm:btn-lg btn-md sm:text-base text-sm"
          >
            {isLoading && <span className="loading loading-spinner loading-sm" />}
            {t("claimModal.doubleAction")}
          </button>
        </div>

        {/* Coming Soon Toast */}
        {/* {showComingSoon && (
          <div className="toast toast-top toast-center z-[9999]">
            <div className="alert alert-info">
              <Iconify icon="mdi:information" className="w-5 h-5" />
              <span>{t("claimModal.comingSoon")}</span>
            </div>
          </div>
        )} */}
      </div>
    </Modal>
  );
}

export default BonusClaimConfirmationModal;
