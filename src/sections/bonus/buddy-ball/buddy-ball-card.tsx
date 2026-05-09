import { useTranslation } from "react-i18next";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { useNavigate } from "@tanstack/react-router";
import { useBoundStore } from "@/store";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";

export function BuddyBallCard() {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const buddyBallsImg = useBonusDetailsImage("buddy_balls", 96);

  const openModal = useBoundStore((state) => state.openModal);

  return (
    <div className="flex items-center justify-between h-[104px] sm:h-[140px] bg-base-200 rounded-2xl p-4 gap-2">
      <div className={"flex flex-col items-center w-full flex-1 self-stretch  justify-center"}>
        <div className="flex items-center gap-4 w-full">
          <img
            src={buddyBallsImg}
            loading="lazy"
            decoding="async"
            className="w-15 h-15 object-cover"
          />
          <div className="text-base-content whitespace-pre-line font-bold text-lg leading-5 uppercase">
            {t("buddyBalls:buddyBalls")}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between self-stretch gap-2">
        <Info
          className=""
          onClick={(e) => {
            e.stopPropagation();
            openModal("OPEN_BUDDY_BALLS_MODAL")
          }} />
        <button className="btn btn-primary btn-md px-5 rounded-field self-center min-w-20 h-10"
                onClick={() => void navigate({ to: "/buddy-balls" })}>
          {t("bonus:go")}
        </button>
      </div>
    </div>
  );
}