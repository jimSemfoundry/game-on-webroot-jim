import React, { PropsWithChildren, ReactNode, useEffect, useMemo, useState } from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/cn.ts";
import { emitter } from "@/store/emitter.ts";
import { RequireItem } from "@/components/modal/UserFinanceModal/c/RequireItem.tsx";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { useBoundStore } from "@/store";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";

export const DisplayContent = ({ children, status, className }: PropsWithChildren<{
  status: boolean,
  className?: string
}>) => {
  return <div className={classNames(status ? "block" : "hidden", className)}>{children}</div>;
};

export const Applied = ({ cls }: { cls?: string }) => {
  const { t } = useTranslation();

  return (
    <button className={cn("btn btn-primary z-10 ", cls)}>
      {t("finance:applied")}
    </button>
  );
};

export const FormBox = ({ label, children }: { label: ReactNode; children: ReactNode }) => {
  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="text-xs font-semibold text-base-content/50">{label}</div>
      {children}
    </div>
  );
};

export const InputBox = ({ type, label, className, ...props }: React.ComponentProps<"input"> & {
  label: React.ReactNode
}) => {
  return (
    <FormBox label={label}>
      <input {...props}
             className={classNames("input bg-base-300 w-full border-0 !outline-0 font-semibold px-4", className)} />
    </FormBox>
  );
};

