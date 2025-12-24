import type React from "react";
import Iconify from "@/components/iconify";
import { Countdown } from "@/components/ui";
import { ImageColorCard } from "@/components/ui/ImageColorCard";
import { LazyImage } from "@/components/ui/LazyImage";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useClaimReward } from "@/query/free-spins";
import { useNavigate } from "@tanstack/react-router";
import { useToggle } from "ahooks";
import { useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { createBonusGradient, gradientStyles } from "../styles";
import { BonusFreeSpinsHelpModal } from "./bonus-free-spins-help-modal";
import { FreeSpinStatus, resolveFreeSpinStatus } from "@/types/freeSpins";

const gameAccentMap: Record<string, string> = {
  "Starlight Princess 1000": "#A855F7",
  "Sweet Bonanza": "#F97316",
  "Gates of Olympus": "#3B82F6"
};

interface FreeSpinsProps {
  gameTitle?: string;
  gameIcon?: string;
  available?: number;
  total?: number;
  maxWin?: number;
  expiration?: number;
  gameId?: string; // 游戏ID，用于跳转
  isAvailable?: boolean; // 是否可玩
  handleStatus?: number | string;
  freeSpinCode?: string;
  turnoverLimit?: number;
  currentTurnover?: number;
  winAmount?: number;
  currency?: string;
  isExpired?: boolean;
  recordId?: string | number;
  isTurnoverMet?: boolean;
}

export function BonusFreeSpinsCard({
                                     gameTitle = "Starlight Princess 1000",
                                     gameIcon = "/images/illustrations/1857b3c3960b034ca7ae8715066f61f100c62d43.png",
                                     available = 20,
                                     total = 20,
                                     maxWin = 570.47,
                                     expiration = 0,
                                     gameId,
                                     handleStatus,
                                     freeSpinCode,
                                     turnoverLimit = 0,
                                     currentTurnover = 0,
                                     winAmount = 0,
                                     currency = "USDT",
                                     isExpired = false,
                                     isAvailable = false,
                                     recordId,
                                     isTurnoverMet
                                   }: FreeSpinsProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const navigate = useNavigate();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const { mutate: claimReward, isPending: isClaiming } = useClaimReward();
  const [finished, { set }] = useToggle<boolean>(false);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const fallbackBackground = useMemo(() => {
    const accent = gameAccentMap[gameTitle];
    if (accent) {
      return createBonusGradient(accent);
    }
    return gradientStyles.purple;
  }, [gameTitle]);

  const parsedTurnoverLimit = Math.max(0, Number(turnoverLimit ?? 0));
  const parsedCurrentTurnover = Math.max(0, Number(currentTurnover ?? 0));
  const progressPercent =
    parsedTurnoverLimit > 0 ? Math.min((parsedCurrentTurnover / parsedTurnoverLimit) * 100, 100) : 0;

  const normalizedHandleStatus = Number.isFinite(Number(handleStatus)) ? Number(handleStatus) : undefined;
  const resolvedStatus = resolveFreeSpinStatus({
    handle_status: normalizedHandleStatus as FreeSpinStatus | undefined,
    status: normalizedHandleStatus as FreeSpinStatus | undefined,
    is_turnover_requirement_met: isTurnoverMet,
    turnover_limit_usdt: String(parsedTurnoverLimit || 0),
    current_turnover_limit_usdt: String(parsedCurrentTurnover || 0)
  });
  const isPlayState = Boolean(isAvailable && available > 0);
  const hasExpiration = Boolean(expiration);
  const expired = finished || isExpired || (hasExpiration && expiration * 1000 <= Date.now());

  // 处理Play按钮点击
  const handlePlayClick = () => {
    if (!gameId) return;

    const trimmedCurrency = typeof currency === "string" ? currency.trim() : "";
    const mobileSearchParams = trimmedCurrency ? { currency: trimmedCurrency } : undefined;

    if (isMobile) {
      navigate({
        to: "/games/play/$gameId",
        params: { gameId },
        search: mobileSearchParams
      });
    } else {
      navigate({
        to: "/games/$gameId",
        params: { gameId },
        search: { freeSpins: "true", currency: trimmedCurrency || undefined }
      });
    }
  };

  const handleClaimReward = () => {
    const payload = freeSpinCode
      ? { free_spin_code: freeSpinCode }
      : recordId
        ? { record_id: String(recordId) }
        : null;
    if (!payload) return;
    claimReward(payload);
  };

  const formattedMaxWin = formatWithConversion(maxWin ?? 0, currency, {
    showSymbol: true,
    showCode: false
  }).formatted;

  const formattedWinAmount = formatWithConversion(winAmount ?? 0, currency, {
    showSymbol: true,
    showCode: false
  }).formatted;

  const turnoverCurrency = "USDT";

  const formattedTurnoverCurrent = formatWithConversion(parsedCurrentTurnover, turnoverCurrency, {
    showSymbol: true,
    showCode: false
  }).formatted;

  const formattedTurnoverTotal = formatWithConversion(parsedTurnoverLimit, turnoverCurrency, {
    showSymbol: true,
    showCode: false
  }).formatted;

  const isProgressCard = !isPlayState;
  const ctaLabel = (() => {
    switch (resolvedStatus) {
      case FreeSpinStatus.CLAIM:
        return t("bonus:claim");
      case FreeSpinStatus.ONGOING:
        return t("bonus:ongoing");
      case FreeSpinStatus.CLAIMED:
        return t("bonus:status.claimed");
      case FreeSpinStatus.CANCELLED:
        return t("bonus:status.cancelled");
      default:
        return t("transaction:transactionStatus.pending");
    }
  })();
  const actionButtonClass = (() => {
    if (resolvedStatus === FreeSpinStatus.CLAIM) return "btn-primary text-primary-content";
    if (resolvedStatus === FreeSpinStatus.ONGOING) return "bg-primary/20 text-primary border-none";
    return "bg-base-200 text-base-content/60 border-none";
  })();
  const actionDisabled = resolvedStatus !== FreeSpinStatus.CLAIM;

  if (!isAuthenticated) {
    return (
      <ImageColorCard
        gradientMode="linear"
        imageUrl="/images/illustrations/08fb6136f804423bc7c787dffd61015d6a46771b.png"
        colorOpacity={0.6}
        paletteOrder={["DarkVibrant", "Vibrant", "Muted"]}
        className="flex items-center p-8 gap-2 rounded-field h-[140px] sm:h-[170px] w-full relative overflow-hidden border border-base-200 transition-all duration-500"
      >
        <p className="text-2xl sm:text-4xl font-bold uppercase leading-6 sm:leading-8 text-start">
          <span className="text-base-content block">{t("bonus:freeSpins")}</span>
          <span className="text-primary block">{t("bonus:bonus")}</span>
        </p>
        <LazyImage src="/images/illustrations/08fb6136f804423bc7c787dffd61015d6a46771b.png" alt="free spins"
                   className="w-[150px] h-[150px] sm:w-[185px] sm:h-[185px] -rotate-4 absolute right-0 top-0 rtl:rotate-y-180 rtl:left-0 rtl:right-auto" />
      </ImageColorCard>
    );
  }
  return (
    <ImageColorCard
      imageUrl={gameIcon}
      defaultBackground={fallbackBackground}
      className="relative w-full overflow-hidden rounded-field border border-base-200 bg-base-200/30 transition-all duration-500 p-4"
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

      {/* Content */}
      {isProgressCard ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <img
              src={gameIcon}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              alt={gameTitle}
              className="w-15 rounded-field object-cover aspect-[3/4] shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/illustrations/isometric9.svg";
              }}
            />
            <div className="flex flex-col gap-1 flex-1 text-base-content/70">
              <p className="text-sm sm:text-base font-bold text-base-content">
                {t("bonus:freeSpins")} {freeSpinCode || gameTitle || t("bonus:freeSpins")}
              </p>
              <p className="text-xs sm:text-sm leading-snug">
                <Trans i18nKey="bonus:wager_free_spin"
                       values={{ value1: formattedTurnoverTotal, value2: formattedWinAmount }}
                       components={[<span className="text-primary font-semibold" />]} />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-base-content">
                <span className="text-xs tracking-wide text-base-content/70">{t("bonus:progress")}:</span>
                <span className="text-base-content font-semibold text-xs">
                  {formattedTurnoverCurrent} / {formattedTurnoverTotal}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-base-200/80 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPercent}%`,
                    background: "linear-gradient(90deg, #C4E02C 0%, #A0C526 45%, #7EA020 100%)"
                  }}
                ></div>
              </div>
            </div>
            <button
              className={`btn btn-md max-w-20 w-20 rounded-field text-sm font-semibold ${actionButtonClass}`}
              disabled={actionDisabled}
              onClick={resolvedStatus === FreeSpinStatus.CLAIM ? handleClaimReward : undefined}
            >
              {isClaiming ? <span className="loading loading-spinner loading-xs"></span> : ctaLabel}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start sm:items-center gap-4">
          <img
            src={gameIcon}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            alt={gameTitle}
            className="w-15 rounded-field object-cover aspect-[3/4] shadow-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/illustrations/isometric9.svg";
            }}
          />
          <div className="flex flex-col h-full w-full text-base-content/70 gap-3 flex-1">
            <p className="text-sm font-bold sm:text-base leading-tight line-clamp-2 break-words text-base-content">
              {gameTitle}
            </p>
            <div className="text-xs sm:text-sm">
              <p className="font-semibold text-base-content">
                {available}/{total} <span className="font-normal text-base-content/70">{t("bonus:available")}</span>
              </p>
              <p className="flex items-center gap-1">
                <span>{t("gameDetail:maxWin")}:</span>
                <span className="font-semibold text-base-content">{formattedMaxWin}</span>
              </p>
              <p className="flex items-center gap-1">
                <span>{expired ? t("transaction:transactionStatus.expired") : t("bonus:expires")}:</span>
                {!expired && hasExpiration ? (
                  <Countdown
                    className="text-xs sm:text-sm"
                    target={expiration * 1000}
                    onComplete={() => set(true)}
                    renderCustom={(time) => (
                      <div className={"font-mono text-xs sm:text-sm flex items-center"}>
                        <span className="countdown">
                          <span style={{ "--value": time.days } as React.CSSProperties}></span>
                        </span>
                        <span className="mr-0.5">d</span>
                        <span className="countdown">
                          <span style={{ "--value": time.hours } as React.CSSProperties}></span>
                        </span>
                        <span className="mr-0.5">h</span>
                        <span className="countdown">
                          <span style={{ "--value": time.minutes } as React.CSSProperties}></span>
                        </span>
                        <span>m</span>
                        <span className="countdown">
                          <span style={{ "--value": time.seconds } as React.CSSProperties}></span>
                        </span>
                        <span>s</span>
                      </div>
                    )}
                  />
                ) : !hasExpiration ? (
                  <span className="text-base-content/50">--</span>
                ) : null}
              </p>
            </div>
          </div>
          <button onClick={handlePlayClick} className="btn btn-primary btn-md px-5 rounded-field self-center">
            {t("common:common.play")}
          </button>
        </div>
      )}

      {/* Tips Modal */}
      <BonusFreeSpinsHelpModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
    </ImageColorCard>
  );
}
