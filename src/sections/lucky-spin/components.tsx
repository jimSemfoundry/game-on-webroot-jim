// 时尚深色配色，不重复
import styled from "styled-components";
import { ReactNode } from "react";
import clsx from "clsx";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";

export const deepColors = [
  "#932F90",
  "#C95587",
  "#B64D62",
  "#DEAA6F",
  "#D9CB6D",
  "#ABBB5B",
  "#5A9F4C",
  "#58AD9C",
  "#53A5AA",
  "#4884B4",
  "#3F56A7",
  "#3F56A7",
  "#864FBE",
];

// 旋转动画配置常量
export const SPIN_BUFFER = 200;
export const SPIN_DURATION = 4000;
export const SPIN_WHEEL_CONFIG = {
  borderColor: "transparent",
  borderWidth: 20,
  lineColor: "rgba(255,255,255,0.18)",
  lineWidth: 1.5,
  radius: 0.86,
  itemLabelRadius: 0.55,
  itemLabelRadiusMax: 0.28,
  itemLabelFontSizeMax: 18,
  itemLabelColors: ["#ffffff"],
  itemLabelStrokeColors: ["rgba(0,0,0,0.8)"],
  itemLabelStrokeWidth: 0.6,
  itemLabelAlign: "right",
  itemLabelBaselineOffset: -0.06,
  rotationSpeedMax: 700,
  pointerAngle: 90,
  isInteractive: false
};
export const SPIN_CURRENCY = new Set(["crypto", "fiat", "currency"]);
export const SPIN_RADIALS = {
  "normal": "radial-gradient(157.05% 100% at 0% 46.47%, color(display-p3 0.2667 0.5922 0.3882 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))",
  "mega": "radial-gradient(157.05% 100% at 0% 46.47%, color(display-p3 0.9223 0.3266 0.756 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))"
};
export const SPIN_TYPE_ICON = {
  "normal": "/images/lucky-spin/roulette1.png",
  "mega": "/images/lucky-spin/roulette2.png"
};

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export function imageScale(p?: Record<string, any>) {
  return (p?.prize_type === "currency" || p?.prize_type === "crypto") ? 0.25 : 0.75;
}

export function getPrizeImageUrl(extra_data: Record<string, any>, user_currency?: string): string {
  // TODO: 用户的结算币
  if (user_currency && SPIN_CURRENCY.has(extra_data?.prize_type) && extra_data?.prize_name === "User Currency") {
    return `/icons/currency/${user_currency?.toLowerCase()}.png`;
  }

  return SPIN_CURRENCY.has(extra_data?.prize_type)
    ? `/icons/currency/${extra_data?.prize_currency?.toLowerCase()}.png`
    : extra_data?.prize_icon ?? "";
}

export function getPrizeLabel(extra_data: Record<string, any>): string {
  return SPIN_CURRENCY.has(extra_data?.prize_type)
    ? extra_data?.prize_currency
    : extra_data?.prize_type === "physical_item" ? extra_data?.prize_name : extra_data?.prize_type;
}

export function getPrizePrefix(extra_data: Record<string, any>): string {
  return SPIN_CURRENCY.has(extra_data?.prize_type)
    ? "+"
    : "";
}

export const maskUsername = (username: string) => {
  if (!username || username.length <= 2) return username;
  const firstChar = username[0];
  const lastChar = username[username.length - 1];
  const maskLength = username.length - 2;
  return `${firstChar}${"*".repeat(maskLength)}${lastChar}`;
};

export const InnerConfirmBox = styled(ConfirmBox)<{ $type: string }>`
    background: ${(props) => props.$type === "normal"
  ? "url(\"/images/lucky-spin/lucky-btn.png\") no-repeat"
  : "url(\"/images/lucky-spin/mega-btn.png\") no-repeat"};
    background-size: 100% 100%
`;

export const InnerBonusContainer = styled.div`
    background: url('/images/lucky-spin/spins.png') no-repeat top right;
    position: relative;
    background-size: 160px 160px;
`;

export const InnerCoinsContainer = styled.div`
    background: url('/images/lucky-spin/coins.png') no-repeat;
    background-position: center -30px;
`;

export const InnerBackgroundContainer = styled.div`
    background: linear-gradient(175deg, color(display-p3 0.226 0.2013 0.3357) -1.75%, color(display-p3 0.3059 0.0549 0.298) 54.33%);
    box-shadow: 0 4px 250px 1000px color(display-p3 0 0 0 / 0.50);
`;