export const InnerFieldItem = ({ name, field, onChange }: {
  name: string,
  field: Record<string, any>,
  onChange: (v: Record<string, any>) => void
}) => {
  const { t } = useTranslation();

  const { syncAction } = useBoundStore();

  const [account, setAccount] = useState<{
    extra: null | Record<string, any>;
    value: string
    error: boolean
    error_content: Record<string, any> | null
  }>({
    extra: null,
    value: "",
    error: false,
    error_content: null
  });

  const regexp = useMemo(() => {
    if (account.extra?.type === "withdraw_type") {
      switch (account.extra?.value) {
        case "PHONE":
          return { error: "FIXED_LENGTH", regexp: /^\d{11}$/, len: 11 };
        case "EMAIL":
          return { error: "EMAIL", regexp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ };
        default:
          return { error: "REQUIRED_FIELDS", regexp: /^\S+$/ };
      }
    }

    if (field?.label === "email") {
      return { error: "EMAIL", regexp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ };
    }

    if (field?.type === "number") {
      // 有几个固定长度的要求
      if (field?.fixed_length) {
        const split = field?.fixed_length?.split(",");
        const combine = split.map((s: string) => `^\\d{${s}}$`);
        return {
          error: "NUMBER_LIMIT_LENGTH",
          regexp: new RegExp(combine.join("|")),
          limit: field?.fixed_length
        };
      }
      // 有最短长度要求，有最大长度要求
      if (field?.min_length > 0 && field?.max_length > 0 && field?.min_length !== field?.max_length) {
        return {
          error: "MIN_MAX_LENGTH",
          regexp: new RegExp(`^\\d{${field.min_length},${field.max_length}}$`),
          min: field.min_length,
          max: field.max_length,
          mobile: field.label === "mobile_number"
        };
      }
      // 固定长度要求
      if (field?.min_length > 0 && field?.max_length > 0 && field?.min_length === field?.max_length) {
        return {
          error: "FIXED_LENGTH",
          regexp: new RegExp(`^\\d{${field.min_length}}$`),
          len: field.min_length,
          mobile: field.label === "mobile_number"
        };
      }
      // 有些没有长度要求，需要自行控制
      if (field.label === "mobile_number" || field.name === "mobile_number") {
        return {
          error: "MIN_MAX_LENGTH",
          regexp: /^[0-9]{7,15}$/,
          min: 7,
          max: 15,
          mobile: true
        };
      }

      // 至少1位数字
      return { error: "REQUIRED_NUMBER", regexp: /^\d+$/ };
    }

    if (field?.type === "string") {
      // 有几个固定长度的要求
      if (field?.fixed_length) {
        const split = field?.fixed_length?.split(",");
        const combine = split.map((s: string) => `^.{${s}}$`);
        return {
          error: "STRING_LIMIT_LENGTH",
          regexp: new RegExp(combine.join("|")),
          limit: field?.fixed_length
        };
      }
      // 有最短长度要求，有最大长度要求
      if (field?.min_length > 0 && field?.max_length > 0 && field?.min_length !== field?.max_length) {
        return {
          error: "STRING_MIN_MAX_LENGTH",
          regexp: new RegExp(`^.{${field.min_length},${field.max_length}}$`),
          min: field.min_length,
          max: field.max_length
        };
      }
      // 固定长度要求
      if (field?.min_length > 0 && field?.max_length > 0 && field?.min_length === field?.max_length) {
        return {
          error: "STRING_FIXED_LENGTH",
          regexp: new RegExp(`^.{${field.min_length}}$`),
          len: field.min_length
        };
      }
      // 特殊字符禁止要求
      if (field?.disabled_char) {
        return {
          error: "STRING_DISABLED_CHAR",
          regexp: new RegExp(`^[^${field.disabled_char.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}]*$`),
          disabled_char: field?.disabled_char
        };
      }
    }

    // 非空即可
    return { error: "REQUIRED_FIELDS", regexp: /^(?=\s*\S)[\s\S]*$/ };
  }, [field, account.extra]);

  useEffect(() => {
    onChange({ value: "", [`${name}_error`]: false });

    emitter.addListener("withdraw_type", function(v: string) {
      setAccount((old) => ({
        ...old,
        extra: { type: "withdraw_type", value: v },
        value: "",
        error: false,
        error_content: null
      }));
    });
  }, []);

  // 事件通知 & 重置表单状态
  useEffect(() => {
    if (syncAction.type && ["CLOSE_FINANCE_MODAL"].includes(syncAction.type)) setAccount({
      extra: null,
      value: "",
      error: false,
      error_content: null
    });
  }, [syncAction]);

  return (
    <div key={name} onClick={(e) => e.stopPropagation()}>
      <InputBox
        type="text"
        label={<RequireItem label={t(`finance:${field.label}`)} />}
        value={account.value}
        onChange={(e) => {
          const base = {
            value: e.target.value,
            error: !regexp.regexp.test(e.target.value),
            error_content: !regexp.regexp.test(e.target.value) ? regexp : null
          };
          setAccount((old) => ({ ...old, ...base }));
          onChange({ value: base.value, [`${name}_error`]: base.error });
        }}
        placeholder={`${t("finance:enter")} ${t(`finance:${field.label}`)}`}
      />
      {/* 有长度范围的手机号 */}
      <ErrorMessageBox
        sample
        show={account.error_content?.error === "MIN_MAX_LENGTH" && account.error_content?.mobile}
        content={t("finance:enter_phone_min_max", { min: account.error_content?.min, max: account.error_content?.max })}
      />
      {/* 固定长度的手机号 */}
      <ErrorMessageBox
        sample
        show={account.error_content?.error === "FIXED_LENGTH" && account.error_content?.mobile}
        content={t("finance:enter_phone_fixed_len", { len: account.error_content?.len })}
      />
      <ErrorMessageBox
        sample
        show={account.error_content?.error === "EMAIL"}
        content={t("finance:enter_email_correct")}
      />
      <ErrorMessageBox
        sample
        show={account.error_content?.error === "REQUIRED_FIELDS"}
        content={t("finance:field_required")}
      />
      <ErrorMessageBox
        sample
        show={account.error_content?.error === "REQUIRED_NUMBER"}
        content={t("finance:enter_number")}
      />
      {/* 有长度范围的数字账号 */}
      <ErrorMessageBox
        sample
        show={account.error_content?.error === "MIN_MAX_LENGTH" && !account.error_content?.mobile}
        content={t("finance:enter_number_min_max", {
          min: account.error_content?.min,
          max: account.error_content?.max
        })}
      />
      {/* 固定长度的数字账号 */}
      <ErrorMessageBox
        sample
        show={account.error_content?.error === "FIXED_LENGTH" && !account.error_content?.mobile}
        content={t("finance:enter_number_fixed_len", { len: account.error_content?.len })}
      />
      <ErrorMessageBox
        sample
        content={t("finance:enter_code_fixed_len", { len: account.error_content?.len })}
        show={account.error_content?.error === "STRING_FIXED_LENGTH"}
      />
      <ErrorMessageBox
        sample
        show={account.error_content?.error === "STRING_MIN_MAX_LENGTH" && !account.error_content?.mobile}
        content={t("finance:enter_code_min_max", { min: account.error_content?.min, max: account.error_content?.max })}
      />
      {/* 特殊字符禁止要求 */}
      <ErrorMessageBox
        sample
        show={account.error_content?.error === "STRING_DISABLED_CHAR"}
        content={t("finance:enter_string_disabled_char", { char: account.error_content?.disabled_char })}
      />
      {/* 有几个固定长度要求 */}
      <ErrorMessageBox
        sample
        show={account.error_content?.error === "NUMBER_LIMIT_LENGTH"}
        content={t("finance:enter_number_limit_length", { limit: account.error_content?.limit })}
      />
      <ErrorMessageBox
        sample
        show={account.error_content?.error === "STRING_LIMIT_LENGTH"}
        content={t("finance:enter_string_limit_length", { limit: account.error_content?.limit })}
      />
    </div>
  );
};

