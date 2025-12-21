import { Modal } from "@/components/ui/Modal";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { authService } from "@/services/authService";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useDoubledUpModal } from "@/contexts/ModalsProvider";
import { useNothingModal } from "@/contexts/ModalsProvider";

export interface DoubleOrNothingModalProps {
  open: boolean;
  onClose: () => void;
  modalData: {
    don_record_id: string;
    amount: string;
  }
}

export const DoubleOrNothingModal = ({ open, onClose, modalData }: DoubleOrNothingModalProps) => {
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [don_record_id, setDonRecordId] = useState('');

  const { openDoubledUpModal } = useDoubledUpModal();
  const { openNothingModal } = useNothingModal();

  useEffect(() => {
    if (modalData?.don_record_id && modalData?.amount) {
      setDonRecordId(modalData?.don_record_id);
      setNewAmount(modalData?.amount);
    }
  }, [modalData]);

  useEffect(() => {
    return () => {
      setDonRecordId('');
      setNewAmount('');
    }
  }, []);

  const handleClaim = () => {
    if (don_record_id) {
      setIsLoading(true);
      authService.donDeal(don_record_id).then((res: any) => {
        if (res.code === 0) {
          // setDonData(res.data);
          if (res.data?.is_win) {
            openDoubledUpModal(res.data)
          } else {
            openNothingModal(don_record_id)
          }
          onClose()
        }
      }).finally(() => {
        setIsLoading(false);
      });
    }
  };

  return (
    <>
      <Modal
        isOpen={open}
        onClose={onClose}
        hideTitle
        position="modal-middle"
        zIndex={1007}
        className="h-[573px] bg-transparent p-0 max-w-[335px] mx-auto" >
        <div className="flex flex-col overflow-hidden h-full" style={{
          background: 'linear-gradient(175.38deg, color(display-p3 0.090 0.090 0.259) -1.75%, color(display-p3 0.020 0.027 0.102) 54.33%)',
          boxShadow: '0px 4px 250px 1000px color(display-p3 0.000 0.000 0.000 / 0.5)',
        }}>
          {/* <div className="flex items-center gap-2 mt-4 ml-4">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_21452_365455)">
                <path d="M13.0955 5.51951L2.3053 0.166876C1.77845 -0.0943444 1.17438 -0.0466939 0.691933 0.294402C0.258889 0.600531 0 1.10652 0 1.64713V12.352C0 12.8927 0.258889 13.3986 0.691933 13.7048C0.968331 13.9002 1.28381 13.9996 1.60211 13.9996C1.84036 13.9996 2.07955 13.944 2.3053 13.832L13.0955 8.47932C13.6536 8.20268 14.0003 7.63498 14.0003 6.99907C14.0003 6.36316 13.6536 5.79547 13.0955 5.51882V5.51951ZM12.6834 7.48106L1.8932 12.8333C1.63775 12.9609 1.3848 12.8906 1.2341 12.7836C1.14655 12.7219 1.00022 12.5838 1.00022 12.352V1.64713C1.00022 1.41539 1.14686 1.27724 1.2341 1.21553C1.32727 1.14903 1.45984 1.0976 1.60711 1.0976C1.69841 1.0976 1.79565 1.11749 1.8932 1.16548L12.6834 6.51811C12.8844 6.61821 13.0004 6.79339 13.0004 6.99941C13.0004 7.20544 12.8847 7.38062 12.6834 7.48072V7.48106ZM4.49991 5.35496V6.99941C4.49991 7.30246 4.27635 7.54757 3.99996 7.54757H2.50009V8.09572H3.99996C4.27635 8.09572 4.49991 8.34083 4.49991 8.64387C4.49991 8.94691 4.27635 9.19202 3.99996 9.19202H1.99982C1.72342 9.19202 1.49987 8.94691 1.49987 8.64387V6.99941C1.49987 6.69637 1.72342 6.45126 1.99982 6.45126H3.49969V5.90311H1.99982C1.72342 5.90311 1.49987 5.658 1.49987 5.35496C1.49987 5.05191 1.72342 4.8068 1.99982 4.8068H3.99996C4.27635 4.8068 4.49991 5.05191 4.49991 5.35496ZM8.38449 5.70634L7.40146 6.99976L8.38449 8.29318C8.56115 8.52594 8.53238 8.87184 8.32039 9.06553C8.22659 9.15054 8.11341 9.19237 8.00054 9.19237C7.85702 9.19237 7.71476 9.12552 7.61564 8.99525L6.74987 7.85609L5.88409 8.99525C5.78497 9.12518 5.64302 9.19237 5.4992 9.19237C5.38632 9.19237 5.27314 9.15054 5.17934 9.06553C4.96735 8.87184 4.93858 8.52594 5.11524 8.29318L6.09827 6.99976L5.11524 5.70634C4.93858 5.47357 4.96735 5.12767 5.17934 4.93399C5.39258 4.74064 5.70712 4.77115 5.88378 5.00426L6.74955 6.14342L7.61533 5.00426C7.79199 4.77149 8.10716 4.74098 8.32008 4.93399C8.53207 5.12767 8.56084 5.47357 8.38418 5.70634H8.38449Z" fill="#C4E02C" />
              </g>
              <defs>
                <clipPath id="clip0_21452_365455">
                  <rect width="14" height="14" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <h1 className="text-lg font-semibold text-white ">{t('bonus:double_or_nothing')}</h1>
          </div> */}
          <div className="pt-[51px]">
            <img src="/images/double-nothing/don-test.png" alt="mystery-box-close" />
            <div className="relative">
              <div className="w-[180px] h-[180px] absolute left-1/2 -translate-x-1/2 top-[27px] z-10"
                style={{
                  filter: 'drop-shadow(0px 4px 40px rgba(5, 7, 26, 1)) drop-shadow(0px 4px 160px rgba(23, 23, 66, 1))',
                }}
              >
                <div className="w-full h-full relative ">
                  <div className="font-montserrat text-white text-[72px] leading-[36px] font-bold absolute top-[20px] right-[116px] ">0x</div>
                  <img src="/images/double-nothing/rocket.png" alt="rocket" className=" " />
                  <div className="font-montserrat text-white text-[72px] leading-[36px] font-bold absolute bottom-[20px] left-[132px] ">2x</div>
                </div>
              </div>

              <img src="/images/double-nothing/sau.png" alt="sau" className="w-[360px] h-[366px] absolute left-1/2 -translate-x-1/2 -top-[27px] opacity-5" />
            </div>

            <div className="absolute bottom-8 left-0 z-50 w-full">

              <div className="flex items-center gap-2 justify-center mb-6">
                <img src="/images/double-nothing/currency.png" alt="coin" className="w-[25px] h-[25px] object-cover " />
                <div className="text-primary text-2xl leading-6 font-bold ">{formatWithConversion(newAmount, 'BUCK', {
                  showSymbol: true,
                  showCode: false,
                }).formatted}</div>
              </div>

              <p className="text-white text-sm font-semibold whitespace-pre-line leading-5 text-center mb-8" >
                {t('bonus:double_or_nothing_description')} <span className="text-primary">{t('bonus:double_it')}</span>
              </p>

              <div className="mx-4 max-w-[311px] mx-auto">
                <div className="inline-flex items-center gap-2 w-full">
                  <button className="btn btn-square btn-soft btn-primary min-w-[96px] h-12" onClick={onClose}>
                    {t('bonus:no_thanks')}
                  </button>
                  <button className="btn btn-primary w-full flex-1 h-12"
                    style={{
                      boxShadow: '0px 4px 30px color-mix(in oklch, var(--color-primary) 30%, transparent)',
                    }}
                    disabled={isLoading} onClick={handleClaim}>
                    {isLoading ? <span className="loading loading-spinner loading-xs"></span> : t('bonus:double_or_nothing')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      {/* {donData?.is_win === true && <DoubledUp donData={donData} />} */}
      {/* {donData?.is_win === false && don_record_id && <Nothing don_record_id={don_record_id} />} */}
    </>
  );
};

export default DoubleOrNothingModal;


