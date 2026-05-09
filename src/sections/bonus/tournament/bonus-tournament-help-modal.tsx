import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "react-i18next";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BonusTournamentHelpModal = ({ isOpen, onClose }: Props) => {
  const { t } = useTranslation(['popup' , 'bonus', 'casino']);
  const ILLUSTRATION_URL = useBonusDetailsImage("tournament_reward", 256);

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideTitle={true} className="bg-transparent md:w-[500px] max-w-lg p-0" position="modal-middle">
      <div className="flex flex-col gap-1">
        {/* Top highlight card */}
        <div
          className="rounded-box px-7 py-4 relative overflow-hidden h-[140px] flex items-center justify-center"
          style={{
            background: `radial-gradient(100% 308% at 100% 0%, rgba(227, 106, 26, 0.5) 0%, rgba(15, 20, 26, 0.5) 100%), linear-gradient(0deg, var(--color-base-300), var(--color-base-300))`,
          }}
        >
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="text-left">
              <h2 className="text-2xl font-bold text-base-content leading-7">
                <div>{t("popup:tournament.title")}</div>
                <div>& {t("bonus:races")?.toUpperCase()}</div>
              </h2>
            </div>
            <div className="flex-shrink-0">
              <img
                src={ILLUSTRATION_URL}
                alt="Tournaments & Races"
                className="w-auto h-[128px] object-contain -rotate-12"
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
              <p className="text-xs text-base-content/50 leading-5">
                {t("popup:tournament.description")}
              </p>

              <div className="py-3 bg-base-300 rounded-field px-4 mt-4">
                <p className="text-xs text-base-content/50 mb-1 font-semibold">{t("popup:tournament.tournamentFrequency")}</p>
                <p className="text-lg font-bold text-primary">{t("casino:daily")}, {t("casino:weekly")}</p>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:tournament.claimDistribution")}</h4>
                <p className="text-xs text-base-content/50 leading-5">{t("popup:tournament.claimDistributionDesc")}</p>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:tournament.expiration")}</h4>
                <p className="text-xs text-base-content/50 leading-5">{t("popup:tournament.expirationDesc")}</p>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:tournament.generalTerms")}</h4>
                <p className="text-xs text-base-content/50 leading-5">{t("popup:tournament.generalTermsDesc1")}</p>
                <p className="mt-2 text-xs text-base-content/50 leading-5">{t("popup:tournament.generalTermsDesc2")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
