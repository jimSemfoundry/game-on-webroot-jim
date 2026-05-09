import { useTranslation } from "react-i18next";
import { Info } from "@/sections/bonus/components/Info.tsx";
import clsx from "clsx";
import { useNavigate } from "@tanstack/react-router";
import { useUserSportWallet } from "@/query/sports-bonus.ts";
import { BonusDollarsState } from "@/sections/dollars/components.tsx";
import { useState } from "react";
import { CardLoading } from "@/sections/bonus/components/CardLoading.tsx";
import { SportsBonusHelpModal } from "@/sections/sports-bonus/sports-bonus-store/SportsBonusHelpModal.tsx";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import { useBonusDetailsImage } from "@/hooks/api/useBonusDetailsImage";

const InnerProgress = ({ isCompleted }: { isCompleted: boolean }) => {
  const { t } = useTranslation();
  return (
    <div>
      <div className="text-base-content/50 text-xs font-semibold">
        {isCompleted ? t("bonus:wagerCompleted") : t("bonus:wageringProgress")}
      </div>
    </div>
  );
};

export const SportsBonusCard = () => {
  const navigate = useNavigate();

  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  const { t } = useTranslation(['sportsBonus']);

  const { data: sports, isLoading } = useUserSportWallet();

  const is_pending_collection = sports?.data?.status === BonusDollarsState.pending_collection;

  // 基础配置数据
  const { data: baseConfig } = useBaseConfig();
  const sportsBonusImg = useBonusDetailsImage("sports_bonus", 96);

  // TODO: 是否开启betby来控制彩金页面中体育活动的入口
  const is_show_betby = baseConfig?.data?.is_show_betby !== 0;

  return is_show_betby && (isLoading ? (
    <CardLoading />
  ) : (
    <div
      className={clsx(
        "flex items-center justify-between min-h-[104px] sm:min-h-[140px] bg-base-200 rounded-2xl p-4 gap-2",
        { "items-center": !sports?.data || is_pending_collection }
      )}
    >
      <div className="flex flex-col gap-4 flex-1">
        <div className="flex items-center gap-4 w-full">
          <img
            src={sportsBonusImg}
            loading="lazy"
            decoding="async"
            className="w-15 h-15 object-cover"
          />
          <h2
            className={clsx("text-sm leading-5 font-bold uppercase", {
              "!text-lg whitespace-pre-line": !sports?.data
            })}
          >
            {t("sportsBonus:bonus")}
          </h2>
        </div>

        {sports?.data && <InnerProgress isCompleted={is_pending_collection} />}
      </div>

      <div className="flex flex-col items-end justify-between self-stretch gap-2">
        <Info
          className=""
          onClick={(e) => {
            e.stopPropagation();
            setIsStoreModalOpen(true);
          }}
        />

        <button
          className="btn btn-primary btn-md px-5 rounded-field self-center min-w-20 h-10"
          onClick={() => void navigate({ to: "/dollars/sports-bonus" })}
        >
          {is_pending_collection ? t("bonus:claim") : t("bonus:go")}
        </button>
      </div>
      <SportsBonusHelpModal isOpen={isStoreModalOpen} onClose={() => setIsStoreModalOpen(false)} />
    </div>
  ));
};
