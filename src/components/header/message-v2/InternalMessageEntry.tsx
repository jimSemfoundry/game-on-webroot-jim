import InternalMessageCounter from "@/components/header/c/InternalMessageCounter.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { useToggle } from "@/hooks/useToggle";
import { InnerComponents, InnerModalTitle } from "@/components/header/message-v2/c/InnerComponents.tsx";
import { createPortal } from "react-dom";
import { AnimatePresence, m as motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Suspense, lazy } from "react";

// 懒加载 MessageV2 组件
const MessageV2 = lazy(() => import("@/components/header/message-v2/index.tsx"));

export const InternalMessageEntry = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { t } = useTranslation('chat')

  const [open, { set }] = useToggle<boolean>(false);

  return (
    isMobile
      // for mobile
      ? (<>
          {createPortal(
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
                  className="px-4 py-4 bg-base-300 fixed w-full z-1002 top-0 bottom-0 flex flex-col"
                  style={{ paddingTop: "max(1rem, var(--safe-area-inset-top))" }}
                >
                  <div className="flex items-center justify-center relative text-lg font-semibold h-10">
                    <button className={"absolute left-0 btn btn-square rounded-lg"} onClick={() => set(false)}>
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    {t("chat:notifications")}
                  </div>
                  <div className="mt-6 overflow-y-auto flex-1 hide-scrollbar">
                    <Suspense fallback={<div className="loading loading-spinner loading-xs"></div>}>
                      <MessageV2 status={open} onClose={() => set(false)} />
                    </Suspense>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
          <InternalMessageCounter onClick={() => set(true)} />
          {/*<Modal*/}
          {/*  hideTitle={true}*/}
          {/*  isOpen={open}*/}
          {/*  onClose={() => set(false)}*/}
          {/*  position={isMobile ? "modal-bottom" : "modal-middle"}*/}
          {/*  className={`*/}
          {/*            p-5 bg-base-400 hide-scrollbar md:p-0 md:rounded-lg shadow-lg */}
          {/*            min-h-[calc(100%-3rem)]*/}
          {/*            max-h-[calc(100%-3rem)]*/}
          {/*            `}*/}
          {/*  closeButtonClassName={"hidden"}*/}
          {/*>*/}
          {/*  <div className={"flex justify-between sticky top-0 bg-base-400"}>*/}
          {/*    <InnerModalTitle />*/}
          {/*    <InnerComponents onClick={() => set(false)} />*/}
          {/*  </div>*/}
          {/*  <MessageV2 status={open} className={"mt-4 h-[calc(100vh-140px)]"} />*/}
          {/*</Modal>*/}
        </>)
      // for desk
      : (<div className="drawer drawer-end w-10 h-10">
          <input id="my-drawer-1" type="checkbox" checked={open} readOnly className="drawer-toggle" />
          <div className="drawer-content">
            <label htmlFor="my-drawer-1">
              <InternalMessageCounter onClick={() => set(!open)} />
            </label>
          </div>
          <div className="drawer-side hide-scrollbar z-1003">
            {/* 点击遮罩层关闭 drawer */}
            <label aria-label="close message sidebar" className="drawer-overlay" onClick={() => set(false)} />
            <div className="bg-base-400 h-[calc(100%-16px)] w-90 p-4 m-2 rounded-box">
              <div className={"flex justify-between sticky top-0 bg-base-400"}>
                <InnerModalTitle />
                <InnerComponents onClick={() => set(false)} />
              </div>
              <Suspense fallback={<div className="loading loading-spinner loading-xs"></div>}>
                <MessageV2 status={open} className={"mt-4 h-[calc(100%-50px)]"} onClose={() => set(false)} />
              </Suspense>
            </div>
          </div>
        </div>)
  );
};
