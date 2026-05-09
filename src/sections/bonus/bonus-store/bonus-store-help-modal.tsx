import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "react-i18next";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";

interface BonusStoreHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BonusStoreHelpModal = ({ isOpen, onClose }: BonusStoreHelpModalProps) => {
  const { t } = useTranslation(['popup', 'casino', 'bonus']);
  const ILLUSTRATION_URL = useBonusDetailsImage("bonus_store", 256);

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideTitle={true} className="bg-transparent md:w-[500px] max-w-lg p-0" position="modal-middle">
      <div className="flex flex-col gap-1">
        {/* 上方带渐变的独立卡片 */}
        <div
          className="rounded-box px-8 text-center relative overflow-hidden max-h-[140px] h-[140px] flex items-center"
          style={{
            background: `
              radial-gradient(100% 308% at 100% 0%, rgba(251, 191, 0, 0.5) 0%, rgba(61, 42, 0, 0.5) 100%),
              linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
            `,
          }}
        >
          <div className="relative z-10 flex items-center h-full justify-between w-full">
            <h2 className="text-lg font-bold text-base-content text-start leading-5 whitespace-pre-line uppercase">
              {t("bonus:bonus_store_title")}
            </h2>
            <img
              src={ILLUSTRATION_URL}
              alt={t("bonus:bonus_store")}
              loading="lazy"
              decoding="async"
              className="w-[126px] h-[126px] object-contain"
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

            <div className="max-h-[400px] overflow-y-auto pb-12 hide-scrollbar">
              {/* 描述文本 */}
              <p className="text-xs text-base-content/50 leading-5">
                {t("popup:bonus_details_modal.description")}
              </p>

              {/* Claim Distribution 区块 */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("popup:claim_distribution")}</h4>
                <p className="text-xs text-base-content/50 leading-5">
                  {t("popup:bonus_details_modal.claim_distribution")}
                </p>
              </div>

              {/* Expiration 区块 */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("bonus:expiration")}</h4>
                <p className="text-xs text-base-content/50 leading-5 whitespace-pre-line">
                  {t("popup:bonus_details_modal.expiration_description")}
                </p> 
              </div>

              {/* General Terms 区块 */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">{t("bonus:general_terms")}</h4>
                <p className="text-xs text-base-content/50 leading-5 whitespace-pre-line">
                  {t("popup:bonus_details_modal.generalTerms_description")}
                </p> 
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
