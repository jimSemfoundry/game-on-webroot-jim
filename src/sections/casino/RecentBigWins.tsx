import { Carousel, useCarousel } from "@/components/carousel";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { GameImage } from "@/components/ui/GameImage";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useModals } from "@/contexts/ModalsProvider";
import { useGreatestGameOrder } from "@/hooks/api/usePublic";
import AutoScroll from "embla-carousel-auto-scroll";
import { useState, useCallback, memo } from "react";

export const RecentBigWins = memo(() => {
  const { data: greatestGameOrder } = useGreatestGameOrder();
  const { openBetSlipModal } = useModals();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const carousel = useCarousel(
    {
      slidesToShow: "auto",
      startIndex: 1,
      dragFree: true,
      slideSpacing: "8px",
      align: "start",
      loop: true,
      duration: 20,
    },
    [AutoScroll({ playOnInit: true, speed: 1, stopOnInteraction: false })],
  );

  // 使用 useCallback 优化错误处理函数
  const handleImageError = useCallback((orderId: string) => {
    setFailedImages((prev) => new Set(prev).add(orderId));
  }, []);

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center gap-2">
        <div className="inline-grid *:[grid-area:1/1]">
          <div className="status status-md sm:status-lg status-primary animate-ping"></div>
          <div className="status status-md sm:status-lg status-primary"></div>
        </div>
        <p className="text-sm sm:text-base font-bold">Recent Big Wins</p>
      </div>

      <Carousel carousel={carousel} className="p-1">
        {greatestGameOrder?.data
          ?.map((order: any) => {
            // 过滤掉没有图片的订单或加载失败的订单
            if (!order.image || order.image.trim() === "" || failedImages.has(order.id)) {
              return null;
            }

            return (
              <div
                key={order.id}
                className="flex flex-col items-center gap-0.5  select-none"
                onClick={() => {
                  openBetSlipModal(order);
                }}
              >
                <div className="relative w-15 cursor-pointer">
                  <GameImage
                    src={order.image}
                    alt={order.name}
                    className="object-cover origin-center hover:scale-110 transition-all duration-300"
                    containerClassName="rounded-field"
                    onError={() => handleImageError(order.id)}
                  />
                </div>
                <p className="text-[10px] font-semibold text-base-content/50">{`${order?.nickname?.slice(0, 3)}...${order?.nickname?.slice(
                  -3,
                )}`}</p>
                <div className="flex items-center gap-0.5">
                  <CurrencyIcon
                    currency={order.real_currency}
                    className="w-3 h-3"
                  />
                  <p className="text-[10px] font-bold text-base-content">
                    {
                      formatWithConversion(
                        order.real_win_amount,
                        order.real_currency,
                        { compact: true, showCode: false },
                      ).formatted
                    }
                  </p>
                </div>
              </div>
            );
          })
          .filter(Boolean)}
      </Carousel>
    </div>
  );
});
