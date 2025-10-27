import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useTranslation } from "react-i18next";

interface BonusRakebackHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BonusRakebackHelpModal = ({ isOpen, onClose }: BonusRakebackHelpModalProps) => {
  const { t } = useTranslation();
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideTitle={true} className="bg-transparent md:w-[500px] max-w-lg p-0" position="modal-middle">
      <div className="flex flex-col gap-1">
        {/* 上方带渐变的独立卡片 */}
        <div
          className="rounded-box px-8 text-center relative overflow-hidden max-h-[140px] flex items-center"
          style={{
            background: `
              radial-gradient(100% 308% at 100% 0%, rgba(92, 120, 240, 0.5) 0%, rgba(15, 20, 26, 0) 100%),
              linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
            `,
          }}
        >
          <div className="relative z-10 flex items-center h-full">
            <h2 className="text-2xl md:text-3xl font-bold text-base-content mb-2 text-start leading-6">
              SUPER
              <br />
              <span className="text-primary">RAKEBACK</span>
              <br />
              <span className="text-primary">PROGRAM</span>
            </h2>
            <img src="/images/illustrations/29283baa24f82bafe627e3b11c521761551173bb.png" alt="Super Rakeback" className="w-40 h-40" />
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
              <p className="text-xs text-base-content/50 leading-5">{t("popup:rakeback.new1")}</p>

              {/* Release Frequency 区块 */}
              <div className="py-3 bg-base-300 rounded-field px-4 mt-4">
                <p className="text-xs text-base-content/50 mb-1 font-semibold">{t("popup:rakeback.release_frequency")}</p>
                <p className="text-lg font-bold text-primary">{t("bonus:instantaneous")}</p>
              </div>

              {/* How is the Bonus Calculated 区块 */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:rakeback.howIsBonusCalculated")}</h4>
                <p className="text-xs text-base-content/50 leading-5">{t("popup:rakeback.howIsBonusCalculatedDesc")}</p>
              </div>

              {/* Claim Distribution 区块 */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:missions.claimDistribution")}</h4>
                <p className="text-xs text-base-content/50 leading-5">{t("popup:rakeback.yourBalance")}</p>
                <p className="text-xs text-base-content/50 leading-5">{t("popup:rakeback.yourCalendar")}</p>
              </div>

              {/* Sapphire and Beyond 区块 */}
              <div className="pt-4 bg-base-300 rounded-field px-4 py-2 mt-4 flex items-center gap-4">
                <img src="/images/illustrations/isometric-1.svg" alt="isometric" className="w-10 h-10" />
                <div className="flex items-start flex-col">
                  <p className="text-xs mb-1 font-semibold text-primary">{t("popup:rakeback.sapphireAndBeyond")}</p>
                  <p className="text-xs text-base-content/50 leading-5 mt-1">{t("popup:missions.goldBalanceDistribution")}</p>
                  <p className="text-xs text-base-content/50 leading-5">{t("popup:missions.goldCalendarDistribution")}</p>
                </div>
              </div>

              <p className="mt-4 text-base-content/50 text-xs">
                {t("popup:missions.minimumClaimAmount", { money: formatWithConversion(0.1, "USD", { showCode: false }).formatted })}
              </p>

              <p className="font-semibold text-sm mt-4">{t("popup:rakeback.whatIsBooster")}</p>
              <p className="mt-4 text-base-content/50 text-xs leading-5">{t("popup:rakeback.rakebackDesc1")}</p>

              <p className="font-semibold text-sm mt-4">{t("popup:missions.expiration")}</p>
              <p className="mt-4 text-base-content/50 text-xs leading-5">{t("popup:missions.expirationDesc")}</p>

              <p className="font-semibold text-sm mt-4">{t("popup:missions.generalTerms")}</p>
              <p className="mt-4 text-base-content/50 text-xs leading-5">{t("popup:missions.generalTermsDesc1")}</p>
              <p className="mt-4 text-base-content/50 text-xs leading-5">{t("popup:missions.generalTermsDesc2")}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
