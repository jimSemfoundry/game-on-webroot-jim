import { useLikeGameMutation } from "@/hooks/api/useAuth";
import { cn } from "@/utils/cn";
import { m } from "motion/react";
import { useState, useCallback } from "react";

interface FavoriteButtonProps {
  inner_game_id: string;
  initialIsFavorite?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const FavoriteButton = ({
  inner_game_id,
  initialIsFavorite = false,
  size = "md",
  className,
}: FavoriteButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [showParticles, setShowParticles] = useState(false);
  const { mutate: likeGame, isPending } = useLikeGameMutation();

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 700);
    if (isPending) return;
    likeGame(inner_game_id, {
      onSuccess: (response) => {
        if (response.code === 0) {
          setIsFavorite(response.data.is_favorite);
        }
      },
      onError: () => {
        setShowParticles(false);
      }
    });
  }, [isPending, inner_game_id, likeGame]);

  const sizeConfig = {
    sm: {
      button: "btn-sm",
      icon: "w-4 h-4"
    },
    md: {
      button: "btn-md", 
      icon: "w-5 h-5"
    },
    lg: {
      button: "btn-lg",
      icon: "w-6 h-6"
    }
  };

  const config = sizeConfig[size];

  return (
    <m.button
      onClick={handleClick}
      className={cn(
        "btn btn-square relative",
        config.button,
        className
      )}
      aria-pressed={isFavorite}
      style={{ overflow: "visible" }}
      aria-label={isFavorite ? "Unlike" : "Like"}
      whileTap={{ scale: 0.9 }}
    >
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none z-[9999]">
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (i / 20) * Math.PI * 2;
            const distance = Math.random() * 40 + 20;
            const size = Math.random() * 5 + 3;
            const hue = Math.random() * 50;
            return (
              <m.div
                key={i}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  backgroundColor: `hsl(${hue}, 100%, 50%)`,
                  transform: "translate(-50%, -50%)",
                }}
                initial={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance,
                  scale: 0,
                  opacity: 0,
                }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
              />
            );
          })}
        </div>
      )}

      <m.svg
        width="18"
        height="18"
        viewBox="0 0 24 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ scale: isFavorite ? 1.2 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
      >
        <m.path
          d="M11.645 21.718L11.6384 21.7145L11.6158 21.7023C11.5965 21.6918 11.5689 21.6766 11.5336 21.6569C11.4629 21.6175 11.3612 21.5598 11.233 21.4843C10.9765 21.3334 10.6132 21.1113 10.1785 20.8223C9.31074 20.2455 8.15122 19.3975 6.9886 18.3137C4.68781 16.1689 2.25 12.9825 2.25 9.05737C2.25 6.12932 4.7136 3.80737 7.6875 3.80737C9.43638 3.80737 11.0023 4.60646 12 5.85897C12.9977 4.60646 14.5636 3.80737 16.3125 3.80737C19.2864 3.80737 21.75 6.12932 21.75 9.05737C21.75 12.9825 19.3122 16.1689 17.0114 18.3137C15.8488 19.3975 14.6893 20.2455 13.8215 20.8223C13.3868 21.1113 13.0235 21.3334 12.767 21.4843C12.6388 21.5598 12.5371 21.6175 12.4664 21.6569C12.4311 21.6766 12.4035 21.6918 12.3842 21.7023L12.3616 21.7145L12.355 21.718L12.3523 21.7195C12.1323 21.8363 11.8677 21.8363 11.6477 21.7195L11.645 21.718Z"
          animate={{ fill: isFavorite ? "#FF506E" : "#A6ADBB" }}
          transition={{ duration: 0.2 }}
        />
      </m.svg>
    </m.button>
  );
};