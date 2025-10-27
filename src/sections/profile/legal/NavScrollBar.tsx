import classNames from "classnames";
import { useRef, useState, useEffect, ReactNode } from "react";
import Measure, { Rect } from "react-measure";
import { useTranslation } from "react-i18next";

export type TBar =
  "aboutUs" |
  "responsibleGaming" |
  "termsOfService"

const Label = ({ name }: { name: TBar }) => {
  const { t } = useTranslation();
  return (
    <div
      className="flex items-center gap-2 justify-center rounded-field min-w-[48px] px-2 h-8 sm:h-12 py-1 font-semibold">
      <span className="text-xs sm:text-base whitespace-nowrap">{t(`menu:${name}`)}</span>
    </div>
  );
};

const items: { value: TBar, label: ReactNode }[] = [
  {
    value: "aboutUs",
    label: <Label name="aboutUs" />
  },
  {
    value: "responsibleGaming",
    label: <Label name="responsibleGaming" />
  },
  {
    value: "termsOfService",
    label: <Label name="termsOfService" />
  },
];

export const NavScrollBar = ({ setNavIndex }: { setNavIndex: (v: TBar) => void }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [_navIndex, _setNavIndex] = useState<TBar>("aboutUs");

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
      const target = document.getElementById("LEGAL");
      if (target) {
        onScroll({ width: target.getBoundingClientRect().width, left: target.offsetLeft } as any);
        clearInterval(timer);
      }
    }, 200);

    return () => clearInterval(timer);
  }, [_navIndex]);

  return (
    <div ref={ref} className="relative overflow-x-auto hide-scrollbar gap-4 flex overflow-hidden md:mx-0 mb-4">
      {items.map((item: Record<string, any>) => (
        <Measure offset key={item?.value}>
          {({ measureRef, contentRect }) => (
            <button
              ref={measureRef}
              className={classNames(
                "relative btn btn-sm md:btn-lg bg-base-300 flex items-center gap-1 rounded-lg border-0 font-bold text-base-content/70 px-1",
                item?.value === _navIndex ? "text-primary-content bg-secondary" : ""
              )}
              id={item?.value === _navIndex ? "LEGAL" : ""}
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
