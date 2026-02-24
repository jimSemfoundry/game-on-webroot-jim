import { ComponentProps, ReactNode, useState } from "react";
import clsx from "clsx";
import styled from "styled-components";
import { X } from "lucide-react";
import Iconify from "@/components/iconify";
import { useTranslation } from "react-i18next";
import { Alert } from "@/components/icons/Alert.tsx";
import { useBoundStore } from "@/store";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";

export const InnerTitle = ({ title, className }: { title: ReactNode, className?: string }) => {
  return <h3
    className={clsx("text-base text-white font-semibold flex items-center gap-1 mt-3", className)}>{title}</h3>;
};

export const RadialGradientContainer = styled.div`
    background: radial-gradient(100.35% 100% at 100% 50%, var(--d-color-semantic-primary-bg, color(display-p3 0.7702 0.8775 0.1745 / 0.20)) 0%, var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098 / 0.20)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098));
`;

export const InnerClose = (props: ComponentProps<"button">) => {
  return (<button {...props} className="btn btn-sm btn-square bg-base-100"><X size={16} /></button>);
};

export const InnerLabel = ({ title, subTitle, className }: { title: string, subTitle: string, className?: string }) => {
  return <div className={clsx("bg-base-200 rounded-field p-3", className)}>
    <p className="text-xs text-base-content/50 mb-1 font-bold">{title}</p>
    <p className="text-sm font-extrabold text-primary">{subTitle}</p>
  </div>;
};

export const InnerPicture = ({ name, className }: { name: string, className?: string }) => {
  return <img
    src={`/images/bonus/${name}.png?w=209&auto=format,compress&q=80`}
    className={clsx("h-full absolute right-0 rtl:-left-5 rtl:right-auto", className)} alt={""} />;
};

export const InnerHeader = () => {
  const { t } = useTranslation();
  return <div className="flex items-center gap-2">
    <Iconify icon="custom:bonus" className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
    <span className="text-sm font-bold">{t("bonus:welcomeBonus")}</span>
  </div>;
};

export const InnerOption = ({ name, type, title, subTitle, children, checked: _checked, onChecked }: {
  type: TBonus,
  name: TBonus,
  title: string,
  checked?: boolean,
  subTitle: string,
  children?: ReactNode,
  onChecked?: (checked: boolean) => void,
}) => {
  const openModal = useBoundStore((state) => state.openModal);

  const [uncontrolledChecked, setUncontrolledChecked] = useState<boolean>(false);

  const isControlled = _checked != null;
  const checked = _checked ?? uncontrolledChecked;

  const setChecked = (next: boolean) => {
    if (!isControlled) setUncontrolledChecked(next);
    onChecked?.(next);
  };

  return <div
    className="bg-base-200 rounded-field py-2 px-3 flex items-center gap-5 cursor-pointer select-none"
    onClick={() => {
      setChecked(!checked);
    }}
  >
    <input
      type="checkbox"
      className="checkbox checkbox-sm checkbox-primary rounded-sm"
      checked={checked}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        setChecked(e.target.checked);
      }}
    ></input>
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-1">
        {children}
        <div>
          <p className="text-[13px] font-bold">{title}</p>
          <p className="text-[11px] font-bold text-primary leading-4">{subTitle}</p>
        </div>
      </div>

      {/* 活动详情 */}
      <InnerDisplayContent show={!type.includes("none_bonus")}>
        <button
          className={"btn btn-square bg-base-400"}
          onClick={(e) => {
            e?.stopPropagation();
            openModal(BONUS_TYPE_MODAL_MAP[name]);
            return false;
          }}>
          <Alert />
        </button>
      </InnerDisplayContent>
    </div>
  </div>;
};

export type TBonus = "free_bonus" | "mini_bonus" | "mega_bonus" | "none_bonus"

export const BONUS_WALLET_INFO_MAP: Record<TBonus, any> = {
  "free_bonus": {
    id: 1,
    title: "bonus:freePlayBonus",
    subTitle: "bonus:noDepositBonus"
  },
  "mini_bonus": {
    id: 2,
    title: "bonus:miniSlotBonus",
    subTitle: "bonus:depositSlotBonus"
  },
  "mega_bonus": {
    id: 3,
    title: "bonus:megaSlotBonus",
    subTitle: "bonus:depositSlotBonus"
  },
  "none_bonus": {
    id: 4,
    title: "bonus:restrictions1",
    subTitle: "bonus:restrictions2"
  }
};

export const BONUS_TYPE_MODAL_MAP: Record<TBonus, any> = {
  free_bonus: "OPEN_FREE_PLAY_BONUS_MODAL",
  mini_bonus: "OPEN_MINI_SLOT_BONUS_MODAL",
  mega_bonus: "OPEN_MEGA_SLOT_BONUS_MODAL",
  none_bonus: ""
};

export enum EBonus {
  NONE = "none_bonus",
  MINI = "mini_bonus",
  MEGA = "mega_bonus",
  FREE = "free_bonus",
  TOKEN = "BONUS",
  GIVE_UP = "give_up_bonus"
}