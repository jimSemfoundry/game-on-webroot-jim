// import { AutoScrollLite, Carousel, useCarousel } from "@/components/carousel";
import { Marquee } from "@/components/ui/Marquee";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { GameImage } from "@/components/ui/GameImage";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useModals } from "@/contexts/ModalsProvider";
import { useGreatestGameOrder } from "@/hooks/api/usePublic";
import { useMemo, useState, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useBannedGameCheck } from "@/hooks/useBannedGameCheck.ts";

export const RecentBigWins = memo(() => {
  const { t } = useTranslation();
  const { data: greatestGameOrder, isLoading } = useGreatestGameOrder();
  const { openBetSlipModal } = useModals();
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  // 使用自定义 hook 检查游戏是否被禁止
  const isGameBanned = useBannedGameCheck(true);

  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // const carousel = useCarousel(
  //   {
  //     slidesToShow: "auto",
  //     startIndex: 1,
  //     dragFree: true,
  //     slideSpacing: "8px",
  //     align: "start",
  //     loop: true,
  //     duration: 20,
  //     watch: {
  //       arrows: false,
  //       dots: false,
  //       progress: false,
  //       thumbs: false
  //     }
  //   },
  //   [AutoScrollLite({ playOnInit: true, speed: 1, stopOnInteraction: false })]
  // );

  // 使用 useCallback 优化错误处理函数
  const handleImageError = useCallback((orderId: string) => {
    setFailedImages((prev) => new Set(prev).add(orderId));
  }, []);

  const displayOrders = useMemo(() => {
    const orders = greatestGameOrder?.data ?? [];

    const withImages = orders.filter((order: any) => {
      return !isGameBanned(order) && order?.image && order.image.trim() !== "" && !failedImages.has(order.id);
    });

    return withImages.slice(0, 30);
  }, [failedImages, greatestGameOrder?.data, isGameBanned]);

  return (
    <SmallLoading
      loading={isLoading} className={"h-[165px] md:h-[169px] !bg-base-400 rounded-xl"}
      content={<div className="flex flex-col gap-1 w-full">
        <div className="flex items-center gap-2">
          <div className="inline-grid *:[grid-area:1/1]">
            <div className="status status-md sm:status-lg status-primary animate-ping"></div>
            <div className="status status-md sm:status-lg status-primary"></div>
          </div>
          <p className="text-sm sm:text-base font-bold">{t("casino:recentBigWins")}</p>
        </div>

        {/* <Carousel carousel={carousel} className="p-1"> */}
        <Marquee speed={60} pauseOnHover className="p-1">
          {displayOrders.map((order: any) => (
            <div
              key={order.id}
              className="flex flex-col items-center gap-0.5 select-none"
              onClick={() => {
                openBetSlipModal(order);
              }}
            >
              <div className="relative w-18 cursor-pointer">
                <GameImage
                  sample
                  src={order.image}
                  alt={order.name}
                  data={order}
                  className="object-cover origin-center hover:scale-110 transition-all duration-300"
                  containerClassName="rounded-field"
                  onError={() => handleImageError(order.id)}
                />
              </div>
              <p
                className="text-[11px] font-bold text-base-content/60 max-w-16 truncate text-center">{order?.nickname}</p>
              <div className="flex items-center gap-0.5">
                <CurrencyIcon
                  currency={order.real_currency}
                  className="w-3.5 h-3.5"
                />
                <p className="text-[11px] font-extrabold text-primary max-w-16 truncate">
                  {
                    formatWithConversion(
                      order.real_win_amount,
                      order.real_currency,
                      { compact: true, showCode: false }
                    ).formatted
                  }
                </p>
              </div>
            </div>
          ))}
          {/* </Carousel> */}
        </Marquee>
      </div>} />
  );
});
