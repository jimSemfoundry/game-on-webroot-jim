import type { HTMLAttributes } from 'react';

import { useRef, useState, useEffect } from 'react';
import {
  m,
  useTransform,
  useMotionValue,
  useAnimationFrame,
  useMotionTemplate,
} from 'motion/react';
import { cn } from '@/utils/cn';

// ----------------------------------------------------------------------

type BorderStyleProps = {
  width?: string;
  color?: string;
};

export type AnimateBorderProps = HTMLAttributes<HTMLDivElement> & {
  rounded?: boolean;
  children?: React.ReactNode;
  sx?: React.CSSProperties;
  slotProps?: {
    primaryBorder?: BorderStyleProps;
    secondaryBorder?: BorderStyleProps;
  };
};

export function AnimateBorder({
  sx,
  children,
  className,
  slotProps,
  rounded = true,
  ...other
}: AnimateBorderProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  const progress = useMotionValue(0);

  useAnimationFrame((time) => {
    if (pathLength) {
      progress.set((time / 5000) % 1);
    }
  });

  const strokeDasharray = useMotionTemplate`${pathLength} ${pathLength}`;
  const strokeDashoffset = useTransform(progress, [0, 1], [0, pathLength]);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  const primaryBorderWidth = slotProps?.primaryBorder?.width ?? '2px';
  const primaryBorderColor = slotProps?.primaryBorder?.color ?? 'rgb(var(--color-primary))';
  const secondaryBorderWidth = slotProps?.secondaryBorder?.width ?? '1px';
  const secondaryBorderColor = slotProps?.secondaryBorder?.color ?? 'rgb(var(--color-primary) / 0.3)';

  return (
    <div
      className={cn(
        'relative',
        rounded && 'rounded-lg',
        className
      )}
      style={sx}
      {...other}
    >
      {/* Content */}
      {children}

      {/* Primary animated border */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="absolute inset-0 w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <m.path
            ref={pathRef}
            d={rounded ? 
              "M 8 0 L calc(100% - 8px) 0 Q 100% 0 100% 8 L 100% calc(100% - 8px) Q 100% 100% calc(100% - 8px) 100% L 8 100% Q 0 100% 0 calc(100% - 8px) L 0 8 Q 0 0 8 0 Z" :
              "M 0 0 L 100% 0 L 100% 100% L 0 100% Z"
            }
            stroke={primaryBorderColor}
            strokeWidth={primaryBorderWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray,
              strokeDashoffset,
            }}
          />
        </svg>
      </div>

      {/* Secondary static border */}
      <div 
        className={cn(
          'absolute inset-0 pointer-events-none border',
          rounded && 'rounded-lg'
        )}
        style={{
          borderWidth: secondaryBorderWidth,
          borderColor: secondaryBorderColor,
        }}
      />
    </div>
  );
}