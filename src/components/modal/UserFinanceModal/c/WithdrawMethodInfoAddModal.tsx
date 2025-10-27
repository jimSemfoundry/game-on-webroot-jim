import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { authService } from "@/services/authService.ts";
import { useBoundStore } from "@/store";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RequireItem } from "@/components/modal/UserFinanceModal/c/RequireItem.tsx";
import { FormBox } from "@/components/modal/UserFinanceModal/c/FormBox.tsx";
import { email_reg_exp } from "@/utils/regexp.ts";
import { InputBox } from "@/components/modal/UserFinanceModal/c/InputBox.tsx";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { WithdrawMethodSelectV2 } from "@/components/modal/UserFinanceModal/c/WithdrawMethodSelectV2.tsx";
import {
  useSupportedFiatWithdrawGatewaysV2,
  useUserWithdrawFiatInfo
} from "@/components/modal/UserFinanceModal/helper.ts";
import { AnimatePresence, motion as m } from "motion/react";
import classNames from "classnames";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { InnerSearch } from "@/sections/profile/security/PhoneAreaCodeSelect.tsx";
import { NoData } from "@/components/modal/UserFinanceModal/c/NoData.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { useToggle } from "ahooks";
import { cn } from "@/utils/cn.ts";

type ErrorString = `${string}_error`;

interface ISelectedOption {
  loading: boolean;
  showModal: boolean;
  provider: Record<string, any> | null;
  formItem: Record<string, any> | null;

  [key: ErrorString]: boolean;
}

const initSelected = {
  loading: false,
  provider: null,
  formItem: null,
  showModal: false
};

