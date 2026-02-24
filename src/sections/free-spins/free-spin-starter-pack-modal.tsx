import { Modal } from "@/components/ui/Modal";
import { FreeSpinModalProps } from "./types";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import styled from "styled-components";

export function FreeSpinModal(
  {
    isOpen,
    onClose,
    onContinue,
    freeSpinData
  }: FreeSpinModalProps) {
  const { t } = useTranslation('popup');

  return (
    <Modal
      hideTitle
      isOpen={isOpen}
      onClose={onClose}
      className="w-[335px] p-0 bg-transparent"
      position="modal-middle"
      closeButtonClassName="bg-white/10 z-50"
    >
      <div className="mx-auto flex flex-col items-center justify-center">
        <InnerPolygonBox1 className="w-[335px] h-[236px] flex-shrink-0 bg-base-200">
          <div className="pt-6 text-[#00FF86] font-extrabold text-center flex-1">{t("popup:freeSpins.bonus")}</div>
          <div className="flex flex-col items-center justify-center mt-[7px] text-center">
            <InnerTextWrapper text={String(freeSpinData?.bet_count || 0)} className="text-[72px]" />
            <InnerTextWrapper text={t("popup:freeSpins.freeSpins")} className="text-[24px]" />
            <InnerTextWrapper text={t("popup:freeSpins.a_special_reward_just_for_you")}
                              className="!text-[#00FF86] w-[130px] !leading-4 text-sm mt-[16px]" />
          </div>
        </InnerPolygonBox1>
        <InnerPolygonBox2 onClick={onContinue} className="relative w-[335px] h-[78px] flex-shrink-0">
          <InnerTextWrapper
            text={t("popup:freeSpins.continue")}
            className="flex items-center justify-center h-full !text-black cursor-pointer" />
          <InnerBoldLine />
        </InnerPolygonBox2>
      </div>
    </Modal>
  );
}

const InnerPolygonBox1 = styled.div`
    clip-path: polygon(6% 0%, 94% 0%, 100% 10%, 100% 100%, 0% 100%, 0% 10%);
`;

const InnerPolygonBox2 = styled.div`
    clip-path: polygon(0 0, 100% 0, 100% 76%, 94% 100%, 6% 100%, 0 76%);
    background: linear-gradient(270deg, #00D764 0%, #006F34 100%)
`;

const InnerBoldLine = () => {
  return (<div
    className="w-20 h-2 flex-shrink-0 absolute bottom-0 left-1/2 -translate-x-1/2 bg-base-200"></div>);
};

const InnerTextWrapper = ({ text, className }: { text: string, className: string }) => {
  return (<div
    className={clsx("leading-[100%] text-neutral-content font-bold font-montserrat", className)}>{text}</div>);
};