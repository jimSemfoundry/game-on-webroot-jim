import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { DepositFiatAmount } from "@/components/modal/UserFinanceModal/c/DepositFiatAmount.tsx";
import {
  DepositFiatFormInit,
  handleBindOrHideFormItemDefaultValue
} from "@/components/modal/UserFinanceModal/c/DepositFiatFormInit.tsx";
import { useFiatGatewayDepositParams } from "@/hooks/api/useAuth.ts";
import { authService } from "@/services/authService.ts";
import { useBoundStore } from "@/store";
import { useToggle } from "ahooks";
import React, { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ErrorString } from "@/store/type.ts";
import { InnerFieldItem, InnerOptions } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { debug_target, open_debug } from "@/components/modal/UserFinanceModal/helper.ts";
import { useRumSdkUserLog } from "@/utils/helper.ts";
import { isEmpty } from "lodash-es";

export const DepositFiatForm = () => {

  const { t } = useTranslation();

  const [loading, { set }] = useToggle<boolean>(false);

  const { rumCustomLog, rumException } = useRumSdkUserLog();

  // from data store, share common data
  const { depositFiat, setDepositFiat, syncAction, setSyncAction } = useBoundStore();

  // 网关必填字段
  const { data: fields } = useFiatGatewayDepositParams(depositFiat.method?.gateway_id, depositFiat.method?.pay_bankcode);

  // 附加的隐藏的必要的字段，不在表单出现
  useEffect(() => {
    if (!fields?.data) return;

    const transform = fields.data;
    for (const key in transform) {
      const field = transform[key];

      if (!field.required) continue;

      if (field.bind || field.hide) {
        const value = handleBindOrHideFormItemDefaultValue(field, depositFiat.method);
        setDepositFiat({ formItem: { [key]: value || "" } });
      }
    }
  }, [fields]);

  // 客户端可见的表单生成
  const formItem = useMemo(() => {
    let amountNode: React.ReactNode = null;
    let selectNode: React.ReactNode = null;
    let nodes: React.ReactNode[] = [];
    if (fields?.data) {
      const transform = fields.data;

      if (open_debug && debug_target === "DEPOSIT") {
        console.info("Deposit Fiat 表单项");
        console.info(transform);
      }

      for (const key in transform) {
        const field = transform[key];

        if (field.hide || !field.required) continue;

        if (key === "amount") {
          amountNode = <DepositFiatAmount key="amount" />;
          continue;
        }

        if (Array.isArray(field.select) && field.select.length > 0) {
          selectNode = (
            <InnerOptions
              key={key}
              name={key}
              field={field}
              onChange={(v) => {
                setDepositFiat({
                  formItem: v
                });
              }} />
          );
          continue;
        }

        nodes.push(<InnerFieldItem
          key={key}
          name={key}
          field={field}
          onChange={(v) => {
            setDepositFiat({
              formItem: { [key]: v.value },
              [`${key}_error`]: v[`${key}_error`]
            });
          }} />);
      }
    }

    // 控制表单的显示顺序
    return nodes.concat(selectNode, amountNode);
  }, [fields]);

  // 创建订单
  const createOrder = useCallback(async () => {
    if (open_debug && debug_target === "DEPOSIT") {
      console.info("Create Deposit Fiat Order Data");
      console.info({
        ...depositFiat.formItem,
        gateway_id: depositFiat.method?.gateway_id,
        return_url: location.origin,
        pay_bankcode: depositFiat.method?.pay_bankcode
      });
      // return;
    }

    set(true);

    const params = {
      ...depositFiat.formItem,
      gateway_id: depositFiat.method?.gateway_id,
      return_url: location.origin,
      pay_bankcode: depositFiat.method?.pay_bankcode
    };

    authService
      .createFiatDepositOrder(params)
      .then(({ code, data }) => {
        if (code === 0) {
          if (data.payment_url) {
            window.location.href = data.payment_url;
          } else {
            toast.error(t("toast:paymentUrlNotFound"));
          }
        } else {
          toast.error(t("toast:failedToCreateDepositOrder"));
        }
      })
      .catch((error) => {
        toast.error(t("toast:failedToCreateDepositOrder"));
        set(false);

        // 异常推送
        rumException(error, params);
      })
      .finally(() => {
        set(false);
      });
  }, [t, depositFiat]);

  // 表单字段是否有错误
  const filed_value_null = useMemo(() => {
    return isEmpty(depositFiat.formItem) || Object.values(depositFiat.formItem).some((value) => !value);
  }, [depositFiat.formItem]);

  // 表单字段是否有额外的错误
  const filed_value_error = useMemo(() => {
    const keys = Object.keys(depositFiat);
    return keys.filter((k) => k.includes("_error")).some((j) => depositFiat[j as ErrorString]);
  }, [depositFiat]);

  // 供应商不可用错误
  const provider_error = useMemo(() => {
    if (depositFiat.method) return depositFiat.method?.status === 0;
  }, [depositFiat.method]);

  // 事件通知
  useEffect(() => {
    if (syncAction.type === "SYNC_DEPOSIT_FIAT_CREATE") void createOrder();
  }, [syncAction]);

  // debug console
  useEffect(() => {
    if (open_debug && debug_target === "DEPOSIT") {
      console.info("************ depositFiat start ************");
      console.info(depositFiat);
      console.info("************ depositFiat ended ************");
    }
  }, [depositFiat]);

  // 数据推送 - 延迟
  useEffect(() => {
    rumCustomLog("depositFiat", depositFiat);
  }, [rumCustomLog, depositFiat]);

  return (
    <DepositFiatFormInit>
      {/* 表单 */}
      {formItem}

      <div>
        {/* 提交 Fiat 存款 */}
        <ConfirmBox
          loading={loading}
          disabled={filed_value_null || filed_value_error || provider_error}
          onClick={() => {
            setSyncAction("OPEN_DEPOSIT_FIAT_VIEW_MODAL");
          }}
        >
          {t("finance:continue")}
        </ConfirmBox>
      </div>
    </DepositFiatFormInit>
  );
};
