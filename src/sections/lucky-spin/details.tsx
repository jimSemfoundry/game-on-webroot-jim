import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Modal } from "@/components/ui/Modal.tsx";
import { ComponentProps, PropsWithChildren, ReactNode } from "react";
import clsx from "clsx";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";

dayjs.extend(isToday);

export const Details = (
  {
    open,
    onClose
  }: {
    open: boolean;
    onClose: () => void;
  }) => {
  const { t } = useTranslation(["popup", "bonus", "buddyBalls"]);

  return (
    <Modal
      hideTitle
      isOpen={open}
      onClose={onClose}
      className="p-0 h-[75vh] max-h-[75vh] md:w-[420px] hide-scrollbar bg-transparent outline-none"
      closeButtonClassName="hidden"
      position="modal-middle"
    >
      <InnerSlogan title={t("luckySpin:fortune")} picture="/images/lucky-spin/spins.png" />

      <InnerContainer>
        <InnerHeader
          title={<>
            <img src="/images/lucky-spin/spins-small.png" alt="" className={"w-4 h-4"} />
            {t("bonus:bonus_details")}
          </>}
          onClose={onClose}
        />

        <InnerContent>
          <InnerDescription cls={"!mt-0"}>
            {t("luckySpin:ready")}
          </InnerDescription>

          <InnerTitle title={t("popup:missions.claimDistribution")} />
          <InnerDescription>{t("luckySpin:rewards")}

          </InnerDescription><InnerTitle title={t("popup:tournament.expiration")} />
          <InnerDescription>{t("popup:tournament.expirationDesc")}</InnerDescription>

          <InnerTitle title={t("popup:tournament.generalTerms")} />
          <InnerDescription>{t("buddyBalls:accumulated")}</InnerDescription>
          <InnerDescription>{t("popup:tournament.generalTermsDesc2")}</InnerDescription>

        </InnerContent>
      </InnerContainer>
    </Modal>
  );
};

export default Details;

// TODO: 文本内容弹窗通用格式
export const InnerTitle = ({ title, className }: { title: ReactNode, className?: string }) => {
  return <h3
    className={clsx("text-sm text-base-content font-semibold flex items-center gap-1 mt-4", className)}>{title}</h3>;
};

// TODO: 文本内容弹窗通用格式
export const InnerClose = (props: ComponentProps<"button">) => {
  return (<button {...props} className="btn btn-sm btn-square bg-base-100 outline-none"><X size={16} /></button>);
};

// TODO: 文本内容弹窗通用格式
export const InnerSlogan = ({ title, picture }: { title: ReactNode, picture: string }) => {
  return (<div
    className="rounded-box px-8 relative overflow-hidden max-h-[140px] h-[140px] flex items-center mb-1"
    style={{
      background: `radial-gradient(180.83% 141.42% at 100% 0%, color(display-p3 0.9216 0.3255 0.7569 / 0.50) 0%, var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098 / 0.50)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))`
    }}
  >
    <div className={"relative z-10 flex items-center h-full justify-between w-full"}>
      <div className={"text-lg font-bold text-base-content uppercase whitespace-pre-line leading-5"}>
        {title}
      </div>
      <img src={picture} className={"w-[126px] h-[126px] object-contain"} alt={""} />
    </div>
  </div>);
};

// TODO: 文本内容弹窗通用格式
export const InnerHeader = ({ title, onClose }: { title: ReactNode, onClose: () => void }) => {
  return (<div className={"flex items-center justify-between mb-4"}>
    <InnerTitle className={"!mt-0"} title={title} />
    <InnerClose onClick={onClose} />
  </div>);
};

// TODO: 文本内容弹窗通用格式
export const InnerContent = (props: PropsWithChildren) => {
  return <div className={"hide-scrollbar overflow-y-auto h-[460px]"}>{props.children}</div>;
};

// TODO: 文本内容弹窗通用格式
export const InnerContainer = (props: PropsWithChildren) => {
  return <section
    className={"text-xs font-semibold bg-base-300 h-full p-4 rounded-t-2xl flex-1 leading-4"}>{props.children}</section>;
};

// TODO: 文本内容弹窗通用格式
export const InnerDescription = (props: PropsWithChildren<{ cls?: string }>) => {
  return <p className={clsx("text-base-content/50 whitespace-pre-line mt-3", props?.cls)}>{props.children}</p>;
};