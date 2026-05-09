import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "react-i18next";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";

interface HelpModalMysteryBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModalMysteryBox = ({ isOpen, onClose }: HelpModalMysteryBoxProps) => {
  const { t } = useTranslation(['popup', 'bonus']);
  const ILLUSTRATION_URL = useBonusDetailsImage("mystery_box", 256);

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideTitle={true} className="bg-transparent md:w-[500px] max-w-lg p-0" position="modal-middle">
      <div className="flex flex-col gap-1">
        {/* Top highlight card */}
        <div
          className="rounded-box px-7 py-4 relative overflow-hidden h-[140px] flex items-center justify-center"
          style={{
            background: `radial-gradient(100% 308% at 100% 0%, rgba(44, 134, 46, 0.5) 0%, rgba(15, 20, 26, 0.5) 100%), linear-gradient(0deg, var(--color-base-300), var(--color-base-300))`,
          }}
        >
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="text-left">
              <p className="text-2xl font-bold text-primary leading-7 uppercase">{t('bonus:mystery_box')}</p>
            </div>
            <div className="flex-shrink-0">
              <img
                src={ILLUSTRATION_URL}
                alt="Mystery Box"
                className="w-auto h-[128px] object-contain"
              />
            </div>
          </div>
        </div>

        {/* Main content card */}
        <div className="bg-base-400 rounded-box relative">
          <button onClick={onClose} className="absolute right-4 top-4 rtl:left-4 rtl:right-auto btn btn-square btn-sm bg-base-300 hover:bg-base-200 border-0">
            <Iconify icon="mdi:close" className="w-5 h-5 text-base-content/50" />
          </button>

          <div className="flex flex-col gap-4 px-4 pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Iconify icon="custom:bonus" className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold">{t("bonus:bonus_details")}</h3>
            </div>

            <div className="max-h-[420px] overflow-y-auto pb-12 hide-scrollbar">
              <p className="text-xs text-base-content/50 leading-5">{t("popup:mysteryBox.description")}</p>

              <div className="py-3 bg-base-300 rounded-field px-4 mt-4">
                <p className="text-xs text-base-content/50 mb-1 font-semibold">{t("popup:releaseFrequency")}</p>
                <p className="text-lg font-bold text-primary">{t("popup:mysteryBox.releaseFrequencyValue")}</p>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:claim_distribution")}</h4>
                <div className="py-3 bg-base-300 rounded-field px-4 flex items-center gap-3">
                  <img src="/icons/isometric/1.svg" className="w-10 h-10" />
                  <div>
                    <p className="text-sm font-semibold text-primary">{t("popup:mysteryBox.claimDistributionTitle")}</p>
                    <p className="text-xs text-base-content/50 leading-5">{t("popup:mysteryBox.claimDistributionDesc")}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:deposit.expiration")}</h4>
                <p className="text-xs text-base-content/50 leading-5">{t("popup:mysteryBox.expirationDesc")}</p>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:deposit.generalTerms")}</h4>
                <p className="text-xs text-base-content/50 leading-5">{t("popup:mysteryBox.generalTermsDesc1")}</p>
                <p className="mt-2 text-xs text-base-content/50 leading-5">{t("popup:mysteryBox.generalTermsDesc2")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