export const WithdrawMethodInfoAddModal = () => {
  const { t } = useTranslation();

  const [status, setStatus] = useState<ISelectedOption>(initSelected);

  // from data store, share common data
  const { withdrawFiat, syncAction, setSyncAction, setWithdrawFiatV2 } = useBoundStore();

  // 法币是否支持新版的提币操作
  const { data: gatewaysV2 } = useSupportedFiatWithdrawGatewaysV2(withdrawFiat.currency?.currency);

  // 法币提现用用户添加的快捷信息列表
  const { refetch } = useUserWithdrawFiatInfo(withdrawFiat.currency?.currency);

  // 添加提款快捷信息
  const submit = useCallback(() => {
    const final_params = params(status.provider, status.formItem);
    setStatus((v) => ({ ...v, loading: true }));
    authService
      .addUserWithdrawInfo({
        ...final_params,
        currency: withdrawFiat.currency?.currency,
        channel_class: status.provider?.channel_class
      })
      .then((res) => {
        if (res.code === 200) { // FIXME: 怎么又是 200 了，约定的应该都是 0 吧
          toast.success(t("toast:walletAddressAddedSuccessfully"));
          setWithdrawFiatV2({ method: status.provider });
          setStatus(initSelected);
          void refetch();
        } else {
          toast.error(t("toast:failedToAddAddress"));
        }
      })
      .catch(() => {
        toast.error(t("toast:failedToAddAddress"));
        setStatus((v) => ({ ...v, loading: false }));
      })
      .finally(() => {
        setStatus((v) => ({ ...v, loading: false }));
      });
  }, [status]);

  const formItem = useMemo(() => {
    if (!status.provider) return;
    const transform = parser(status.provider?.params);
    let selectNode: React.ReactNode = null;
    let nodes: React.ReactNode[] = [];
    if (transform) {
      for (const key in transform) {
        const field = transform[key];
        if (field.hide || !field.required) continue;
        if (key === "amount") continue;
        if (key === "account") {
          if (field.label === "mobile_number") {
            nodes.push(<InnerPhone
              name={key}
              field={field}
              onChange={(v) => {
                setStatus((old) => ({
                  ...old,
                  formItem: { ...old.formItem, account: v.value },
                  account_error: v.account_error
                }));
              }} />);
            continue;
          }
          if (field.label === "bank_account_number") {
            nodes.push(<InnerAccount
              name={key}
              field={field}
              onChange={(v) => {
                setStatus((old) => ({
                  ...old,
                  formItem: { ...old.formItem, account: v.value },
                  account_error: v.account_error
                }));
              }} />);
            continue;
          }
          nodes.push(<InnerField
            key={key}
            name={key}
            field={field}
            onChange={(v) => {
              setStatus((old) => ({
                ...old,
                formItem: { ...old.formItem, ...v }
              }));
            }} />);
        }
        if (field.label === "email") {
          nodes.push(<InnerEmail
            name={key}
            field={field}
            onChange={(v) => {
              setStatus((old) => ({
                ...old,
                formItem: { ...old.formItem, email: v.value },
                email_error: v.email_error
              }));
            }} />);
          continue;
        }
        if (field.select && field.select.length > 0) {
          selectNode = (<InnerOptions
            name={key}
            field={field}
            onChange={(v) => {
              setStatus((old) => ({
                ...old,
                formItem: { ...old.formItem, ...v }
              }));
            }} />);
          continue;
        }
        nodes.push(<InnerField
          key={key}
          name={key}
          field={field}
          onChange={(v) => {
            setStatus((old) => ({
              ...old,
              formItem: { ...old.formItem, ...v }
            }));
          }} />);
      }
    }
    return nodes.concat(selectNode);
  }, [status.provider]);

  // 表单字段是否有错误
  const error1 = useMemo(() => {
    if (status.formItem && status.provider) return Object.values(params(status.provider, status.formItem)).some((value) => !value);
  }, [status.formItem, status.provider]);

  // 表单字段是否有额外的错误
  const error2 = useMemo(() => {
    const keys = Object.keys(status);
    return keys.filter((k) => k.includes("_error")).find((j) => status[j as ErrorString]);
  }, [status]);

  // 事件通知
  useEffect(() => {
    if (syncAction.type === "OPEN_WITHDRAW_METHOD_ADD_MODAL") {
      setStatus((v) => ({ ...v, showModal: true }));
      setSyncAction(undefined);
    }
  }, [syncAction.type]);

  useEffect(() => {
    if (status.showModal && Array.isArray(gatewaysV2?.data)) setStatus((old) => ({
      ...old,
      provider: gatewaysV2?.data?.[0]
    }));
  }, [gatewaysV2, status.showModal]);

  return (
    <Modal
      title={
        <div className="flex items-center gap-x-2">
          <p className="text-sm font-bold">{t("finance:add_withdrawal_address")}</p>
        </div>
      }
      isOpen={status.showModal}
      onClose={() => setStatus(initSelected)}
      position="modal-middle"
      className="bg-base-400 md:max-w-[360px] shadow-lg hide-scrollbar"
    >
      <div className="flex flex-col gap-4">
        <FormBox label={t("finance:withdrawCurrency")}>
          <div className="flex items-center bg-base-300 h-10 rounded-lg px-4 gap-2">
            <img src={withdrawFiat.currency?.icon} alt="" className="h-6 w-6 rounded-full" />
            <span className="text-sm font-semibold">{withdrawFiat.currency?.currency}</span>
          </div>
        </FormBox>

        <WithdrawMethodSelectV2
          method={status.provider}
          setMethod={(v) => setStatus((old) => ({ ...old, ...v }))}
          title={t("finance:withdrawalMethod")}
          currency={withdrawFiat.currency?.currency}
        />

        {/* 表单 */}
        {formItem}

        <p className="text-base-content/50 font-semibold leading-4 text-xs">
          请确保在提交前所有提款详情均准确无误。因用户输入错误导致的交易不可撤销。
        </p>

        <ConfirmBox disabled={!status.formItem || error1 || !!error2} onClick={submit} loading={status.loading}>
          {t("finance:save")}
        </ConfirmBox>
      </div>
    </Modal>
  );
};

