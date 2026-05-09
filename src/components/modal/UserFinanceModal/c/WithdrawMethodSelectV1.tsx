import { NoData } from "@/components/modal/UserFinanceModal/c/NoData.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { cn } from "@/utils/cn.ts";
import { useClickAway } from "@/hooks/useClickAway";
import { useToggle } from "@/hooks/useToggle";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { m, LazyMotion, domMax, AnimatePresence } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useSupportedFiatWithdrawGatewaysV1 } from "@/components/modal/UserFinanceModal/helper.ts";
import clsx from "clsx";
import {
  InnerLoading, InnerMaintenance,
  InnerPayment,
  InnerProviderIcon
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { sleep } from "@/components/socialLogin/helper.ts";

export const WithdrawMethodSelectV1 = (
  {
    title,
    currency,
    method,
    setMethod
  }: {
    title: string;
    currency: string;
    method: Record<string, any> | null;
    setMethod: (v: Record<string, any>) => void;
  }) => {
  const ref = useRef<HTMLDivElement>(null);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const { t } = useTranslation();

  // 法币提款支持的网关
  const { data: gateways, isLoading } = useSupportedFiatWithdrawGatewaysV1(currency);

  const [status, { set }] = useToggle<boolean>(false);

  const memoProviders = useMemo(() => {
    const transform = gateways?.data ?? [];
    return transform.length === 0 ? (
      <NoData text={t("common.noData")} />
    ) : (
      <div className="grid grid-cols-3 gap-x-2 gap-y-3">
        {transform.map((gateway: Record<string, any>, index: number) => (
          <InnerPayment
            key={index}
            method={method}
            gateway={gateway}
            onClick={async () => {
              // 已选中的没必要再次选中触发事件
              if (method?.id === gateway?.id) return;
              setMethod({ method: gateway });

              await sleep(250);

              set(false);
            }}
          />
        ))}
      </div>
    );
  }, [gateways, status, method]);

  useClickAway(ref, () => {
    !isMobile && set(false);
  });

  useEffect(() => {
    if (Array.isArray(gateways?.data)) setMethod({ method: gateways?.data?.[0] });
  }, [gateways]);

  return (
    <div className="flex flex-col gap-2" ref={ref}>
      <p className="text-xs font-semibold text-base-content/50 flex items-center">{title}</p>
      <div className="relative">
        <button
          onClick={() => !isLoading && set(!status)}
          className={cn("relative btn px-4 flex h-10 w-full items-center justify-between bg-base-300 border-0 hover:bg-base-300/60")}
        >
          {isLoading ? (<InnerLoading />) : (
            <>
              <div className={"flex items-center gap-2"}>
                <InnerProviderIcon
                  icon={method?.icon}
                  thumbnail={method?.thumbnail}
                  iconLight={method?.icon_light}
                  thumbnailLight={method?.thumbnail_light}
                />
                <p
                  className={clsx("truncate font-semibold", method ? "text-base-content" : "text-base-content/50")}>
                  {method?.display_name || t("finance:select")}
                </p>
              </div>
              <ChevronDown
                className={cn("w-4 h-4 md:transition-transform md:duration-200 text-base-content/50", status ? "md:rotate-180" : "")}
              />
            </>
          )}
          <InnerMaintenance show={method?.status === 0}
                            className="top-0 right-0 rounded-tr-lg rounded-bl-lg bg-warning/60" />
        </button>

        {/*桌面端*/}
        <LazyMotion features={domMax}>
          <AnimatePresence>
            {!isMobile && status && (
              <m.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: { height: "auto", opacity: 1, pointerEvents: "auto" as const, display: "block" },
                  closed: { height: 0, opacity: 0, pointerEvents: "none" as const, transitionEnd: { display: "none" } }
                }}
                transition={{ duration: 0.1 }}
                className={cn(`
            bg-base-300 absolute z-10 mt-1 w-full rounded-lg shadow-xs 
            w-[calc(100vw-3rem)] md:w-[calc(200%+8px)] overflow-hidden ltr:-left-[calc(100%+8px)] rtl:-right-[calc(100%+8px)]`)}
              >
                <div className="h-2 bg-base-300 sticky top-0" />
                <div className="flex max-h-[412px] flex-col gap-3 px-3 py-1 overflow-y-auto hide-scrollbar">
                  <p className="h-5 text-xs font-semibold">{t("finance:paymentProviders")}</p>
                  {memoProviders}
                </div>
                <div className="h-2 bg-base-300 sticky bottom-0" />
              </m.div>
            )}
          </AnimatePresence>
        </LazyMotion>
      </div>

      {/* 移动端 */}
      {isMobile &&
        createPortal(
          <LazyMotion features={domMax}>
            <AnimatePresence>
              {status && (
                <m.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={{
                    open: { opacity: 1, y: 0, pointerEvents: "auto" as const, display: "flex" },
                    closed: { opacity: 0, y: -8, pointerEvents: "none" as const, transitionEnd: { display: "none" } }
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="px-4 py-4 bg-base-300 fixed w-full z-1002 top-0 bottom-0 flex flex-col"
                  style={{ paddingTop: "max(1rem, var(--safe-area-inset-top))" }}
                >
                  <p className="flex items-center justify-center relative text-lg font-semibold h-7">
                    <button className={"absolute left-0 btn btn-square rounded-lg"} onClick={() => set(false)}>
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    {t("finance:paymentProviders")}
                  </p>
                  <div className="mt-4 overflow-y-auto flex-1 hide-scrollbar">{memoProviders}</div>
                </m.div>
              )}
            </AnimatePresence>
          </LazyMotion>,
          document.body
        )}
    </div>
  );
};
