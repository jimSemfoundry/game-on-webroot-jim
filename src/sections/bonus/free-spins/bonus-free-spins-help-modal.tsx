import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "react-i18next";

interface BonusFreeSpinsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BonusFreeSpinsHelpModal = ({ isOpen, onClose }: BonusFreeSpinsHelpModalProps) => {
  const { t } = useTranslation(['popup', 'casino', 'bonus']);

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideTitle={true} className="bg-transparent md:w-[500px] max-w-lg p-0" position="modal-middle">
      <div className="flex flex-col gap-1">
        {/* 上方带渐变的独立卡片 */}
        <div
          className="rounded-box pl-8 pr-4 text-center relative overflow-hidden max-h-[140px] flex items-center"
          style={{
            background: `
              radial-gradient(100% 308% at 100% 0%, rgba(42, 207, 4, 0.5) 0%, var(--color-base-300) 100%),
              linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
            `,
          }}
        >
          <div className="relative z-10 flex items-center h-full justify-between w-full">
            <h2 className="text-xl md:text-2xl font-bold text-base-content mb-2 text-start leading-6 text-nowrap">
              {t("casino:freeSpins")}
              <br />
              <span className="text-primary uppercase">{t("bonus:bonus")}</span>
            </h2>
            <img
              src="/images/illustrations/08fb6136f804423bc7c787dffd61015d6a46771b.png"
              alt="Free Spins"
              className="w-[150px] h-[150px] -rotate-6 translate-y-1"
            />
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
              <p className="text-xs text-base-content/50 leading-5">
                {t("bonus:freeSpinsBonusDetails")}
              </p>

              {/* Claim Distribution 区块 */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:missions.claimDistribution")}</h4>
                <p className="text-xs text-base-content/50 leading-5">
                  {t("bonus:freeSpinsClaimDistributionDescription1")}
                </p>
                <p className="text-xs text-base-content/50 leading-5 mt-4">
                  {t("bonus:freeSpinsClaimDistributionDescription2")}
                </p>
              </div>

              {/* Expiration 区块 */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("bonus:expiration")}</h4>
                <p className="text-xs text-base-content/50 leading-5">
                  {t("bonus:freeSpinsExpirationDescription1")}
                </p>
                <p className="text-xs text-base-content/50 leading-5 mt-4">
                  {t("bonus:freeSpinsExpirationDescription2")}
                </p>
              </div>

              {/* General Terms 区块 */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("bonus:general_terms")}</h4>
                <p className="text-xs text-base-content/50 leading-5">
                  {t("bonus:freeSpinsGeneralTermsDescription1")}
                </p>
                <p className="text-xs text-base-content/50 leading-5 mt-4">
                  {t("bonus:freeSpinsGeneralTermsDescription2")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
