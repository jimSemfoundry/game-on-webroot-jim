import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { authService } from "@/services/authService.ts";
import { useBoundStore } from "@/store";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RequireItem } from "@/components/modal/UserFinanceModal/c/RequireItem.tsx";
import { WithdrawMethodSelectV2 } from "@/components/modal/UserFinanceModal/c/WithdrawMethodSelectV2.tsx";
import {
  debug_target,
  open_debug,
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
import { handleBindOrHideFormItemDefaultValue } from "@/components/modal/UserFinanceModal/c/DepositFiatFormInit.tsx";
import { FormBox, InnerFieldItem } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { emitter } from "@/store/emitter.ts";

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
  const { withdrawFiat, syncAction, setWithdrawFiatV2 } = useBoundStore();

  // 法币是否支持新版的提币操作
  const { data: gatewaysV2 } = useSupportedFiatWithdrawGatewaysV2(withdrawFiat.currency?.currency);

  // 法币提现用用户添加的快捷信息列表
  const { refetch } = useUserWithdrawFiatInfo(withdrawFiat.currency?.currency);

  // 附加的隐藏的必要的字段，不在表单出现
  useEffect(() => {
    if (!status.provider?.params) return;

    const transform = parser(status.provider?.params);
    for (const key in transform) {
      const field = transform[key];

      if (!field.required) continue;

      if (field.bind || field.hide) {
        const value = handleBindOrHideFormItemDefaultValue(field, status.provider);
        setStatus((old) => ({
          ...old,
          formItem: { ...old.formItem, [key]: value || "" }
        }));
      }
    }
  }, [status.provider?.params]);

  // 重置数据状态，避免脏数据
  useEffect(() => {
    if (status.provider?.id) {
      const next_status = { ...status, formItem: null };
      Object.keys(next_status).forEach((k) => {
        if (k.endsWith("_error")) Reflect.deleteProperty(next_status, k);
      });
      setStatus(next_status);
    }
  }, [status.provider?.id]);

  // 表单初始化
  const formItem = useMemo(() => {
    if (!status.provider) return;

    const transform = parser(status.provider?.params);

    if (open_debug && debug_target === "WITHDRAW") {
      console.info("Withdraw Fiat V2 表单项");
      console.info(transform);
    }

    let selectNode: React.ReactNode = null;
    let nodes: React.ReactNode[] = [];

    if (transform) {
      for (const key in transform) {
        const field = transform[key];

        if (field.hide || !field.required) continue;

        if (key === "amount") continue;

        if (field.select && field.select.length > 0) {
          selectNode = (<InnerOptions
            key={`${key}_${status.provider?.id}`} // key 的不同可以强制重新挂载新数据，方便数据状态重置
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

        nodes.push(<InnerFieldItem
          key={`${key}_${status.provider?.id}`} // key 的不同可以强制重新挂载新数据，方便数据状态重置
          name={key}
          field={field}
          onChange={(v) => {
            setStatus((old) => {
              return ({
                ...old,
                formItem: { ...old.formItem, [key]: v.value },
                [`${key}_error`]: v[`${key}_error`]
              })
            });
          }} />);
      }
    }

    return nodes.concat(selectNode);
  }, [status.provider]);

  // 表单字段是否有错误
  const filed_value_match = useMemo(() => {
    if (!status.formItem || !status.provider) return true;
    if (status.formItem && status.provider) return Object.values(params(status.provider, status.formItem)).some((value) => !value);
  }, [status.formItem, status.provider]);

  // 表单字段是否有额外的错误
  const filed_value_null = useMemo(() => {
    const keys = Object.keys(status);
    return keys.filter((k) => k.includes("_error")).some((j) => status[j as ErrorString]);
  }, [status]);

  // 添加提款快捷信息
  const submit = useCallback(() => {
    const final_params = params(status.provider, status.formItem);

    if (open_debug && debug_target === "WITHDRAW") {
      console.info("Withdraw Fiat Fast Data");
      console.info({
        ...final_params,
        currency: withdrawFiat.currency?.currency,
        channel_class: status.provider?.channel_class
      });
      console.info(status);
      // return;
    }

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
          setStatus((v) => ({ ...v, showModal: false }));
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
  }, [status, filed_value_match, filed_value_null]);

  // 事件通知
  useEffect(() => {
    if (syncAction.type === "OPEN_WITHDRAW_METHOD_ADD_MODAL") {
      setStatus((v) => ({ ...v, showModal: true }));
    }
  }, [syncAction]);

  // 设置默认通道
  useEffect(() => {
    if (status.showModal && Array.isArray(gatewaysV2?.data)) setStatus((old) => ({
      ...old,
      provider: gatewaysV2?.data?.[0]
    }));
  }, [gatewaysV2, status.showModal]);

  useEffect(() => {
    console.info("status", status);
    console.info("filed_value_null", filed_value_null);
    console.info("filed_value_match", filed_value_match);
  }, [filed_value_match, filed_value_null, status]);

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
      className="bg-base-400 md:max-w-[400px] shadow-lg hide-scrollbar h-[75vh] max-h-[75vh]"
    >
      <div className="flex flex-col gap-4">
        <FormBox label={t("finance:withdrawCurrency")}>
          <div className="flex items-center bg-base-300 h-10 rounded-lg px-4 gap-2">
            <img src={withdrawFiat.currency?.icon} alt="" className="h-6 w-6 rounded-full" />
            <span className="text-sm font-semibold">{withdrawFiat.currency?.currency}</span>
          </div>
        </FormBox>

        {/* 供应商选择 */}
        <WithdrawMethodSelectV2
          method={status.provider}
          setMethod={(v) => setStatus((old) => ({ ...old, ...v }))}
          title={t("finance:withdrawalMethod")}
          currency={withdrawFiat.currency?.currency}
        />

        {/* 表单 */}
        {formItem}

        <p className="text-base-content/50 font-semibold leading-4 text-xs">
          {t("finance:ensure_all_withdrawal")}
        </p>

        <ConfirmBox onClick={submit} loading={status.loading}>
          {t("finance:save")}
        </ConfirmBox>
      </div>
    </Modal>
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
    option: Record<string, any> | null,
    search: string,
  }>({
    search: "",
    option: null
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
              o.value === status.option?.value ? "bg-base-200" : ""
            )}
            onClick={() => {
              emitter.emit(name, o.value);
              setStatus((v) => ({ ...v, option: o, search: "" }));
              onChange({ [name]: o.value });
              set(false);
            }}
          >
            {o.label}
          </div>
        ))}
      </div>
    );
  }, [memoFilteredOptions, status.option]);

  useEffect(() => {
    onChange({ [name]: memoOptions[0].value });
    setStatus((old) => ({ ...old, option: memoOptions[0] }));
  }, [memoOptions]);

  return (
    <FormBox key={name} label={<RequireItem label={t(`finance:${field.label}`)} />}>
      <div
        className="flex items-center justify-between bg-base-300 h-10 rounded-lg px-4 cursor-pointer"
        onClick={() => {
          set(!show);
          !show && setStatus((o) => ({ ...o, search: "" }));
        }}>
        <span className="text-sm font-semibold truncate">{status.option?.label}</span>
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
                  style={{ marginTop: "env(safe-area-inset-top)" }}
                  className="px-4 py-4 bg-base-400 fixed w-full z-[1001] top-0 bottom-0 flex flex-col"
                >
                  <p className="flex items-center justify-center relative text-lg font-semibold h-10">
                    <button className={"absolute left-0 btn btn-md btn-square rounded-lg bg-base-300 border-0"}
                            onClick={() => set(false)}>
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    {t(`finance:${field.label}`)}
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

export function parser(payload: string) {
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

export default WithdrawMethodInfoAddModal;