import { Carousel, useCarousel } from "@/components/carousel";
import Iconify from "@/components/iconify/iconify";
import { useGameProviders } from "@/hooks/api/usePublic";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";

type GameProvider = {
  id: string;
  name: string;
  logo: string;
  [key: string]: any;
};

export const GameProviders = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // 组件内部获取数据
  const { data: gameProvidersResponse, isLoading } = useGameProviders();
  const gameProviders = gameProvidersResponse?.data;

  const carousel = useCarousel({
    slidesToShow: "auto",
    startIndex: 0, // 从第一个开始
    dragFree: true,
    slideSpacing: "8px",
    align: "start",
    loop: true, // 保持循环功能
    containScroll: "trimSnaps", // 防止滚动超出边界
  });

  // 处理加载状态
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[105px]">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
  }

  const handleAllClick = () => {
    navigate({
      to: "/explore",
      search: {
        type: "casino",
        category: "hot",
        providers: "all", // = all 显示菜单
      },
    });
  };

  // 过滤掉加载失败的provider
  const validProviders = gameProviders.filter((provider: GameProvider) => !failedImages.has(provider.id));

  return (
    <div className="flex flex-col gap-1 w-full select-none">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2 px-1 cursor-pointer" onClick={handleAllClick}>
          <Iconify icon="custom:game" />
          <p className="text-md sm:text-lg font-semibold">{t(`explore:providers`)}</p>
        </div>
        <button
          className="btn btn-sm btn-primary"
          onClick={handleAllClick}
        >
          All
        </button>
      </div>
      <Carousel carousel={carousel}>
        {validProviders.map((provider: GameProvider) => (
          <div key={provider.id} className="flex flex-col rounded-field items-center gap-0.5 cursor-pointer bg-base-200">
            <div className="relative w-[110px] h-[60px] sm:w-[233px] sm:h-[105px] group px-2 sm:px-7 py-3">
              <img
                src={provider.logo}
                alt={provider.name}
                className="w-full h-full object-contain p-2"
                onError={() => {
                  // 标记为加载失败，从列表中移除
                  setFailedImages((prev) => new Set(prev).add(provider.id));
                }}
              />
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};
