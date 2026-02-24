import { useTranslation } from "react-i18next";
import { Country, getCountries } from "react-phone-number-input";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import locale from "react-phone-number-input/locale/en";
import { cn } from "@/utils/cn.ts";
import { ChevronDown, ChevronLeft, Search } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { createPortal } from "react-dom";
import { useToggle } from "@/hooks/useToggle";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { NoData } from "@/components/modal/UserFinanceModal/c/NoData.tsx";
import clsx from "clsx";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import { InnerLoading } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

interface IStatus {
  search: string,
  country: string,
}

const initStatus: IStatus = {
  search: "",
  country: ""
};

export const CountryCodeSelect = ({ loading, defaultCode, onCodeChange }: {
  loading: boolean
  defaultCode: string
  onCodeChange: (v: string) => void,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const { t } = useTranslation('profile');

  const [status, setStatus] = useState<IStatus>(initStatus);

  const [show, { set }] = useToggle<boolean>(false);

  const memoOptions = useMemo(() => {
    const countries = getCountries();
    return countries.map((code) => {
      return ({
        value: code,
        label: <div className={"flex items-center justify-between w-full"}>
          <span
            className={"flex items-center gap-2 space-between"}>{getUnicodeFlagIcon(code)}<span>{locale[code]}</span></span>
          <span className={"text-xs md:text-[10px] text-base-content/50"}>{code}</span>
        </div>,
        search: [code, locale[code]]
      });
    });
  }, []);

  /**
   * 根据搜索文本过滤选项
   */
  const memoFilteredOptions = useMemo(() => {
    return status.search
      ? memoOptions.filter((option) => option.search.some((o) => o.toLowerCase().includes(status.search.toLowerCase())))
      : memoOptions;
  }, [memoOptions, status.search]);

  /**
   * 区号选择列表
   */
  const memoSelectOptions = useMemo(() => {
    return memoFilteredOptions.length === 0 ? (
      <NoData text={t("common.noData")} />
    ) : (
      <div className="flex flex-col gap-1">
        {memoFilteredOptions.map((o, index: number) => (
          <div
            key={index}
            className={clsx(
              "md:text-xs font-bold flex items-center justify-between",
              "cursor-pointer rounded-md p-2 select-none",
              "hover:bg-base-200 active:bg-base-200",
              o.value === status.country ? "bg-base-200" : ""
            )}
            onClick={() => {
              onCodeChange(o.value);
              setStatus((v) => ({ ...v, country: o.value, search: "" }));
              set(false);
            }}
          >
            {o.label}
          </div>
        ))}
      </div>
    );
  }, [memoFilteredOptions, status.country]);

  /**
   * 根据用户IP默认地区码
   */
  useEffect(() => {
    if (defaultCode) setStatus((o) => ({
      ...o,
      country: defaultCode.toUpperCase() as Country
    }));
  }, [defaultCode]);

  return (
    <div>
      <div
        className="rounded-lg flex items-center justify-between bg-base-300 h-10 px-4 cursor-pointer"
        onClick={() => {
          !loading && set(!show);
          !show && setStatus((o) => ({ ...o, search: "" }));
        }}>
        {loading ? (
          <InnerLoading />
        ) : (
          <>
            <p className={cn("text-sm truncate font-extrabold text-base-content")}>
              {status.country
                ? <span
                  className="flex gap-2"><span>{getUnicodeFlagIcon(status.country as Country)}</span>{locale[status.country as Country]}</span>
                : <span className={'text-base-content/50'}>{t("finance:select")}</span>}
            </p>
            <ChevronDown
              className={cn("w-4 h-4 md:transition-transform md:duration-200 text-base-content/50", show ? "md:rotate-180" : "")}
            />
          </>
        )}
      </div>
      <div className="flex flex-col" ref={ref}>
        {/*<p className="py-1.5 text-xs font-semibold text-base-content/50 flex items-center">{t("profile:phoneVerification")}</p>*/}
        {/*桌面端*/}
        {!isMobile && (
          <AnimatePresence>
            {show && (
              <m.div
                className={clsx(`
          bg-base-300 z-1 mt-1 w-full rounded-lg shadow-xs overflow-hidden 
          w-[calc(100vw-3rem)] md:w-full 
          ltr:-left-[calc(100%+8px)] rtl:-right-[calc(100%+8px)]
          `)}
                exit={{ height: 0 }}
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                transition={{ duration: 0.1, delay: 0.1 }}
              >
                <div className="h-2 bg-base-300 sticky top-0" />
                <InnerSearch
                  className="mx-3 mt-1 mb-2"
                  placeholder={t("common:common.searchPlaceholder")}
                  value={status.search}
                  onChange={(v) => setStatus((o) => ({ ...o, search: v }))}
                />
                <div className="flex max-h-[180px] flex-col gap-3 px-3 py-1 overflow-y-auto hide-scrollbar">
                  {memoSelectOptions}
                </div>
                <div className="h-2 bg-base-300 sticky bottom-0" />
              </m.div>
            )}
          </AnimatePresence>
        )}

        {/* 移动端 */}
        {isMobile &&
          createPortal(
            <AnimatePresence>
              {show && (
                <m.div
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  style={{ marginTop: "var(--safe-area-inset-top)" }}
                  className="px-4 py-4 bg-base-400 fixed w-full z-[1002] top-0 bottom-0 flex flex-col"
                >
                  <p className="flex items-center justify-center relative text-lg font-semibold h-10">
                    <button className={"absolute left-0 btn btn-md btn-square rounded-lg bg-base-300 border-0"}
                            onClick={() => set(false)}>
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    {t("common:common.selectCountry")}
                  </p>
                  <InnerSearch
                    className="mt-4 bg-base-300"
                    placeholder={t("common:common.searchPlaceholder")}
                    value={status.search}
                    onChange={(v) => setStatus((o) => ({ ...o, search: v }))}
                  />
                  <div className="mt-2 overflow-y-auto flex-1 hide-scrollbar">{memoSelectOptions}</div>
                </m.div>
              )}
            </AnimatePresence>,
            document.body
          )}
      </div>
    </div>
  );
};

const InnerSearch = forwardRef<HTMLInputElement, {
  value: string,
  className?: string,
  placeholder?: string
  onChange: (v: string) => void
}>(({ value, onChange, className, placeholder }, ref) => {
  return <div className="flex">
    <label className={clsx("input bg-base-200 w-full !outline-0 border-0 font-bold", className)}>
      <Search className="text-base-content/50 w-4 h-4" />
      <input
        ref={ref}
        type="text"
        value={value}
        placeholder={placeholder}
        className="flex-1"
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  </div>;
});
