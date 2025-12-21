import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ChevronRight } from "lucide-react";
import { InnerEffect } from "@/sections/casino/hero-banner/InnerEffect.tsx";
import { InnerGradient } from "@/sections/casino/hero-banner/InnerGradient.tsx";
import { useCallback, memo, useMemo } from "react";
import classNames from "classnames";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useAuthModals, useFinanceModal } from "@/contexts/ModalsProvider.tsx";
import { randomString } from "@/components/modal/UserFinanceModal/helper.ts";
import { parser } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";
import { Trans, useTranslation } from "react-i18next";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext.tsx";
import { InnerContentVisible } from "@/components/header/message-v2/c/InnerComponents.tsx";
import { authService } from "@/services/authService.ts";
import { useBoundStore } from "@/store";

// const match_banner1 = [
//   "1st_game_sunday",
//   "1st_game_welcome",
//   "1st_game_referral",
//   "1st_game_thursday",
//   "1st_game_bonus_wallet",
//   "1st_game_be_the_first",
//   "1st_game_slots_tournament",
//   "1st_game_first_referral_bonus",
//   "1st_game_exclusive_vip_rewards",
//   "1st_win_game_sunday",
//   "1st_win_game_welcome",
//   "1st_win_game_referral",
//   "1st_win_game_thursday",
//   "1st_win_game_be_the_first",
//   "1st_win_game_bonus_wallet",
//   "1st_win_game_slots_tournament",
//   "1st_win_game_first_referral_bonus",
//   "1st_win_game_exclusive_vip_rewards"
// ];

const match_banner2 = [
  "1st_game_regional",
  "1st_game_betting_partner",
  "1st_win_game_regional",
  "1st_win_game_betting_partner"
];

export const InnerBannerItem = ({ data, type, content }: {
  data: Record<string, any>,
  type: string,
  content: string
}) => {
  const banner = useMemo(() => parser(content), [content]);

  return (
    <div className="w-full rounded-box px-4 py-8 relative h-[209px] sm:h-[258px] overflow-hidden rtl:rotate-y-180"
         style={{ isolation: "isolate" }}>
      <div className="flex gap-1 flex-col justify-between h-full relative z-40 rtl:rotate-y-180">
        <div className="flex flex-col whitespace-pre-line font-black leading-5">
          <p className="text-base-content">
            <InnerDataTranslation
              text={`banner:${banner?.text_list[0]?.text}`}
              value={banner?.value || 0}
              percent={(((data?.extra_data?.bonus_rate || 0) * 100) || (banner?.percent || 0)) + "%"} />
          </p>
          <p className="text-primary">
            <InnerDataTranslation
              text={`banner:${banner?.text_list[1]?.text}`}
              value={banner?.value || 0}
              percent={(((data?.extra_data?.bonus_rate || 0) * 100) || (banner?.percent || 0)) + "%"} />
          </p>
        </div>

        <InnerContentVisible
          className={"flex flex-wrap gap-2"}
          show={banner?.button_list && banner?.button_list?.length > 0}>
          <InnerBannerButton banner={{ ...banner, name: data?.name }} />
        </InnerContentVisible>
      </div>

      {/* 人物 */}
      <InnerBannerPerson src={banner?.float_image_list[0]?.mobile_image} />

      {/* 品牌 */}
      <InnerBannerBrands type={type} banner={banner} />

      {/* 底图 */}
      <InnerBannerBaseImg src={banner?.background_image_list[0]?.mobile_image} />

      {/* 效果层 */}
      <InnerGradient />
      <InnerEffect />
    </div>
  );
};

export default memo(InnerBannerItem);

const InnerBannerBrands = ({ type, banner }: { type: string, banner: Record<string, any> }) => {
  return <InnerContentVisible show={match_banner2.includes(type)}>
    <div className="absolute z-20 top-[90px] max-w-40 flex flex-col items-center gap-4">
      <img src={banner?.float_image_list[1]?.mobile_image} alt="" loading="lazy" decoding="async"
           className="max-w-[30px]" />
      <img src={banner?.float_image_list[2]?.mobile_image} alt="" loading="lazy" decoding="async"
           className="max-h-[30px]" />
    </div>
  </InnerContentVisible>;
};

