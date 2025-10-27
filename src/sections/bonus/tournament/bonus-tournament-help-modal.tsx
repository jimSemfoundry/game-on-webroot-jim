import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "react-i18next";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BonusTournamentHelpModal = ({ isOpen, onClose }: Props) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideTitle={true} className="bg-transparent md:w-[500px] max-w-lg p-0" position="modal-middle">
      <div className="flex flex-col gap-1">
        <div
          className="rounded-box px-5 py-3 text-center relative overflow-hidden h-[140px] flex items-center justify-center"
          style={{
            background: `
              radial-gradient(100% 308% at 100% 0%, rgba(255, 138, 76, 0.5) 0%, rgba(15, 20, 26, 0.5) 100%),
              linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
            `,
          }}
        >
          <div className="relative z-10 flex items-center justify-between w-full">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-base-content text-start leading-6">
                <div>TOURNAMENTS</div>
                <div>& RACES</div>
              </h2>
            </div>
            <div className="flex-shrink-0">
              <img src="/images/illustrations/a0460e0b128df2ab73ba3a735212bd9d95c841b1.png" className="w-35 h-35" />
            </div>
          </div>
        </div>

        <div className="bg-base-400 rounded-box relative">
          <button onClick={onClose} className="absolute right-4 top-4 btn btn-square btn-sm bg-base-300 hover:bg-base-200 border-0">
            <Iconify icon="mdi:close" className="w-5 h-5 text-base-content/50" />
          </button>

          <div className="flex flex-col gap-4 px-4 pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Iconify icon="custom:bonus" className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold">{t("bonus:bonus_details")}</h3>
            </div>

            <div className="max-h-[400px] overflow-y-auto pb-12">
              <p className="text-xs text-base-content/50 leading-5">
                Tournament Rewards are prizes given for outstanding performance in competitions. They recognize your skill and strategy, offering exciting rewards based on your final ranking and participation.
              </p>

              <div className="py-3 bg-base-300 rounded-field px-4 mt-4">
                <p className="text-xs text-base-content/50 mb-1 font-semibold">Tournament Frequency</p>
                <p className="text-lg font-bold text-primary">Daily, Weekly</p>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">Claim Distribution</h4>
                <p className="text-xs text-base-content/50 leading-5">Tournament and Race Rewards are credited directly to your BUCK account balance once claimed.</p>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">Expiration</h4>
                <p className="text-xs text-base-content/50 leading-5">None - Rewards accumulate until claimed.</p>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">General Terms</h4>
                <p className="text-xs text-base-content/50 leading-5">
                  Rewards are calculated and credited in USDT, then displayed in your preferred fiat currency for convenience. Please note, currency conversions are approximate.
                </p>
                <p className="mt-2 text-xs text-base-content/50 leading-5">
                  The casino reserves the right to modify or revoke eligibility at any time, without the obligation to justify. Any abuse or fraudulent activity will lead to disqualification from the promotion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
