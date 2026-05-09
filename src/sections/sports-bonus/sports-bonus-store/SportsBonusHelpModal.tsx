import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "react-i18next";
import { useUserSportWallet } from "@/query/sports-bonus.ts";
import { parser } from "@/sections/sports-bonus/components.tsx";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";

interface SportsBonusHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SportsBonusHelpModal = ({ isOpen, onClose }: SportsBonusHelpModalProps) => {
  const { t } = useTranslation(["popup", "bonus"]);
  const ILLUSTRATION_URL = useBonusDetailsImage("sports_bonus", 256);

  // TODO: 体育彩金活动
  const { data: sports } = useUserSportWallet();

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideTitle={true} className="bg-transparent md:w-[500px] max-w-lg p-0"
           position="modal-middle">
      <div className="flex flex-col gap-1">
        <div
          className="rounded-box px-8 text-center relative overflow-hidden max-h-[140px] h-[140px] flex items-center"
          style={{
            background: "radial-gradient(130% 308% at 100% 0%, rgba(170,67,255,1) 0%, rgba(132,59,233,1) 25%, rgba(94,51,211,1) 50%, rgba(56,43,189,1) 75%, rgba(18,35,167,1) 100%)"
          }}
        >
          <div className="relative z-10 flex items-center h-full justify-between w-full">
            <div className="flex flex-col items-start gap-2">
              <h2 className="text-xl font-bold text-base-content text-start leading-5 whitespace-pre-line uppercase">
                {t("bonus:sports_bonus_title")}
              </h2>
              <span className="text-xs font-bold text-base-content/80">FIFA 2026</span>
            </div>
            <img
              src={ILLUSTRATION_URL}
              alt="Sports Bonus"
              loading="lazy"
              decoding="async"
              className="w-[126px] h-[126px] object-contain"
            />
          </div>
        </div>

        <div className="bg-base-400 rounded-box relative">
          <button onClick={onClose}
                  className="absolute right-4 top-4 rtl:left-4 rtl:right-auto btn btn-square btn-sm bg-base-300 hover:bg-base-200 border-0">
            <Iconify icon="mdi:close" className="w-5 h-5 text-base-content/50" />
          </button>

          <div className="flex flex-col gap-4 px-4 pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Iconify icon="custom:bonus" className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold">{t("bonus:bonus_details")}</h3>
            </div>

            <div className="max-h-[400px] overflow-y-auto pb-12 hide-scrollbar">
              <p className="text-xs text-base-content/50 leading-5">
                {t("popup:sports_bonus_details_modal.description")}
              </p>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:claim_distribution")}</h4>
                <p className="text-xs text-base-content/50 leading-5">
                  {t("popup:sports_bonus_details_modal.claim_distribution")}
                </p>
              </div>

              {/*TODO: 里面有数据的显示需要用户有参与体育彩金活动才行*/}
              {sports?.data && <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("bonus:wagering_rules")}</h4>
                <p className="text-xs text-base-content/50 leading-5 whitespace-pre-line">
                  {t("popup:sports_bonus_details_modal.wagering_rules", { minOdds: parser(sports?.data?.extra_data)?.min_odds })}
                </p>
              </div>}

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("bonus:expiration")}</h4>
                <p className="text-xs text-base-content/50 leading-5 whitespace-pre-line">
                  {t("popup:sports_bonus_details_modal.expiration_description")}
                </p>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("bonus:general_terms")}</h4>
                <p className="text-xs text-base-content/50 leading-5 whitespace-pre-line">
                  {t("popup:sports_bonus_details_modal.generalTerms_description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
