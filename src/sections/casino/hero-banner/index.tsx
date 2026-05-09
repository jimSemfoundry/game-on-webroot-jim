import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useBaseConfig, useIsLeagueEnabled } from "@/hooks/api/usePublic";
import { InnerBannerItem } from "@/sections/casino/hero-banner/InnerBannerItem.tsx";
import { Carousel, CarouselDotButtons, useCarousel } from "@/components/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useBannerContentList } from "@/sections/casino/hero-banner/helper.ts";
import { VIPMondayBannerItem } from "@/sections/casino/hero-banner/VIPMondayBannerItem.tsx";
import { ThursdayBannerItem } from "@/sections/casino/hero-banner/ThursdayBannerItem.tsx";
import { SundayBannerItem } from "@/sections/casino/hero-banner/SundayBannerItem.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { Trans, useTranslation } from "react-i18next";
import GoogleAuth from "@/components/socialLogin/GoogleAuth.tsx";
import { useAuthModals } from "@/contexts/ModalsProvider.tsx";
import SocialLogin from "@/components/socialLogin";
import { DepositSunday } from "@/sections/casino/hero-banner/template/DepositSunday.tsx";
import { DepositThursday } from "@/sections/casino/hero-banner/template/DepositThursday.tsx";
import { BonusWallet } from "@/sections/casino/hero-banner/template/BonusWallet.tsx";
import { VIPMondayBonus } from "@/sections/casino/hero-banner/template/VIPMondayBonus.tsx";
import { BeTheFirst } from "@/sections/casino/hero-banner/template/BeTheFirst.tsx";
import { Welcome } from "@/sections/casino/hero-banner/template/Welcome.tsx";
import { Referral } from "@/sections/casino/hero-banner/template/Referral.tsx";
import { Regional } from "@/sections/casino/hero-banner/template/Regional.tsx";
import { VIPRewards } from "@/sections/casino/hero-banner/template/VIPRewards.tsx";
import { BettingPartner } from "@/sections/casino/hero-banner/template/BettingPartner.tsx";
import { SlotsTournament } from "@/sections/casino/hero-banner/template/SlotsTournament.tsx";
import { FirstReferralBonus } from "@/sections/casino/hero-banner/template/FirstReferralBonus.tsx";
import { VIPMonday } from "@/sections/casino/hero-banner/template/VIPMonday.tsx";
import { DollarsBonusBannerItem } from "@/sections/dollars/bonus-banner-content.tsx";
import { getImgCompressParams } from "@/utils/helper.ts";
import { useMemo } from "react";
import { CommonBanner } from "@/sections/casino/hero-banner/template/CommonBanner.tsx";

