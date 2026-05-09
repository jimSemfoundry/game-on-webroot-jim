import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { ReactNode } from "react";
import clsx from "clsx";

export const StyledBackground = styled.div`
    position: relative;
    overflow: hidden;
    border-radius: 0 0 11px 11px;
    background: var(--color-base-200);
    box-shadow:
      inset 0 -12px 22px rgba(0, 0, 0, 0.18),
      0 6px 18px rgba(0, 0, 0, 0.18);

    @media (min-width: 768px) {
      border-radius: 11px !important;
    }
`;

export const InnerBuddyBallsContainer = styled.div`
    background: url('/images/bonus/buddy-balls.png') no-repeat;
    background-position: right 20px top 20px;
    position: relative;
`;

export const InnerBuddyBallsSlogan = () => {
  const { t } = useTranslation(["buddyBalls"]);
  return <h3 className={"pl-3 font-extrabold text-[18px] text-base-content leading-5 whitespace-pre-line uppercase"}>
    {t("buddyBalls:buddyBalls")}
  </h3>;
};

export const InnerItemWrap = ({ label, value, className }: {
  label?: string,
  value: ReactNode,
  className?: string
}) => {
  return <div className="flex justify-between text-xs font-semibold">
    <span className={"truncate"}>{label}</span>
    <span className={clsx("text-end", className)}>{value}</span>
  </div>;
};

export const InnerDataIsNull = () => {
  const { t } = useTranslation(["buddyBalls"]);
  return <div
    className="absolute inset-0 flex items-center justify-center bg-base-300 rounded-xl overflow-hidden text-xs text-base-content/50 font-semibold">
    {t("common:common.noData")}
  </div>;
};

export const InnerDataLoading = () => {
  return <div
    className="absolute inset-0 flex items-center justify-center rounded-xl overflow-hidden">
    <span className="loading loading-spinner loading-xl text-primary" />
  </div>;
};