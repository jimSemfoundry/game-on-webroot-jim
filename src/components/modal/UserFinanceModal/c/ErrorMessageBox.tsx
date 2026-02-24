import { clsx } from "clsx";
import { ReactNode } from "react";

export const ErrorMessageBox = (
  {
    show,
    sample,
    content,
    className
  }: {
    show: boolean;
    sample?: boolean;
    content: ReactNode;
    className?: string;
  }) => {
  return (
    <div
      className={clsx("w-full text-warning text-[11px] font-semibold", className,
        show ? "block" : "hidden",
        sample ? "whitespace-normal static mt-1 tracking-tighter leading-tight" : "truncate absolute",
      )}>
      {content}
    </div>
  );
};
