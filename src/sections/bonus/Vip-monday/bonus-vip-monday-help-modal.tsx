
import { Modal } from "@/components/ui/Modal";
import { Trans, useTranslation } from 'react-i18next';

interface BonusRakebackHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BonusVipMondayHelpModal = ({ isOpen, onClose }: BonusRakebackHelpModalProps) => { 
  const { t } = useTranslation('popup');

  return (
    <Modal
      hideTitle
      isOpen={isOpen}
      onClose={onClose}
      position={'modal-middle'}
      className="bg-transparent md:w-[500px] max-w-lg p-0"
    >
      <div className="flex flex-col gap-1">
        {/* 上方带渐变的独立卡片 */}
        <div
          className="rounded-box px-8 text-center relative overflow-hidden h-[140px] flex items-center"
          style={{
            background: `
            radial-gradient(100% 308% at 100% 0%, color(display-p3 0.7765 0.2824 0.1412 / 0.50) 0%, color(display-p3 0.063 0.078 0.098 / 0.5) 100%),
            linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
            `,
          }}
        >
          <div className="relative z-10 flex items-center h-full justify-between w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-start leading-6 whitespace-pre-line">
              <Trans
                i18nKey={'popup:vipMonday.title'}
                components={[<span className="text-primary" />]}
              />
            </h2>
            <img src="/images/rewards/vip-monday.png" alt="Super Rakeback" className="w-auto h-[128px]" />
          </div>
        </div>

        {/* 下方独立的主卡片 - 包含close按钮 */}
        <div className="bg-base-400 rounded-box relative" style={{ background: `rgba(7, 11, 16, 1)` }}>
          {/* Close按钮 - 位于右上角 */}
          <button onClick={onClose} className="absolute right-4 top-4 rtl:left-4 rtl:right-auto btn btn-square btn-sm bg-base-300 hover:bg-base-200 border-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.91406 2.91406L11.0802 11.0802" stroke="#EBEBEB" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.91591 11.0802L11.082 2.91406" stroke="#EBEBEB" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex flex-col gap-4 px-4 pt-5">
            {/* Bonus Details 标题 */}
            <div className="flex items-center gap-2 mb-2">
              {/* <Iconify icon="custom:bonus" className="w-4 h-4 text-primary" /> */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.56369 1.16406C4.10298 1.16646 2.82982 1.21048 2.0221 2.0182C1.21439 2.82591 1.17037 4.09908 1.16797 6.55978H4.03419C3.82946 6.30405 3.67648 6.0024 3.59307 5.66873C3.27909 4.4128 4.4167 3.27518 5.67263 3.58916C6.00631 3.67258 6.30795 3.82555 6.56369 4.03028V1.16406Z" fill="#C4E02C" />
                <path d="M1.16797 7.4375C1.17037 9.89817 1.21439 11.1713 2.0221 11.979C2.82982 12.7867 4.10298 12.8308 6.56369 12.8332V8.23877C6.10886 9.14719 5.16952 9.77083 4.0845 9.77083C3.84287 9.77083 3.647 9.57495 3.647 9.33333C3.647 9.09172 3.84287 8.89583 4.0845 8.89583C4.98096 8.89583 5.7321 8.27359 5.9296 7.4375H1.16797Z" fill="#C4E02C" />
                <path d="M7.4375 12.8332C9.89817 12.8308 11.1713 12.7867 11.979 11.979C12.7867 11.1713 12.8308 9.89817 12.8332 7.4375H8.07153C8.26904 8.27359 9.0202 8.89583 9.91667 8.89583C10.1583 8.89583 10.3542 9.09172 10.3542 9.33333C10.3542 9.57495 10.1583 9.77083 9.91667 9.77083C8.83161 9.77083 7.89227 9.14719 7.4375 8.23877V12.8332Z" fill="#C4E02C" />
                <path d="M12.8332 6.55978C12.8308 4.09908 12.7867 2.82591 11.979 2.0182C11.1713 1.21048 9.89817 1.16646 7.4375 1.16406V4.03028C7.69323 3.82555 7.99488 3.67258 8.32848 3.58916C9.58446 3.27518 10.7221 4.4128 10.4081 5.66873C10.3246 6.0024 10.1717 6.30405 9.96695 6.55978H12.8332Z" fill="#C4E02C" />
                <path d="M5.45837 4.4399C6.10677 4.602 6.56165 5.18458 6.56165 5.8529V6.56165H5.8529C5.18458 6.56165 4.602 6.10677 4.4399 5.45837C4.28613 4.84328 4.84328 4.28613 5.45837 4.4399Z" fill="#C4E02C" />
                <path d="M7.4375 5.8529V6.56165H8.14619C8.81452 6.56165 9.39709 6.10677 9.5592 5.45837C9.71297 4.84328 9.15582 4.28613 8.54076 4.4399C7.89233 4.602 7.4375 5.18458 7.4375 5.8529Z" fill="#C4E02C" />
              </svg>

              <h3 className="text-base font-bold text-white">{t("bonus:bonus_details")}</h3>
            </div>

            <div className="max-h-[400px] overflow-y-auto pb-12 hide-scrollbar">
              {/* 描述文本 */}
              <p className="text-xs text-base-content/50 leading-5">{t("popup:vipMonday.vipMondayDescription")}</p>

              {/* Release Frequency 区块 */}
              <div className="py-3 bg-base-300 rounded-field px-4 mt-4">
                <p className="text-xs text-base-content/50 mb-1 font-semibold">{t("popup:vipMonday.release_frequency")}</p>
                <p className="text-lg font-bold text-primary">{t("popup:vipMonday.every_monday")}</p>
              </div>

              <p className="font-semibold text-sm mt-4 text-white">{t("popup:claim_distribution")}</p>

              {/* Sapphire and Beyond 区块 */}
              <div className="pt-4 bg-base-300 rounded-field p-4 mt-4 flex items-center gap-4">
                <img src="/images/illustrations/isometric-1.svg" alt="isometric" className="w-10 h-10" />
                <div className="flex items-start flex-col">
                  <p className="text-xs font-semibold text-primary">{t("popup:vipMonday.to_your_account_balance")}</p>
                  <p className="text-xs text-base-content/50 mt-2">{t("popup:vipMonday.to_your_account_balance_description")}</p>
                </div>
              </div>

              <p className="font-semibold text-sm mt-4 text-white">{t("popup:expiration")}</p>
              <p className="mt-3 text-base-content/50 text-xs leading-5">{t("popup:vipMonday.expiration_description")}</p>

              <p className="font-semibold text-sm mt-4 text-white">{t("popup:generalTerms")}</p>
              <p className="mt-3 text-base-content/50 text-xs leading-5 whitespace-pre-line">{t("popup:vipMonday.generalTerms_description")}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
