import classNames from "classnames";
import { AnimatePresence, m, motion } from "motion/react";
import { ReactNode } from "react";

export const ErrorMessageBox = (
  {
    show,
    sample,
    content,
    className
  }: {
    show: boolean;
    sample?: boolean;
    content: ReactNode;
    className?: string;
  }) => {
  const M = sample ? motion.div : m.div
  return (
    <AnimatePresence>
      {show && (
        <M
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0 }}
          transition={{ duration: 0.1 }}
          className="overflow-hidden"
        >
          <div
            className={classNames(
              "text-error text-[12px] font-semibold font-sans",
              className
            )}
          >
            {content}
          </div>
        </M>
      )}
    </AnimatePresence>
  );
};
