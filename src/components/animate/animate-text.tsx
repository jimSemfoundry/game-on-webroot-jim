import type { Variants, UseInViewOptions } from 'motion/react';
import type { HTMLAttributes } from 'react';

import { useRef, useMemo, useEffect } from 'react';
import { m, useInView, useAnimation } from 'motion/react';
import { cn } from '@/utils/cn';

import { varFade, varContainer } from './variants';

// ----------------------------------------------------------------------

export type AnimateTextProps = HTMLAttributes<HTMLParagraphElement> & {
  variants?: Variants;
  repeatDelayMs?: number;
  textContent: string | string[];
  once?: UseInViewOptions['once'];
  amount?: UseInViewOptions['amount'];
  component?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div';
};

export function AnimateText({
  className,
  variants,
  textContent,
  once = true,
  amount = 1 / 3,
  component: Component = 'p',
  repeatDelayMs = 100,
  ...other
}: AnimateTextProps) {
  const textRef = useRef(null);
  const animationControls = useAnimation();

  const textArray = useMemo(
    () => (Array.isArray(textContent) ? textContent : [textContent]),
    [textContent]
  );

  const isInView = useInView(textRef, { once, amount });

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const triggerAnimation = () => {
      if (repeatDelayMs) {
        timeout = setTimeout(async () => {
          await animationControls.start('initial');
          animationControls.start('animate');
        }, repeatDelayMs);
      } else {
        animationControls.start('animate');
      }
    };

    if (isInView) {
      triggerAnimation();
    } else {
      animationControls.start('initial');
    }

    return () => clearTimeout(timeout);
  }, [animationControls, isInView, repeatDelayMs]);

  return (
    <Component className={cn('relative', className)} {...other}>
      {/* Screen reader only text */}
      <span className="sr-only">{textArray.join(' ')}</span>

      <m.span
        aria-hidden
        ref={textRef}
        initial="initial"
        animate={animationControls}
        exit="exit"
        variants={varContainer()}
        className="block"
      >
        {textArray?.map((line, lineIndex) => (
          <span key={`${line}-${lineIndex}`} className="block">
            {line.split(' ').map((word, wordIndex) => {
              const lastWordInline = line.split(' ')[line.split(' ').length - 1];

              return (
                <span key={`${word}-${wordIndex}`} className="inline-block">
                  {word.split('').map((char, charIndex) => (
                    <m.span
                      key={`${char}-${charIndex}`}
                      variants={variants ?? varFade('in')}
                      className="inline-block"
                    >
                      {char}
                    </m.span>
                  ))}

                  {lastWordInline !== word && (
                    <span className="inline-block">&nbsp;</span>
                  )}
                </span>
              );
            })}
          </span>
        ))}
      </m.span>
    </Component>
  );
}