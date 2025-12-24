import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import StorageExtend from "./StorageExtend.ts";
// import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { sleep } from "@/components/socialLogin/helper.ts";
import styled from "styled-components";
import { useAuthModals } from "@/contexts/ModalsProvider.tsx";
import { X } from "lucide-react";
import { useBoundStore } from "@/store";

export default function WelcomeSignUpModal() {
  const ref = useRef<HTMLDialogElement>(null);

  // const { t } = useTranslation();

  const { isAuthenticated } = useAuth();

  const { openSignUpModal } = useAuthModals();

  // from data store, share common data
  const { syncAction } = useBoundStore();

  const [radio, isRadio] = useState<boolean>(false);

  // 事件通知
  useEffect(() => {
    if (!isAuthenticated && syncAction.type === "OPEN_WELCOME_SIGN_UP_MODAL") {
      ref.current?.showModal();
    }
  }, [syncAction, isAuthenticated]);

  return <dialog ref={ref} className="modal" onClose={() => ref.current?.close()}>
    <StyledBackground1
      className="modal-box p-6 rounded-xl relative flex flex-col overflow-hidden gap-6 max-w-[400px]">
      <CloseBtn onClick={() => ref.current?.close()} />
      <div className="relative min-h-90 flex flex-col gap-6 items-center justify-end">
        <div className="z-1 p-5 rounded-xl bg-black/60">
          <StyledBackground2 className="text-4xl font-lobster text-center font-extrabold">
            {/*{t("casino:registrationBonus")}*/}
            Registration<br />Bonus
          </StyledBackground2>

          <p
            className="text-center text-sm font-extrabold mt-4 whitespace-pre-line">
            {/*{t("casino:freeSpinsAwaitYou")}*/}
            Your Free Spins<br />
            Await You
          </p>
        </div>
        {/* 小仙女 */}
        <img src={`https://1stgame.imgix.net/popup/default/little_fairy.png`}
             alt="" className="w-36 absolute -left-20 rotate-10 -top-[24%]" />

        {/* 小魔女 */}
        <img src={`https://1stgame.imgix.net/popup/default/little_witch.png`}
             alt="" className="w-34 absolute -right-20 -rotate-10 top-0" />

        {/* 宙斯大爷 */}
        <img
          src={`https://1stgame.imgix.net/popup/default/zeus2.png`}
          alt="" className="w-85 absolute -bottom-6 max-w-none"
        />

        <div className="flex flex-col gap-14 justify-center z-1">
          <div className={"text-center"}>
            <button className="btn btn-primary" onClick={() => {
              openSignUpModal()
              ref.current?.close()
            }}>
              {/*{t("casino:claimNow")}*/}
              Claim Now
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10px] bg-base-300/70 rounded-full p-1 cursor-pointer font-bold"
               onClick={() => {
                 if (!radio) {
                   StorageExtend.getInstance().setItem({
                     key: "DoNotRemainMeToday",
                     value: true,
                     expired: dayjs().endOf("day").valueOf()
                   });
                 } else {
                   StorageExtend.getInstance().removeItem("DoNotRemainMeToday");
                 }
                 radio ? isRadio(false) : isRadio(true);
               }}>
            <input
              type="checkbox"
              checked={radio}
              className="checkbox checkbox-xs border checkbox-primary"
              onChange={() => null}
            />
            {/*{t("casino:notRemainToday")}*/}
            Do Not Remind Me Again Today
          </div>
        </div>
      </div>
    </StyledBackground1>
  </dialog>;
}

const StyledBackground1 = styled.div`
    background: linear-gradient(175deg, color(display-p3 0.1686 0.1725 0.4314) -1.75%, color(display-p3 0.0549 0.0667 0.1843) 54.33%);
`;

const StyledBackground2 = styled.div`
    background: linear-gradient(183deg, color(display-p3 0.7176 0.8824 1) 2.12%, color(display-p3 0.498 0.7765 1) 57.21%, color(display-p3 0.8431 0.9529 1) 102.79%);
    background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0px 4px 0px #0E00BD);
`;

const CloseBtn = ({ onClick }: { onClick?: () => void }) => {
  return (<div className="flex w-full justify-end z-1">
      <button className="btn btn-sm btn-square" onClick={onClick}>
        <X size={16} />
      </button>
    </div>
  );
};

export const WelcomeSignUp = () => {
  const { setSyncAction } = useBoundStore()

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fn = async () => {
      await sleep(1500);
      setSyncAction('OPEN_WELCOME_SIGN_UP_MODAL')
    };
    if (!isAuthenticated && !StorageExtend.getInstance().getItem("DoNotRemainMeToday")) void fn();
  }, [isAuthenticated]);

  return null
}