import Iconify from "@/components/iconify/iconify";
import { GameCarousel } from "@/components/ui/GameCarousel";
import { useGameProviders } from "@/hooks/api/usePublic";
import { isMobile } from "@/utils/browser";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { getImgCompressParams } from "@/utils/helper.ts";
import { useThemeSystem } from "@/hooks/useThemeSystem";

type GameProvider = {
  id: string;
  name: string;
  logo: string;
  day_logo?: string;
  name_key?: string;
  [key: string]: any;
};

export const GameProviders = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const { isDarkTheme } = useThemeSystem();

  // 组件内部获取数据
  const { data: gameProvidersResponse, isLoading } = useGameProviders();
  const gameProviders = gameProvidersResponse?.data;

  const handleAllClick = useCallback(() => {
    navigate({
      to: "/explore",
      search: {
        type: "casino",
        category: "hot",
        providers: "all", // = all 显示菜单
      },
    });
  }, [navigate]);

  const handleProviderClick = useCallback((provider: GameProvider) => {
    const providerKey = provider.name_key ?? provider.id;
    navigate({
      to: "/explore",
      search: {
        type: "casino",
        category: "hot",
        providers: providerKey, // 使用 name_key 作为 provider 标识
      },
    });
  }, [navigate]);

  // 过滤掉加载失败的provider
  const validProviders = ((gameProviders ?? []) as GameProvider[]).filter(
    (provider) => !failedImages.has(provider.id),
  );
  const lazyOnMobile = isMobile();

  // 处理加载状态
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[105px]">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
  }

  return (
    <GameCarousel className="select-none">
      <GameCarousel.Header onTitleClick={handleAllClick} onAllClick={handleAllClick} allLabel={t("transaction:filters.all")}>
        <Iconify icon="custom:game" />
        <p className="text-md sm:text-lg font-semibold">{t(`explore:providers`)}</p>
      </GameCarousel.Header>
      <GameCarousel.Content>
        <GameCarousel.Track>
          {validProviders.map((provider) => {
            const logoSrc = isDarkTheme() ? provider.logo : provider.day_logo || provider.logo;
            return (
            <GameCarousel.Item
              key={provider.id}
              className="flex flex-col rounded-field items-center gap-0.5 cursor-pointer bg-base-200"
              onClick={() => handleProviderClick(provider)}
              lazy={lazyOnMobile}
              placeholder={<div className="w-[110px] h-[60px] sm:w-[233px] sm:h-[105px] rounded-field bg-base-200" />}
            >
              <div className="relative w-[110px] h-[60px] sm:w-[184px] sm:h-[86px] group px-2 md:p-3">
                <img
                  src={getImgCompressParams(logoSrc, 'auto', 60)}
                  alt={provider.name}
                  loading='lazy'
                  className="w-full h-full object-contain"
                  onError={() => {
                    // 标记为加载失败，从列表中移除
                    setFailedImages((prev) => new Set(prev).add(provider.id));
                  }}
                />
              </div>
            </GameCarousel.Item>
            );
          })}
        </GameCarousel.Track>
        <GameCarousel.Fade />
      </GameCarousel.Content>
    </GameCarousel>
  );
};
