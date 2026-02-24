import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useVibrantColor } from "@/hooks/useVibrantColor";
import { useTranslation } from "react-i18next";
import { Trans } from "react-i18next";

interface BonusRakebackHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ILLUSTRATION_URL = "/images/illustrations/29283baa24f82bafe627e3b11c521761551173bb.png";

export const BonusRakebackHelpModal = ({ isOpen, onClose }: BonusRakebackHelpModalProps) => {
  const { t } = useTranslation(['popup', 'bonus']);
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { gradient: vibrantGradient } = useVibrantColor(ILLUSTRATION_URL, {
    fallbackGradient:
      "radial-gradient(120% 260% at 100% 0%, rgba(92, 120, 240, 0.45) 0%, rgba(15, 20, 26, 0.05) 50%)",
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
          <div className="relative z-10 flex items-center h-full w-full justify-between">
             <div className="text-left">
              <p className="text-2xl font-bold text-base-content">{t("popup:rakeback.super")}</p>
              <p className="text-2xl font-bold text-primary leading-7 whitespace-pre-line">{t("popup:rakeback.title")}</p>
            </div>
            <img src="/images/illustrations/29283baa24f82bafe627e3b11c521761551173bb.png" alt="Super Rakeback" className="w-40 h-40" />
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

            <div className="max-h-[400px] overflow-y-auto pb-12">
              {/* 描述文本 */}
              <p className="text-xs text-base-content/50 leading-5">{t("popup:rakeback.description")}</p>

              <div className="py-3 bg-base-300 rounded-field px-4 mt-4">
                <p className="text-xs text-base-content/50 mb-1 font-semibold">{t("popup:rakeback.release_frequency")}</p>
                <p className="text-lg font-bold text-primary">{t("popup:rakeback.instantaneous")}</p>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:rakeback.howIsBonusCalculated")}</h4>
                <p className="text-xs text-base-content/50 leading-5" dangerouslySetInnerHTML={{ __html: t("popup:rakeback.howIsBonusCalculatedDesc") }}></p>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:missions.claimDistribution")}</h4>
                {/* <p className="text-xs text-base-content/50 leading-5">{t("popup:rakeback.yourBalance")}</p>
                <p className="text-xs text-base-content/50 leading-5">{t("popup:rakeback.yourCalendar")}</p> */}
              </div>

              {/* Sapphire and Beyond 区块 */}
              <div className="pt-4 bg-base-300 rounded-field px-4 py-2 mt-4 flex items-center gap-4">
                <img src="/images/illustrations/isometric-1.svg" alt="isometric" className="w-10 h-10" />
                <div className="flex items-start flex-col">
                  <p className="text-xs mb-1 font-semibold text-primary">{t("popup:rakeback.goldMembersAndAbove")}</p>
                  <p className="text-xs text-base-content/50 leading-5 mt-1">{t("popup:rakeback.yourBalance2")}</p>
                  {/* <p className="text-xs text-base-content/50 leading-5">{t("popup:missions.goldCalendarDistribution")}</p> */}
                </div>
              </div>

              <p className="mt-4 text-base-content/50 text-xs">
                
                  <Trans
                    i18nKey={'popup:rakeback.minimumClaimAmount'}
                    components={[<span className="text-primary" />]}
                    values={{
                      money: formatWithConversion(1, "USD", { showCode: false }).formatted,
                      value: formatWithConversion(1, "USD", { showCode: false }).formatted,
                    }}
                  />
                {/* {t("popup:missions.minimumClaimAmount", { money: formatWithConversion(0.1, "USD", { showCode: false }).formatted })} */}
              </p>

              <p className="font-semibold text-sm mt-4">{t("popup:rakeback.whatIsBooster")}</p>
              <p className="mt-4 text-base-content/50 text-xs leading-5">{t("popup:rakeback.rakebackDesc1")}</p>
              <p className="mt-4 text-base-content/50 text-xs leading-5">{t("popup:rakeback.rakebackDesc2")}</p>

              <p className="font-semibold text-sm mt-4">{t("popup:rakeback.expiration")}</p>
              <p className="mt-4 text-base-content/50 text-xs leading-5">{t("popup:rakeback.expirationDesc")}</p>

              <p className="font-semibold text-sm mt-4">{t("popup:rakeback.generalTerms")}</p>
              <p className="mt-4 text-base-content/50 text-xs leading-5">{t("popup:rakeback.generalTermsDesc1")}</p>
              <p className="mt-4 text-base-content/50 text-xs leading-5">{t("popup:rakeback.generalTermsDesc2")}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
