import { cn } from "@/utils/cn";
import Iconify from "@/components/iconify";
import { LazyImage } from "./LazyImage";
import { useNavigate } from "@tanstack/react-router";

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
}

export function GameImage({
  // Legacy props
  src,
  alt,
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
  onClick
}: GameImageProps) {
  const navigate = useNavigate();

  // Derive values from game object or legacy props
  const imageSrc = game?.image || game?.imageUrl || src || '/images/game-placeholder.jpg';
  const imageAlt = game?.game_name || game?.title || alt || 'Game';
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
      navigate({ to: '/games/$gameId', params: { gameId: navigationGameId } });
    }
  };

  const isClickable = (onClick || (!disableNavigation && navigationGameId));
  return (
    <div 
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
      <LazyImage
        src={imageSrc + '&w=200&auto=format,compress&dpr=2'}
        alt={imageAlt}
        className={cn(
          "absolute inset-0 w-full h-full object-fill",
          showHoverEffects && "group-hover:brightness-50 transition-all duration-300",
          className
        )}
        onLoad={onLoad}
        onError={onError}
      />
      
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
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
          <div className="bg-white/30 w-14 h-14 rounded-full flex items-center justify-center">
            <Iconify
              icon="custom:play"
              className="w-7 h-7 text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
