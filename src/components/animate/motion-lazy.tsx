import { domMax, LazyMotion } from 'motion/react';
import type { ReactNode } from 'react';

// ----------------------------------------------------------------------

export type MotionLazyProps = {
  children: ReactNode;
};

export function MotionLazy({ children }: MotionLazyProps) {
  return (
    <LazyMotion strict features={domMax}>
      {children}
    </LazyMotion>
  );
}