export const InnerWinnerContainer = styled.div`
    background: url('/images/lucky-spin/board.png') no-repeat bottom center;
`;

export const InnerTextClipContainer = styled.div`
    background: linear-gradient(180deg, color(display-p3 1 1 1) 0%, color(display-p3 1 0.9628 0.6815) 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;

export const InnerBonusSlogan = () => {
  const { t } = useTranslation();
  return <h3 className={"pl-3 font-extrabold text-[18px] text-base-content leading-5 whitespace-pre-line uppercase"}>
    {t("luckySpin:fortune")}
  </h3>;
};

export const InnerContainer = styled.div<{ $type: string }>`
    background: ${(props) => props?.$type === "mega"
            ? "radial-gradient(104.83% 55.32% at 49.87% 44.68%, color(display-p3 0.4549 0.0672 0.4894) 0%, var(--d-color-base-200, color(display-p3 0.0941 0.1137 0.1412)) 100%)"
            : "radial-gradient(104.83% 55.32% at 49.87% 44.68%, color(display-p3 0 0.2784 0.1216) 0%, var(--d-color-base-200, color(display-p3 0.0941 0.1137 0.1412)) 100%)"};
`;

export const InnerBonusItem = ({ icon, value, extra, onClick }: {
  icon?: ReactNode,
  value?: ReactNode,
  extra?: ReactNode,
  onClick?: () => void
}) => {
  return <div
    onClick={onClick}
    className={"font-semibold flex items-center gap-1 text-xs text-base-content/50 rounded-lg px-2 py-1.5 bg-base-200 flex-shrink-0"}>
    {icon}
    {value}
    {extra}
  </div>;
};

export const InnerDataCard = ({ children, className }: { children?: ReactNode, className?: string }) => {
  return <div className={clsx("p-4 bg-base-200 rounded-xl flex justify-between items-center font-semibold", className)}>
    {children}
  </div>;
};

export const InnerSpinsData = ({ name, count }: { name?: string, count?: ReactNode }) => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  return <div className="text-base-content flex flex-col gap-2">
    <span className="text-lg font-extrabold">{name}</span>
    <div className="flex items-center gap-1">
      <img src={SPIN_TYPE_ICON[name?.toLowerCase()?.includes("lucky") ? "normal" : "mega"]} className={"w-6 h-6"} />
      <span>x {count}</span>
    </div>
    <span className={"underline cursor-pointer text-xs font-semibold"}
          onClick={() => void navigate({ to: "/lucky-spin/history" })}>{t("common:common.history")}</span>
  </div>;
};

export const InnerSpinsType = ({ icon, title, active, extra, onClick, className }: {
  icon?: ReactNode,
  title?: ReactNode,
  active?: boolean,
  extra?: ReactNode,
  onClick: () => void
  className?: string
}) => {
  return <div
    onClick={onClick}
    className={clsx("relative text-sm cursor-pointer border border-1 border-base-100 px-3 py-2 rounded-lg bg-base-300 flex gap-1 items-center justify-center", { "spin-wheel-active": active }, className)}>
    {icon}<span className={""}>{title}</span>
    {extra}
  </div>;
};

export const InnerDataLoading = () => {
  return <div
    className="absolute inset-0 flex items-center justify-center rounded-xl overflow-hidden">
    <span className="loading loading-spinner loading-xl text-primary" />
  </div>;
};

export const InnerCounterLabel = ({ data, className }: { data: Record<string, any>, className?: string }) => {
  const { t } = useTranslation();

  return <div
    className={clsx("text-primary font-bold", className)}>
    {t(`luckySpin:${getPrizeLabel(data)}`)}{" "}x{data?.prize_value}</div>;
};

export const InnerPrizeDisplay = ({ data, className }: {
  data: Record<string, any>,
  className?: string,
}) => {
  const { t } = useTranslation();

  const { formatCurrency } = useCurrencyData();

  if (SPIN_CURRENCY.has(data?.prize_type)) {
    const format = formatCurrency({
      amount: data?.prize_value,
      currency: data?.prize_currency,
      showSymbol: false, showCode: true
    });

    return (
      <div className={clsx("text-primary font-bold", className)}>
        {getPrizePrefix(data) + format.formatted}
      </div>
    );
  }

  if (data?.prize_type === "free_spin") {
    return <div className={clsx("text-primary font-bold", className)}>{t(`luckySpin:${getPrizeLabel(data)}`)}</div>;
  }

  return <InnerCounterLabel data={data} className={className} />;
};