const Index = () => {
  const isMobile = useMediaQuery("(max-width: 460px)");

  const { user, isLoading: userLoading } = useAuth();

  const { data, isLoading: bannerLoading } = useBannerContentList();
  const { isLeagueEnabled } = useIsLeagueEnabled();

  // 根据 is_league 过滤 slots_tournament banner
  const banners = useMemo(() => {
    const rawBanners = data?.data ?? [];
    if (!isLeagueEnabled) {
      return rawBanners.filter((item: Record<string, any>) =>
        !item?.name?.includes("slots_tournament")
      );
    }
    return rawBanners;
  }, [data?.data, isLeagueEnabled]);

  const carousel = useCarousel(
    {
      slidesToShow: isMobile ? 1 : 3,
      startIndex: 0,
      dragFree: false,
      slideSpacing: "12px",
      align: "start",
      loop: true,
      containScroll: "trimSnaps",
      duration: 20
    },
    [Autoplay({ delay: 4_000 })]
  );

  return (
    <div className="select-none text-lg leading-5 font-black relative h-[209px] bg-base-400 rounded-xl overflow-hidden">
      {bannerLoading || userLoading || !user && <InnerDefaultBanner />}
      {!bannerLoading && banners.length > 0 && <>
        <Carousel carousel={carousel}>
          {banners.map((item: Record<string, any>) => {

              if (item?.name?.endsWith("_v2")) {
                
                if (item?.name?.endsWith("_sunday_v2")) {
                  return <DepositSunday
                    key={item?.id}
                    content={item?.banner_content}
                    extra_content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_thursday_v2")) {
                  return <DepositThursday
                    key={item?.id}
                    content={item?.banner_content}
                    extra_content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_bonus_wallet_v2")) {
                  return <BonusWallet
                    key={item?.id}
                    data={item}
                    content={item?.banner_content}
                    extra_content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_vip_monday_v2")) {
                  return <VIPMonday
                    key={item?.id}
                    content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_monday_vip_bonus_v2")) {
                  return <VIPMondayBonus
                    key={item?.id}
                    content={item?.banner_content}
                    extra_content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_be_the_first_v2")) {
                  return <BeTheFirst
                    key={item?.id}
                    content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_welcome_v2")) {
                  return <Welcome
                    key={item?.id}
                    content={item?.banner_content}
                    extra_content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_referral_v2")) {
                  return <Referral
                    key={item?.id}
                    content={item?.banner_content}
                    extra_content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_regional_v2")) {
                  return <Regional
                    key={item?.id}
                    content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_exclusive_vip_rewards_v2")) {
                  return <VIPRewards
                    key={item?.id}
                    content={item?.banner_content}
                    extra_content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_betting_partner_v2")) {
                  return <BettingPartner
                    key={item?.id}
                    content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_slots_tournament_v2")) {
                  return <SlotsTournament
                    key={item?.id}
                    content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_first_referral_bonus_v2")) {
                  return <FirstReferralBonus
                    key={item?.id}
                    content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_vip_monday_v2")) {
                  return <VIPMonday
                    key={item?.id}
                    content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_common_banner_v2")) {
                  return <CommonBanner
                    key={item?.id}
                    content={item?.content}
                  />;
                }
              } else if (item?.name?.endsWith("_v3")) {
                if (item?.name?.endsWith("_sunday_v3")) {
                  return <DepositSunday
                    key={item?.id}
                    content={item?.banner_content}
                    extra_content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_thursday_v3")) {
                  return <DepositThursday
                    key={item?.id}
                    content={item?.banner_content}
                    extra_content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_bonus_wallet_v3")) {
                  return <BonusWallet
                    key={item?.id}
                    data={item}
                    content={item?.banner_content}
                    extra_content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_vip_monday_v3")) {
                  return <VIPMonday
                    key={item?.id}
                    content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_monday_vip_bonus_v3")) {
                  return <VIPMondayBonus
                    key={item?.id}
                    content={item?.banner_content}
                    extra_content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_be_the_first_v3")) {
                  return <BeTheFirst
                    key={item?.id}
                    content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_welcome_v3")) {
                  return <Welcome
                    key={item?.id}
                    content={item?.banner_content}
                    extra_content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_referral_v3")) {
                  return <Referral
                    key={item?.id}
                    content={item?.banner_content}
                    extra_content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_regional_v3")) {
                  return <Regional
                    key={item?.id}
                    content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_exclusive_vip_rewards_v3")) {
                  return <VIPRewards
                    key={item?.id}
                    content={item?.banner_content}
                    extra_content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_betting_partner_v3")) {
                  return <BettingPartner
                    key={item?.id}
                    content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_slots_tournament_v3")) {
                  return <SlotsTournament
                    key={item?.id}
                    content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_first_referral_bonus_v3")) {
                  return <FirstReferralBonus
                    key={item?.id}
                    content={item?.content}
                  />;
                }

                if (item?.name?.endsWith("_vip_monday_v3")) {
                  return <VIPMonday
                    key={item?.id}
                    content={item?.content}
                  />;
                }
              } else {
                if (item?.name?.endsWith("_sunday")) {
                  return <SundayBannerItem
                    key={item?.id} type={item?.name} data={item}
                    content={item?.banner_content} />;
                }

                if (item?.name?.endsWith("_thursday")) {
                  return <ThursdayBannerItem
                    key={item?.id} type={item?.name} data={item}
                    content={item?.banner_content} />;
                }

                if (item?.name?.endsWith("_bonus_wallet")) {
                  return <DollarsBonusBannerItem key={item?.id} data={item} content={item?.banner_content} />;
                }

                if (item?.name?.endsWith("_monday_vip_bonus")) {
                  return <VIPMondayBannerItem
                    key={item?.id} type={item?.name} data={item}
                    content={item?.banner_content} />;
                }

                return (<InnerBannerItem
                  key={item?.id}
                  type={item?.name}
                  data={item}
                  content={item?.banner_content} />);
              }
            }
          )}
        </Carousel>
        <CarouselDotButtons
          className="absolute bottom-0 left-1/2 -translate-x-1/2 sm:hidden h-5"
          scrollSnaps={carousel.dots.scrollSnaps}
          selectedIndex={carousel.dots.selectedIndex}
          onClickDot={carousel.dots.onClickDot}
        />
      </>}
    </div>
  );
};

