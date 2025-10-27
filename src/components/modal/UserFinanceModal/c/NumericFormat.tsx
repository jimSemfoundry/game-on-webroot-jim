import classNames from "classnames";
import { forwardRef, ReactNode, useMemo } from "react";
import { NumericFormat as _NumericFormat, NumericFormatProps } from "react-number-format";
import Decimal from "decimal.js";

export const NumericFormat = forwardRef<HTMLDivElement, NumericFormatProps<{ suf?: ReactNode }>>((
  {
    suf,
    className,
    ...props
  }, _ref) => {
  const final_value = useMemo(() => {
    const v1 = props.value ?? 0
    const v2 = props.decimalScale ?? 0
    if (Number(v1) > 0 && Number(v2) > 0) return Decimal(v1).toDP(v2, Decimal.ROUND_DOWN).toString();
    return props.value
  }, [props.value, props.decimalScale]);
  return (
    <div className="relative flex items-center">
      <_NumericFormat
        {...props}
        value={final_value}
        className={classNames("w-full px-4 bg-base-300 input border-0 !outline-0 text-sm font-bold", className)} />
      {suf && <div className="z-1 absolute ltr:right-4 rtl:left-4 text-base-content/70">{suf}</div>}
    </div>
  );
});

NumericFormat.displayName = "NumericFormat";
