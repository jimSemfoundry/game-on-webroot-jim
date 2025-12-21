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
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ErrorString } from "@/store/type.ts";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import Decimal from "decimal.js";
import { InnerFieldItem, InnerOptions } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { open_debug } from "@/components/modal/UserFinanceModal/helper.ts";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";

export const DepositFiatForm = () => {

  const { t } = useTranslation();

  const [loading, { set }] = useToggle<boolean>(false);

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

      if (open_debug) {
        console.info("Deposit Fiat 表单项");
        console.info(transform);
      }

      for (const key in transform) {
        const field = transform[key];

        if (field.hide || !field.required) continue;

        if (key === "amount") {
          amountNode = <DepositFiatAmount key="amount" formKey="amount" />;
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
    if (open_debug) {
      console.info("Deposit Fiat Order Data");
      console.info({
        ...depositFiat.formItem,
        gateway_id: depositFiat.method?.gateway_id,
        return_url: location.origin,
        pay_bankcode: depositFiat.method?.pay_bankcode
      });
      return;
    }

    set(true);
    authService
      .createFiatDepositOrder({
        ...depositFiat.formItem,
        gateway_id: depositFiat.method?.gateway_id,
        return_url: location.origin,
        pay_bankcode: depositFiat.method?.pay_bankcode
      })
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
      .catch(() => {
        toast.error(t("toast:failedToCreateDepositOrder"));
        set(false);
      })
      .finally(() => {
        set(false);
      });
  }, [t, depositFiat]);

  // 表单字段是否有错误
  const error1 = useMemo(() => {
    if (depositFiat.formItem) return Object.values(depositFiat.formItem).some((value) => !value);
  }, [depositFiat.formItem]);

  // 表单字段是否有额外的错误
  const error2 = useMemo(() => {
    const keys = Object.keys(depositFiat);
    return keys.filter((k) => k.includes("_error")).find((j) => depositFiat[j as ErrorString]);
  }, [depositFiat]);

  // 供应商不可用错误1
  const error3 = useMemo(() => {
    if (depositFiat.method) return Decimal(depositFiat.formItem?.amount || 0).gt(0) && depositFiat.method?.status === 0;
  }, [depositFiat.formItem, depositFiat.method]);

  // 供应商不可用错误2
  const error4 = useMemo(() => {
    if (depositFiat.method) return Decimal(depositFiat.formItem?.amount || 0).gt(0) && !depositFiat.method?.active;
  }, [depositFiat.formItem, depositFiat.method]);

  // 事件通知
  useEffect(() => {
    if (syncAction.type === "SYNC_DEPOSIT_FIAT_CREATE") void createOrder();
  }, [syncAction]);

  useEffect(() => {
    if (open_debug) {
      console.info(error1);
      console.info(error2);
      console.info(error3);
      console.info(error4);
      console.info(depositFiat);
    }
  }, [error1, error2, error3, error4, depositFiat]);

  return (
    <DepositFiatFormInit>
      {/* 表单 */}
      {formItem}

      <InnerDisplayContent show={Boolean(error3) || Boolean(error4)}>
        <div className="bg-base-300 rounded-lg p-2">
          <ErrorMessageBox
            sample
            content={<Trans
              i18nKey={"finance:channel_under_maintenance"}
              values={{ channel: depositFiat.method?.display_name }}
              components={[<span className="underline font-bold" />]} />}
            show={Boolean(error3) && !Boolean(error4)} />

          <ErrorMessageBox
            sample
            content={<Trans
              i18nKey={"finance:channel_not_activated"}
              values={{ channel: depositFiat.method?.display_name }}
              components={[<span className="underline font-bold" />]} />}
            show={Boolean(error4)} />
        </div>
      </InnerDisplayContent>

      <div>
        {/* 提交 Fiat 存款 */}
        <ConfirmBox
          loading={loading}
          disabled={error1 || !!error2 || error3 || error4}
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
