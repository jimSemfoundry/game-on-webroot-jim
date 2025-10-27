import type { HTMLAttributes, ReactNode } from 'react';

import { m } from 'motion/react';
import { cn } from '@/utils/cn';

// ----------------------------------------------------------------------

export type AnimateLogoProps = HTMLAttributes<HTMLDivElement> & {
  logo?: ReactNode;
  logoClassName?: string;
};

export function AnimateLogoZoom({ logo, className, logoClassName, ...other }: AnimateLogoProps) {
  return (
    <div
      className={cn(
        'w-30 h-30 relative inline-flex items-center justify-center',
        className
      )}
      {...other}
    >
      <m.span
        animate={{ scale: [1, 0.9, 0.9, 1, 1], opacity: [1, 0.48, 0.48, 1, 1] }}
        transition={{
          duration: 2,
          repeatDelay: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {logo ?? (
          <div className={cn('w-16 h-16 bg-primary rounded-lg', logoClassName)} />
        )}
      </m.span>

      {/* Primary outline */}
      <m.span
        className="absolute border-3 border-primary/25"
        style={{
          width: 'calc(100% - 20px)',
          height: 'calc(100% - 20px)',
        }}
        animate={{
          scale: [1.6, 1, 1, 1.6, 1.6],
          rotate: [270, 0, 0, 270, 270],
          opacity: [0.25, 1, 1, 1, 0.25],
          borderRadius: ['25%', '25%', '50%', '50%', '25%'],
        }}
        transition={{ ease: 'linear', duration: 3.2, repeat: Infinity }}
      />

      {/* Secondary outline */}
      <m.span
        className="absolute w-full h-full border-8 border-primary/25"
        animate={{
          scale: [1, 1.2, 1.2, 1, 1],
          rotate: [0, 270, 270, 0, 0],
          opacity: [1, 0.25, 0.25, 0.25, 1],
          borderRadius: ['25%', '25%', '50%', '50%', '25%'],
        }}
        transition={{ ease: 'linear', duration: 3.2, repeat: Infinity }}
      />
    </div>
  );
}

// ----------------------------------------------------------------------

export function AnimateLogoRotate({ logo, className, logoClassName, ...other }: AnimateLogoProps) {
  return (
    <div
      className={cn(
        'w-24 h-24 relative inline-flex items-center justify-center',
        className
      )}
      {...other}
    >
      <div className="z-10">
        {logo ?? (
          <div className={cn('w-10 h-10 bg-primary rounded-lg', logoClassName)} />
        )}
      </div>

      <m.span
        className="absolute w-full h-full rounded-full opacity-16 bg-gradient-to-br from-transparent from-50% to-primary transition-opacity duration-200"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, ease: 'linear', repeat: Infinity }}
      />
    </div>
  );
}