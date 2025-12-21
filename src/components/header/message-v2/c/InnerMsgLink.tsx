import { Headphones, SquareArrowOutUpRight } from "lucide-react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { MType } from "@/components/header/message-v2/c/InnerCountdown.tsx";
import { NavigateFn, useNavigate } from "@tanstack/react-router";
import { useChatwootContext } from "@/contexts/ChatwootContext.tsx";

export const InnerMsgLink = ({ type, status, jump_url, expired_at, onClose }: {
  type: MType,
  status: number,
  jump_url: string,
  expired_at: number,
  onClose?: () => void
}) => {
  return useMemo(() => {
    if (type === "promo_code") {
      return (
        <PromoCodeLink
          end={expired_at * 1000}
          status={status}
          jump_url={jump_url}
          onClose={onClose}
        />);
    }
    if (type === "free_spins") {
      return (
        <FreeSpinsLink
          end={expired_at * 1000}
          status={status}
          jump_url={jump_url}
          onClose={onClose}
        />);
    }
    return <GeneralLink jump_url={jump_url} onClose={onClose} />;
  }, []);
};

const GeneralLink = ({ jump_url, onClose }: {
  type?: string,
  jump_url: string,
  payload?: string,
  onClose?: () => void
}) => {
  const navigate = useNavigate();

  const { toggleWidget } = useChatwootContext();

  // console.info(type)
  // console.info(payload)

  return (<div className="text-right mt-4 sticky bottom-0">
    <button className={"btn btn-primary btn-soft btn-square btn-sm"} onClick={() => {
      // TODO: promo_code free_spins
      // if (type.includes('free_spins') && payload) {
      //   const p = parser(payload)
      //   return navigate(`${paths.main.game.details}${p.inner_game_id}/${p.game_provider}`)
      // }
      if (jump_url.includes("jump-chat")) return toggleWidget();
      const isOuterLink = /^https?:\/\/.*/.test(jump_url);
      if (isOuterLink) window.open(decodeURIComponent(jump_url));
      else {
        void navigate({ to: decodeURIComponent(jump_url?.replace('/main/', '/')) });
        onClose?.();
      }
    }}>
      {jump_url === "jump-chat" ? <Headphones className="w-4 h-4" /> : <SquareArrowOutUpRight className="w-4 h-4" />}
    </button>
  </div>);
};

const FreeSpinsLink = (
  {
    end, jump_url, onClose, status
  }: {
    status: number, end: number;
    jump_url: string;
    onClose?: () => void
  }) => {
  const timerRef = useRef<any>(null);

  const navigate = useNavigate();

  const [finished, setFinished] = useState<boolean>(false);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = null;
  };

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(function() {
      const diff = dayjs(end).diff(dayjs(), "millisecond");
      if (diff <= 0) {
        stopTimer();
        setFinished(true);

        return;
      }
    }, 1_000);
  }, [end]);

  useLayoutEffect(() => {
    if (!timerRef.current && end) {
      startTimer();
    }
    return () => {
      stopTimer();
    };
  }, [end]);

  return ([5, 6].includes(status) || dayjs().valueOf() >= end)
    ? null
    : (!finished && <JumpUrl jump_url={jump_url} onClose={onClose} navigate={navigate} />);
};

const PromoCodeLink = (
  {
    end, jump_url, onClose, status
  }: {
    status: number, end: number;
    jump_url: string;
    onClose?: () => void
  }) => {
  const timerRef = useRef<any>(null);

  const navigate = useNavigate();

  const [finished, setFinished] = useState<boolean>(false);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = null;
  };

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(function() {
      const diff = dayjs(end).diff(dayjs(), "millisecond");

      if (diff <= 0) {
        stopTimer();
        setFinished(true);

        return;
      }
    }, 1_000);
  }, [end]);

  useLayoutEffect(() => {
    if (!timerRef.current && end && status === 0) {
      startTimer();
    }
    return () => {
      stopTimer();
    };
  }, [end, status]);

  return (status === 1 || dayjs().valueOf() >= end)
    ? null
    : (!finished && <JumpUrl jump_url={jump_url} onClose={onClose} navigate={navigate} />);
};

export function parser(payload: string) {
  try {
    if (!/^{.*}$/.test(payload)) return payload;
    const origin_payload = JSON.parse(payload);
    const output: any = {};
    for (const key in origin_payload) {
      if (origin_payload.hasOwnProperty(key)) {
        if (/^{.*}$/.test(origin_payload[key]))
          output[key] = parser(origin_payload[key]);
        else output[key] = origin_payload[key];
      }
    }
    return output;
  } catch (e) {
    return null;
  }
}

const JumpUrl = ({ jump_url, navigate, onClose }: {
  jump_url: string,
  navigate: NavigateFn,
  onClose?: () => void
}) => {
  return (<div className="text-right mt-4 sticky bottom-0">
    <button className={"btn btn-primary btn-soft btn-square btn-sm"} onClick={() => {
      void navigate({ to: decodeURIComponent(jump_url?.replace('/main/', '/')) });
      onClose?.();
    }}>
      <SquareArrowOutUpRight className="w-4 h-4" />
    </button>
  </div>);
};
