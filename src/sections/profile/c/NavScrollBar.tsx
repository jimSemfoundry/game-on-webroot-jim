import classNames from "classnames";
import { useRef, useState, useEffect, ReactNode } from "react";
import Measure, { Rect } from "react-measure";
import Iconify from "@/components/iconify";
import { kebabCase } from "lodash-es";
import { emitter } from "@/store/emitter.ts";

export type TBar =
  "Dashboard" |
  "Transactions" |
  "Rollover" |
  "BetHistory" |
  "Bet History" |
  "Security" |
  "Profile" |
  "Legal"

const Label = ({ name }: { name: TBar }) => {
  return (
    <div
      className="flex items-center gap-2 justify-center rounded-field min-w-[48px] px-2 h-8 sm:h-12 py-1 font-semibold">
      <Iconify icon={`custom:${kebabCase(name.toLowerCase())}`} className="w-3.5 h-3.5" />
      <span className="text-xs sm:text-base whitespace-nowrap">{name}</span>
    </div>
  );
};

const items: { value: TBar, label: ReactNode }[] = [
  {
    value: "Dashboard",
    label: <Label name="Dashboard" />
  },
  {
    value: "Transactions",
    label: <Label name="Transactions" />
  },
  {
    value: "Rollover",
    label: <Label name="Rollover" />
  },
  {
    value: "BetHistory",
    label: <Label name="Bet History" />
  },
  {
    value: "Security",
    label: <Label name="Security" />
  },
  {
    value: "Profile",
    label: <Label name="Profile" />
  },
  {
    value: "Legal",
    label: <Label name="Legal" />
  }
];

export const NavScrollBar = ({ setNavIndex }: { setNavIndex: (v: TBar) => void }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [_navIndex, _setNavIndex] = useState<string>("Dashboard");

  /**
   * 选中则滚动
   */
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

    // 处理该区域的鼠标滚动支持
    if (container) container.addEventListener("wheel", handleWheel);

    function handleWheel(this: HTMLDivElement, event: WheelEvent) {
      event.preventDefault();
      event.deltaY < 0 ? (this.scrollLeft -= 5) : (this.scrollLeft += 5);
    }
  };

  /**
   * 滚动到目标
   */
  useEffect(() => {
    const timer = setInterval(() => {
      const target = document.getElementById("target");
      if (target) {
        onScroll({ width: target.getBoundingClientRect().width, left: target.offsetLeft } as any);
        clearInterval(timer);
      }
    }, 200);

    return () => clearInterval(timer);
  }, [_navIndex]);

  const changeNavTab = (index: string) => {
    setNavIndex(index as TBar);
    _setNavIndex(index);
  }
  /**
   * 共享数据
   */
  useEffect(() => {
    const subscription = emitter.addListener("SYNC_TABS_INDEX", (index: string) => {
      changeNavTab(index);
    });
    return () => subscription.remove();
  }, []);

  return (
    <div ref={ref} className="relative overflow-x-auto hide-scrollbar gap-4 flex overflow-hidden md:mx-0">
      {items.map((item: Record<string, any>) => (
        <Measure offset key={item?.value}>
          {({ measureRef, contentRect }) => (
            <button
              ref={measureRef}
              className={classNames(
                "relative btn btn-sm md:btn-lg bg-base-300 flex items-center gap-1 rounded-lg border-0 font-bold text-base-content/70 px-1",
                item?.value === _navIndex ? "text-primary-content bg-primary" : ""
              )}
              id={item?.value === _navIndex ? "target" : ""}
              onClick={() => {
                onScroll(contentRect.offset!);
                setNavIndex(item?.value);
                _setNavIndex(item?.value);
              }}>
              {item.label}
            </button>
          )}
        </Measure>))}
    </div>
  );
};
