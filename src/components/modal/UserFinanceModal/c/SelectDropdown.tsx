import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import clsx from "clsx";
import { ChevronDown, ChevronLeft, Search } from "lucide-react";
import { forwardRef, ReactNode, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { NoData } from "@/components/modal/UserFinanceModal/c/NoData.tsx";
import { LazyMotion, domMax, m, AnimatePresence } from "motion/react";

export interface SelectOption {
  id: string;
  value: string | number;
  label?: string | ReactNode;
  extra?:ReactNode;
  icon?: string | ReactNode;
  spare?: string | number;
  disabled?: boolean;
}

export interface SelectDropdownRef {
  handleOpenChange: (open: boolean) => void;
  blur: () => void;
}

export interface SelectDropdownProps {
  loading?: boolean;
  title?: ReactNode;
  /** 选项列表 */
  options: SelectOption[];
  /** 当前选中的值 */
  value?: string | number;
  /** 选择变化时的回调函数 */
  onChange?: (value: string | number, option: SelectOption) => void;
  /** 占位文本 */
  placeholder?: string;
  /** 起始图标 */
  startIcon?: string | ReactNode;
  /** 是否禁用 */
  disabled?: boolean;
  /** 下拉框宽度 */
  width?: string;
  /** 按钮高度 */
  height?: "xs" | "sm" | "md" | "lg" | "h10";
  /** 按钮样式 */
  variant?: "filled" | "outlined" | "ghost";
  /** 自定义类名 */
  className?: string;
  /** 下拉内容的自定义类名 */
  dropdownClassName?: string;
  /** 下拉框容器的自定义类名 */
  dropdownContainerClassName?: string;
  /** 是否显示搜索框 */
  showSearch?: boolean;
  /** 搜索框占位文本 */
  searchPlaceholder?: string;
  /** 无数据时显示的文本 */
  emptyText?: string;
  /** 自定义渲染选项 */
  renderOption?: (option: SelectOption) => ReactNode;
  /** 自定义渲染选中值 */
  renderValue?: (option: SelectOption | null) => ReactNode;
  /** 按钮的自定义类名 */
  buttonClassName?: string;
  /** 是否自动聚焦搜索框 */
  focusSearch?: boolean;
}

export const SelectDropdown = forwardRef<
  SelectDropdownRef,
  SelectDropdownProps
>(
  (
    {
      loading,
      title,
      options,
      value,
      onChange,
      placeholder,
      disabled = false,
      width = "w-full",
      height = "md",
      variant = "filled",
      className = "",
      // dropdownClassName = "",
      dropdownContainerClassName = "",
      showSearch = false,
      searchPlaceholder,
      emptyText,
      renderOption,
      renderValue,
      buttonClassName = "",
      focusSearch = false
    },
    ref
  ) => {
    const isMobile = useMediaQuery("(max-width: 768px)");

    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Set default placeholder if not provided
    const finalPlaceholder = placeholder || t("common:common.pleaseSelect");
    const finalSearchPlaceholder =
      searchPlaceholder || t("common:common.searchPlaceholder");
    const finalEmptyText = emptyText || t("common:common.noData");

    // 获取当前选中的选项
    const selectedOption = useMemo(() => {
      return options.find((option) => option.value === value) || null;
    }, [options, value]);

    // 根据搜索文本过滤选项
    const filteredOptions = useMemo(() => {
      return showSearch && searchText
        ? options.filter((option) =>
          (typeof option.label === "string"
              ? option.label
              : option.value.toString()
          )
            .toLowerCase()
            .includes(searchText.toLowerCase())
        )
        : options;
    }, [options, searchText, showSearch]);

    // 切换下拉框状态
    const toggleDropdown = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    // 选择选项
    const handleSelect = (option: SelectOption) => {
      if (option.disabled) return;

      if (onChange && option.value !== value) {
        onChange(option.value, option);
      }
      setIsOpen(false);
      setSearchText("");
    };

    useImperativeHandle(ref, () => ({
      handleOpenChange: (open: boolean) => {
        setIsOpen(open);
      },
      blur: () => {
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
      }
    }));

    // 点击外部关闭下拉框
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          !isMobile
        ) {
          setIsOpen(false);
          setSearchText("");
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        // 如果有搜索框，自动聚焦
        if (showSearch && searchInputRef.current && focusSearch) {
          searchInputRef.current.focus();
        }
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen, showSearch]);

    // 按钮高度样式
    const buttonHeightClass = {
      xs: "h-8",
      sm: "h-10",
      md: "h-12",
      lg: "h-16",
      h10: "h-10"
    }[height];

    // 按钮变体样式
    const buttonVariantClass = {
      filled: "bg-base-300 hover:bg-base-300/60",
      outlined:
        "bg-transparent border border-base-content/20 hover:bg-base-200/30",
      ghost: "bg-transparent hover:bg-base-200/30"
    }[variant];

    // 渲染选项
    const renderOptionItem = (option: SelectOption) => {
      if (renderOption) {
        return renderOption(option);
      }

      return (
        <div className="flex items-center gap-2 md:text-sm font-semibold">
          {option.icon &&
            ((typeof option.icon === "string" ? (
              <ImageWithPlaceholder src={option.icon} alt="" className="h-6 w-6 rounded-full" />
            ) : (
              <span className="flex-shrink-0">{option.icon}</span>
            )))}
          <div className={'flex justify-between items-center w-full'}>
            {option.label || option.value}
            <span className={'text-base-content/50 text-[11px]'}>{option?.extra}</span>
          </div>
        </div>
      );
    };

    // 渲染选中值
    const renderSelectedValue = useMemo(() => {
      if (renderValue && selectedOption) {
        return renderValue(selectedOption);
      }

      if (!selectedOption) {
        return (
          <span className="text-base-content/50">
            {finalPlaceholder}
          </span>
        );
      }

      return (
        <div
          className={clsx(
            "flex items-center gap-2",
            dropdownContainerClassName
          )}
        >
          {selectedOption.icon &&
            (typeof selectedOption.icon === "string" ? (
              <ImageWithPlaceholder src={selectedOption.icon} alt="" className="h-6 w-6 rounded-full" />
            ) : (
              <span className="flex-shrink-0">{selectedOption.icon}</span>
            ))}
          <span className="flex-1 truncate">
            {selectedOption.label || selectedOption.value}
          </span>
        </div>
      );
    }, [selectedOption]);

    const renderOptionWrap = useMemo(() => {
      return filteredOptions.map((option, index) => (
        <div
          key={`${option.id}_${index}`}
          className={clsx(
            "cursor-pointer rounded-lg p-2 select-none",
            option.disabled
              ? "!cursor-not-allowed opacity-50"
              : "hover:bg-base-200 active:bg-base-200",
            option.value === value ? "bg-base-200" : ""
          )}
          onClick={() => !option.disabled && handleSelect(option)}
        >
          {renderOptionItem(option)}
        </div>
      ));
    }, [value, filteredOptions]);

    return (
      <div ref={dropdownRef} className={clsx("relative", width, className)}>
        {/* 选择按钮 */}
        <button
          className={clsx(
            "btn flex w-full items-center justify-between px-4 text-sm font-semibold border-0",
            buttonHeightClass,
            buttonVariantClass,
            buttonClassName,
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          )}
          onClick={() => !loading && toggleDropdown()}
          disabled={disabled}
        >
          {loading ? <InnerLoading /> : <>
            <div className="flex-1 text-left overflow-hidden">{renderSelectedValue}</div>
            <Icon isOpen={isOpen} />
          </>}
        </button>

        {/*桌面端 - 使用 AnimatePresence 优化加载 */}
        {!isMobile && (
          <LazyMotion features={domMax}>
            <AnimatePresence>
              {isOpen && (
                <m.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={{
                    open: { height: "auto", opacity: 1, pointerEvents: "auto" as const, display: "block" },
                    closed: { height: 0, opacity: 0, pointerEvents: "none" as const, transitionEnd: { display: "none" } }
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={clsx(
                    "absolute top-full left-0 right-0 mt-2 bg-base-400 rounded-field shadow-lg z-[1001] overflow-hidden",
                    dropdownContainerClassName
                  )}
                >
                  <div className="p-2">
                    {/* 搜索框 */}
                    <Wrapper show={showSearch && options.length > 0}>
                      <InnerSearch
                        className="mb-2 bg-base-300"
                        ref={searchInputRef}
                        placeholder={finalSearchPlaceholder}
                        value={searchText}
                        onChange={setSearchText}
                      />
                    </Wrapper>

                    {/* 选项内容 */}
                    <div className="max-h-60 overflow-y-auto p-1 hide-scrollbar">
                      {filteredOptions.length > 0 ? renderOptionWrap : (
                        <NoData text={finalEmptyText} className="p-3 text-xs" />
                      )}
                    </div>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </LazyMotion>
        )}

        {/* H5模式选项列表 - 使用 AnimatePresence 优化加载 */}
        {isMobile && createPortal(
          <LazyMotion features={domMax}>
            <AnimatePresence>
              {isOpen && (
                <m.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={{
                    open: { opacity: 1, y: 0, pointerEvents: "auto" as const, display: "flex" },
                    closed: { opacity: 0, y: -8, pointerEvents: "none" as const, transitionEnd: { display: "none" } }
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{ marginTop: "var(--safe-area-inset-top)" }}
                  className="px-4 py-4 bg-base-400 fixed w-full z-[1002] top-0 bottom-0 flex flex-col"
                >
                  <div className="flex items-center justify-center relative text-lg font-semibold h-10">
                    <Close close={setIsOpen} />{title}
                  </div>

                  {/* 搜索框 */}
                  <Wrapper show={showSearch && options.length > 0}>
                    <InnerSearch
                      className="mt-4 bg-base-300"
                      ref={searchInputRef}
                      placeholder={finalSearchPlaceholder}
                      value={searchText}
                      onChange={setSearchText}
                    />
                  </Wrapper>

                  {/* 选项内容 */}
                  <div className="mt-2 overflow-y-auto flex-1 hide-scrollbar rounded-lg flex flex-col gap-1">
                    {filteredOptions.length > 0 ? renderOptionWrap : (
                      <NoData text={finalEmptyText} className="text-sm" />
                    )}
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </LazyMotion>
          , document.body)}
      </div>
    );
  }
);

// Add displayName to the component
SelectDropdown.displayName = "SelectDropdown";

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

const InnerLoading = () => {
  return (<><span className="bg-base-200 md:bg-base-400 skeleton w-6 h-6 rounded-full"></span><span
    className="bg-base-200 md:bg-base-400 skeleton flex-1 rounded-lg h-6" /></>);
};

const ImageWithPlaceholder = ({ src, alt, className, ...props }: React.ComponentProps<"img">) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  return (
    <>
      {!imageLoaded && (
        <div className={clsx("skeleton bg-base-200", className)} />
      )}
      <img
        {...props}
        src={src}
        className={className}
        alt={alt}
        onLoad={() => setImageLoaded(true)}
        style={{ display: imageLoaded ? "block" : "none" }}
      />
    </>
  );
};

const Icon = ({ isOpen }: { isOpen: boolean }) => {
  return <ChevronDown strokeWidth={2} className={clsx(
    "w-4 h-4 md:transition-transform md:duration-200 text-base-content/50",
    isOpen ? "md:rotate-180" : ""
  )} />;
};

const Close = ({ close }: { close: (v: boolean) => void }) => {
  return <button
    className={"absolute left-0 btn btn-md btn-square rounded-lg bg-base-300 border-0"}
    onClick={() => close(false)}
  >
    <ChevronLeft className="w-6 h-6" />
  </button>;
};

const Wrapper = ({ show, children }: { show: boolean, children: ReactNode }) => {
  return <>{show ? children : null}</>;
};
