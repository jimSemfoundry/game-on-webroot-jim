import clsx from "clsx";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export const NothingFound = ({ text, icon, className }: { text?: ReactNode, icon?: string, className?: string }) => {
  const { t } = useTranslation();
  return <div
    className={clsx("absolute inset-0 flex flex-col gap-2 items-center justify-center bg-base-300 rounded-xl text-xs text-base-content/50 font-semibold", className)}>
    {icon && <img src={icon} alt="" className={"max-w-8"} />}
    <span>{text || t("common:common.noData")}</span>
  </div>;
};
