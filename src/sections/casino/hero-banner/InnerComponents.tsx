import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext.tsx";
import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import { useNavigate } from "@tanstack/react-router";
import { useBoundStore } from "@/store";
import { useAuthModals, useFinanceModal } from "@/contexts/ModalsProvider.tsx";
import { ComponentProps, useCallback } from "react";
import { randomString } from "@/components/modal/UserFinanceModal/helper.ts";
import { bonus_dollars_router_path } from "@/sections/dollars/bonus-wallet.tsx";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";
import { getImgCompressParams } from "@/utils/helper.ts";

export const InnerBannerButton = ({ banner }: { banner: Record<string, any> }) => {
  const { t } = useTranslation();

  const { navigate } = useNavigateGuard();

  // TODO: 多个按钮的情况未支持
  return <button
    onClick={() => navigate(banner?.button_list[0]?.button_link, true)}
    className={clsx("btn btn-primary btn-md px-2 rounded-md gap-2 font-bold", {
      "btn-xs rounded-md": banner?.button_list?.length > 1,
      "btn-outline": banner?.button_list[0]?.button_text?.toLowerCase()?.includes("more_info")
    })}>
    {t(`banner:${banner?.button_list[0]?.button_text}`)}
    <ChevronRight size={12} className="rtl:rotate-y-180" strokeWidth={4} />
  </button>;
};

export const InnerBannerWrapper = (props: ComponentProps<"div">) => {
  return <div
    className={clsx("w-full rounded-xl px-4 py-6 relative h-[209px] overflow-hidden bg-base-200", props.className)}
    style={{
      isolation: "isolate",
      background:
        `linear-gradient(120deg,
  var(--color-base-200) 0%,
  var(--color-base-200) 52.8%,
  
  color-mix(in oklch, var(--color-primary) 10%, transparent) 53.2%,
  color-mix(in oklch, var(--color-primary) 10%, transparent) 81.8%,
  
  color-mix(in oklch, var(--color-primary) 40%, transparent) 82.2%,
  color-mix(in oklch, var(--color-primary) 40%, transparent) 87.8%,
  
  color-mix(in oklch, var(--color-primary) 20%, transparent) 88.2%,
  color-mix(in oklch, var(--color-primary) 20%, transparent) 92.8%,
  
  color-mix(in oklch, var(--color-primary) 10%, transparent) 93.2%,
  color-mix(in oklch, var(--color-primary) 10%, transparent) 100%
)`
    }}>{props?.children}</div>;
};

export const InnerBannerContent = (props: ComponentProps<"div">) => {
  return <div
    className="flex gap-1 flex-col justify-between h-full relative z-40">{props?.children}</div>;
};

export const InnerBannerTitle = ({ list, data, banner, className }: {
  list: Record<string, any>[],
  data: Record<string, any>,
  banner: Record<string, any>,
  className?: string
}) => {
  return <div className="flex flex-col whitespace-pre-line font-black leading-5 ">{
    list.map((item, index) => {
      if (item?.text) return (
        <p className={clsx("text-base-content rtl:ml-auto", className)} key={index}>
          <InnerDataTranslation
            text={`banner:${item?.text}`}
            value={banner?.value || 0}
            percent={(((data?.extra_data?.bonus_rate || 0) * 100) || (banner?.percent || 0)) + "%"}
            fiat_bonus={banner?.fiat_bonus}
            crypto_bonus={banner?.crypto_bonus}
          />
        </p>);
    })
  }</div>;
};

export const InnerBannerBrands = ({ type, banner }: { type: string, banner: Record<string, any> }) => {
  return (type.endsWith("_regional") || type.endsWith("_betting_partner")) &&
    <div className="absolute z-20 top-[90px] max-w-40 flex flex-col items-center gap-4 rtl:left-4">
      <img src={banner?.float_image_list[1]?.mobile_image} alt="" loading="lazy" decoding="async"
           className="max-w-[30px]" />
      <img src={banner?.float_image_list[2]?.mobile_image} alt="" loading="lazy" decoding="async"
           className="max-h-[30px]" />
    </div>;
};

export const InnerBannerPerson = ({ src }: { src: string }) => {
  return <img
    src={getImgCompressParams(src, 209, 80)} alt="" fetchPriority="high"
    className={`absolute z-20 top-0 right-0 h-[209px] w-auto object-cover
           sm:bottom-0 sm:top-auto rtl:right-auto rtl:left-0
           `} />;
};

export const InnerBannerBaseImg = ({ src }: { src: string }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  return <div
    className="absolute inset-0 z-0 rounded-box bg-cover bg-center bg-no-repeat"
    style={{
      backgroundImage: `url(${getImgCompressParams(src)})`,
      backgroundPosition: !isMobile ? "0px 20%" : "-1% 50%"
    }}
  />;
};

export const InnerDataTranslation = ({ text, value, percent, fiat_bonus = 0, crypto_bonus = 0 }: {
  text: string,
  value: string,
  percent: string,
  fiat_bonus?: number,
  crypto_bonus?: number
}) => {
  const { user } = useAuth();

  const { selectedCurrency } = useDisplayCurrency();

  const { convertCurrency, exchangeRates, formatCurrency } = useDisplayCurrency();

  const displayCurrency = (user?.currency_fiat || selectedCurrency) ?? "USD";

  return <span className={"whitespace-pre-line"}>
    <Trans
      i18nKey={text}
      values={{
        percent,
        value: formatCurrency({
          amount: convertCurrency({
            amount: value,
            fromCurrency: "USDT",
            toCurrency: displayCurrency,
            exchangeRates
          }),
          currency: displayCurrency,
          showSymbol: true, showCode: false
        }).formatted,
        fiat_bonus: `+${fiat_bonus * 100}%`,
        crypto_bonus: `+${crypto_bonus * 100}%`
      }}
      components={[<span className={"text-primary"} />]}
    />
  </span>;
};

