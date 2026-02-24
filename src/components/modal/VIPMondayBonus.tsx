import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import { Gift, X } from "lucide-react";
import { ComponentProps, ReactNode } from "react";
import clsx from "clsx";
import { Modal } from "@/components/ui/Modal.tsx";

export default function VIPMondayBonusModal(
  {
    open,
    onClose
  }: {
    open: boolean;
    onClose: () => void;
  }) {
  const { t } = useTranslation();

  return (
    <Modal
      hideTitle
      isOpen={open}
      onClose={onClose}
      className="p-0 h-[75vh] max-h-[75vh] md:w-[500px] hide-scrollbar bg-transparent"
      closeButtonClassName="hidden"
      position="modal-middle"
    >
      <RadialGradientContainer className={"relative rounded-2xl mb-1 flex items-center justify-between h-[180px]"}>
        <div className={"text-2xl font-bold pl-8 rtl:pr-8 text-white"}>
          <Trans
            i18nKey="popup:vipMonday.title"
            components={[<div className={"text-primary"} />]}
          />
        </div>
        <img src="https://cdn-a.imgix.net/banner/public/images/casino/banner/vip-monday.png?w=209&auto=format,compress&q=80" className={"h-full absolute right-0 rtl:-left-5 rtl:right-auto"} alt={""} />
      </RadialGradientContainer>
      <section className={"text-xs font-semibold bg-base-300 p-4 rounded-t-2xl flex-1 leading-4"}>
        <div className={"flex items-center justify-between mb-4"}>
          <InnerTitle
            className={"!mt-0"}
            title={<><Gift className={"w-4 h-4 text-primary"} strokeWidth={3} />{t("bonus:bonus_details")}</>} />
          <InnerClose onClick={onClose} />
        </div>
        <div className={"hide-scrollbar overflow-y-auto h-[calc(100%-80px)]"}>
          <p className={"text-base-content/50"}>{t("popup:vipMonday.vipMondayDescription")}</p>

          <div className="py-3 bg-base-200 rounded-field px-4 mt-4">
            <p className="text-xs text-base-content/50 mb-1 font-semibold">{t("popup:vipMonday.release_frequency")}</p>
            <p className="text-base font-extrabold text-primary">{t("popup:vipMonday.every_monday")}</p>
          </div>

          <InnerTitle title={t("popup:claim_distribution")} />

          <div className="bg-base-200 rounded-field p-4 mt-4 flex items-center gap-4">
            <img src="/images/illustrations/isometric-1.svg" alt="isometric" className="w-10 h-10" />
            <div className="flex items-start flex-col">
              <p className="text-xs font-extrabold text-primary">{t("popup:vipMonday.to_your_account_balance")}</p>
              <p
                className="text-xs text-base-content/50 mt-2">{t("popup:vipMonday.to_your_account_balance_description")}</p>
            </div>
          </div>

          <InnerTitle title={t("popup:expiration")} />

          <p className={"mt-3 text-base-content/50"}>{t("popup:vipMonday.expiration_description")}</p>

          <InnerTitle title={t("popup:generalTerms")} />

          <p
            className={"mt-3 text-base-content/50 whitespace-pre-line"}>{t("popup:vipMonday.generalTerms_description")}</p>
        </div>
      </section>
    </Modal>
  );
}

const InnerTitle = ({ title, className }: { title: ReactNode, className?: string }) => {
  return <h3
    className={clsx("text-base text-white font-semibold flex items-center gap-1 mt-3", className)}>{title}</h3>;
};

const RadialGradientContainer = styled.div`
    background: radial-gradient(150.83% 141.42% at 100% 0%, color(display-p3 0.62 0.82 0.27 / 0.50) 0%, var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098 / 0.50)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))
`;

const InnerClose = (props: ComponentProps<"button">) => {
  return (<button {...props} className="btn btn-sm btn-square bg-base-100 outline-none"><X size={16} /></button>);
};