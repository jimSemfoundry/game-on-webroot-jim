/**
 * Bonus page Mystery Box help modal, used to introduce the details of Mystery Box.
 */
import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "react-i18next";

interface HelpModalMysteryBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModalMysteryBox = ({ isOpen, onClose }: HelpModalMysteryBoxProps) => {
  const { t } = useTranslation();

  const headerContent = (
    <div className="flex items-center gap-2">
      <Iconify icon="custom:conquest" className="w-5 h-5 text-primary" />
      <p className="text-xl font-bold">{t("bonus:conquests")}</p>
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
          <p className="text-sm text-base-content/70">{t("bonus:conquests_description")}</p>
        </div>

        <div className="rounded-box bg-base-200 p-4">
          <h3 className="font-semibold text-base mb-2">{t("bonus:conquest_levels")}</h3>
          <p className="text-sm text-base-content/70">{t("bonus:conquest_levels_description")}</p>
        </div>

        <div className="rounded-box bg-base-200 p-4">
          <h3 className="font-semibold text-base mb-2">{t("bonus:rewards_structure")}</h3>
          <ul className="text-sm text-base-content/70 space-y-1">
            <li>" {t("bonus:progressive_rewards")}</li>
            <li>" {t("bonus:milestone_bonuses")}</li>
            <li>" {t("bonus:completion_rewards")}</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
