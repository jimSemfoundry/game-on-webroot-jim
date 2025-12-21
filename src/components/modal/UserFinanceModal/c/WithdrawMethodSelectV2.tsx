import { NoData } from "@/components/modal/UserFinanceModal/c/NoData.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { cn } from "@/utils/cn.ts";
import { useClickAway, useToggle } from "ahooks";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useSupportedFiatWithdrawGatewaysV2 } from "@/components/modal/UserFinanceModal/helper.ts";
import classNames from "classnames";
import {
  InnerLoading,
  InnerPayment,
  InnerProviderIcon
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

export const WithdrawMethodSelectV2 = (
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
  const { data: gateways, isLoading } = useSupportedFiatWithdrawGatewaysV2(currency);

  const [status, { set }] = useToggle<boolean>(false);

  useClickAway(() => {
    set(false);
  }, [ref]);

  // 设置默认值
  useEffect(() => {
    if (Array.isArray(gateways?.data)) setMethod({ provider: gateways?.data?.[0] });
  }, [gateways]);

  return (
    <div className="flex flex-col gap-2" ref={ref}>
      <p className="text-xs font-semibold text-base-content/50 flex items-center">{title}</p>
      <div className="relative">
        <button
          onClick={() => !isLoading && set(!status)}
          className={cn("btn px-4 flex h-10 w-full items-center justify-between bg-base-300 border-0 hover:bg-base-300/60")}
        >
          {isLoading ? (<InnerLoading />) : (
            <>
              <div className={"flex items-center gap-2"}>
                <InnerProviderIcon icon={method?.icon} thumbnail={method?.thumbnail} />
                <p
                  className={classNames("truncate font-semibold", method ? "text-base-content" : "text-base-content/50")}>
                  {method?.channel_class || t("finance:select")}
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
                className="bg-base-300 z-1 mt-1 w-full rounded-lg shadow-xs overflow-hidden shadow-lg"
                exit={{ height: 0 }}
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                transition={{ duration: 0.1, delay: 0.1 }}
              >
                <div className="h-2 bg-base-300 sticky top-0" />
                <div className="flex max-h-[296px] flex-col gap-3 px-3 py-1 overflow-y-auto hide-scrollbar">
                  <p className="h-5 text-xs font-semibold">{t("finance:paymentProviders")}</p>
                  <InnerProviderWrap set={set} method={method} setMethod={setMethod} gateways={gateways?.data ?? []} />
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
                className="px-4 py-4 bg-base-300 fixed w-full z-1001 top-0 bottom-0 flex flex-col"
              >
                <p className="flex items-center justify-center relative text-lg font-semibold h-7">
                  <button className={"absolute left-0 btn btn-square rounded-lg"} onClick={() => set(false)}>
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  {t("finance:paymentProviders")}
                </p>
                <div className="mt-4 overflow-y-auto flex-1 hide-scrollbar">
                  <InnerProviderWrap set={set} method={method} setMethod={setMethod} gateways={gateways?.data ?? []} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

const InnerProviderWrap = ({ set, method, gateways, setMethod }: {
  set: (value: boolean) => void
  method: Record<string, any> | null;
  gateways: Record<string, any>,
  setMethod: (v: Record<string, any>) => void;
}) => {
  const { t } = useTranslation();
  return gateways.length === 0 ? (
    <NoData text={t("common.noData")} />
  ) : (
    <div className="grid grid-cols-3 gap-x-2 gap-y-3">
      {gateways.map((gateway: Record<string, any>, index: number) => (
        <InnerPayment
          key={index}
          method={method}
          gateway={gateway}
          onClick={() => {
            // 已选中的没必要再次选中触发事件
            if (method?.id === gateway?.id) return;
            setMethod({ provider: gateway });
            setTimeout(() => {
              set(false);
            }, 100)
          }}
        />
      ))}
    </div>
  );
};