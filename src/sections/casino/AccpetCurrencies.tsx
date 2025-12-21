import { useTranslation } from "react-i18next";
import { useFinanceModal } from "@/contexts/ModalsProvider.tsx";
import { randomString } from "@/components/modal/UserFinanceModal/helper.ts";
import { usePaymentGatewayByUser, usePaymentIcons } from "@/query/casino";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { Carousel, useCarousel } from "@/components/carousel";

export const AcceptCurrencies = () => {
  // const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { t } = useTranslation();
  const { user } = useAuth();

  const { openUserFinanceModalWithTab } = useFinanceModal()

  const { paymentGatewayByUser } = usePaymentGatewayByUser();
  const { paymentIcons } = usePaymentIcons();

  return (
    <div className="flex flex-col sm:block">
      <div className="flex items-center justify-between sm:hidden">
        <div className="flex items-center gap-2">
          {
            (paymentGatewayByUser?.currency_icon) ?
              <img src={paymentGatewayByUser?.currency_icon} className="h-[14px] w-[14px] overflow-hidden" />
              :
              <div className="inline-grid *:[grid-area:1/1]">
                <div className="status status-md sm:status-lg status-primary animate-ping"></div>
                <div className="status status-md sm:status-lg status-primary"></div>
              </div>
          }
          <p className="text-sm font-bold text-base-content">{t('casino:weAccept')}</p>
        </div>
        <button className="btn btn-sm btn-primary" onClick={() => openUserFinanceModalWithTab(`deposit_${randomString()}`)}>{t("casino:all")}</button>
      </div>

      <div className="h-[128px] sm:h-[128px] w-full relative overflow-hidden z-20 mt-2 sm:mt-0">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 z-0 rounded-box bg-cover bg-center bg-no-repeat overflow-hidden">
          <div className="w-[1280px]">
            <img
              src="/images/illustrations/accpet-currencies.png"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Gradient Overlay Layers */}
        {/* <div
          className="absolute inset-0 z-0 rounded-box"
          style={{
            background: "linear-gradient(45deg, transparent 18.45%, color-mix(in oklch, var(--color-base-300), transparent 100%) 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-0 rounded-box"
          style={{
            background: "linear-gradient(270deg, transparent 1.67%, color-mix(in oklch, var(--color-base-300), transparent 40%) 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-0 rounded-box"
          style={{
            background: "linear-gradient(0deg, transparent 0.33%, color-mix(in oklch, var(--color-base-300), transparent 0%) 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-0 rounded-box"
          style={{
            background: "linear-gradient(180deg, transparent 0%, color-mix(in oklch, var(--color-base-300), transparent 20%) 100%)",
          }}
        /> */}

        {/** Content */}
        <div className="absolute inset-0 z-40 sm:px-12">
          <div className="flex items-center justify-center flex-col sm:flex-row-reverse sm:justify-around gap-4 h-full w-full">
            <div className="avatar-group -space-x-1.5">
              {/* {acceptCurrencies.map((currency, index) => (
                <div className="avatar border-0 w-8 h-8" key={index}>
                  <CurrencyIcon currency={currency} className="w-8 h-8" />
                </div>
              ))} */}
              {
                user ? paymentGatewayByUser?.crypto_icons.map((item, index) => (
                  <div className="avatar border-0 w-8 h-8" key={index}>
                    <img src={item} key={index} className="w-8 h-8" />
                  </div>
                ))
                  : paymentIcons?.crypto_icons.map((item, index) => (
                    <div className="avatar border-0 w-8 h-8" key={index}>
                      <img src={item} key={index} className="w-8 h-8" />
                    </div>
                  ))
              }
            </div>
            {/* <div className="flex items-center gap-4"> */}
            {/* <img className="h-[35px] w-auto my-1.25 object-cover" src="/images/partners/payment-methods/gcash.svg" alt="GCash" />
              <img className="h-[35px] w-auto my-1.25 object-cover" src="/images/partners/payment-methods/maya.svg" alt="Maya" />
              <img className="h-[35px] w-auto my-1.25 object-cover" src="/images/partners/payment-methods/grab.svg" alt="Grab" /> */}
            {/* </div> */}
            <PaymentIconsCarousel icons={user ? paymentGatewayByUser?.fiat_icons : paymentIcons?.fiat_icons} />

            <div className="items-center gap-4 hidden sm:flex">
              {
                (paymentGatewayByUser?.currency_icon) &&
                <img src={paymentGatewayByUser?.currency_icon} className="w-9 h-9" />
              }
              <p className="text-3xl font-bold text-base-content">{t('casino:weAccept')}</p>
              <button className="btn btn-sm btn-soft btn-primary" onClick={() => openUserFinanceModalWithTab(`deposit_${randomString()}`)}>
                {t('casino:viewAll')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentIconsCarousel = ({ icons }: { icons: any }) => {
  const carousel = useCarousel({
    slidesToShow: "auto",
    startIndex: 0, // 从第一个开始
    dragFree: true,
    slideSpacing: "8px",
    align: "start",
    loop: true, // 保持循环功能
    containScroll: "trimSnaps", // 防止滚动超出边界
  });

  return (
    <div className="flex w-full select-none max-w-[85%] sm:flex-1">
      <Carousel carousel={carousel}>
        {
          icons?.map((item: any, index: any) => (
            <div key={index} className="flex flex-col items-center gap-0.5 cursor-pointer ">
              <div className="relative ">
                <img className="h-[35px] w-auto object-cover p-2" src={item} />
              </div>
            </div>
          ))
        }
      </Carousel>
    </div>
  );
}
