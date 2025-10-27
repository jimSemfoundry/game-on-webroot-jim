import {
  ImageWithPlaceholder,
  InnerLoading,
  InnerMaintenance, InnerProviderIcon
} from "@/components/modal/UserFinanceModal/c/DepositMethodSelect.tsx";
import { NoData } from "@/components/modal/UserFinanceModal/c/NoData.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { cn } from "@/utils/cn.ts";
import { useClickAway, useToggle } from "ahooks";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useSupportedFiatWithdrawGatewaysV1 } from "@/components/modal/UserFinanceModal/helper.ts";
import classNames from "classnames";

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
          <div
            key={index}
            className={cn(
              "relative cursor-pointer bg-base-400 flex flex-col gap-2 rounded-lg p-2 justify-center text-xs text-base-content/50 text-center font-semibold",
              { "bg-primary/20 text-primary": method?.pay_bankcode === gateway?.pay_bankcode },
              { "opacity-50": !gateway.active || gateway.status === 0 }
            )}
            onClick={() => {
              // 已选中的没必要再次选中触发事件
              if (!gateway.active || gateway.status === 0 || method?.pay_bankcode === gateway?.pay_bankcode) return;
              setMethod({ method: gateway });
              set(false);
            }}
          >
            <InnerMaintenance show={gateway.status === 0} className="top-0 left-0 right-0 rounded-t-lg" />
            <div className="flex h-10 items-center justify-center">
              {gateway.icon ? (
                <ImageWithPlaceholder src={gateway.icon} className="max-h-10" alt={gateway.display_name} />
              ) : (
                <div
                  className="h-full w-full flex items-center justify-center border-dashed border-base-100 border-1 rounded-lg px-1">
                  <span className="truncate">{gateway.display_name}</span>
                </div>
              )}
            </div>
            <div>
              <p>{gateway.display_name}</p>
              <p>
                {gateway.min} ~ {gateway.max}
              </p>
              <p>ETA: {Math.ceil(gateway.timeout / 60)} min</p>
            </div>
          </div>
        ))}
      </div>
    );
  }, [gateways, status]);

  useClickAway(() => {
    set(false);
  }, [ref]);

  useEffect(() => {
    if (Array.isArray(gateways?.data)) setMethod({ method: gateways?.data?.[0] });
  }, [gateways]);

  return (
    <div className="flex flex-col gap-2" ref={ref}>
      <p className="text-xs font-semibold text-base-content/50 flex items-center">{title}</p>
      <div className="relative">
        <button
          onClick={() => !isLoading && set(!status)}
          className={cn("btn px-4 flex h-10 w-full items-center justify-between bg-base-300 border-0 hover:bg-base-300/60")}
        >
          {isLoading ? (
            <InnerLoading />
          ) : (
            <>
              <div className={"flex items-center gap-2"}>
                <InnerProviderIcon icon={method?.icon} thumbnail={method?.thumbnail} />
                <p
                  className={classNames("truncate font-semibold", method ? "text-base-content" : "text-base-content/50")}>
                  {method?.display_name || t("finance:select")}
                </p>
              </div>
              <ChevronDown
                className={cn("w-4 h-4 md:transition-transform md:duration-200 text-base-content/50", status ? "md:rotate-180" : "")}
              />
            </>
          )}
        </button>

        {/*桌面端*/}
        {!isMobile && (
          <AnimatePresence>
            {status && (
              <motion.div
                className={cn(`
          bg-base-300 absolute z-1 mt-1 w-full rounded-lg shadow-xs 
          w-[calc(100vw-3rem)] md:w-[calc(200%+8px)] overflow-hidden ltr:-left-[calc(100%+8px)] rtl:-right-[calc(100%+8px)]`)}
                exit={{ height: 0 }}
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                transition={{ duration: 0.1, delay: 0.1 }}
              >
                <div className="h-2 bg-base-300 sticky top-0" />
                <div className="flex max-h-[412px] flex-col gap-3 px-3 py-1 overflow-y-auto hide-scrollbar">
                  <p className="h-5 text-xs font-semibold">{t("finance:paymentProviders")}</p>
                  {memoProviders}
                </div>
                <div className="h-2 bg-base-300 sticky bottom-0" />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* 移动端 */}
      {isMobile &&
        createPortal(
          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
                className="px-4 py-4 bg-base-300 fixed w-full z-999 top-0 bottom-0 flex flex-col"
              >
                <p className="flex items-center justify-center relative text-lg font-semibold h-7">
                  <button className={"absolute left-0 btn btn-square rounded-lg"} onClick={() => set(false)}>
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  {t("finance:paymentProviders")}
                </p>
                <div className="mt-4 overflow-y-auto flex-1 hide-scrollbar">{memoProviders}</div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
