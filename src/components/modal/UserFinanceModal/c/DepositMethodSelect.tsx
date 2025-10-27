import { NoData } from "@/components/modal/UserFinanceModal/c/NoData.tsx";
import { useSupportedFiatDepositGateways } from "@/hooks/api/useAuth.ts";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { useClickAway, useToggle } from "ahooks";
import classNames from "classnames";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import Decimal from "decimal.js";
import { useBoundStore } from "@/store";

export const DepositMethodSelect = (
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

  // from data store, share common data
  const { depositFiat } = useBoundStore();

  // 法币存款支持的网关
  const { data: gateways, isLoading } = useSupportedFiatDepositGateways(currency);

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
            className={classNames(
              "relative cursor-pointer bg-base-400 flex flex-col gap-2 rounded-lg px-2 py-4 justify-center text-[11px] text-base-content/70 text-center font-bold",
              { "bg-primary/20 text-primary": method?.pay_bankcode === gateway?.pay_bankcode },
              {
                "opacity-50": !gateway.active || gateway.status === 0 ||
                  (Decimal(Number(depositFiat.formItem?.amount || 0)).gt(0) &&
                    (Decimal(depositFiat.formItem?.amount || 0 || 0).lt(gateway.min) ||
                      Decimal(depositFiat.formItem?.amount || 0 || 0).gt(gateway.max)))
              }
            )}
            onClick={() => {
              // 已选中的没必要再次选中触发事件
              if (!gateway.active ||
                gateway.status === 0 ||
                method?.pay_bankcode === gateway?.pay_bankcode ||
                (Decimal(Number(depositFiat.formItem?.amount || 0)).gt(0) &&
                  (Decimal(depositFiat.formItem?.amount || 0).lt(gateway.min) ||
                    Decimal(depositFiat.formItem?.amount || 0).gt(gateway.max)))) return;
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
              <p className="truncate">{gateway.display_name}</p>
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
      <div className="text-xs font-semibold text-base-content/50 flex items-center">{title}</div>
      <div className="relative">
        <button
          onClick={() => !isLoading && set(!status)}
          className={classNames("btn px-4 flex h-10 w-full items-center justify-between bg-base-300 border-0 hover:bg-base-300/60")}
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
                className={classNames("w-4 h-4 md:transition-transform md:duration-200 text-base-content/50", status ? "md:rotate-180" : "")}
              />
            </>
          )}
        </button>

        {/*桌面端*/}
        {!isMobile && (
          <AnimatePresence>
            {status && (
              <motion.div
                className={classNames(`
          bg-base-300 absolute z-2 mt-1 rounded-lg shadow-xs 
          w-[calc(100vw-3rem)] md:w-[calc(200%+8px)] overflow-hidden ltr:-left-[calc(100%+8px)] rtl:-right-[calc(100%+8px)]`)}
                exit={{ height: 0 }}
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                transition={{ duration: 0.1, delay: 0.1 }}
              >
                <div className="h-2 bg-base-300 sticky top-0" />
                <div className="flex max-h-[388px] flex-col gap-3 px-3 py-1 overflow-y-auto hide-scrollbar">
                  <p className="text-xs font-semibold">{t("finance:paymentProviders")}</p>
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
                <div className="flex items-center justify-center relative text-lg font-semibold h-7">
                  <button className={"absolute left-0 btn btn-square rounded-lg"} onClick={() => set(false)}>
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  {t("finance:paymentProviders")}
                </div>
                <div className="mt-4 overflow-y-auto flex-1 hide-scrollbar">{memoProviders}</div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
export const InnerLoading = () => {
  return (
    <>
      <span className="bg-base-200 md:bg-base-400 skeleton w-6 h-6 rounded-full"></span>
      <span className="bg-base-200 md:bg-base-400 skeleton flex-1 rounded-lg h-6" />
    </>
  );
};
export const ImageWithPlaceholder = ({ src, alt, className, ...props }: React.ComponentProps<"img">) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  useEffect(() => {
    if (!src) return;
    setImageLoaded(false);
    const img = new Image();
    img.src = src;
    img.onload = () => setImageLoaded(true);
  }, [src]);
  return imageLoaded ? (
    <img {...props} src={src} className={className} alt={alt} />
  ) : (
    <div className={classNames("skeleton bg-base-300 w-full h-full rounded-lg", className)} />
  );
};

export const InnerProviderIcon = ({ icon, thumbnail }: { icon?: string, thumbnail?: string }) => {
  return <img src={thumbnail || icon} className={classNames("h-7", { "!h-4": thumbnail })} alt="" />;
};

// 维护中的供应商
export const InnerMaintenance = ({ show, className }: { show: boolean, className?: string }) => {
  const { t } = useTranslation();
  return show && (
    <span
      className={classNames("uppercase text-center bg-warning text-[10px] px-1 text-neutral absolute truncate", className)}
    >
      {t("finance:maintenance")}
    </span>
  );
};
