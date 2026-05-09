import { useTranslation } from "react-i18next";
import { useAuthModals } from "@/contexts/ModalsProvider.tsx";
import { usePaymentGatewayByUser, usePaymentIcons } from "@/query/casino";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { Carousel, useCarousel } from "@/components/carousel";
import { getImgCompressParams } from "@/utils/helper.ts";
import { useThemeSystem } from "@/hooks/useThemeSystem";
import type { ICachePaymentIcons } from "@/types/game";
import { useNavigate } from "@tanstack/react-router";

export const AcceptCurrencies = () => {
  const navigate = useNavigate();

  // const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isDarkTheme } = useThemeSystem();

  const { openSignInModal } = useAuthModals();

  const { paymentGatewayByUser } = usePaymentGatewayByUser();
  const { paymentIcons } = usePaymentIcons();
  const paymentData = user ? paymentGatewayByUser : paymentIcons;
  const fiatIcons = getThemeAwareFiatIcons(paymentData, !isDarkTheme());

  return (
    <div className="flex flex-col sm:block">
      <div className="flex items-center justify-between sm:hidden">
        <div className="flex items-center gap-2">
          {
            (paymentGatewayByUser?.currency_icon) ?
              <img src={paymentGatewayByUser?.currency_icon} className="h-[14px] w-[14px] overflow-hidden" loading="lazy" decoding="async" />
              :
              <div className="inline-grid *:[grid-area:1/1]">
                <div className="status status-md sm:status-lg status-primary animate-ping"></div>
                <div className="status status-md sm:status-lg status-primary"></div>
              </div>
          }
          <p className="text-sm font-bold text-base-content">{t("casino:weAccept")}</p>
        </div>
        <button className="btn btn-xs btn-link font-extrabold no-underline"
                onClick={() => {
                  if (!user) openSignInModal();
                  else void navigate({to:'/finance'});
                }}>{t("casino:all")}</button>
      </div>

      <div className="h-[128px] sm:h-[128px] w-full relative overflow-hidden z-20 mt-2 sm:mt-0 rounded-2xl bg-base-200">

        {/** Content */}
        <div className="absolute inset-0 z-40 sm:px-12">
          <div
            className="flex items-center justify-center flex-col sm:flex-row-reverse sm:justify-around gap-4 h-full w-full">
            <div className="avatar-group -space-x-2.5">
              {/* {acceptCurrencies.map((currency, index) => (
                <div className="avatar border-0 w-8 h-8" key={index}>
                  <CurrencyIcon currency={currency} className="w-8 h-8" />
                </div>
              ))} */}
              {
                user ? paymentGatewayByUser?.crypto_icons.map((item, index) => (
                    <div className="avatar border-0 w-8 h-8" key={index}>
                      <img src={item} key={index} className="w-8 h-8" loading="lazy" decoding="async" />
                    </div>
                  ))
                  : paymentIcons?.crypto_icons.map((item, index) => (
                    <div className="avatar border-0 w-8 h-8" key={index}>
                      <img src={item} key={index} className="w-8 h-8" loading="lazy" decoding="async" />
                    </div>
                  ))
              }
            </div>
            {/* <div className="flex items-center gap-4"> */}
            {/* <img className="h-[35px] w-auto my-1.25 object-cover" src="/images/partners/payment-methods/gcash.svg" alt="GCash" />
              <img className="h-[35px] w-auto my-1.25 object-cover" src="/images/partners/payment-methods/maya.svg" alt="Maya" />
              <img className="h-[35px] w-auto my-1.25 object-cover" src="/images/partners/payment-methods/grab.svg" alt="Grab" /> */}
            {/* </div> */}
            <PaymentIconsCarouselGuard icons={fiatIcons} />

            <div className="items-center gap-4 hidden sm:flex">
              {
                (paymentGatewayByUser?.currency_icon) &&
                <img src={paymentGatewayByUser?.currency_icon} className="w-9 h-9" loading="lazy" decoding="async" />
              }
              <p className="text-3xl font-bold text-base-content">{t("casino:weAccept")}</p>
              <button className="btn btn-sm btn-soft btn-primary"
                      onClick={() => void navigate({to:'/finance'})}>
                {t("casino:viewAll")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getThemeAwareFiatIcons = (paymentData: ICachePaymentIcons | undefined, useLightThemeIcons: boolean) => {
  if (!paymentData) return undefined;

  if (useLightThemeIcons && paymentData.fiat_icons_light?.length) {
    return paymentData.fiat_icons_light;
  }

  return paymentData.fiat_icons;
};

const PaymentIconsCarouselGuard = ({ icons }: { icons: string[] | undefined }) => {
  return icons?.length ? <PaymentIconsCarousel icons={icons} /> : null;
};

const PaymentIconsCarousel = ({ icons }: { icons: any }) => {
  const carousel = useCarousel({
    slidesToShow: "auto",
    startIndex: 0, // 从第一个开始
    dragFree: true,
    slideSpacing: "8px",
    align: "start",
    loop: true, // 保持循环功能
    containScroll: "trimSnaps" // 防止滚动超出边界
  });

  return (
    <div className="flex w-full select-none max-w-[85%] sm:flex-1">
      <Carousel carousel={carousel}>
        {
          icons?.map((item: any, index: any) => (
            <div key={index} className="flex flex-col items-center gap-0.5 cursor-pointer ">
              <div className="relative p-1 bg-base-400 rounded-lg">
                <img className="h-[35px] w-auto object-cover" src={getImgCompressParams(item)} loading="lazy" decoding="async" />
              </div>
            </div>
          ))
        }
      </Carousel>
    </div>
  );
};
