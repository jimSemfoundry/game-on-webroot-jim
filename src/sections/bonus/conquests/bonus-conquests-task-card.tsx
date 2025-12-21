import { useCallback, useEffect, useState } from "react";
import { ProgressWithLabel } from "@/components/ui/ProgressBar";
import { gradientStyles, createBonusGradient, type GradientColor } from "@/sections/bonus/styles";
import { useVibrantColor } from "@/hooks/useVibrantColor";

export interface BonusConquestsTaskCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradientColor: GradientColor;
  reward: string;
  progress: number;
  completed: boolean;
  category?: string;
  backgroundStyle?: string;
  onGoClick: (taskId: string) => void;
  onColorExtracted: (taskId: string, color: string) => void;
}

export const BonusConquestsTaskCard = ({
  id,
  title,
  description,
  icon,
  gradientColor,
  progress,
  backgroundStyle,
  onGoClick,
  onColorExtracted
}: BonusConquestsTaskCardProps) => {
  const [background, setBackground] = useState<string>(gradientStyles[gradientColor]);
  const { hex } = useVibrantColor(icon);

  useEffect(() => {
    if (hex) {
      const newGradient = createBonusGradient(hex);
      setBackground(newGradient);
      onColorExtracted(id, newGradient);
    }
  }, [hex, id, onColorExtracted]);

  const handleGoClick = useCallback(() => {
    onGoClick(id);
  }, [id, onGoClick]);

  return (
    <div
      className="rounded-field p-4 relative overflow-hidden border border-base-200"
      style={{
        background: backgroundStyle || background,
      }}
    >
      <div className="flex flex-col gap-3">
        {/* Top Section: Icon + Name + Description */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="rounded-lg flex items-center justify-center flex-shrink-0">
            <img
              src={icon}
              alt={title}
              className="w-15 h-15 object-contain"
              loading="lazy"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-base-content mb-2">{title}</h4>
            <p className="text-xs text-base-content/60 leading-4">{description}</p>
          </div>
        </div>

        {/* Bottom Section: Progress + Go Button */}
        <div className="flex items-center gap-3">
          {/* Progress Section */}
          <ProgressWithLabel
            progress={progress}
            label="Progress"
            className="opacity-50"
          />

          {/* Go Button */}
          <button
            onClick={handleGoClick}
            className="btn w-20 btn-primary btn-soft btn-md px-4 flex-shrink-0"
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
};
