import { CurrencyIconPlaceholder } from "@/components/modal/UserFinanceModal/c/CurrencyIconPlaceholder.tsx";
import {
  useSupportedCurrencyV2Filter
} from "@/components/modal/UserFinanceModal/helper.ts";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useBoundStore } from "@/store";
import { cn } from "@/utils/cn.ts";
import { forwardRef, useEffect, useLayoutEffect, useRef, WheelEvent } from "react";
import Measure, { ContentRect, Rect } from "react-measure";

export const CurrencyScrollBar = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [l1, currencies] = useSupportedCurrencyV2Filter("CRYPTO", "DEPOSIT");

  // from data store, share common data
  const { syncAction } = useBoundStore();

  // 代币选择滚动
  const onScroll = (offset?: Rect) => {
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

  /**
   * 事件通知
   * 当设置好用户默认的加密货币时候，需要自动滚动到指定代币位置
   * 该操作是一次性的，后续不能生效
   */
  useEffect(() => {
    if (syncAction.type === "SYNC_USER_LATEST_DEPOSIT") {
      const target = document.getElementById("target");
      if (target) onScroll({ width: target.getBoundingClientRect().width, left: target.offsetLeft } as any);
    }
  }, [syncAction]);

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
              <InnerOption ref={measureRef} item={item} data={currencies} onScroll={onScroll}
                           contentRect={contentRect} />
            )}
          </Measure>
        ))}
      />
    </div>
  );
};

const InnerOption = forwardRef<
  HTMLButtonElement,
  {
    data: Record<string, any>[];
    item: Record<string, any>;
    onScroll: (v: Rect) => void;
    contentRect: ContentRect;
  }
>(({ data, item, onScroll, contentRect }, ref) => {
  // 只需要初始化的时候执行一次币种选中操作
  const hasRunOnce = useRef(false);

  const { depositCrypto, setDepositCrypto, setSyncAction } = useBoundStore();

  /**
   * 当设置好用户默认的加密货币时候，需要自动滚动到指定代币位置
   * 该操作是一次性的，后续不能生效
   */
  useLayoutEffect(() => {
    if (!hasRunOnce.current && item?.currency === depositCrypto.currency?.currency) {
      setSyncAction("SYNC_USER_LATEST_DEPOSIT", item);

      hasRunOnce.current = true;
    }
  }, [depositCrypto.currency?.currency]);

  return (
    <button
      ref={ref}
      className={cn(
        "relative btn btn-sm bg-base-300 flex items-center gap-1 rounded-full border-0 font-bold text-base-content/50 px-3 font-sans",
        item?.currency === depositCrypto.currency?.currency ? "text-base-400 bg-primary" : ""
      )}
      id={item?.currency === depositCrypto.currency?.currency ? "target" : ""}
      onClick={() => {
        onScroll(contentRect.offset!);
        setDepositCrypto({ currency: data.find((o: Record<string, any>) => o.currency === item?.currency) });
      }}
    >
      <CurrencyIconPlaceholder currency={item?.currency} />
      <span className="text-xs">{item?.currency}</span>
    </button>
  );
});
