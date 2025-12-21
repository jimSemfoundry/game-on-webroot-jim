import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useVibrantColor } from "@/hooks/useVibrantColor";
import { useTranslation } from "react-i18next";
import { Trans } from "react-i18next";

interface BonusLuckyNumberHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ILLUSTRATION_URL = "/images/illustrations/bdff680c12dae6bd01b27ff35cb22ad0cd656f89.png";

export const BonusLuckyNumberHelpModal = ({ isOpen, onClose }: BonusLuckyNumberHelpModalProps) => {
  const { t } = useTranslation();
  const { formatWithConversion } = useDisplayCurrencyFormatter()
  const { gradient: vibrantGradient } = useVibrantColor(ILLUSTRATION_URL, {
    fallbackGradient:
      "radial-gradient(120% 260% at 100% 0%, rgba(173, 0, 0, 0.45) 0%, rgba(15, 20, 26, 0.05) 50%)",
    opacity: 0.45,
    colorTypes: ['DarkMuted']
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideTitle={true} className="bg-transparent md:w-[500px] max-w-lg p-0" position="modal-middle">
      <div className="flex flex-col gap-1">
        {/* Top highlight card */}
        <div
          className="rounded-box px-7 py-4 relative overflow-hidden h-[180px] flex items-center justify-center"
          style={{
            background: `${vibrantGradient}, linear-gradient(0deg, var(--color-base-300), var(--color-base-300))`,
          }}
        >
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="text-left">
              <p className="text-2xl font-bold text-base-content whitespace-pre-line">{t("popup:luckySeven.title")}</p>
            </div>
            <div className="shrink-0">
              <img
                src={ILLUSTRATION_URL}
                alt="Lucky Sevens"
                className="w-36 h-36 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Main content card */}
        <div className="bg-base-400 rounded-box relative">
          <button onClick={onClose} className="absolute right-4 top-4 btn btn-square btn-sm bg-base-300 hover:bg-base-200 border-0">
            <Iconify icon="mdi:close" className="w-5 h-5 text-base-content/50" />
          </button>

          <div className="flex flex-col gap-4 px-4 pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Iconify icon="custom:bonus" className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold">{t("bonus:bonus_details")}</h3>
            </div>

            <div className="max-h-[420px] overflow-y-auto pb-12">
              <p className="text-xs text-base-content/50 leading-5">
                <Trans
                  i18nKey={`popup:luckySeven.description`}
                  components={[<span className="text-primary" />]}
                  values={{ money: formatWithConversion(777, "USD", { showCode: false }).formatted }}
                />
              </p>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:claim_distribution")}</h4>
                <div className="py-3 bg-base-300 rounded-field px-4 flex items-center gap-4">
                  <img src="/images/illustrations/isometric-1.svg" className="w-10 h-10" />
                  <div>
                    <p className="text-sm font-semibold text-primary">{t("popup:luckySeven.claimDistributionTitle")}</p>
                    <p className="text-xs text-base-content/50 leading-5">{t("popup:luckySeven.claimDistributionDesc")}</p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-base-content/50 leading-5">{t("popup:luckySeven.claimDistributionNote")}</p>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:luckySeven.winningConditions")}</h4>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold text-base-content/50 mb-1 px-4">
                    <span>{t("popup:luckySeven.betIdEnding")}</span>
                    <span>{t("popup:luckySeven.bonusReward")}</span>
                  </div>
                  <div className="bg-base-300 rounded-field px-4 py-3 flex justify-between items-center">
                    <span className="text-xs text-base-content/50 font-medium italic">7777</span>
                    <span className="text-xs text-primary font-semibold">{t("popup:luckySeven.condition1")}</span>
                  </div>
                  <div className="rounded-field px-4 py-3 flex justify-between items-center">
                    <span className="text-xs text-base-content/50 font-medium italic">77777</span>
                    <span className="text-xs text-primary font-semibold">{t("popup:luckySeven.condition2")}</span>
                  </div>
                  <div className="bg-base-300 rounded-field px-4 py-3 flex justify-between items-center">
                    <span className="text-xs text-base-content/50 font-medium italic">777777</span>
                    <span className="text-xs text-primary font-semibold">{t("popup:luckySeven.condition3")}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:deposit.expiration")}</h4>
                <p className="text-xs text-base-content/50 leading-5">{t("popup:luckySeven.expirationDesc")}</p>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:deposit.generalTerms")}</h4>
                <p className="text-xs text-base-content/50 leading-5">{t("popup:luckySeven.generalTermsDesc1")}</p>
                <p className="mt-2 text-xs text-base-content/50 leading-5">
                  <Trans
                    i18nKey={`popup:luckySeven.generalTermsDesc2`}
                    components={[<span className="text-primary" />]}
                    values={{ money: formatWithConversion(777, "USD", { showCode: false }).formatted }}
                  />
                </p>
                <p className="mt-2 text-xs text-base-content/50 leading-5">{t("popup:luckySeven.generalTermsDesc3")}</p>
                <p className="mt-2 text-xs text-base-content/50 leading-5">{t("popup:luckySeven.generalTermsDesc4")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
