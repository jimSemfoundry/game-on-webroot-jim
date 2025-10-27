import type { MotionValue, MotionProps } from 'motion/react';
import type { HTMLAttributes, SVGAttributes } from 'react';

import { m, useSpring, useTransform } from 'motion/react';
import { cn } from '@/utils/cn';
import { createPortal } from 'react-dom';

// ----------------------------------------------------------------------

type BaseProps = MotionProps & HTMLAttributes<HTMLDivElement> & SVGAttributes<SVGSVGElement>;

export interface ScrollProgressProps extends BaseProps {
  size?: number;
  portal?: boolean;
  thickness?: number;
  whenScroll?: 'x' | 'y';
  progress: MotionValue<number>;
  variant: 'linear' | 'circular';
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  wrapperClassName?: string;
}

export function ScrollProgress({
  size,
  portal,
  variant,
  className,
  wrapperClassName,
  thickness = 3.6,
  whenScroll = 'y',
  color = 'primary',
  progress: progressProps,
  ...other
}: ScrollProgressProps) {
  const transformProgress = useTransform(progressProps, [0, -1], [0, 1]);

  // For RTL support - you can add RTL context here if needed
  const isRtl = false; // Replace with your RTL context
  const progress = isRtl && whenScroll === 'x' ? transformProgress : progressProps;

  const scaleX = useSpring(progress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const progressSize = variant === 'circular' ? (size ?? 64) : (size ?? 3);

  const colorClasses = {
    inherit: 'text-current',
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
  };

  const backgroundColorClasses = {
    inherit: 'bg-current',
    primary: 'bg-gradient-to-br from-primary/80 to-primary',
    secondary: 'bg-gradient-to-br from-secondary/80 to-secondary',
    success: 'bg-gradient-to-br from-success/80 to-success',
    warning: 'bg-gradient-to-br from-warning/80 to-warning',
    error: 'bg-gradient-to-br from-error/80 to-error',
  };

  const renderCircular = () => (
    <svg
      viewBox={`0 0 ${progressSize} ${progressSize}`}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        'transform -rotate-90',
        colorClasses[color],
        className
      )}
      style={{
        width: progressSize,
        height: progressSize,
      }}
      {...other}
    >
      <circle
        cx={progressSize / 2}
        cy={progressSize / 2}
        r={progressSize / 2 - thickness - 4}
        strokeWidth={thickness}
        strokeOpacity={0.2}
        fill="none"
        strokeDashoffset={0}
        stroke="currentColor"
      />

      <m.circle
        cx={progressSize / 2}
        cy={progressSize / 2}
        r={progressSize / 2 - thickness - 4}
        strokeWidth={thickness}
        fill="none"
        strokeDashoffset={0}
        stroke="currentColor"
        style={{ pathLength: progress }}
      />
    </svg>
  );

  const renderLinear = () => (
    <m.div
      className={cn(
        'fixed top-0 left-0 right-0 origin-left',
        backgroundColorClasses[color],
        className
      )}
      style={{
        height: progressSize,
        scaleX,
      }}
      {...other}
    />
  );

  const content = (
    <div className={wrapperClassName}>
      {variant === 'circular' ? renderCircular() : renderLinear()}
    </div>
  );

  if (portal) {
    return createPortal(content, document.body);
  }

  return content;
}