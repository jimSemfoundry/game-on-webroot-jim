import type { MotionProps } from 'motion/react';
import type { HTMLAttributes } from 'react';

import { m } from 'motion/react';

import { varContainer } from './variants';

// ----------------------------------------------------------------------

export type MotionContainerProps = HTMLAttributes<HTMLDivElement> &
  MotionProps & {
    animate?: boolean;
    action?: boolean;
  };

export function MotionContainer({
  className,
  animate,
  children,
  action = false,
  ...other
}: MotionContainerProps) {
  return (
    <m.div
      variants={varContainer()}
      initial={action ? false : 'initial'}
      animate={action ? (animate ? 'animate' : 'exit') : 'animate'}
      exit={action ? undefined : 'exit'}
      className={className}
      {...other}
    >
      {children}
    </m.div>
  );
}
