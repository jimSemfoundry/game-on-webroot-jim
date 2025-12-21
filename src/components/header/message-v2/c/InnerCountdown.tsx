import { useMemo, useState } from "react";
import Countdown from "./Countdown.tsx";
import { Clock } from "lucide-react";
import { parser } from "./InnerMsgLink.tsx";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { InnerDisplayContent } from "@/components/header/message-v2/c/InnerComponents.tsx";
import dayjs from "dayjs";

export type MType = "promo_code" | "free_spins"

export const msg_type_need_countdown: MType[] = ["promo_code", "free_spins"];

export const InnerCountdown = ({ type, status, payload, jump_url, expired_at, onClose }: {
  type: MType,
  status: number,
  payload: string,
  jump_url: string,
  expired_at: number,
  onClose?: () => void
}) => {
  const _payload = useMemo(() => payload && parser(JSON.parse(payload)), [payload]);

  return <>
    {type === "free_spins" &&
      <FreeSpinsCountdown
        status={status}
        payload={_payload}
        jump_url={jump_url}
        expired_at={expired_at * 1000}
        onClose={onClose} />}
    {
      type === "promo_code" &&
      <PromoCodeCountdown
        status={status}
        jump_url={jump_url}
        expired_at={expired_at * 1000}
        onClose={onClose} />
    }
  </>;
};

const PromoCodeCountdown = (
  {
    status,
    jump_url, onClose, expired_at
  }: {
    status: number,
    jump_url: string,
    expired_at: number,
    onClose?: () => void
  }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [finished, setFinished] = useState<boolean>(false)

  return (<>
    <InnerDisplayContent show={[0].includes(status) && expired_at > 0 && dayjs().valueOf() < expired_at}>
      <Countdown
        onFinished={(v) => {
          v && setFinished(v)
        }}
        deadlineText={t("bonus:expires")}

        endedText={<div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {t("transaction:transactionStatus.expired")}
        </div>}
        end={expired_at} />

      <InnerDisplayContent show={!finished}>
        <div className={"text-primary text-[12px] cursor-pointer"} onClick={(e) => {
          e.stopPropagation();
          void navigate({ to: decodeURIComponent(jump_url) });
          onClose?.();
          return false;
        }}>
          {t("bonus:deposit_now")}
        </div>
      </InnerDisplayContent>
    </InnerDisplayContent>

    <InnerDisplayContent show={expired_at > 0 && dayjs().valueOf() >= expired_at && ![1].includes(status)}>
      <div className="flex items-center gap-1 text-[12px] text-base-content/50">
        <Clock className="w-3 h-3" />
        {t("transaction:transactionStatus.expired")}
      </div>
    </InnerDisplayContent>

    <InnerDisplayContent show={[1].includes(status)}>
      <span className={"text-primary text-[12px]"}>{t("bonus:completed")}</span>
    </InnerDisplayContent>
  </>);
};

const FreeSpinsCountdown = (
  {
    status,
    jump_url, onClose, expired_at, payload
  }: {
    status: number,
    payload: Record<string, any>,
    jump_url: string,
    expired_at: number,
    onClose?: () => void
  }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  return (<>
    <InnerDisplayContent show={[0, 1].includes(status) && expired_at > 0 && dayjs().valueOf() < expired_at}>
      <Countdown
        deadlineText={t("transaction:transactionStatus.expired")}
        endedText={<div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {t("transaction:transactionStatus.expired")}
        </div>}
        end={expired_at} />
    </InnerDisplayContent>

    <InnerDisplayContent show={expired_at > 0 && dayjs().valueOf() >= expired_at && ![4, 5].includes(status)}>
      <div className="flex items-center gap-1 text-[12px] text-base-content/50">
        <Clock className="w-3 h-3" />
        {t("transaction:transactionStatus.expired")}
      </div>
    </InnerDisplayContent>

    <InnerDisplayContent show={[2, 3].includes(status)}>
      <div
        className={"text-primary text-[12px] cursor-pointer"}
        onClick={(e) => {
          e.stopPropagation();
          void navigate({ to: decodeURIComponent(jump_url) });
          onClose?.();
          return false;
        }}>{t("Free Spins")} {payload?.free_spin_code}</div>
    </InnerDisplayContent>

    <InnerDisplayContent show={[4, 5].includes(status)}>
      <span className={"text-primary text-[12px]"}>{t("bonus:completed")}</span>
    </InnerDisplayContent>

    <InnerDisplayContent show={[6].includes(status)}>
      <span className={"text-base-content/50 text-[12px]"}>{t("transaction:transactionStatus.cancelled")}</span>
    </InnerDisplayContent>
  </>);
};
