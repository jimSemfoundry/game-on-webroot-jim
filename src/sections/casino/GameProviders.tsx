import Iconify from "@/components/iconify/iconify";
import { GameCarousel } from "@/components/ui/GameCarousel";
import { useGameProviders } from "@/hooks/api/usePublic";
import { isMobile } from "@/utils/browser";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { getImgCompressParams } from "@/utils/helper.ts";
import { useThemeSystem } from "@/hooks/useThemeSystem";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/utils/themeMerger";

type GameProvider = {
  id: string;
  name: string;
  logo: string;
  day_logo?: string;
  name_key?: string;
  [key: string]: any;
};

interface ExploreProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerOptions: GameProvider[];
  setFailedImages: React.Dispatch<React.SetStateAction<Set<string>>>;
}


export const GameProviders = ({ type = "" }: { type?: "" | "detail" }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const { isDarkTheme } = useThemeSystem();
  const [isProviderOpen, setIsProviderOpen] = useState(false);

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
      <GameCarousel.Header
        onTitleClick={() => {
          if (type === "detail") {
            setIsProviderOpen(true)
          } else {
            handleAllClick()
          }
        }}
        onAllClick={() => {
          if (type === "detail") {
            setIsProviderOpen(true)
          } else {
            handleAllClick()
          }
        }}
        allLabel={t("transaction:filters.all")}
      >
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
      {
        type === "detail" && (
          <ExploreProviderModal
            isOpen={isProviderOpen}
            onClose={() => setIsProviderOpen(false)}
            providerOptions={validProviders}
            setFailedImages={setFailedImages}
          />
        )
      }
    </GameCarousel>
  );
};

function ExploreProviderModal({
  isOpen,
  onClose,
  providerOptions,
  setFailedImages,
}: ExploreProviderModalProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDarkTheme } = useThemeSystem();

  const handleAllClick = useCallback(() => {
    navigate({
      to: "/explore",
      search: {
        type: "casino",
        category: "hot",
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={cn("bg-base-400 mx-auto overflow-hidden", isPWA ? "!max-h-[90vh]" : "!max-h-[80vh]")}
      position={isMobile ? 'modal-bottom' : 'modal-middle'}
      title={
        <div className="flex items-center gap-2">
          <Iconify icon="custom:game" width={16} height={16} className="text-primary" />
          <p className="text-base md:text-xl font-bold">{t("explore:providers")}</p>
        </div>
      }
    >
      <div className="flex flex-col overflow-hidden" style={{ maxHeight: isMobile ? (isPWA ? 'calc(90vh - 100px)' : 'calc(80vh - 120px)') : '60vh' }}>
        <div className="overflow-y-auto hide-scrollbar">
          <div className="bg-base-300 rounded-field p-2">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div
                className={cn(
                  "rounded-field p-3 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 border border-solid h-[62px]",
                  "border-transparent bg-base-200 hover:bg-base-300"
                )}
                onClick={() => handleAllClick()}
              >
                <span className="text-xs font-semibold">{t("explore:all")}</span>
              </div>
              {providerOptions.map((option: GameProvider) => {
                const logoSrc = isDarkTheme() ? option.logo : option.day_logo || option.logo;

                return (
                  <div
                    key={option.id}
                    className={cn(
                      "rounded-field p-3 cursor-pointer transition-all flex flex-col items-center gap-2 border border-solid h-[62px]",
                      "border-transparent bg-base-200 hover:bg-base-300"
                    )}
                    onClick={() => handleProviderClick(option)}
                  >
                    <img
                      src={getImgCompressParams(logoSrc, 'auto', 60)}
                      alt={option.name}
                      loading='lazy'
                      className="w-full h-full object-contain"
                      onError={() => {
                        // 标记为加载失败，从列表中移除
                        setFailedImages((prev) => new Set(prev).add(option.id));
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}