import { useInView } from "motion/react";
import type { UseInViewOptions } from "motion/react";
import type { ReactNode } from "react";
import { useRef } from "react";

interface LazySectionProps {
  children: ReactNode;
  placeholder?: ReactNode;
  minHeight?: number | string;
  rootMargin?: UseInViewOptions["margin"];
}

export function LazySection({
  children,
  placeholder,
  minHeight = 200,
  rootMargin = "0px",
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: rootMargin, once: true });
  const fallbackPlaceholder = (
    <div style={{ minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight }} />
  );

  return <div ref={ref}>{isInView ? children : placeholder ?? fallbackPlaceholder}</div>;
}
