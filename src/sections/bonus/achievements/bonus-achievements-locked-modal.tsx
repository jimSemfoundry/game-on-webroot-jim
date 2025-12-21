import { Modal } from "@/components/ui/Modal";
import Iconify from "@/components/iconify";
import { useEffect, useState } from "react";
import { useVibrantColor } from "@/hooks/useVibrantColor";

const ILLUSTRATION_URL = "/images/illustrations/0bfb7eed784e639b1f6c07fda138122d67b96eef.png";

interface BonusAchievementsLockedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BonusAchievementsLockedModal({ isOpen, onClose }: BonusAchievementsLockedModalProps) {
  const [bgColor, setBgColor] = useState<string>("");
  const { rgb } = useVibrantColor(ILLUSTRATION_URL);

  useEffect(() => {
    if (isOpen && rgb) {
      const gradientColor = `
        radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.20) 0%, rgba(0, 0, 0, 0.00) 100%),
        var(--color-base-400)
      `;
      setBgColor(gradientColor);
    }
  }, [isOpen, rgb]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideTitle
      className="md:w-[500px] max-w-lg p-0"
      position="modal-middle"
      closeButtonClassName="bg-transparent hover:bg-white/10 border-0 text-white/70 hover:text-white z-[60] relative"
      style={{
        background: bgColor || `
          radial-gradient(162.99% 78.23% at 50.15% 21.77%, rgba(139, 92, 246, 0.20) 0%, rgba(0, 0, 0, 0.00) 100%),
          var(--color-base-400)
        `
      }}
    >
      <div className="relative">
        {/* Main Content */}
        <div className="p-8 sm:p-12 flex flex-col items-center text-center">
          {/* Lock Icon with warning */}
          <div className="flex items-center gap-2 mb-8">
            <Iconify icon="custom:lock" className="sm:w-6 sm:h-6 w-4 h-4 text-yellow-400" />
            <h2 className="sm:text-2xl text-lg font-bold text-white">Achievement Locked</h2>
          </div>

          {/* Achievement Badge */}
          <div className="mb-8 relative">
            <img
              src={ILLUSTRATION_URL}
              alt="Achievement Badge"
              className="w-32 h-32 object-contain relative z-10 -rotate-6"
            />
          </div>

          {/* Title */}
          <h3 className="sm:text-3xl text-xl font-bold text-white mb-6">Achievements</h3>

          {/* Description */}
          <p className="sm:text-base text-sm text-gray-400 mb-10 leading-relaxed max-w-md">
            Once you hit VIP 2, the journey gets even more exciting - start collecting special achievement
            rewards designed to celebrate every step of your progress!
          </p>

          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="btn btn-primary sm:btn-lg btn-md  w-full max-w-sm relative z-50"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
