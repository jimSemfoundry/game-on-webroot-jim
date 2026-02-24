import { useState } from "react";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";
import { m, AnimatePresence } from "motion/react";

type LegalProps = {
  text: {
    title?: string;
    description?: string;
    content?: string;
    open?: boolean;
  };
};

export const Container = ({ text }: LegalProps) => {
  const [isOpen, setIsOpen] = useState(text?.open ?? true);

  return (
    <div className="bg-base-200 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer gap-2"
        onClick={() => setIsOpen(!isOpen)}>
        <div className="font-bold text-sm md:text-md flex-1">{text?.title}</div>
        <ChevronRight className={clsx("w-3 h-3 md:w-4 md:h-4", { "rotate-90": isOpen })} strokeWidth={4} />
      </div>

      <AnimatePresence>
        {isOpen && (<m.div
          exit={{ height: 0 }}
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          transition={{ duration: 0.1 }}
          className="px-4 pb-4 text-sm"
        >
          <div dangerouslySetInnerHTML={{ __html: text?.content ?? "" }} />
        </m.div>)}
      </AnimatePresence>
    </div>
  );
};
