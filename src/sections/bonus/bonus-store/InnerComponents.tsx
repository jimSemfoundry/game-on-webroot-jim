import { Store } from "@/components/icons/Store.tsx";
import { useTranslation } from "react-i18next";
import { Info } from "@/sections/bonus/components/Info.tsx";
import clsx from "clsx";
import { useNavigate } from "@tanstack/react-router";
import { useUserBonusWallet } from "@/query/dollars.ts";
import { BonusDollarsState } from "@/sections/dollars/components.tsx";
import { useState } from "react";
// import { Decimal } from "decimal.js";
// import { useBoundStore } from "@/store";
import { CardLoading } from "@/sections/bonus/components/CardLoading.tsx";
import { BonusStoreHelpModal } from "../bonus-store/bonus-store-help-modal";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";

export const InnerSlogan = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  return <div className={"mb-2 text-sm font-semibold flex justify-between"}>
    <div className="flex gap-2 items-center">
      <Store className={"w-5 h-5 text-primary"} />
      {t("bonus:bonusStore")}
    </div>
    <span className={"cursor-pointer underline text-base-content/50"}
      onClick={() => void navigate({ to: "/dollars/bonus/history" })}>{t("common:common.history")}</span>
  </div>;
};

export const InnerProgress = ({ isCompleted }: { isCompleted: boolean }) => {
  const { t } = useTranslation();
  return <div className={""}>
    <div
      className={"text-base-content/50 text-xs font-semibold"}>{isCompleted ? t("bonus:wagerCompleted") : t("bonus:wageringProgress")}</div>
    {/* {!isCompleted && <progress className="progress progress-primary block mt-2" value={value} max={1} />} */}
  </div>;
};

export const InnerBonusCard = () => {
  const navigate = useNavigate();

  // const setSyncAction = useBoundStore((state) => state.setSyncAction);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  const { t } = useTranslation();
  const bonusStoreImg = useBonusDetailsImage("bonus_store", 96);

  // 彩金钱包数据
  const { data: bonusWallet, isLoading } = useUserBonusWallet();

  // const progress = useMemo(() => {
  //   const a = Decimal(bonusWallet?.data?.wager || 0);
  //   const b = Decimal(bonusWallet?.data?.wager_require || 0);
  //   if (a.eq(0) || b.eq(0)) return 0;
  //   const c = a.div(b).toNumber();
  //   return Math.min(1, c);
  // }, [bonusWallet?.data?.wager, bonusWallet?.data?.wager_require]);

  const is_pending_collection = bonusWallet?.data?.status === BonusDollarsState.pending_collection;

  return isLoading ? <CardLoading /> : <div
    className={clsx("flex items-center justify-between min-h-[104px] sm:min-h-[140px] bg-base-200 rounded-2xl p-4 gap-2",
      { "items-center": !bonusWallet?.data || is_pending_collection })}
  >

    <div className={"flex flex-col gap-4 flex-1"}>
      <div className="flex items-center gap-4 w-full">
        <img
          src={bonusStoreImg}
          loading="lazy"
          decoding="async"
          className="w-15 h-15 object-cover"
        />
        <h2 className={clsx("text-sm leading-5 font-bold uppercase", { "!text-lg whitespace-pre-line": !bonusWallet?.data })}>
          {t("bonus:bonusStore")}
        </h2>
      </div>

      {bonusWallet?.data && <InnerProgress isCompleted={is_pending_collection} />}
    </div>

    <div className="flex flex-col items-end justify-between self-stretch gap-2">
      {/* 活动信息提示 */}
      {/* <button className={"btn btn-square bg-transparent border-none btn-sm"}
        onClick={() => setSyncAction("OPEN_BONUS_STORE_MODAL")}><Alert /></button> */}
             <Info
                  className=""
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsStoreModalOpen(true);
                  }} />

      {/* 活动入口链接 */}
      <button
        className={"btn btn-primary btn-md px-5 rounded-field self-center min-w-20 h-10"}
        onClick={() => void navigate({ to: "/dollars/bonus" })}>
        {is_pending_collection
          ? t("bonus:claim")
          : t("bonus:go")}
      </button>
    </div>
    <BonusStoreHelpModal isOpen={isStoreModalOpen} onClose={() => setIsStoreModalOpen(false)} />
  </div>;
};