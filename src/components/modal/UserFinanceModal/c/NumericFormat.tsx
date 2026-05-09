import clsx from "clsx";
import { forwardRef, ReactNode, useMemo } from "react";
import { NumericFormat as _NumericFormat, NumericFormatProps } from "react-number-format";

export const o = (value: string | number, decimal = 8): string => {
  let str: string;
  if (typeof value === "number") {
    str = String(value);
  } else {
    str = value;
  }
  // 优先判断是否为科学计数法
  if (str.includes("e") || str.includes("E")) {
    const match = str.match(/[eE]([+-]?\d+)$/);
    const exponent = match ? parseInt(match[1], 10) : 0;
    // 根据指数动态调整小数位数，避免极大数产生超长字符串
    const safeDecimal = exponent > 10 ? Math.max(0, 20 - exponent) : 20;
    str = Number(str).toFixed(safeDecimal).replace(/\.?0+$/, "");
  }
  return str.indexOf(".") > -1 ? f(str, decimal) : str;
};

const f = (value: string, decimal = 8): string => {
  const regexp = /(?:\.0*|(\.\d+?)0+)$/;
  const [a, b] = value.split(".");
  const output = `${a}.${b.substring(0, decimal)}`;
  return output.replace(regexp, "$1");
};

export const NumericFormat = forwardRef<HTMLDivElement, NumericFormatProps<{
  suf?: ReactNode
  wrapCls?: string
}>>((
  {
    suf,
    wrapCls,
    ...props
  }, _ref) => {
  const final_value = useMemo(() => {
    const v1 = props.value;
    const v2 = props.decimalScale;
    if (v1 === "") return "";
    if (Number(v1) === 0) return 0;
    if (Number(v1) > 0) return o(v1!, v2);
    return props.value;
  }, [props.value, props.decimalScale]);
  return (
    <div className={clsx("flex gap-1 items-center justify-between px-4 bg-base-300 rounded-lg", wrapCls)}>
      <_NumericFormat
        {...props}
        value={final_value}
        allowNegative={false}
        className={clsx("flex-1 input px-0 border-0 rounded-none !outline-0 font-bold bg-inherit disabled:bg-inherit [&::placeholder]:text-base-content", props.className)} />
      {suf && <div className="text-base-content/70">{suf}</div>}
    </div>
  );
});

NumericFormat.displayName = "NumericFormat";
