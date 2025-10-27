import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "react-i18next";

interface BonusLuckyNumberHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BonusLuckyNumberHelpModal = ({ isOpen, onClose }: BonusLuckyNumberHelpModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideTitle={true} className="bg-transparent md:w-[500px] max-w-lg p-0" position="modal-middle">
      <div className="flex flex-col gap-1">
        {/* 上方带渐变的独立卡片 */}
        <div
          className="rounded-box pl-7.5 pr-3 py-3 text-center relative overflow-hidden h-[140px] flex items-center justify-center"
          style={{
            background: `
              radial-gradient(100% 308% at 100% 0%, rgba(173, 0, 0, 0.5) 0%, rgba(15, 20, 26, 0.5) 100%),
              linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
            `,
          }}
        >
          <div className="relative z-10 flex items-center justify-between w-full">
            <div>
              <h2 className="text-2xl md:text-xl font-bold text-base-content text-start leading-6">
                <div>LUCKY</div>
                <div>SEVENS</div>
              </h2>
            </div>
            {/* Lucky 7 illustration */}
            <div className="flex-shrink-0">
              <img src="/images/illustrations/bdff680c12dae6bd01b27ff35cb22ad0cd656f89.png" className="w-35 h-35" />
            </div>
          </div>
        </div>

        {/* 下方独立的主卡片 - 包含close按钮 */}
        <div className="bg-base-400 rounded-box relative">
          {/* Close按钮 - 位于右上角 */}
          <button onClick={onClose} className="absolute right-4 top-4 btn btn-square btn-sm bg-base-300 hover:bg-base-200 border-0">
            <Iconify icon="mdi:close" className="w-5 h-5 text-base-content/50" />
          </button>

          <div className="flex flex-col gap-4 px-4 pt-5">
            {/* Bonus Details 标题 */}
            <div className="flex items-center gap-2 mb-2">
              <Iconify icon="custom:bonus" className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold">{t("bonus:bonus_details")}</h3>
            </div>

            <div className="max-h-[400px] overflow-y-auto pb-12">
              {/* 描述文本 */}
              <p className="text-xs text-base-content/50 leading-5">
                Hit the Lucky 7's and score a sweet bonus! If your Bet ID ends in 7777, 77777 or 777777 while playing eligible slots, you'll
                get a surprise bonus - up to ₱44,553.57! Just spin, hit those lucky digits, and let the good times (and bonuses) roll!
              </p>

              {/* Claim Distribution 区块 */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:missions.claimDistribution")}</h4>
                <p className="text-xs text-base-content/50 leading-5">100% to your calendar for 3 days</p>
              </div>

              {/* Sapphire and Beyond 区块 */}
              <div className="py-3 bg-base-300 rounded-field px-4 mt-4 flex items-center gap-3">
                <img src="/images/illustrations/isometric-1.svg" className="w-10 h-10" />
                <div className="flex flex-col">
                  <p className="text-xs mb-1 font-semibold text-primary">Sapphire and Beyond</p>
                  <p className="text-xs text-base-content/50 leading-4">50% to your balance</p>
                  <p className="text-xs text-base-content/50 leading-4">50% to your calendar for 3 days</p>
                </div>
              </div>

              {/* Winning Conditions 区块 */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">Winning Conditions</h4>
                <div className="space-y-2">
                  <p className="text-xs text-base-content/50 leading-5">
                    If your Bet ID ends in 7777, you'll receive 17.7% of your bet amount automatically to your Bonus calendar.
                  </p>
                  <p className="text-xs text-base-content/50 leading-5">
                    If your Bet ID ends in 77777, you'll receive 777% of your bet amount automatically to your Bonus calendar.
                  </p>
                  <p className="text-xs text-base-content/50 leading-5">
                    If your Bet ID ends in 777777, you'll receive 777% of your bet amount automatically to your Bonus calendar.
                  </p>
                </div>
              </div>

              {/* Expiration 区块 */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:deposit.expiration")}</h4>
                <p className="text-xs text-base-content/50 leading-5">None - Lucky Seven Rewards accumulate until claimed.</p>
              </div>

              {/* General Terms 区块 */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:deposit.generalTerms")}</h4>
                <p className="text-xs text-base-content/50 leading-5">You can win each lucky 7 combo once per day.</p>
                <p className="mt-2 text-xs text-base-content/50 leading-5">
                  The bonus amount is capped at ₱44,553.57 per qualifying Bet ID.
                </p>
                <p className="mt-2 text-xs text-base-content/50 leading-5">
                  Rewards are calculated and credited in USDT, then displayed in your preferred fiat currency for convenience. Please note,
                  currency conversions are approximate.
                </p>
                <p className="mt-2 text-xs text-base-content/50 leading-5">
                  The casino reserves the right to modify or terminate this promotion at any time. Abuse or fraudulent activity will result
                  in disqualification from the promotion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
