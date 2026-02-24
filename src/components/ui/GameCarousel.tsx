import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { isMobile } from "@/utils/browser";
import { cn } from "@/utils/cn";

type ScrollDirection = "left" | "right";

type GameCarouselContextValue = {
  trackRef: React.RefObject<HTMLDivElement | null>;
  scroll: (direction: ScrollDirection) => void;
};

const GameCarouselContext = createContext<GameCarouselContextValue | null>(null);

const useGameCarouselContext = () => useContext(GameCarouselContext);

interface GameCarouselProps {
  children: ReactNode;
  className?: string;
}

const GameCarouselRoot = ({ children, className }: GameCarouselProps) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: ScrollDirection) => {
    const node = trackRef.current;
    if (!node) return;
    const amount = Math.max(200, node.clientWidth * 0.8);
    node.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }, []);

  return (
    <GameCarouselContext.Provider value={{ trackRef, scroll }}>
      <div className={cn("flex flex-col gap-1 w-full", className)}>{children}</div>
    </GameCarouselContext.Provider>
  );
};

interface GameCarouselHeaderProps {
  children: ReactNode;
  onTitleClick?: () => void;
  onAllClick?: () => void;
  allLabel?: ReactNode;
  showArrows?: boolean;
  className?: string;
}

const GameCarouselHeader = ({
  children,
  onTitleClick,
  onAllClick,
  allLabel,
  showArrows = true,
  className,
}: GameCarouselHeaderProps) => {
  const context = useGameCarouselContext();
  const scroll = context?.scroll;

  return (
    <div className={cn("flex justify-between items-center px-1", className)}>
      <div
        className={cn("flex items-center gap-2 px-1", onTitleClick && "cursor-pointer")}
        onClick={onTitleClick}
      >
        {children}
      </div>
      {(onAllClick || showArrows) && (
        <div className="flex items-center gap-1">
          {onAllClick && allLabel !== undefined && (
            <button
              className={cn(
                "btn btn-xs md:btn-sm font-extrabold no-underline px-2 md:px-3 whitespace-nowrap",
                isMobile() && "btn-link",
              )}
              onClick={onAllClick}
            >
              {allLabel}
            </button>
          )}
          {showArrows && (
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                className="btn btn-sm btn-square"
                onClick={() => scroll?.("left")}
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-y-180" />
              </button>
              <button
                type="button"
                className="btn btn-sm btn-square"
                onClick={() => scroll?.("right")}
              >
                <ChevronRight className="w-4 h-4 rtl:rotate-y-180" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface GameCarouselContentProps {
  children: ReactNode;
  className?: string;
}

const GameCarouselContent = ({ children, className }: GameCarouselContentProps) => (
  <div className={cn("relative overflow-x-hidden mt-2", className)}>{children}</div>
);

interface GameCarouselTrackProps {
  children: ReactNode;
  className?: string;
}

const GameCarouselTrack = ({ children, className }: GameCarouselTrackProps) => {
  const context = useGameCarouselContext();
  const fallbackRef = useRef<HTMLDivElement>(null);
  const trackRef = context?.trackRef ?? fallbackRef;

  return (
    <div
      ref={trackRef}
      className={cn(
        "carousel w-full overflow-x-auto rounded-field gap-2 select-none hide-scrollbar",
        className,
      )}
    >
      {children}
    </div>
  );
};

interface GameCarouselItemProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  lazy?: boolean;
  placeholder?: ReactNode;
  rootMargin?: string;
  unmountOnExit?: boolean;
}

const GameCarouselItem = ({
  children,
  className,
  onClick,
  lazy = false,
  placeholder,
  rootMargin = "0px 120px",
  unmountOnExit = false,
}: GameCarouselItemProps) => {
  const context = useGameCarouselContext();
  const itemRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasEntered, setHasEntered] = useState(!lazy);

  useEffect(() => {
    if (!lazy || !itemRef.current) return;

    const root = context?.trackRef.current ?? null;
    let observer: IntersectionObserver | null = null;
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          setIsInView(true);
          if (!unmountOnExit && observer) {
            observer.disconnect();
          }
        } else if (unmountOnExit) {
          setIsInView(false);
        }
      },
      { root, rootMargin, threshold: 0 },
    );

    observer.observe(itemRef.current);
    return () => observer.disconnect();
  }, [lazy, rootMargin, unmountOnExit, context?.trackRef]);

  const shouldRender = !lazy || (unmountOnExit ? isInView : hasEntered);

  return (
    <div ref={itemRef} className={cn("carousel-item", className)} onClick={onClick}>
      {shouldRender ? children : placeholder ?? null}
    </div>
  );
};

interface GameCarouselFadeProps {
  className?: string;
}

const GameCarouselFade = ({ className }: GameCarouselFadeProps) => (
  <div
    className={cn(
      "absolute w-18 sm:w-36 rtl:left-0 ltr:right-0 top-0 bottom-0 ltr:bg-linear-to-r rtl:bg-linear-to-l from-transparent to-base-300/60 z-20 pointer-events-none",
      className,
    )}
  />
);

export const GameCarousel = Object.assign(GameCarouselRoot, {
  Header: GameCarouselHeader,
  Content: GameCarouselContent,
  Track: GameCarouselTrack,
  Item: GameCarouselItem,
  Fade: GameCarouselFade,
});