const InnerBannerPerson = ({ src }: { src: string }) => {
  return <img
    src={getImgixParams(src)} alt="" loading="lazy" decoding="async"
    className={`absolute z-20 top-0 right-0 h-[209px] w-auto object-cover
           sm:bottom-0 sm:top-auto
           sm:h-[258px]
           `} />;
};

const InnerBannerBaseImg = ({ src }: { src: string }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  return <div
    className="absolute inset-0 z-0 rounded-box bg-cover bg-center bg-no-repeat"
    style={{
      backgroundImage: `url(${getImgixParams(src)})`,
      backgroundPosition: !isMobile ? "0px 20%" : "-1% 50%"
    }}
  />;
};

const InnerBannerButton = ({ banner }: { banner: Record<string, any> }) => {
  const { t } = useTranslation();

  const { navigate } = useNavigateGuard();

  const handle = useCallback(async () => {
    if (banner?.name?.includes("game_sunday")) {
      await authService.userAddSundayBonus();
    }
    if (banner?.name?.includes("game_thursday")) {
      await authService.userAddThursdayBonus();
    }
    navigate(banner?.button_list[0]?.button_link, true);
  }, [banner]);

  return <button
    onClick={handle}
    className={classNames("btn btn-primary btn-sm px-2 md:btn-md md:px-3 rounded-md gap-2 font-bold", {
      "btn-xs rounded-md": banner?.button_list?.length > 1
    })}>
    {t(`banner:${banner?.button_list[0]?.button_text}`)}
    <ChevronRight size={12} className="rtl:rotate-y-180" strokeWidth={4} />
  </button>;
};

const InnerDataTranslation = ({ text, value, percent }: { text: string, value: string, percent: string }) => {
  const { user } = useAuth();

  const { convertCurrency, exchangeRates, formatCurrency } = useDisplayCurrency();

  return <Trans
    i18nKey={text}
    values={{
      percent,
      value: formatCurrency({
        amount: convertCurrency({
          amount: value,
          fromCurrency: "USDT",
          toCurrency: user?.currency_fiat ?? "USD",
          exchangeRates
        }),
        currency: user?.currency_fiat ?? "",
        showSymbol: true, showCode: false
      }).formatted
    }}
    components={[<span className={"text-primary"} />]}
  />;
};

const useNavigateGuard = () => {
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();

  const { setSyncAction } = useBoundStore();

  const { openSignInModal } = useAuthModals();

  const { openUserFinanceModalWithTab } = useFinanceModal();

  const fn = useCallback((path: string, auth = false) => {
    if (auth) {
      if (!isAuthenticated) return openSignInModal();
      if (path.includes("/referral/bonus")) return setSyncAction("OPEN_EXTRA_REFERRAL_BONUS_MODAL");
      if (path.includes("deposit")) return openUserFinanceModalWithTab(`deposit_${randomString()}`);
      if (path.includes("referral")) return void navigate({ to: "/referral" });
      if (path.includes("vip")) return void navigate({ to: "/vip-club" });
      if (path.includes("tournament")) return void navigate({ to: "/tournament" });
      return void navigate({ to: path });
    }
  }, [isAuthenticated]);

  return { navigate: fn };
};

function getImgixParams(url: string) {
  // const network = getNetworkType();
  let params = "";
  // if (network === "slow-2g" || network === "2g") {
  //   params = "w=300&q=40&dpr=0.65";
  // } else if (network === "3g") {
  //   params = "w=360&q=60&dpr=0.75";
  // } else {
  params = "w=200&auto=format,compress&dpr=1.75&q=80";
  // }
  return hasAnySearchParams(url) ? `${url}&${params}` : `${url}?${params}`;
}

function hasAnySearchParams(url: string) {
  try {
    const parse_url = new URL(url);
    return parse_url.search.length > 0;
  } catch (_e) {
    return false;
  }
}