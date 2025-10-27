import { CurrencyIconPlaceholder } from "@/components/modal/UserFinanceModal/c/CurrencyIconPlaceholder.tsx";
import { useSupportedSettlementCurrenciesFilter, useUserLatestDeposit } from "@/components/modal/UserFinanceModal/helper.ts";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useBoundStore } from "@/store";
import { cn } from "@/utils/cn.ts";
import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import Measure, { ContentRect, Rect } from "react-measure";

export const CurrencyScrollBar = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [l1, currencies] = useSupportedSettlementCurrenciesFilter("CRYPTO", "DEPOSIT");

  const { data: latestDeposit, isLoading: l2 } = useUserLatestDeposit();

  // from data store, share common data
  const { setDepositCrypto, syncAction } = useBoundStore();

  // 代币选择滚动
  const onScroll = (offset?: Rect) => {
    const container = ref.current;

    if (container && offset) {
      const { width: w1 = 0, left = 0 } = offset;
      const { width: w2 } = container.getBoundingClientRect();

      const scrollLeft = left + (w1 - w2) / 2;

      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }

    // 处理该区域的鼠标滚动支持
    if (container) container.addEventListener("wheel", handleWheel);

    function handleWheel(this: HTMLDivElement, event: WheelEvent) {
      event.preventDefault();
      event.deltaY < 0 ? (this.scrollLeft -= 10) : (this.scrollLeft += 10);
    }
  };

  // initial default selected option
  useEffect(() => {
    if (l1 || l2) return;
    const v = latestDeposit?.data?.[0];
    if (currencies.length > 0) {
      let find = undefined;
      if (v && v?.network === "CRYPTO") find = currencies.find((o: { currency: string }) => o?.currency === v?.currency);
      setDepositCrypto({ currency: find || currencies[0] });
    }
  }, [l1, l2, currencies, latestDeposit]);

  // 事件通知
  useEffect(() => {
    if (syncAction.type === "SYNC_USER_LATEST_DEPOSIT") {
      const target = document.getElementById("target");
      if (target) onScroll({ width: target.getBoundingClientRect().width, left: target.offsetLeft } as any);
    }
  }, [syncAction]);

  return (
    <div ref={ref} className="relative overflow-x-auto hide-scrollbar gap-2 flex overflow-hidden">
      <SmallLoading
        className="h-8 !rounded-lg w-full"
        loading={l1}
        content={currencies.map((item: Record<string, any>) => (
          <Measure offset key={item?.id}>
            {({ measureRef, contentRect }) => (
              <InnerOption ref={measureRef} item={item} data={currencies} onScroll={onScroll} contentRect={contentRect} />
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
  const { depositCrypto, setDepositCrypto, setSyncAction } = useBoundStore();

  useLayoutEffect(() => {
    if (item?.currency === depositCrypto.currency?.currency) setSyncAction("SYNC_USER_LATEST_DEPOSIT", item);
  }, [depositCrypto.currency]);

  return (
    <button
      ref={ref}
      className={cn(
        "relative btn btn-sm bg-base-300 flex items-center gap-1 rounded-lg border-0 font-bold text-base-content/50 px-2",
        item?.currency === depositCrypto.currency?.currency ? "text-base-400 bg-primary" : "",
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
