import React from "react";
import classNames from "classnames";

export function Card({ icon, title, children, className }: {
  icon?: React.ReactNode,
  title?: string,
  children: React.ReactNode,
  className?: string
}) {
  return (
    <div className={classNames("rounded-xl bg-base-200 p-3 flex flex-col gap-3 md:p-6 md:gap-4", className)}>
      {(icon || title) && (
        <div className="flex gap-2 items-center text-base-content/80 font-semibold text-sm md:text-lg">
          {icon}
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
