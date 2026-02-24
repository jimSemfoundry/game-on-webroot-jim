import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { DepositFiatAmount } from "@/components/modal/UserFinanceModal/c/DepositFiatAmount.tsx";
import {
  DepositFiatFormInit
} from "@/components/modal/UserFinanceModal/c/DepositFiatFormInit.tsx";
import { useFiatGatewayDepositParams } from "@/hooks/api/useAuth.ts";
import { authService } from "@/services/authService.ts";
import { useBoundStore } from "@/store";
import { useToggle } from "@/hooks/useToggle";
import React, { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ErrorString } from "@/store/type.ts";
import {
  InnerFieldItem,
  InnerOptions,
  InnerUnnecessary
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { debug_target, open_debug } from "@/components/modal/UserFinanceModal/helper.ts";
import { useRumSdkUserLog } from "@/utils/helper.ts";
import { isEmpty } from "@/utils/helper.ts";
import { emitter } from "@/store/emitter.ts";
import { openExternalUrl } from "@/utils/telegramWebApp";

export const DepositFiatForm = () => {

  const { t } = useTranslation();

  const [loading, { set }] = useToggle<boolean>(false);

  const { rumCustomLog, rumException } = useRumSdkUserLog();

  // from data store, share common data
  const { depositFiat, setDepositFiat, setSyncAction, openModal } = useBoundStore();

  // 网关必填字段
  const { data: fields } = useFiatGatewayDepositParams(depositFiat.method?.gateway_id, depositFiat.method?.pay_bankcode);

  // 客户端可见的表单生成
  const formItem = useMemo(() => {
    let amountNode: React.ReactNode = null;
    let selectNode: React.ReactNode[] = [];
    let nodes: React.ReactNode[] = [];
    if (fields?.data) {
      const transform = fields.data;

      if (open_debug && debug_target === "DEPOSIT") {
        console.info("Deposit Fiat 表单项");
        console.info(transform);
      }

      for (const key in transform) {
        const field = transform[key];

        if (field.hide) continue;

        if (!field.required && !field.hide && !field.select) {
          nodes.push(<InnerUnnecessary
            key={`${key}_${depositFiat.method?.gateway_id}`} // key 的不同可以强制重新挂载新数据，方便数据状态重置
            name={key}
            field={field}
            onChange={(v) => {
              setDepositFiat({
                extraItem: { [key]: v.value }
              });
            }} />);
          continue;
        }

        if (key === "amount") {
          amountNode = <DepositFiatAmount key="amount" multiple={field?.multiple} />;
          continue;
        }

        if (Array.isArray(field.select) && field.select.length > 0) {
          selectNode.push(
            <InnerOptions
              key={`${key}_${depositFiat.method?.gateway_id}`} // key 的不同可以强制重新挂载新数据，方便数据状态重置
              name={key}
              field={field}
              onChange={(v) => {
                if (field.required) { // 必选
                  setDepositFiat({
                    formItem: { [key]: v.value },
                    [`${key}_error`]: v[`${key}_error`]
                  });
                } else { // 非必选
                  setDepositFiat({
                    extraItem: { [key]: v.value }
                  });
                }
              }} />
          );
          continue;
        }

        nodes.push(<InnerFieldItem
          key={`${key}_${depositFiat.method?.gateway_id}`} // key 的不同可以强制重新挂载新数据，方便数据状态重置
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
  }, [fields, depositFiat.method?.gateway_id]);

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
        if (code === 0 || code === 200) {
          if (data.payment_url) {
            openExternalUrl(data.payment_url);
          } else {
            toast.error(t("toast:paymentUrlNotFound"));
          }
        } else if (code === 40021) {
          // 提款AML措施-错误提示
          openModal("OPEN_FINANCE_AML_MODAL");
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
    return isEmpty(depositFiat.formItem) || (!!depositFiat.formItem && Object.values(depositFiat.formItem).some((value) => !value));
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
    const em = emitter.addListener("SYNC_DEPOSIT_FIAT_CREATE", function () {
      void createOrder();
    });

    return () => em?.remove();
  }, [createOrder]);

  // debug console
  useEffect(() => {
    if (open_debug && debug_target === "DEPOSIT") {
      console.info(depositFiat);
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
