import type { MotionProps } from 'motion/react';
import type { HTMLAttributes } from 'react';

import { m } from 'motion/react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import { varContainer } from './variants';

// ----------------------------------------------------------------------

export type MotionViewportProps = HTMLAttributes<HTMLDivElement> &
  MotionProps & {
    disableAnimate?: boolean;
    disableOnMobile?: boolean;
  };

export function MotionViewport({
  children,
  className,
  viewport,
  disableAnimate = false,
  disableOnMobile = true,
  variants,
  initial = 'initial',
  whileInView = 'animate',
  ...other
}: MotionViewportProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const disabled = (isMobile && disableOnMobile) || disableAnimate;

  if (disabled) {
    return (
      <div className={className} {...other}>
        {children}
      </div>
    );
  }

  return (
    <m.div
      initial={initial}
      whileInView={whileInView}
      variants={variants || varContainer()}
      viewport={{ once: true, amount: 0.3, ...viewport }}
      className={className}
      {...other}
    >
      {children}
    </m.div>
  );
}
