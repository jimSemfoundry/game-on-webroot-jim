import { useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ReactNode } from "react";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";

export const PromotionalSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      className="flex sm:gap-4 min-h-[130px] sm:min-h-[160px] gap-2 sm:gap-4">
      <InnerWrapper onClick={() => navigate({ to: "/explore", search: { type: "casino", category: "hot" } })}>
        <InnerSlogan title={t("common:common.casino")} subTitle={t("casino:spinPlayAndWinAcrossTopCasinoHits")} />
        <InnerNavLink onClick={() => navigate({ to: "/explore", search: { type: "casino", category: "hot" } })} />
        {/* Main illustration - responsive sizing */}
        <InnerPicture name="casino" />
        {/* Background grid mask - full coverage */}
        <InnerBgMask />
      </InnerWrapper>
      <InnerBetbyGuard />
    </div>
  );
};

const InnerBgMask = () => {
  return <img
    src="/images/illustrations/mask1.png"
    alt=""
    loading={"lazy"}
    className="absolute inset-0 w-full h-full rtl:rotate-y-180 opacity-20 object-cover"
  />;
};

const InnerSlogan = ({ title, subTitle }: { title: string, subTitle: string }) => {
  return (
    <div className="flex flex-col gap-2 z-10 relative">
      <p className="font-extrabold text-sm sm:text-base">{title}</p>
      {subTitle && <p className="hidden sm:block text-base-content/50 font-bold text-sm max-w-[320px] leading-4">
        {subTitle}
      </p>}
    </div>
  );
};

const InnerWrapper = ({ onClick, children, className }: {
  onClick: () => void,
  children: ReactNode,
  className?: string
}) => {
  return (<div
    onClick={onClick}
    className={clsx("cursor-pointer hover:bg-base-200/50 transition-colors p-4 sm:p-6 w-full rounded-xl bg-base-200 relative overflow-hidden flex flex-col justify-between gap-4", className)}>
    {children}
  </div>);
};

const InnerPicture = ({ name }: { name: string }) => {
  return <img
    className="absolute bottom-1 ltr:right-4 rtl:left-4 rtl:rotate-y-180
                     w-24 h-24
                     sm:w-30 sm:h-30 sm:ltr:right-6 sm:rtl:left-6 sm:top-1/2 sm:-translate-y-1/2
                     object-contain"
    src={`/images/illustrations/${name}.png`}
    alt={name}
  />;
};

const InnerNavLink = ({ onClick }: { onClick: () => void }) => {
  return <button
    className="btn btn-primary btn-square btn-soft btn-sm z-10 relative"
    onClick={onClick}
  >
    {/*<span className="hidden sm:inline text-xs lg:text-base">{t("common:common.explore")}</span>*/}
    <ChevronRight className="rtl:rotate-y-180 w-4 h-4" strokeWidth={3} />
  </button>;
};

/**
 * 在 Betby 不支持的地区和被体育禁止的用户将体育替换为“Live（Casino）”
 */
const InnerBetbyGuard = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  // 基础配置数据
  const { data: baseConfig } = useBaseConfig();

  return baseConfig?.data?.is_show_betby === 0
    ? (<InnerWrapper onClick={() => navigate({ to: "/explore", search: { type: "liveCasino", category: "all" } })}>
      <InnerSlogan title={t("explore:live")} subTitle={t("casino:liveDealers")} />
      <InnerNavLink onClick={() => navigate({ to: "/explore", search: { type: "liveCasino", category: "all" } })} />
      {/* Main illustration - responsive sizing */}
      <InnerPicture name="live_casino" />
      {/* Background grid mask - full coverage */}
      <InnerBgMask />
    </InnerWrapper>)
    : (<InnerWrapper onClick={() => navigate({ to: "/sports", search: { "bt-path": "/" } })}>
      <InnerSlogan title={t("common:common.sports")} subTitle={t("casino:scoreBigOnSportsFromAroundTheWorld")} />
      <InnerNavLink onClick={() => navigate({ to: "/sports", search: { "bt-path": "/" } })} />
      {/* Main illustration - responsive sizing */}
      <InnerPicture name="sport" />
      {/* Background grid mask - full coverage */}
      <InnerBgMask />
    </InnerWrapper>);
};