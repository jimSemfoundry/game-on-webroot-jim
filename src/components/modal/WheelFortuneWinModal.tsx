import { Modal } from "@/components/ui/Modal.tsx";
import { useTranslation } from "react-i18next";
import {
  getPrizeImageUrl, InnerBackgroundContainer,
  InnerCoinsContainer, InnerConfirmBox,
  InnerPrizeDisplay, InnerTextClipContainer,
  InnerWinnerContainer
} from "@/sections/lucky-spin/components.tsx";
import { X } from "lucide-react";

export const WheelFortuneWinModal = (
  {
    data,
    open,
    onClose
  }: {
    data: Record<string, any>;
    open: boolean;
    onClose: () => void;
  }) => {
  const { t } = useTranslation(["luckySpin", "bonus"]);

  return (
    <Modal
      hideTitle
      isOpen={open}
      onClose={onClose}
      className="relative bg-base-400 md:max-w-[360px] h-[65vh] hide-scrollbar p-0"
      position="modal-middle"
      closeButtonClassName={"hidden"}
    >
      <InnerBackgroundContainer className="absolute top-0 bottom-0 w-full">
        <InnerCoinsContainer
          className="p-5 pb-10 absolute h-full w-full flex flex-col items-center font-semibold overflow-hidden">
          <div className={"w-full text-right rtl:text-left"}>
            <button className="z-1 btn btn-sm btn-square bg-base-100 outline-none" onClick={onClose}><X size={16} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-start w-full">
            {/*TODO: 有奖励*/}
            <img src="/images/lucky-spin/flower.png" alt="" className={"w-[188px] animate-[scale-in_0.2s_ease-out]"} />
            <InnerWinnerContainer className="w-full h-[136px] text-lg font-extrabold">
              <InnerTextClipContainer className="text-[52px] font-extrabold text-center">
                {t('luckySpin:winner')}
              </InnerTextClipContainer>
              <div className="flex items-center justify-center gap-2">
                <img src={getPrizeImageUrl(data?.extra_data)} alt="" className={"w-8 h-8"} />
                <InnerPrizeDisplay data={data?.extra_data} className={"text-[20px] !text-base-content"} />
              </div>
            </InnerWinnerContainer>

            {/*TODO: 无奖励*/}
            {/*<InnerTextClipContainer className="text-[52px] font-extrabold text-center leading-[48px]">*/}
            {/*  {t("luckySpin:better")}*/}
            {/*</InnerTextClipContainer>*/}
            {/*<InnerTextClipContainer*/}
            {/*  className={"text-[36px] font-extrabold text-center mt-1"}>{t("luckySpin:next_time")}</InnerTextClipContainer>*/}
          </div>

          <InnerConfirmBox
            onClick={onClose}
            className={"w-60 h-14 font-bold bg-transparent border-none text-base-content"}
            $type={data?.type}
          >
            {t("bonus:gotIt")}
          </InnerConfirmBox>
        </InnerCoinsContainer>
      </InnerBackgroundContainer>
    </Modal>
  );
};

export default WheelFortuneWinModal;
