import classNames from "classnames";
import { ReactNode } from "react";
import { Search } from "lucide-react";

export const NoData = ({ text, className }: { text: ReactNode, className?: string }) => {
  return (<div
    className={classNames("flex items-center justify-center font-semibold text-xs text-base-content/50 gap-1 py-4 bg-base-400/50 rounded-field", className)}>
    <Search className="w-4 h-4" />{text}
  </div>);
};
