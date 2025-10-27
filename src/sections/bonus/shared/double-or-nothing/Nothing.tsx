import { Modal } from "@/components/ui/Modal"; 
import { useTranslation } from "react-i18next";
import { useRef, useState } from "react";
import { Boost, BoostRef } from "./Boost";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";


export const Nothing = ({ don_record_id }: { don_record_id: string }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const { selectedCurrency } = useDisplayCurrencyFormatter();
  const boostRef = useRef<BoostRef>(null);

  const handleBoost = () => {
    setOpen(false);
    boostRef.current?.checkDonPromoHandler(don_record_id);
  };

  return (
    <>
      <Modal
        isOpen={open}
        closeButtonClassName="hidden"
        hideTitle
        onClose={() => setOpen(false)}
        className=""
        style={{
          background: 'transparent',
          padding: '0',
        }}>
        <div className="relative h-[492px] max-w-[351px] pt-[136px] mx-auto">
          <img src="/images/double-nothing/nothing.png" alt="" className="w-full object-cover absolute top-0 left-[50%] translate-x-[-50%] z-[1] pointer-events-none" />
          <div className="h-[356px] w-full flex flex-col items-center justify-center rounded-2xl pt-[90px] relative"
            style={{
              background: 'color(display-p3 0.027 0.043 0.063)',
            }}>
            <div
              className={`absolute top-4 right-4`}
              onClick={() => {
                setOpen(false);
              }}
            >
              <div className='bg-base-200 rounded-lg flex items-center justify-center w-6 h-6'>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.916992 0.916626L9.08311 9.08274" stroke="#A6ADBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M0.91689 9.08274L9.08301 0.916626" stroke="#A6ADBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-white leading-8">{t('bonus:oops')}</p>
            <p className="text-base font-semibold test-sm text-base-content/80 leading-5">{t('bonus:you_got_nothing')}</p> 
            <div className="flex items-center gap-2 justify-center mt-4 mb-5">
              <img src="/images/double-nothing/currency.png" alt="coin" className="w-[25px] h-[25px] object-cover " />
              <div className="text-warning text-2xl leading-6 font-bold ">{selectedCurrency} 0.00</div>
            </div>
            <p className="text-white font-semibold leading-5 test-sm mb-[30px]">{t('bonus:better_luck_next_time')}</p>  

            <button className="btn btn-primary h-12 w-50" onClick={handleBoost}>{t('bonus:continue')}</button>
          </div>
        </div>
      </Modal>
      <Boost ref={boostRef} />
    </>
  );
};