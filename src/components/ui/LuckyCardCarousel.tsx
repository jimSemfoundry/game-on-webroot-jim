import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, m, Variants } from 'motion/react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useNavigate } from '@tanstack/react-router';

// ==========================================
// Types
// ==========================================

export interface Game {
  id: string
  inner_game_id?: string
  game_provider?: string
  display_game_name: string
  image: string
  provider?: string
}

interface LuckyGameCarouselProps {
  games: Game[]
  isShuffling: boolean
  onGameSelected: (game: Game) => void
  onAnimationComplete: () => void
}

export type AnimationPhase = 'idle' | 'gathering' | 'shuffling' | 'flipping' | 'revealing';

// ==========================================
// Sub-Component: Card (Internal)
// ==========================================

interface CardProps {
  data: Game;
  index: number;
  activeIndex: number;
  totalCards: number;
  animationPhase: AnimationPhase;
  isMobile: boolean;
  isWinner: boolean;
  isHidden?: boolean;
}

const Card: React.FC<CardProps> = React.memo(({
  data,
  index,
  activeIndex,
  totalCards,
  animationPhase,
  isMobile,
  isWinner,
  isHidden,
}) => {
  // Circular Relative Position Logic
  let offset = index - activeIndex;
  const halfTotal = Math.floor(totalCards / 2);

  // Handle wrapping for infinite loop illusion
  if (offset > halfTotal) {
    offset -= totalCards;
  } else if (offset < -halfTotal) {
    offset += totalCards;
  }

  const isActive = index === activeIndex;

  // Responsive Parameters
  const cardWidth = isMobile ? 140 : 200; // Slightly smaller to fit QuickActions container
  const cardHeight = isMobile ? 210 : 300;
  const GAP = isMobile ? 110 : 160;

  const variants: Variants = {
    spread: () => {
      // Common Defaults
      let scale = 1;
      let xPosition = 0;
      let opacity = 1;
      let zIndex = totalCards - Math.abs(offset);
      let rotateY = 0;
      let rotateZ = 0;
      let brightness = 1;
      let yPosition = 0;

      // 1. GATHERING PHASE (Stacked in center)
      if (animationPhase === 'gathering') {
        xPosition = 0;
        rotateY = 0;
        scale = 1 - Math.abs(offset) * 0.01;
        opacity = 1;
        zIndex = totalCards - Math.abs(offset);
        // Organic Randomness
        rotateZ = Math.sin(index * 123) * 4;
        brightness = 1 - (Math.abs(offset) * 0.05);
      }
      // 2. FLIPPING PHASE (Center card spin)
      else if (animationPhase === 'flipping') {
        xPosition = offset * GAP;
        opacity = Math.abs(offset) > 2 ? 0 : Math.max(0.5, 1 - Math.abs(offset) * 0.2);

        if (isActive) {
          rotateY = 360;
          yPosition = -20;
          scale = 1.2;
          brightness = 1.3;
        } else {
          rotateY = offset * -2;
          scale = Math.max(0.8, 1 - Math.abs(offset) * 0.1);
          yPosition = 0;
          brightness = Math.max(0.5, 1 - Math.abs(offset) * 0.15);
        }
      }
      // 3. SHUFFLING & IDLE PHASE (Spread Carousel)
      else {
        xPosition = offset * GAP;
        const absOffset = Math.abs(offset);
        scale = isActive ? 1.1 : Math.max(0.8, 1 - absOffset * 0.1);
        opacity = absOffset > 2 ? 0 : Math.max(0.5, 1 - absOffset * 0.2);
        rotateY = offset * -2;
        yPosition = 0;
        brightness = isActive ? 1.1 : Math.max(0.5, 1 - absOffset * 0.15);
      }

      let boxShadow: any = "0 15px 30px -6px rgba(0, 0, 0, 0.5)";

      // Define Transitions
      let layoutTransition: any;
      if (animationPhase === 'shuffling') {
        layoutTransition = { duration: 0.15, ease: "linear" };
      } else if (animationPhase === 'gathering') {
        layoutTransition = { type: 'spring', stiffness: 180, damping: 20 };
      } else if (animationPhase === 'flipping') {
        layoutTransition = { duration: 0.6, ease: "backInOut" };
      } else {
        layoutTransition = { type: 'spring', stiffness: 120, damping: 20, mass: 1.1 };
      }

      let effectTransition: any = layoutTransition;

      if (isActive && isWinner && animationPhase === 'idle') {
        boxShadow = [
          "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
          "0 0 50px 10px rgba(139, 92, 246, 0.6)",
          "0 25px 50px -12px rgba(0, 0, 0, 0.8)"
        ];
        effectTransition = {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        };
      }

      let rotateYTransition = layoutTransition;
      if (animationPhase === 'idle' && isWinner) {
        rotateYTransition = { duration: 0 };
      }

      // Remove blur filter for better performance
      const safeBrightness = Math.max(0.2, brightness);
      const filter = `brightness(${safeBrightness})`;

      return {
        x: xPosition,
        y: yPosition,
        z: 0,
        rotateY: rotateY,
        rotateZ: rotateZ,
        scale,
        zIndex,
        opacity: isHidden ? 0 : opacity,
        boxShadow,
        filter,
        transition: {
          x: layoutTransition,
          y: layoutTransition,
          z: layoutTransition,
          rotateY: rotateYTransition,
          rotateZ: layoutTransition,
          scale: layoutTransition,
          opacity: { duration: 0.2 },
          zIndex: { duration: 0 },
          boxShadow: effectTransition,
          filter: { duration: 0.2 }
        },
      };
    },
  };

  return (
    <m.div
      layoutId={isHidden ? undefined : `card-container-${data.id}`}
      custom={index}
      variants={variants}
      initial="spread"
      animate="spread"
      className="absolute top-0 bottom-0 my-auto rounded-2xl bg-transparent"
      style={{
        width: cardWidth,
        height: cardHeight,
        left: '50%',
        top: '50%',
        marginLeft: -cardWidth / 2,
        marginTop: -cardHeight / 2,
        transformOrigin: 'center center',
        willChange: 'transform, opacity, filter, box-shadow',
      }}
    >
      <div className="relative w-full h-full overflow-hidden rounded-2xl">
        <m.div className="h-full w-full relative overflow-hidden">
          <m.img
            src={data.image}
            alt={data.display_game_name}
            className="h-full w-full object-cover pointer-events-none"
            animate={isWinner ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={isWinner ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/placeholder-game.png';
            }}
          />
        </m.div>
      </div>
    </m.div>
  );
});

