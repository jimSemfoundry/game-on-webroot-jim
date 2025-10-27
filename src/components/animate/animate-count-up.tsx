import type { UseInViewOptions } from 'motion/react';
import type { HTMLAttributes } from 'react';

import { useRef, useEffect } from 'react';
import { m, animate, useInView, useTransform, useMotionValue } from 'motion/react';
import { cn } from '@/utils/cn';

// ----------------------------------------------------------------------

export type AnimateCountUpProps = HTMLAttributes<HTMLSpanElement> & {
  to: number;
  from?: number;
  toFixed?: number;
  duration?: number;
  unit?: 'k' | 'm' | 'b' | string;
  once?: UseInViewOptions['once'];
  amount?: UseInViewOptions['amount'];
  component?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
};

export function AnimateCountUp({
  to,
  className,
  from = 0,
  toFixed = 0,
  once = true,
  duration = 2,
  amount = 0.5,
  unit: unitProp,
  component: Component = 'span',
  ...other
}: AnimateCountUpProps) {
  const countRef = useRef(null);

  const shortNumber = shortenNumber(to);

  const startCount = useMotionValue<number>(from);
  const endCount = shortNumber ? shortNumber.value : to;

  const unit = unitProp ?? shortNumber?.unit;

  const inView = useInView(countRef, { once, amount });

  const rounded = useTransform(startCount, (latest) =>
    latest.toFixed(isFloat(latest) ? toFixed : 0)
  );

  useEffect(() => {
    if (inView) {
      animate(startCount, endCount, { duration });
    }
  }, [duration, endCount, inView, startCount]);

  return (
    <Component
      className={cn('inline-flex', className)}
      {...other}
    >
      <m.span ref={countRef}>{rounded}</m.span>
      {unit}
    </Component>
  );
}

// ----------------------------------------------------------------------

function isFloat(n: number | string) {
  return typeof n === 'number' && !Number.isInteger(n);
}

function shortenNumber(value: number): { unit: string; value: number } | undefined {
  if (value >= 1e9) {
    return { unit: 'b', value: value / 1e9 };
  }
  if (value >= 1e6) {
    return { unit: 'm', value: value / 1e6 };
  }
  if (value >= 1e3) {
    return { unit: 'k', value: value / 1e3 };
  }
  return undefined;
}