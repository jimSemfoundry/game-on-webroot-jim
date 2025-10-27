import type { ButtonHTMLAttributes, ReactElement } from 'react';

import { cloneElement, useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { ChevronUp } from 'lucide-react';

// ----------------------------------------------------------------------

type BackToTopProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isDebounce?: boolean;
  scrollThreshold?: string | number;
  renderButton?: (isVisible?: boolean) => ReactElement;
};

export function BackToTopButton({
  className,
  isDebounce = true,
  renderButton,
  scrollThreshold = '90%',
  ...other
}: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      
      let threshold: number;
      if (typeof scrollThreshold === 'string' && scrollThreshold.includes('%')) {
        const percentage = parseFloat(scrollThreshold) / 100;
        threshold = documentHeight * percentage;
      } else {
        threshold = Number(scrollThreshold);
      }
      
      const shouldShow = scrollY > threshold;
      
      if (isDebounce) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setIsVisible(shouldShow);
        }, 100);
      } else {
        setIsVisible(shouldShow);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [scrollThreshold, isDebounce]);

  if (renderButton) {
    return cloneElement(renderButton(isVisible) as ReactElement<{ onClick?: () => void }>, {
      onClick: handleBackToTop,
    });
  }

  return (
    <button
      aria-label="Back to top"
      onClick={handleBackToTop}
      className={cn(
        'fixed right-6 bottom-6 md:right-8 md:bottom-8 z-50',
        'w-12 h-12 rounded-full',
        'bg-primary text-primary-content',
        'shadow-lg hover:shadow-xl',
        'transition-all duration-300 ease-out',
        'flex items-center justify-center',
        'hover:scale-110 active:scale-95',
        isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
        className
      )}
      {...other}
    >
      <ChevronUp size={24} />
    </button>
  );
}