const InnerEmail = ({ name, field, onChange }: {
  name: string, field: Record<string, any>
  onChange: (email: {
    value: string
    email_error: boolean
  }) => void
}) => {
  const { t } = useTranslation();

  const [email, setEmail] = useState<{
    value: string
    email_error: boolean
  }>({
    value: "",
    email_error: false
  });

  useEffect(() => {
    onChange({ value: "", email_error: false });
  }, []);

  return (
    <div key={name} onClick={(e) => e.stopPropagation()}>
      <InputBox
        type="text"
        label={<RequireItem label={t(`finance:${field.label}`)} />}
        value={email.value}
        onChange={(e) => {
          const base = {
            value: e.target.value.trim(),
            email_error: e.target.value.trim() !== "" && !email_reg_exp.test(e.target.value.trim())
          };
          setEmail((old) => ({ ...old, ...base }));
          onChange(base);
        }}
        placeholder={`${t("finance:enter")} ${t(`finance:${field.label}`)}`}
      />
      <ErrorMessageBox
        sample
        show={email.value !== "" && email.email_error}
        content={t("login:emailError")}
      />
    </div>
  );
};

const InnerPhone = ({ name, field, onChange }: {
  name: string, field: Record<string, any>
  onChange: (account: {
    value: string
    account_error: boolean
  }) => void
}) => {
  const { t } = useTranslation();

  const [account, setAccount] = useState<{
    value: string
    account_error: boolean
  }>({
    value: "",
    account_error: false
  });

  useEffect(() => {
    onChange({ value: "", account_error: false });
  }, []);

  return (
    <div key={name} onClick={(e) => e.stopPropagation()}>
      <InputBox
        type="text"
        label={<RequireItem label={t(`finance:${field.label}`)} />}
        value={account.value}
        onChange={(e) => {
          const base = {
            value: e.target.value,
            account_error: e.target.value.trim() !== "" && !new RegExp(`^\\d{${field.min_length ?? 1},${field.max_length ?? 20}}$`).test(e.target.value.trim())
          };
          setAccount((old) => ({ ...old, ...base }));
          onChange(base);
        }}
        placeholder={`${t("finance:enter")} ${t(`finance:${field.label}`)}`}
      />
      <ErrorMessageBox
        sample
        show={account.value !== "" && account.account_error}
        content={`请输入${field.min_length === field.max_length ? field.max_length : `${field.min_length} - ${field.max_length}`}位手机号码`}
      />
    </div>
  );
};

const InnerField = ({ name, field, onChange }: {
  name: string, field: Record<string, any>
  onChange: (v: Record<string, any>) => void
}) => {
  const { t } = useTranslation();

  const [value, setValue] = useState<string>("");

  useEffect(() => {
    onChange({ [name]: "" });
  }, []);

  return (
    <InputBox
      key={name}
      type={field.type}
      label={<RequireItem label={t(`finance:${field.label}`)} />}
      value={value}
      onChange={(e) => {
        setValue(e.target.value.trim());
        onChange({ [name]: e.target.value.trim() });
      }}
      placeholder={`${t("finance:enter")} ${t(`finance:${field.label}`)}`}
    />
  );
};