export const InnerOptions = ({ name, field, onChange }: {
  name: string,
  field: Record<string, any>,
  onChange: (v: Record<string, any>) => void
}) => {
  const { t } = useTranslation();

  const [status, setStatus] = useState<{
    value: string,
  }>({
    value: ""
  });

  const memoOptions = useMemo(() => {
    return field.select.map((item: Record<string, any>) => ({
      id: item.value,
      value: item.value,
      label: item.key
    }));
  }, [field]);

  useEffect(() => {
    onChange({ [name]: memoOptions[0].value });
    setStatus((old) => ({ ...old, value: memoOptions[0].value }));
  }, [memoOptions]);

  return (<FormBox key={name} label={<RequireItem label={t(`finance:${field.label}`)} />}>
    <SelectDropdown
      title={t(`finance:${field.label}`)}
      height="sm"
      options={memoOptions}
      value={status.value}
      onChange={(value) => {
        onChange({ [name]: value });
        setStatus((old) => ({ ...old, value: value as string }));
      }}
      placeholder={`${t("finance:select")} ${t(`finance:${field.label}`)}`}
      buttonClassName="bg-base-300 border-0 hover:bg-base-300/60"
      showSearch
    />
  </FormBox>);
};

export const InnerPayment = ({ method, gateway, onClick }: {
  method: Record<string, any> | null,
  gateway: Record<string, any>,
  onClick: () => void
}) => {
  return (<div
    className={classNames(
      "relative cursor-pointer bg-base-400 border-2 border-base-400 flex flex-col gap-2 rounded-lg p-3 justify-center text-[10px] text-base-content/50 text-center font-extrabold",
      { "border-primary text-primary": method?.id === gateway?.id }
    )}
    onClick={onClick}
  >
    <InnerMaintenance show={gateway?.status === 0} className="top-0 left-0 right-0 rounded-t-lg" />
    <div className="flex h-10 items-center justify-center">
      {gateway?.icon ? (
        <ImageWithPlaceholder src={gateway?.icon} className="max-h-10"
                              alt={gateway?.display_name || gateway?.channel_class} />
      ) : (
        <div
          className="h-full w-full flex items-center justify-center border-dashed border-base-100 border-1 rounded-lg px-1">
          <span className="truncate">{gateway?.display_name || gateway?.channel_class}</span>
        </div>
      )}
    </div>
    <div>
      <p className="truncate">{gateway?.display_name || gateway?.channel_class}</p>
      <p className="truncate"><InnerProviderAmountRangeFormat min={gateway?.min} max={gateway?.max} /></p>
      {/*<p>ETA: {Math.ceil(gateway?.timeout / 60)} min</p>*/}
    </div>
  </div>);
};

export const InnerProviderAmountRangeFormat = ({ min, max, currency = "" }: {
  min: string,
  max: string,
  currency?: string
}) => {
  const o = (value: string, decimal = 18): string => {
    const str = String(value);
    const _value = str.indexOf(".") > -1 ? f(str, decimal) : str;
    return _value.replace(/\d+/, (m) => m.replace(/(\d)(?=(\d{3})+$)/g, ($1) => $1 + ","));
  };

  const f = (value: string, decimal = 18): string => {
    const regexp = /(?:\.0*|(\.\d+?)0+)$/;
    const [a, b] = value.split(".");
    const output = `${a}.${b.substring(0, decimal)}`;
    return output.replace(regexp, "$1");
  };

  return <>
    {o(min)}~{o(max)}{" "}{currency}
  </>;
};

// 维护中的供应商
export const InnerMaintenance = ({ show, className }: { show: boolean, className?: string }) => {
  const { t } = useTranslation();
  return show && (
    <span
      className={classNames("uppercase text-center bg-warning text-[10px] px-1 text-neutral absolute truncate leading-3", className)}
    >
      {t("finance:maintenance")}
    </span>
  );
};

export const InnerProviderIcon = ({ icon, thumbnail }: { icon?: string, thumbnail?: string }) => {
  return <img src={thumbnail || icon} className={classNames("h-7 rounded-sm", { "!h-4": thumbnail })} alt="" />;
};

export const ImageWithPlaceholder = ({ src, alt, className, ...props }: React.ComponentProps<"img">) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  useEffect(() => {
    if (!src) return;
    setImageLoaded(false);
    const img = new Image();
    img.src = src;
    img.onload = () => setImageLoaded(true);
  }, [src]);
  return imageLoaded ? (
    <img {...props} src={src} className={className} alt={alt} />
  ) : (
    <div className={classNames("skeleton bg-base-300 w-full h-full rounded-lg", className)} />
  );
};

export const InnerLoading = () => {
  return (
    <>
      <span className="bg-base-200 md:bg-base-400 skeleton w-6 h-6 rounded-full"></span>
      <span className="bg-base-200 md:bg-base-400 skeleton flex-1 rounded-lg h-6" />
    </>
  );
};