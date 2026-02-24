import { ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { getLogoPwaUrl } from "@/utils/assetPaths";

export const InfoTheme = ({ i, rgb, children, resetAnimate }: {
  i: number,
  rgb: string,
  resetAnimate: boolean
  children: (data: any) => ReactNode,
}) => {
  const default_bg = `radial-gradient(80.05% 100% at 0% 46.47%, color-mix(in srgb, ${rgb}, var(--color-base-300) 20%) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))`;
  const logoSrc = getLogoPwaUrl(import.meta.env.VITE_THEME ?? "1stgame");

  return (
    <AnimatePresence>
      {resetAnimate && <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05, type: "spring", stiffness: 500, damping: 30 } }}
        exit={{ opacity: 0, y: 12, transition: { duration: 0.15 } }}
        className="rounded-lg border border-base-200 p-4 relative min-h-20 text-base-content"
        style={{ background: rgb ? default_bg : "color-mix(in oklch, var(--color-base-100) 50%, transparent)" }}
      >
        {children({ data: { icon: logoSrc } })}
      </m.div>}
    </AnimatePresence>
  );
};
