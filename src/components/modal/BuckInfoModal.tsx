import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "react-i18next";

interface HelpModalBuckInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModalBuckInfo = ({ isOpen, onClose }: HelpModalBuckInfoProps) => {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} hideTitle={true} className="bg-transparent md:w-[500px] max-w-lg p-0" position="modal-middle" zIndex={1002}>
      <div className="flex flex-col gap-1">
        {/* 上方带渐变的独立卡片 */}
        <div
          className="pl-8 pr-4 text-center relative overflow-hidden h-[140px] flex items-center rounded-box"
          style={{
            background: `
              radial-gradient(123.83% 141.42% at 100% 0%, color(display-p3 0.6824 0.7922 0.2784 / 0.50) 0%, color(display-p3 0.063 0.078 0.098 / 0.5) 100%),
              linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
            `,
          }}
        >
          <div className="relative z-10 flex items-center h-full justify-between w-full">
            <h2 className="text-xl md:text-2xl font-bold text-base-content mb-2 text-start leading-6 text-nowrap">{t("popup:get_buck")}</h2> 
            <div className="flex items-center -space-x-6">
              <img src="/images/illustrations/8eb77e26320d092b03e700eb23d717c408ef3995.png" className="w-23 h-25 rotate-y-180" />
              <img src="/images/illustrations/buck.png" className="w-26 h-26 z-10" />
            </div>
          </div>
        </div>

        {/* 下方独立的主卡片 - 包含close按钮 */}
        <div className="bg-base-400 rounded-box relative">
          {/* Close按钮 - 位于右上角 */}
          <button onClick={onClose} className="absolute right-4 top-4 rtl:left-4 rtl:right-auto btn btn-square btn-sm bg-base-300 hover:bg-base-200 border-0">
            <Iconify icon="mdi:close" className="w-5 h-5 text-base-content/50" />
          </button>

          <div className="flex flex-col gap-4 px-4 pt-5">
            <div className="max-h-[400px] overflow-y-auto pb-12">
              {/* What is BUCK? */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <img src="/images/illustrations/buck.png" className="w-4 h-4" />
                  <h3 className="text-sm font-bold text-base-content">{t("popup:what_is_buck")}</h3> 
                </div>
                <p className="text-xs text-base-content/50 leading-5">
                  {t("popup:what_is_buck_description")}
                </p>
              </div>

              {/* Is BUCK exchangeable? */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-base-content mb-2">{t("popup:is_buck_exchangeable")}</h3>
                <p className="text-xs text-base-content/50 leading-5">
                  {t("popup:is_buck_exchangeable_description")}
                </p>
              </div>

              {/* Expiration */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-base-content mb-2">{t("popup:expiration")}</h3> 
                <p className="text-xs text-base-content/50 leading-5">
                  {t("popup:expiration_description")}
                </p>
              </div>

              {/* General Terms */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-base-content mb-2">{t("popup:freeSpins.general_terms")}</h3>
                <p className="text-xs text-base-content/50 leading-5 mb-2 whitespace-pre-line">
                  {t("popup:general_terms_description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