Card.displayName = 'Card';

// ==========================================
// Main Component: LuckyGameCarousel
// ==========================================

export const LuckyCardCarousel: React.FC<LuckyGameCarouselProps> = ({
  games,
  isShuffling,
  onGameSelected,
  onAnimationComplete
}) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('idle');

  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isMobile = !isDesktop;

  const animationRef = useRef<number>(0);
  const activeIndexRef = useRef(activeIndex);

  // Keep track of active index in ref for timeouts
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, []);

  // Handle Shuffle Trigger
  useEffect(() => {
    if (isShuffling && animationPhase === 'idle') {
      startShuffleSequence();
    }
  }, [isShuffling]);

  const startShuffleSequence = useCallback(() => {
    // 1. Start Shuffling Immediately
    setAnimationPhase('shuffling');
    setWinnerId(null);

    const runSelectionSequence = () => {
      if (games.length === 0) return;

      const startIndex = activeIndexRef.current;
      const targetIndex = Math.floor(Math.random() * games.length);
      const MIN_LOOPS = 2;
      const distanceToTarget = (targetIndex - startIndex + games.length) % games.length;
      const totalSteps = (games.length * MIN_LOOPS) + distanceToTarget;

      let currentStep = 0;

      const animateStep = () => {
        currentStep++;
        setActiveIndex(prev => (prev + 1) % games.length);

        if (currentStep < totalSteps) {
          const progress = currentStep / totalSteps;
          // Easing function for the shuffle speed
          const delay = 20 + Math.pow(progress, 3) * 150;
          animationRef.current = window.setTimeout(animateStep, delay);
        } else {
          // 3. Pause, then Flip/Reveal
          setTimeout(() => {
            setAnimationPhase('flipping');
            // 4. Wait for Flip, then Idle & Winner
            setTimeout(() => {
              setAnimationPhase('idle');
              const winner = games[targetIndex];
              setWinnerId(winner.id);
              onGameSelected(winner);
              onAnimationComplete();
            }, 600);
          }, 100);
        }
      };
      animateStep();
    };

    runSelectionSequence();
  }, [games, onGameSelected, onAnimationComplete]);

  const selectedGame = games.find(g => g.id === winnerId);
  const activeGame = games[activeIndex];

  if (!games || games.length === 0) return null;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Main Deck Container */}
      <m.div
        className="relative w-full flex items-center justify-center perspective-1000"
        style={{ height: '100%' }}
        animate={{
          opacity: winnerId ? 0.3 : 1,
          scale: winnerId ? 0.9 : 1,
          filter: winnerId ? 'blur(4px)' : 'none'
        }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence>
          {games.map((game, index) => (
            <Card
              key={game.id}
              data={game}
              index={index}
              activeIndex={activeIndex}
              totalCards={games.length}
              animationPhase={animationPhase}
              isMobile={isMobile}
              isWinner={game.id === winnerId}
              isHidden={false} // We don't hide cards in this version, we overlay the winner
            />
          ))}
        </AnimatePresence>
      </m.div>

      {/* Initial State Play Button - Shows for active card when no winner */}
      <AnimatePresence>
        {!winnerId && activeGame && animationPhase === 'idle' && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute hidden sm:flex bottom-8 z-30 items-center justify-center"
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
          >
            <button
              className="btn btn-primary btn-lg w-36 shadow-lg"
              onClick={() => {
                if (activeGame?.inner_game_id) {
                  const gameId = activeGame.game_provider
                    ? `${activeGame.game_provider}:${activeGame.inner_game_id}`
                    : activeGame.inner_game_id
                  navigate({ to: `/games/${gameId}` })
                }
              }}
            >
              PLAY
            </button>
          </m.div>
        )}
      </AnimatePresence>

      {/* Winner Overlay (Big Card) */}
      <AnimatePresence>
        {winnerId && selectedGame && (
          <m.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 drop-shadow-[0_25px_50px_hsl(var(--primary)/0.5)]"
            transition={{
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <div className="relative rounded-box group shadow-2xl shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-500">
              <div className="absolute -inset-2 sm:-inset-6 rounded-box bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 blur-xl opacity-60 group-hover:opacity-80 animate-pulse transition-all duration-500" />
              <div className="relative w-40 sm:w-64 aspect-3/4 rounded-box overflow-hidden bg-transparent shadow-lg group-hover:shadow-xl transition-shadow duration-300 z-10">
                <img
                  src={selectedGame.image}
                  alt={selectedGame.display_game_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/placeholder-game.png';
                  }}
                />
              </div>
              <div className="absolute hidden sm:flex bottom-0 translate-y-1/2 z-10 mx-auto left-0 right-0 items-center justify-center">
                <button
                  className="btn btn-primary btn-lg w-36 shadow-lg"
                  onClick={() => {
                    if (selectedGame?.inner_game_id) {
                      const gameId = selectedGame.game_provider
                        ? `${selectedGame.game_provider}:${selectedGame.inner_game_id}`
                        : selectedGame.inner_game_id
                      navigate({ to: `/games/${gameId}` })
                    }
                  }}
                >
                  PLAY
                </button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};