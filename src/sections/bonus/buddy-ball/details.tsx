import { useTranslation } from "react-i18next";
import { BadgeCheck, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal.tsx";
import { ComponentProps, PropsWithChildren, ReactNode } from "react";
import clsx from "clsx";
import Iconify from "@/components/iconify";
import { useUserBuddyBallsHome } from "@/hooks/api/useAuth.ts";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import { InnerShareLink } from "@/sections/bonus/buddy-ball/share.tsx";
import { useNavigate } from "@tanstack/react-router";

dayjs.extend(isToday);

export const Details = (
  {
    open,
    onClose
  }: {
    open: boolean;
    onClose: () => void;
  }) => {
  const navigate = useNavigate();

  const { t } = useTranslation(["popup", "bonus"]);

  const { data: buddy } = useUserBuddyBallsHome();

  const source = buddy?.data?.source_ball_stats ?? [];
  const user = source?.find((s: { source: string; }) => s?.source === "user");
  const deposit = source?.find((s: { source: string; }) => s?.source === "deposit");

  return (
    <Modal
      hideTitle
      isOpen={open}
      onClose={onClose}
      className="p-0 h-[75vh] max-h-[75vh] md:w-[420px] hide-scrollbar bg-transparent outline-none"
      closeButtonClassName="hidden"
      position="modal-middle"
    >
      <InnerSlogan title={t("buddyBalls:buddyBalls")} picture="/images/bonus/buddy-balls.png" />

      <InnerContainer>
        <InnerHeader
          title={<>
            <Iconify icon="custom:bonus" className="w-4 h-4 text-primary" />
            {t("bonus:bonus_details")}
          </>}
          onClose={onClose}
        />

        <InnerContent>
          <InnerTitle className={"!mt-0"} title={t("buddyBalls:moreBalls")} />

          <div className="flex flex-col gap-3 mt-3">
            <InnerItem title={t("buddyBalls:dailyCheck")} counter={""}>
              {dayjs((buddy?.data?.continuous_checkin_last_date_ts || 0) * 1000).isToday()
                ? <BadgeCheck className={"text-base-content/50 h-4 w-4"} strokeWidth={3} />
                : <button className="btn btn-primary btn-sm sm:btn-md"
                          onClick={() => {
                            onClose()
                            void navigate({ to: "/bonus/check" });
                          }}>{t("buddyBalls:go")}</button>}
            </InnerItem>

            <InnerItem title={t("buddyBalls:referFriend")} counter={"1"}>
              <span className={"pr-3 text-base-content/50 font-bold"}>+{user?.total_ball || 0}</span>
            </InnerItem>

            <InnerItem title={t("buddyBalls:referralDeposit")} counter={"5"}>
              <span className={"pr-3 text-base-content/50 font-bold"}>+{deposit?.total_ball || 0}</span>
            </InnerItem>

            <InnerShareLink />
          </div>

          <InnerTitle title={t("popup:tournament.expiration")} />
          <InnerDescription>{t("popup:tournament.expirationDesc")}</InnerDescription>

          <InnerTitle title={t("popup:tournament.generalTerms")} />
          <InnerDescription>{t("buddyBalls:accumulated")}</InnerDescription>
          <InnerDescription>{t("popup:tournament.generalTermsDesc2")}</InnerDescription>

        </InnerContent>
      </InnerContainer>
    </Modal>
  );
};

const InnerItem = ({ title, counter, children }: { title: ReactNode, counter: string, children: ReactNode }) => {
  return (<div className="flex items-center justify-between bg-base-200 rounded-lg pr-1 pl-4 py-1 min-h-10">
    <div className="flex items-center gap-2">
      <span className={"text-base-content/50"}>{title}</span>
      {<div className="flex text-primary font-bold">
        {counter ? `${counter}x` : ""}
        <img src="/images/bonus/ball.png" alt="" className={"w-4 h-4"} />
      </div>}
    </div>
    {children}
  </div>);
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
    className="rounded-box px-8 text-center relative overflow-hidden max-h-[140px] h-[140px] flex items-center mb-1"
    style={{
      background: `
                radial-gradient(100% 308% at 100% 0%, #75C300 0%, #0A2200 100%),
                linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
              `
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
    className={"text-xs font-semibold bg-base-300 p-4 rounded-t-2xl flex-1 leading-4"}>{props.children}</section>;
};

// TODO: 文本内容弹窗通用格式
export const InnerDescription = (props: PropsWithChildren<{ cls?: string }>) => {
  return <p className={clsx("text-base-content/50 whitespace-pre-line mt-3", props?.cls)}>{props.children}</p>;
};