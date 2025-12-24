import { CurrencyIconPlaceholder } from "@/components/modal/UserFinanceModal/c/CurrencyIconPlaceholder.tsx";
import {
  useSupportedCurrencyV2Filter
} from "@/components/modal/UserFinanceModal/helper.ts";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useBoundStore } from "@/store";
import { cn } from "@/utils/cn.ts";
import { useEffect, useRef, WheelEvent } from "react";
import Measure from "react-measure";

export const CurrencyScrollBar = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [l1, currencies] = useSupportedCurrencyV2Filter("CRYPTO", "DEPOSIT");

  const { depositCrypto, setDepositCrypto } = useBoundStore();

  // 代币选择滚动
  const onScroll = (offset: { width: number, left: number }) => {
    const container = ref.current;

    if (container && offset) {
      const { width: w1 = 0, left = 0 } = offset;
      const { width: w2 } = container.getBoundingClientRect();

      const scrollLeft = left + (w1 - w2) / 2;

      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    const container = ref.current;

    if (!container) return;

    let raf_id = 0;
    let closed = false;

    const callback = () => {
      if (closed) return;

      const target = container.querySelector<HTMLElement>("#target") ?? null;

      if (!target) return;

      onScroll({ width: target.getBoundingClientRect().width, left: target.offsetLeft });

      observer.disconnect();

      closed = true;
    };

    const observer = new MutationObserver(() => {
      callback();
    });

    observer.observe(container, { childList: true, subtree: true, attributes: true });

    raf_id = requestAnimationFrame(callback);

    return () => {
      closed = true;
      observer.disconnect();
      if (raf_id) cancelAnimationFrame(raf_id);
    };
  }, [l1, depositCrypto.currency?.currency]);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // Prevent the default vertical scrolling
      element.scrollLeft += e.deltaY as any; // Scroll horizontally
    };

    element.addEventListener("wheel", handleWheel as any, { passive: false });

    return () => {
      element.removeEventListener("wheel", handleWheel as any);
    };
  }, []);

  return (
    <div ref={ref} className="relative overflow-x-auto gap-4 flex overflow-y-hidden md:mx-0 hide-scrollbar">
      <SmallLoading
        className="h-8 !rounded-lg w-full"
        loading={l1}
        content={currencies.map((item: Record<string, any>) => (
          <Measure offset key={item?.id}>
            {({ measureRef, contentRect }) => (
              <button
                ref={measureRef}
                className={cn(
                  "relative btn btn-sm bg-base-300 flex items-center gap-1 rounded-full border-0 font-bold text-base-content/50 px-3 font-sans",
                  item?.currency === depositCrypto.currency?.currency ? "text-base-400 bg-primary" : ""
                )}
                id={item?.currency === depositCrypto.currency?.currency ? "target" : ""}
                onClick={() => {
                  onScroll(contentRect.offset!);
                  setDepositCrypto({ currency: currencies.find((o: Record<string, any>) => o.currency === item?.currency) });
                }}
              >
                <CurrencyIconPlaceholder currency={item?.currency} />
                <span className="text-xs">{item?.currency}</span>
              </button>
            )}
          </Measure>
        ))}
      />
    </div>
  );
};