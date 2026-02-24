import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "react-i18next";
import { Trans } from "react-i18next";

interface BonusAchievementsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BonusAchievementsHelpModal = ({ isOpen, onClose }: BonusAchievementsHelpModalProps) => {
  const { t } = useTranslation(['vipBonusPopup', 'bonus', 'popup']);

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideTitle={true} className="bg-transparent md:w-[500px] max-w-lg p-0" position="modal-middle">
      <div className="flex flex-col gap-1">
        {/* 上方带渐变的独立卡片 */}
        <div
          className="rounded-box px-5 py-3 text-center relative overflow-hidden h-[140px] flex items-center justify-center"
          style={{
            background: `
              radial-gradient(100% 308% at 100% 0%, rgba(247, 127, 92, 0.5) 0%, rgba(15, 20, 26, 0.5) 100%),
              linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
            `,
          }}
        >
          <div className="relative z-10 flex items-center justify-between w-full">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-base-content text-start leading-6">
                <div>{t("vipBonusPopup:achievements.title")}</div>
                <div className="text-primary whitespace-pre-line">{t("vipBonusPopup:achievements.reward")}</div>
              </h2>
            </div>
            {/* Achievement medal illustration */}
            <div className="shrink-0">
              <img src="/images/illustrations/0bfb7eed784e639b1f6c07fda138122d67b96eef.png" alt="Achievement Award" className="w-34 h-34" />
            </div>
          </div>
        </div>

        {/* 下方独立的主卡片 - 包含close按钮 */}
        <div className="bg-base-400 rounded-box relative">
          {/* Close按钮 - 位于右上角 */}
          <button onClick={onClose} className="absolute right-4 top-4 rtl:left-4 rtl:right-auto btn btn-square btn-sm bg-base-300 hover:bg-base-200 border-0">
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
              <p className="text-xs text-base-content/50 leading-5">{t("vipBonusPopup:achievements.achievementDescription")}</p>

              {/* Release Frequency 区块 */}
              <div className="py-3 bg-base-300 rounded-field px-4 mt-4">
                <p className="text-xs text-base-content/50 mb-1 font-semibold">{t("popup:releaseFrequency")}</p>
                <p className="text-lg font-bold text-primary">{t("popup:rakeback.instantaneous")}</p>
              </div>

              {/* Claim Distribution 区块 */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:missions.claimDistribution")}</h4>
                <p className="text-xs text-base-content/50 leading-5">
                  <Trans
                    i18nKey={`vipBonusPopup:achievements.claimDistributionDescription`}
                    components={[<span className="font-bold" />]}
                  />
                </p>
              </div>

              {/* Expiration 区块 */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:deposit.expiration")}</h4>
                <p className="text-xs text-base-content/50 leading-5">{t("vipBonusPopup:achievements.expirationDescription")}</p>
              </div>

              {/* General Terms 区块 */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:deposit.generalTerms")}</h4>
                <p className="text-xs text-base-content/50 leading-5 whitespace-pre-line">{t("vipBonusPopup:achievements.generalTermsDescription")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
