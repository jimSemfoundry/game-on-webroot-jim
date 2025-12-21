import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import Iconify from "@/components/iconify";
import { useNavigate } from "@tanstack/react-router";
import { GameAvailabilityStatus } from "@/components/GameAvailabilityStatus.tsx";

// Game object interface
interface Game {
  inner_game_id?: string;
  game_provider?: string;
  game_name?: string;
  title?: string;
  image?: string;
  imageUrl?: string;
  // Add other common game properties as needed
}

interface GameImageProps {
  // Legacy props for backward compatibility
  src?: string;
  alt?: string;
  gameName?: string;
  gameId?: string;

  // New game object prop
  game?: Game;

  // Common props
  className?: string;
  containerClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
  showHoverEffects?: boolean;
  disableNavigation?: boolean;
  onClick?: () => void;
  lazy?: boolean;
  data: Record<string, any>;
  hideLock?: boolean
}

export function GameImage(
  {
    // Legacy props
    src,
    alt,
    data,
    gameName,
    gameId,

    // New game object prop
    game,

    // Common props
    className,
    containerClassName,
    onLoad,
    onError,
    showHoverEffects = false,
    disableNavigation = false,
    onClick,
    lazy = true,
    hideLock = false
  }: GameImageProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!lazy);
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);
  const [showLowQuality, setShowLowQuality] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Derive values from game object or legacy props
  const imageSrc = game?.image || game?.imageUrl || src || "/images/game-placeholder.jpg";
  const imageAlt = game?.game_name || game?.title || alt || "Game";
  const displayName = game?.game_name || game?.title || gameName;

  // Create unique gameId for navigation
  const navigationGameId = game
    ? (game.game_provider ? `${game.game_provider}:${game.inner_game_id}` : game.inner_game_id)
    : gameId;

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (!disableNavigation && navigationGameId) {
      navigate({ to: "/games/$gameId", params: { gameId: navigationGameId }, search: {} });
    }
  };

  const isClickable = (onClick || (!disableNavigation && navigationGameId));

  const getProcessedImageUrl = (baseUrl: string, isLowQuality: boolean): string => {
    if (!baseUrl) return "";

    const hasQueryParams = baseUrl.includes("?");
    const separator = hasQueryParams ? "&" : "?";

    if (isLowQuality) {
      return `${baseUrl}${separator}w=120&auto=format,compress&blur=90&cs=tinysrgb`;
    }

    return `${baseUrl}${separator}${getImgixParams()}`;
  };

  const lowQualityUrl = getProcessedImageUrl(imageSrc, true);
  const highQualityUrl = getProcessedImageUrl(imageSrc, false);

  useEffect(() => {
    setIsHighQualityLoaded(false);
    setShowLowQuality(true);
    setHasError(false);
  }, [imageSrc]);

  useEffect(() => {
    if (!lazy) return;
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin: "50px", threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [lazy]);

  useEffect(() => {
    if (!isVisible || !imageSrc || hasError) return;

    let isMounted = true;
    const img = new Image();
    img.src = highQualityUrl;
    img.onload = () => {
      if (!isMounted) return;
      setIsHighQualityLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      if (!isMounted) return;
      setHasError(true);
      onError?.();
    };

    return () => {
      isMounted = false;
    };
  }, [highQualityUrl, imageSrc, isVisible, hasError, onError, onLoad]);

  useEffect(() => {
    if (!isHighQualityLoaded) return;
    const timer = setTimeout(() => setShowLowQuality(false), 400);
    return () => clearTimeout(timer);
  }, [isHighQualityLoaded]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden rounded-field bg-base-300",
        // 3:4 aspect ratio using padding-bottom trick
        "aspect-[3/4]",
        showHoverEffects && "group",
        isClickable && "cursor-pointer",
        containerClassName
      )}
      onClick={isClickable ? handleClick : undefined}
    >
      {imageSrc && !hasError ? (
        <>
          {isVisible && showLowQuality && (
            <img
              src={lowQualityUrl}
              alt={imageAlt}
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-fill blur-2xl scale-110 brightness-90"
            />
          )}
          {isVisible && (
            <img
              src={highQualityUrl}
              alt={imageAlt}
              loading="lazy"
              className={cn(
                "absolute inset-0 h-full w-full object-fill transition-opacity duration-500",
                showHoverEffects && "group-hover:brightness-50",
                className,
                isHighQualityLoaded ? "opacity-100" : "opacity-0"
              )}
            />
          )}
        </>
      ) : (
        <div className="absolute inset-0 h-full w-full bg-base-200" />
      )}

      {showHoverEffects && displayName && (
        <p
          className={cn(
            "text-base-content absolute top-4 leading-3.5 font-semibold w-full text-center opacity-0 group-hover:opacity-100 transition-all duration-300",
            displayName.length > 30
              ? "tracking-normal text-[10px]"
              : "text-xs sm:text-sm break-words"
          )}
        >
          {displayName}
        </p>
      )}

      {showHoverEffects && (
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
          <div className="bg-white/30 w-14 h-14 rounded-full flex items-center justify-center">
            <Iconify
              icon="custom:play"
              className="w-7 h-7 text-white"
            />
          </div>
        </div>
      )}

      {/* 游戏可用状态 */}
      {!hideLock && <GameAvailabilityStatus data={data} />}
    </div>
  );
}

export function getNetworkType(): "4g" | "3g" | "slow-2g" | "2g" {
  if ("connection" in navigator) return (navigator as any)?.connection?.effectiveType ?? "4g";
  return "4g";
}

function getImgixParams() {
  const network = getNetworkType();
  let params = "";
  if (network === "slow-2g" || network === "2g") {
    params = "w=70&auto=format,compress&dpr=1&q=80";
  } else if (network === "3g") {
    params = "w=100&auto=format,compress&dpr=1.25&q=80";
  } else {
    params = "w=200&auto=format,compress&dpr=1.5&q=80";
  }
  return params;
}