export default Index;


export const images_static = "https://images.1st.game/banner/public/images/casino/banner";

const InnerDefaultBanner = () => {
  const { t, i18n } = useTranslation(["banner", "login"]);

  const { openSignInModal, openSignUpModal } = useAuthModals();

  const { data: baseConfigResp } = useBaseConfig();
  const baseConfig = baseConfigResp?.data;

  const rawMainBannerText = baseConfig?.main_banner_text;
  const mainBannerText: Record<string, string> =
    rawMainBannerText && typeof rawMainBannerText === "object" && !Array.isArray(rawMainBannerText)
      ? rawMainBannerText
      : {};
  const mainBannerPortraitUrl: string = baseConfig?.main_banner_img_portrait_url || "";
  const mainBannerLandscapeUrl: string = baseConfig?.main_banner_img_landscape_url || "";

  const customBannerText = mainBannerText[i18n.language] || mainBannerText["en"] || "";

  const desktopImageUrl = mainBannerLandscapeUrl
    ? getImgCompressParams(mainBannerLandscapeUrl, 345, 60)
    : import.meta.env.VITE_CASINO_UNAUTH_BANNER_IMAGE_DESKTOP_URL
    || getImgCompressParams(`${images_static}/single-suarez.png`, 345, 60);
  const mobileImageUrl = mainBannerPortraitUrl
    ? getImgCompressParams(mainBannerPortraitUrl, 209, 80)
    : import.meta.env.VITE_CASINO_UNAUTH_BANNER_IMAGE_MOBILE_URL
    || getImgCompressParams(`${images_static}/single-suarez-small1.png`, 209, 80);

  return <div className={"h-full flex justify-between banner-background"}>
    <div className="z-1">
      <div className={"h-full pl-5 md:pl-10 py-5 md:py-10 flex flex-col items-start justify-between"}>
        <div className={"text-base lg:text-lg xl:text-xl leading-5 max-w-[76%] break-word whitespace-pre-line"}>
          {customBannerText ? (
            <Trans i18nKey={customBannerText} components={[<span className="text-primary" />]} />
          ) : (
            <>
              <p><Trans i18nKey={"banner:BE_THE_FIRST"} /></p>
              <p className={"text-primary"}><Trans i18nKey={"banner:CHALLENGE_EVERYTHING"} /></p>
            </>
          )}
        </div>
        <div className={"banner-desktop-only"}>
          <div className={"flex gap-2 rounded"}>
            <button className={"btn btn-primary font-bold"} onClick={openSignUpModal}>{t("login:signUp")}</button>
            <button className={"btn bg-base-200 font-bold"}
                    onClick={openSignInModal}>{t("login:signIn")}</button>
            <SocialLogin title={t("login:or")} className={"flex flex-row !gap-2"} />
          </div>
        </div>
        <div className={"banner-mobile-only"}>
          <GoogleAuth />
        </div>
      </div>
    </div>
    <picture className="h-full min-w-[209px] absolute right-0 rtl:left-0 rtl:right-auto rtl:sm:ml-6">
      <source
        media="(min-width: 461px)"
        srcSet={desktopImageUrl}
      />
      <img
        src={mobileImageUrl}
        alt=""
        className="object-cover h-full w-auto"
        fetchPriority="high"
      />
    </picture>
  </div>;
};
















