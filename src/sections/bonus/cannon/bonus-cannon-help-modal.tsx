import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "react-i18next";
import Iconify from "@/components/iconify";

interface BonusCannonHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BonusCannonHelpModal = ({ isOpen, onClose }: BonusCannonHelpModalProps) => {
  const { t } = useTranslation();

  const headerContent = (
    <div className="flex items-center gap-2">
      <Iconify icon="custom:achievement" className="w-5 h-5 text-primary" />
      <p className="text-xl font-bold">{t("bonus:achievements")}</p>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={headerContent}
      className="bg-base-400 md:w-[500px] max-w-lg mx-auto overflow-hidden"
      position="modal-middle"
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-box bg-base-200 p-4">
          <h3 className="font-semibold text-base mb-2">{t("bonus:how_it_works")}</h3>
          <p className="text-sm text-base-content/70">
            {t("bonus:achievements_description")}
          </p>
        </div>
        
        <div className="rounded-box bg-base-200 p-4">
          <h3 className="font-semibold text-base mb-2">{t("bonus:achievement_categories")}</h3>
          <p className="text-sm text-base-content/70">
            {t("bonus:achievement_categories_description")}
          </p>
        </div>

        <div className="rounded-box bg-base-200 p-4">
          <h3 className="font-semibold text-base mb-2">{t("bonus:rewards_system")}</h3>
          <ul className="text-sm text-base-content/70 space-y-1">
            <li>" {t("bonus:bronze_silver_gold_tiers")}</li>
            <li>" {t("bonus:exclusive_badges")}</li>
            <li>" {t("bonus:special_bonuses")}</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
