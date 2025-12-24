import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "react-i18next";
import { BonusCardForH5 } from "@/sections/bonus/deposit-bonus/bonus-pool-banner";
import { BannerListTable } from "./BannerListTable";
import { useState, useEffect, useRef } from "react";
import { useGetPromoByPage } from "@/query/promo";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { toast } from "sonner";

export const SpecialOffersModal = ({ open, onClose }: { open: boolean, onClose: () => void }) => {

  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, []);

  const { total } = useGetPromoByPage();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [promoCode, setPromoCode] = useState('');

  return (
    <Modal
      className="p-0 bg-base-400 h-full"
      zIndex={1006}
      isOpen={open}
      onClose={onClose}
      style={{
        height: isMobile ? `calc(100% - env(safe-area-inset-top, 0px) - 48px)` : '770px',
        maxHeight: isMobile ? `calc(100% - env(safe-area-inset-top, 0px) - 48px)` : '770px',
      }}
      closeButtonClassName="hidden"
      hideTitle
    >
      <div className="px-5 py-4 flex flex-col gap-3 h-full ">
        <div className="relative w-full h-7.5">
          <div className='flex items-center justify-center gap-2 absolute h-full w-full'>
            <h2 className="text-base font-semibold leading-6 text-white">
              {t('finance:specialOffers')}
            </h2>
            <span className="indicator-item badge badge-primary z-20 rounded-full p-0 font-bold h-4 w-4 text-xs">{total}</span>
          </div>
          <button className='btn w-7.5 h-7.5 p-0 bg-base-200 relative z-10' onClick={() => onClose()}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M8.95305 3.66112C9.15401 3.87012 9.1475 4.20247 8.93849 4.40344L6.18207 7L8.93849 9.59656C9.1475 9.79753 9.15401 10.1299 8.95305 10.3389C8.75208 10.5479 8.41973 10.5544 8.21073 10.3534L5.06073 7.37844C4.95779 7.27946 4.89961 7.14281 4.89961 7C4.89961 6.85719 4.95779 6.72055 5.06073 6.62156L8.21073 3.64656C8.41973 3.4456 8.75208 3.45211 8.95305 3.66112Z" fill="#A6ADBB" stroke="#A6ADBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <h3 className="text-sm font-semibold leading-4 text-white">
          {t('finance:bonusPool')}
        </h3>
        <div className='border border-primary rounded-lg'>
          <BonusCardForH5 />
        </div>
        <p className="text-xs leading-4.5 text-base">
          {t('finance:bonusPoolOffersAreAlwaysActive')}
        </p>
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold leading-4 text-white">
              {t('finance:limitedOffers')}
            </h3>
            <div className="flex items-center" onClick={() => setIsOpen(!isOpen)}>
              <div className="text-sm font-semibold leading-4 text-base">
                {t('finance:promoCode')}
              </div>
              <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M14.7698 12.7906C14.4713 13.0777 13.9965 13.0684 13.7094 12.7698L10 8.83208L6.29062 12.7698C6.00353 13.0684 5.52875 13.0777 5.23017 12.7906C4.93159 12.5035 4.92228 12.0287 5.20937 11.7302L9.45937 7.23017C9.60078 7.08311 9.79599 7 10 7C10.204 7 10.3992 7.08311 10.5406 7.23017L14.7906 11.7302C15.0777 12.0287 15.0684 12.5035 14.7698 12.7906Z" fill="#EBEBEB" fillOpacity="0.5" />
                </svg>
              </div>
            </div>
          </div>
          <div
            className="transition-all duration-300 ease-in-out "
            style={{
              height: isOpen ? (contentHeight ? `${contentHeight}px` : 'auto') : '0px',
              opacity: isOpen ? 1 : 0,
            }}
          >
            <div ref={contentRef} >
              <div className="flex flex-col gap-3 pt-3">
                <label className="input bg-base-300 w-full text-sm border-none">
                  <input type="text" className="" placeholder={t('finance:enterCode')} value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                  <span className="label" onClick={() => { toast.error(t('toast:promoCodeError')) }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M7.20938 14.7698C6.92228 14.4713 6.93159 13.9965 7.23017 13.7094L11.1679 10L7.23017 6.29062C6.93159 6.00353 6.92228 5.52875 7.20938 5.23017C7.49647 4.93159 7.97125 4.92228 8.26983 5.20937L12.7698 9.45937C12.9169 9.60078 13 9.79599 13 10C13 10.204 12.9169 10.3992 12.7698 10.5406L8.26983 14.7906C7.97125 15.0777 7.49647 15.0684 7.20938 14.7698Z" fill="#EBEBEB" fillOpacity="0.5" />
                    </svg>
                  </span>
                </label>
                <p className="text-xs leading-4.5 text-base">
                  {t('finance:promoCodeDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
        <BannerListTable onClose={() => onClose()} /> 
        {/* <BannerList currency={currency} currentPromo={currentPromo} /> */}
      </div>
    </Modal>
  )
}