import classNames from "classnames";
import { ReactNode } from "react";

export const ErrorMessageBox = (
  {
    show,
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
      className={classNames("mt-1 text-error/55 text-[11px] font-extrabold font-sans", className, show ? "block" : "hidden")}>
      {content}
    </div>
  );
};
