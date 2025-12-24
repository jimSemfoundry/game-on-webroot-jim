import classNames from "classnames";
import { useRef, useState, useEffect, ReactNode, WheelEvent } from "react";
import Measure from "react-measure";
import Iconify from "@/components/iconify";
import { kebabCase } from "lodash-es";
import { emitter } from "@/store/emitter.ts";
import { useTranslation } from "react-i18next";
import { useSearch } from "@tanstack/react-router";

export type TBar =
  "dashboard" |
  "transactions" |
  "rollover" |
  "free-spin" |
  "bet-history" |
  "security" |
  "profile" |
  "legal"

const Label = ({ name, translationKey, namespace }: { name: string; translationKey: string; namespace: string }) => {
  const { t } = useTranslation(namespace);
  return (
    <div
      className="flex items-center gap-2 justify-center rounded-field min-w-[48px] px-2 h-8 sm:h-12 py-1 font-semibold">
      <Iconify icon={`custom:${kebabCase(name.toLowerCase())}`} className="w-3.5 h-3.5" />
      <span className="text-xs sm:text-base whitespace-nowrap">{t(translationKey)}</span>
    </div>
  );
};

const items: { value: TBar, label: ReactNode }[] = [
  {
    value: "dashboard",
    label: <Label name="Dashboard" translationKey="dashboard" namespace="profile" />
  },
  {
    value: "transactions",
    label: <Label name="Transactions" translationKey="transactions" namespace="profile" />
  },
  {
    value: "rollover",
    label: <Label name="Rollover" translationKey="rollover" namespace="profile" />
  },
  {
    value: "free-spin",
    label: <Label name="Free Spin" translationKey="freeSpins" namespace="bonus" />
  },
  {
    value: "bet-history",
    label: <Label name="Bet History" translationKey="betHistory" namespace="profile" />
  },
  {
    value: "security",
    label: <Label name="Security" translationKey="common.security" namespace="common" />
  },
  {
    value: "profile",
    label: <Label name="Profile" translationKey="common.profile" namespace="common" />
  },
  {
    value: "legal",
    label: <Label name="Legal" translationKey="legal" namespace="profile" />
  }
];


export type ProfileSearch = {
  tab?: TBar;
};

export const NavScrollBar = ({ setNavIndex }: { setNavIndex: (v: TBar) => void }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [_navIndex, _setNavIndex] = useState<TBar>("dashboard");

  const search = useSearch({ from: "/_main/_authenticated/profile" }) as ProfileSearch;

  useEffect(() => {
    if (search.tab) {
      const matched = items.find((item) => item.value === search.tab);
      if (matched) {
        setNavIndex(search.tab);
        _setNavIndex(search.tab);
      } else {
        setNavIndex("dashboard");
        _setNavIndex("dashboard");
      }
    }
  }, [search]);

  /**
   * 选中则滚动
   */
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

  /**
   * 滚动到目标
   */
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
  }, [_navIndex]);

  const changeNavTab = (index: TBar) => {
    setNavIndex(index);
    _setNavIndex(index);
  };

  // 共享数据
  useEffect(() => {
    const subscription = emitter.addListener("SYNC_TABS_INDEX", (index: TBar) => {
      changeNavTab(index);
    });
    return () => subscription.remove();
  }, []);

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
    <div ref={ref}
         className={classNames("relative overflow-x-auto overflow-y-hidden gap-4 flex md:mx-0 pb-2 hide-scrollbar")}>
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
