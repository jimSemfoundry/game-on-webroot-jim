import { motion, m } from "motion/react";
import { ReactNode } from "react";

export const MotionContentBox = ({ show, content, sample }: { show: boolean; content: ReactNode, sample?: boolean }) => {
  const M = sample ? motion.div : m.div
  return (
    <M initial={{ height: 0 }} animate={{ height: show ? "auto" : 0 }} transition={{ duration: 0.1 }} className="overflow-hidden">
      {content}
    </M>
  );
};
