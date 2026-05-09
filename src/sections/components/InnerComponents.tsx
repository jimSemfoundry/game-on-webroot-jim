import { ReactNode } from "react";
import clsx from "clsx";

export const InnerBonusParams = ({ children, className }: { children: ReactNode, className?: string }) => {
  return <div
    className={clsx("inline-flex rounded-sm bg-primary/20 px-1 py-0.5 text-[11px] font-bold tracking-tighter text-primary", className)}>{children}</div>;
};