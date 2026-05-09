import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";
import { Alert } from "@/components/icons/Alert.tsx";
import { useTranslation } from "react-i18next";

export const PromoOptionEntry = ({ icon, title, onClick, onExpand, countdown, extraNode }: {
  icon?: string,
  title: string,
  onClick?: () => void,
  onExpand?: () => void,
  countdown?: ReactNode
  extraNode: ReactNode
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <div className={"bg-base-300 rounded-lg flex px-2 py-2 cursor-pointer"}>
        <div className={"flex gap-1 items-center justify-between w-full"} onClick={onExpand}>
          <div className="flex gap-2 items-center">
            <img src={icon || "/icons/ui/gift-box.png"} alt="" className={"w-6 h-6"} />
            <div className="flex flex-col gap-1">
              <p
                className="flex gap-2 items-center text-xs text-base-content font-extrabold"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.();
                  return false;
                }}>
                {title}
                {onClick && <Alert className={"w-4 h-4 text-base-content/50"} />}
              </p>
              <div className={"flex gap-1 flex-wrap"}>
                {extraNode}
              </div>
              {countdown}
            </div>
          </div>
          {onClick && <ChevronRight className="w-5 h-5 text-base-content/50" />}
        </div>
      </div>
      <div className="text-warning text-[11px] font-semibold mt-2">
        {t("finance:met_eligibility")}
      </div>
    </div>
  );
};