const InnerOptions = ({ name, field, onChange }: {
  name: string, field: Record<string, any>,
  onChange: (v: Record<string, any>) => void
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const { t } = useTranslation();

  const [status, setStatus] = useState<{
    value: string,
    search: string,
  }>({
    search: "",
    value: ""
  });

  const [show, { set }] = useToggle<boolean>(false);

  const memoOptions = useMemo(() => {
    return field.select.map((item: Record<string, any>) => ({
      id: item.value,
      value: item.value,
      label: item.key,
      search: [item.value, item.key]
    }));
  }, [field]);

  const memoFilteredOptions = useMemo(() => {
    return status.search
      ? memoOptions.filter((option: {
        search: string[]
      }) => option.search.some((o: string) => o.toLowerCase().includes(status.search.toLowerCase())))
      : memoOptions;
  }, [memoOptions, status.search]);

  const memoSelectOptions = useMemo(() => {
    return memoFilteredOptions.length === 0 ? (
      <NoData text={t("common.noData")} />
    ) : (
      <div className="flex flex-col gap-1">
        {memoFilteredOptions.map((o: Record<string, any>, index: number) => (
          <div
            key={index}
            className={classNames(
              "md:text-xs font-bold flex items-center justify-between",
              "cursor-pointer rounded-md p-2 select-none",
              "hover:bg-base-200 active:bg-base-200",
              o.value === status.value ? "bg-base-200" : ""
            )}
            onClick={() => {
              setStatus((v) => ({ ...v, value: o.value, search: "" }));
              set(false);
            }}
          >
            {o.label}
          </div>
        ))}
      </div>
    );
  }, [memoFilteredOptions, status.value]);

  useEffect(() => {
    onChange({ [name]: memoOptions[0].value });
    setStatus((old) => ({...old, value: memoOptions[0].value}));
  }, [memoOptions]);

  return (
    <FormBox key={name} label={<RequireItem label={t(`finance:${field.label}`)} />}>
      <div
        className="flex items-center justify-between bg-base-300 h-10 rounded-lg px-4 cursor-pointer"
        onClick={() => {
          set(!show);
          !show && setStatus((o) => ({ ...o, search: "" }));
        }}>
        <span className="text-sm font-semibold">{status.value}</span>
        <ChevronDown
          className={cn("w-4 h-4 md:transition-transform md:duration-200 text-base-content/50", show ? "md:rotate-180" : "")}
        />
      </div>

      <div className="flex flex-col -mt-1" ref={ref}>
        {/*桌面端*/}
        {!isMobile && (
          <AnimatePresence>
            {show && (
              <m.div
                className={classNames(`
          bg-base-300 z-1 w-full rounded-lg shadow-xs overflow-hidden 
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
                  placeholder={t("common.searchPlaceholder")}
                  value={status.search}
                  onChange={(v) => setStatus((o) => ({ ...o, search: v }))}
                />
                <div className="flex max-h-[160px] flex-col gap-3 px-3 py-1 overflow-y-auto hide-scrollbar">
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
                  className="px-4 py-4 bg-base-400 fixed w-full z-[1000] top-0 bottom-0 flex flex-col"
                >
                  <p className="flex items-center justify-center relative text-lg font-semibold h-10">
                    <button className={"absolute left-0 btn btn-md btn-square rounded-lg bg-base-300 border-0"}
                            onClick={() => set(false)}>
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    {t("profile:phoneVerification")}
                  </p>
                  <InnerSearch
                    className="mt-4 bg-base-300"
                    placeholder={t("common.searchPlaceholder")}
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
    </FormBox>
  );
};

const InnerAccount = ({ name, field, onChange }: {
  name: string, field: Record<string, any>
  onChange: (account: {
    value: string
    account_error: boolean
  }) => void
}) => {
  const { t } = useTranslation();

  const [account, setAccount] = useState<{
    value: string
    account_error: boolean
  }>({
    value: "",
    account_error: false
  });

  useEffect(() => {
    onChange({ value: "", account_error: false });
  }, []);

  return (
    <div key={name} onClick={(e) => e.stopPropagation()}>
      <InputBox
        type="text"
        label={<RequireItem label={t(`finance:${field.label}`)} />}
        value={account.value}
        onChange={(e) => {
          const base = {
            value: e.target.value.trim(),
            account_error: e.target.value.trim() !== "" && !new RegExp(`^\\d{${field.min_length ?? 1},${field.max_length ?? 20}}$`).test(e.target.value.trim())
          };
          setAccount((old) => ({ ...old, ...base }));
          onChange(base);
        }}
        placeholder={`${t("finance:enter")} ${t(`finance:${field.label}`)}`}
      />
      <ErrorMessageBox
        sample
        show={account.value !== "" && account.account_error}
        content={`请输入${field.min_length === field.max_length ? field.max_length : `${field.min_length} - ${field.max_length}`}位数字`}
      />
    </div>
  );
};

function parser(payload: string) {
  if (!/^{.*}$/.test(payload)) return payload;
  const origin_payload = JSON.parse(payload);
  const output: any = {};
  for (const key in origin_payload) {
    if (origin_payload.hasOwnProperty(key)) {
      if (/^{.*}$/.test(origin_payload[key]))
        output[key] = parser(origin_payload[key]);
      else output[key] = origin_payload[key];
    }
  }
  return output;
}

function params(a: Record<string, any> | null, b: Record<string, any> | null) {
  let final_params = {};
  const parsed = parser(a?.params);
  for (const key in parsed) {
    if (parsed[key]?.hide || !parsed[key]?.required) continue;
    if (Object.prototype.hasOwnProperty.call(b, key)) {
      final_params = { ...final_params, [key]: b?.[key] };
    }
  }
  return final_params;
}
