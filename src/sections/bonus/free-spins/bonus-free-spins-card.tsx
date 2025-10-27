import Iconify from "@/components/iconify";
import { ImageColorCard } from "@/components/ui/ImageColorCard";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { createBonusGradient, gradientStyles } from "../styles";
import { useMemo, useState } from "react";
import { BonusFreeSpinsHelpModal } from "./bonus-free-spins-help-modal";

const gameAccentMap: Record<string, string> = {
  "Starlight Princess 1000": "#A855F7",
  "Sweet Bonanza": "#F97316",
  "Gates of Olympus": "#3B82F6",
};

interface FreeSpinsProps {
  gameTitle?: string;
  gameIcon?: string;
  available?: number;
  total?: number;
  maxWin?: number;
  expiration?: string;
  gameId?: string; // 游戏ID，用于跳转
  isAvailable?: boolean; // 是否可玩
}

export function BonusFreeSpinsCard({ 
  gameTitle = "Starlight Princess 1000",
  gameIcon = "/images/illustrations/1857b3c3960b034ca7ae8715066f61f100c62d43.png",
  available = 20,
  total = 20,
  maxWin = 570.47,
  expiration = "27d 09h 32m",
  gameId,
  isAvailable = true
}: FreeSpinsProps) {
  const { t } = useTranslation();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const navigate = useNavigate();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const fallbackBackground = useMemo(() => {
    const accent = gameAccentMap[gameTitle];
    if (accent) {
      return createBonusGradient(accent);
    }
    return gradientStyles.purple;
  }, [gameTitle]);

  // 处理Play按钮点击
  const handlePlayClick = () => {
    if (gameId) {
      navigate({ 
        to: '/games/$gameId', 
        params: { gameId } 
      });
    }
  };

  // 判断是否显示Play按钮
  const shouldShowPlayButton = isAvailable && available > 0;

  return (
    <ImageColorCard
      imageUrl={gameIcon}
      defaultBackground={fallbackBackground}
      className="flex items-center p-4 gap-2 rounded-field h-[128px] w-full relative overflow-hidden border border-base-200 transition-all duration-500"
      gradientMode="radial"
      colorOpacity={0.6}
    >
      {/* Info Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsInfoModalOpen(true);
        }}
        className="btn btn-square btn-xs bg-base-200 hover:bg-base-300 absolute right-4 rtl:right-auto rtl:left-4 top-4 transition-colors"
      >
        <Iconify icon="custom:info" className="text-base-content/50" />
      </button>

      {/* Game Cover and Title */}
      <div className="flex items-center gap-4 flex-1">
        <img
          src={gameIcon}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          alt={gameTitle}
          className="w-15 rounded-lg object-cover aspect-3/4"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/illustrations/isometric9.svg";
          }}
        />

        <div className="flex flex-col justify-between h-full w-full text-base-content/50">
          <p className="text-sm font-bold sm:text-base leading-tight line-clamp-2 break-words text-base-content">{gameTitle}</p>
          <div className="flex items-center gap-1 text-xs sm:text-sm mt-2">
            <span className="">{available}/{total}</span>
            <span>{t("bonus:available")}</span>
          </div>
          <div className="flex items-center gap-1 w-full justify-start">
            <div className="flex items-center gap-1 text-xs sm:text-sm">
              <span>{t("gameDetail:maxWin")}:</span>
              <span className="">
                {formatWithConversion(maxWin, "USDT", { showSymbol: true, showCode: false }).formatted}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs sm:text-sm">
            <span>{t("bonus:expires_in")}</span>
            <span className="">{expiration}</span>
          </div>
        </div>
      </div>

      {/* Play Button */}
      {shouldShowPlayButton && (
        <button
          onClick={handlePlayClick}
          className="btn btn-primary btn-soft btn-md px-0 w-20 max-w-20"
        >
          {t("common:common.play")}
        </button>
      )}

      {/* Tips Modal */}
      <BonusFreeSpinsHelpModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)} 
      />
    </ImageColorCard>
  );
}