export const InnerTimeDesc = ({ text }: { text: string }) => {
  return (<div
    className="bg-primary absolute -top-1.5 left-0 flex h-3 items-center justify-center rounded-[4px] rounded-bl-none px-2">
    <span className="font-montserrat text-[10px] font-semibold text-black uppercase">{text}</span>
  </div>);
};

export const InnerTimeLabel = ({ value, label }: { value: number, label: string }) => {
  return <div
    className="flex p-1 flex-1 flex-col items-center justify-center rounded-md leading-3"
    style={{ background: "color(display-p3 0.082 0.098 0.118 / 0.8)" }}
  >
    <div className="overflow-hidden font-montserrat countdown text-center text-2xl font-bold text-white">
      <div style={{ "--value": value } as React.CSSProperties} aria-live="polite">
        {value}
      </div>
    </div>
    <div className="font-montserrat text-neutral-content text-[8px]">{label}</div>
  </div>;
};

export const InnerTimeLabelPlaceholder = ({ value, label }: { value: string, label: string }) => {
  return <div
    className="flex p-1 flex-1 flex-col items-center justify-center rounded-md leading-3"
    style={{ background: "color(display-p3 0.082 0.098 0.118 / 0.8)" }}
  >
    <div className="overflow-hidden font-montserrat countdown text-center text-2xl font-bold text-white">
      {value}
    </div>
    <div className="font-montserrat text-neutral-content text-[8px]">{label}</div>
  </div>;
};

export const InnerContainer = styled.div`
    background: linear-gradient(136.93deg, rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(100.68deg, rgba(255, 255, 255, 0.1) 25%, rgba(0, 0, 0, 0) 25%)
`;

export const InnerBonusTips = ({ icon, text, type }: { icon: string, text: string, type: string }) => {
  const { t } = useTranslation(["tournament", "bonus"]);

  const { navigate } = useNavigateGuard();

  return (<InnerBonusTipsWrapper className="p-3 px-4 flex items-center gap-3 justify-between rounded-xl -mt-4 -mx-4">
    <div className="flex items-center gap-3">
      <img src={icon} alt="" className={"w-7 h-7"} />
      <p className={"text-sm text-white flex flex-col leading-5"}>
        <b>{text}</b>
        <span
          className={"text-[12px] text-base-content/70 font-normal"}>{t("bonus:your_bonus", "Claim your Bonus now!")}</span>
      </p>
    </div>
    <button className={"btn btn-sm btn-primary btn-soft btn-square"}
            onClick={() => navigate(bonus_dollars_router_path[type], true)}>
      <ChevronRight className={"w-4 h-4"} strokeWidth={3} />
    </button>
  </InnerBonusTipsWrapper>);
};

const InnerBonusTipsWrapper = styled.div`
    background: radial-gradient(80.05% 100% at 0% 46.47%, color(display-p3 0.9765 0.7255 0.2196 / 0.40) 0%, var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098));
`;

export const useNavigateGuard = () => {
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();

  const { setSyncAction } = useBoundStore();

  const { openSignInModal } = useAuthModals();

  const { openUserFinanceModalWithTab } = useFinanceModal();

  const fn1 = useCallback((path: string, auth = false) => {
    if (auth) {
      if (!isAuthenticated) return openSignInModal();
      if (path.includes("/vip-monday")) return setSyncAction("OPEN_VIP_MONDAY_BONUS_MODAL");
      if (path.includes("/referral/bonus")) return setSyncAction("OPEN_EXTRA_REFERRAL_BONUS_MODAL");
      if (path.includes("deposit")) return openUserFinanceModalWithTab(`deposit_${randomString()}`);
      if (path.includes("referral")) return void navigate({ to: "/referral" });
      if (path.includes("vip")) return void navigate({ to: "/vip-club" });
      if (path.includes("tournament")) return void navigate({ to: "/tournament" });

      // 解析path为路径和查询参数
      const url = new URL(decodeURIComponent(path), window.location.origin);
      const pathname = url.pathname.replace("/main", ""); // 移除/main前缀
      const searchParams = Object.fromEntries(url.searchParams?.entries() || []);

      void navigate({
        to: pathname || "/",
        search: searchParams
      });
    }
  }, [isAuthenticated]);

  const fn2 = useCallback((callback: () => void, auth = false) => {
    if (auth) {
      if (!isAuthenticated) return openSignInModal();
      callback();
    }
  }, [isAuthenticated]);

  return { navigate: fn1, navigateCallback: fn2 };
};

export const InnerBannerButtonV2 = ({ text, onClick, className }: {
  text: string,
  onClick: () => void,
  className?: string
}) => {
  return <div>
    <button
      onClick={onClick}
      className={clsx("btn btn-primary btn-md px-2 rounded-md gap-2 font-bold", className)}>
      {text}
      <ChevronRight size={12} className="rtl:rotate-y-180" strokeWidth={4} />
    </button>
  </div>;
};
