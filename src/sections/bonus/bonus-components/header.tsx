
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { ChevronDown } from 'lucide-react'
import { useState } from "react";

export function BonusListHeader({
  className,
  icon,
  title,
  hasHistory,
  hasArrow,
  jumpTo,
  children,
  childrenClassName
}: {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  hasHistory?: boolean;
  hasArrow?: boolean;
  jumpTo?: () => void;
  children?: React.ReactNode;
  childrenClassName?: string;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  return (
    <details open={hasArrow ? isOpen : true} className={clsx(
      "collapse group",
      className
    )}>
      <summary
        className="collapse-title flex flex-row items-center justify-between px-3 h-[52px] rounded-lg w-full bg-base-200 "
        onClick={(e) => {
          e.preventDefault();
          if (hasArrow) setIsOpen((v) => !v);
        }}
      >
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-base sm:text-lg font-semibold first-letter:uppercase">{title}</p>
        </div>
        <div className="flex items-center gap-4">
          {hasHistory &&
            <button
              type="button"
              className="text-sm sm:text-lg font-semibold text-base-content/50 underline capitalize"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                jumpTo?.();
              }}
            >
              {t("common:common.history")}
            </button>}
          {hasArrow && <ChevronDown className="h-4 w-4 shrink-0 text-base-content/50 transition-transform duration-200 group-open:rotate-180" />}
        </div>
      </summary>
      <div className="collapse-content px-0 pt-3 pb-4">
        <div className={childrenClassName}>
          {children}
        </div>
      </div>
    </details>
  );
}

