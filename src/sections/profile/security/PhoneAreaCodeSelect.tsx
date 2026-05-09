import { useTranslation } from "react-i18next";
import { Country, getCountries, getCountryCallingCode } from "react-phone-number-input";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import locale from "react-phone-number-input/locale/en";
import { cn } from "@/utils/cn.ts";
import { ChevronDown, ChevronLeft, Search } from "lucide-react";
import { AnimatePresence, motion as m } from "motion/react";
import { createPortal } from "react-dom";
import { useToggle } from "@/hooks/useToggle";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { NoData } from "@/components/modal/UserFinanceModal/c/NoData.tsx";
import clsx from "clsx";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import { InnerLoading } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

interface IStatus {
  phone: string,
  search: string,
  area_code: string,
}

const initStatus: IStatus = {
  phone: "",
  search: "",
  area_code: ""
};

export const PhoneAreaCodeSelect = ({ loading, defaultCode, defaultValue = '', onPhoneChange, onCodeChange }: {
  loading: boolean
  defaultCode: string
  defaultValue?: string
  onCodeChange: (v: string) => void,
  onPhoneChange: (v: string) => void
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const { t } = useTranslation('profile');

  const [status, setStatus] = useState<IStatus>(initStatus);

  const [show, { set }] = useToggle<boolean>(false);

  const getFlagAsset = (countryCode?: Country): string => {
    if (!countryCode) return ''
    return `/icons/flags/country/${countryCode.toLowerCase()}.png`
  }

  /**
   * 组装区号选择数据格式
   */
  const memoOptions = useMemo(() => {
    const countries = getCountries();
    return countries.map((code) => {
      return ({
        value: code,
        label: <>
          {/* <span>{getUnicodeFlagIcon(code)}{" "}{locale[code]}</span> */}
          <span className="flex items-center gap-1.5">
            <img
              loading="lazy"
              src={getFlagAsset(code)}
              alt={locale[code]}
              className="w-3 h-3 rounded-sm object-cover"
            />
            <span>{locale[code]}</span>
          </span>
          <span>+{getCountryCallingCode(code)}</span>
        </>,
        search: [code, getUnicodeFlagIcon(code), locale[code], getCountryCallingCode(code)]
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
              combineCode(o) === status.area_code ? "bg-base-200" : ""
            )}
            onClick={() => {
              onCodeChange(o.value);
              setStatus((v) => ({ ...v, area_code: combineCode(o), country: o.value, search: "" }));
              set(false);
            }}
          >
            {o.label}
          </div>
        ))}
      </div>
    );
  }, [memoFilteredOptions, status.area_code]);

  /**
   * 根据用户IP默认地区码
   */
  useEffect(() => {
    if (defaultCode) setStatus((o) => ({
      ...o,
      area_code: combineCode({ value: defaultCode.toUpperCase() as Country })
    }));
  }, [defaultCode]);

  return (
    <div>
      <div className="relative flex items-center gap-2">
        <input
          type="text"
          className="input w-full bg-base-300 !outline-0 border-0 font-semibold px-4 pl-28 text-base-content"
          placeholder={t("profile:enterPhoneNumber")}
          value={status.phone || defaultValue}
          onChange={(v) => {
            const phone = v.target.value;
            let final_phone = phone;
            if (status.area_code && /^0+/.test(phone)) {
              final_phone = phone.replace(/^0+/, "");
            }
            onPhoneChange(final_phone);
            setStatus((o) => ({ ...o, phone: final_phone }));
          }}
        />
        <div className="absolute left-1.5 z-1">
          <button
            onClick={() => {
              !loading && set(!show);
              !show && setStatus((o) => ({ ...o, search: "" }));
            }}
            className="btn btn-xs rounded-sm p-2 flex h-7 w-24 items-center justify-between bg-base-200 border-0"
          >
            {loading ? (
              <InnerLoading />
            ) : (
              <>
                <p className={cn("text-xs truncate font-extrabold text-base-content")}>
                  {status.area_code
                    ? <span className="flex items-center gap-2">
                      <span>
                        <img
                          loading="lazy"
                          src={getFlagAsset((status.area_code?.split("#")[0] || "") as Country)}
                          alt={locale[(status.area_code?.split("#")[0] || "") as Country] || ""}
                          className="w-3 h-3 rounded-sm object-cover"
                        />
                      </span>
                      <span>+{status.area_code?.split("#")[1]}</span>
                    </span>
                    : t("finance:select")}
                </p>
                <ChevronDown
                  className={cn("w-4 h-4 md:transition-transform md:duration-200 text-base-content/50", show ? "md:rotate-180" : "")}
                />
              </>
            )}
          </button>
        </div>
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
                    <button className={"absolute left-0 btn btn-md btn-square rounded-lg bg-base-300 border-0"} onClick={() => set(false)}>
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    {t("profile:phoneVerification")}
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

export const InnerSearch = forwardRef<HTMLInputElement, {
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

function combineCode(o: { value: Country }): string {
  return `${o.value}#${getCountryCallingCode(o.value)}`;
}
