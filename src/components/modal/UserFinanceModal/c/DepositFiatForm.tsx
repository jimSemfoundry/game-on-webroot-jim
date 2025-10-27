import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { DepositFiatAmount } from "@/components/modal/UserFinanceModal/c/DepositFiatAmount.tsx";
import { DepositFiatFormInit } from "@/components/modal/UserFinanceModal/c/DepositFiatFormInit.tsx";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useFiatGatewayDepositParams } from "@/hooks/api/useAuth.ts";
import { authService } from "@/services/authService.ts";
import { useBoundStore } from "@/store";
import { useToggle } from "ahooks";
import React, { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Email, Field } from "@/components/modal/UserFinanceModal/c/DepositFiatFormField.tsx";
import { ErrorString } from "@/store/type.ts";
import { FormBox } from "@/components/modal/UserFinanceModal/c/FormBox.tsx";
import { RequireItem } from "@/components/modal/UserFinanceModal/c/RequireItem.tsx";

export const DepositFiatForm = () => {

  const { t } = useTranslation();

  const [loading, { set }] = useToggle<boolean>(false);

  // from data store, share common data
  const { depositFiat, setDepositFiat, syncAction, setSyncAction } = useBoundStore();

  // 网关必填字段
  const { data: fields } = useFiatGatewayDepositParams(depositFiat.method?.gateway_id, depositFiat.method?.pay_bankcode);

  // 表单生成
  const formItem = useMemo(() => {
    let amountNode: React.ReactNode = null;
    let selectNode: React.ReactNode = null;
    let nodes: React.ReactNode[] = [];
    if (fields?.data) {
      const transform = fields.data;
      for (const key in transform) {
        const field = transform[key];
        if (field.hide || !field.required) continue;
        if (key === "amount") {
          amountNode = <DepositFiatAmount key="amount" formKey="amount" />
          continue;
        }
        if (field.label === "email") {
          nodes.push(<Email />);
          continue;
        }
        if (Array.isArray(field.select) && field.select.length > 0) {
          const options = field.select.map((item: Record<string, any>) => ({
            id: item.value,
            value: item.value,
            label: item.key
          }));
          selectNode = (
            <FormBox key={key} label={<RequireItem label={t(`finance:${field.label}`)} />}>
              <SelectDropdown
                title={t(`finance:${field.label}`)}
                height="sm"
                options={options}
                value={depositFiat.formItem?.[key]}
                onChange={(v) => setDepositFiat({ formItem: { [key]: v } })}
                placeholder={`${t("finance:select")} ${t(`finance:${field.label}`)}`}
                buttonClassName="bg-base-300 border-0 hover:bg-base-300/60"
                showSearch
              />
            </FormBox>
          );
          continue;
        }
        nodes.push(<Field name={key} field={field} />);
      }
    }
    return nodes.concat(selectNode, amountNode);
  }, [fields]);

  // 创建订单
  const createOrder = useCallback(async () => {
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
    const keys = Object.keys(depositFiat)
    return keys.filter((k) => k.includes("_error")).find((j) => depositFiat[j as ErrorString]);
  }, [depositFiat]);

  // 事件通知
  useEffect(() => {
    if (syncAction.type === "SYNC_DEPOSIT_FIAT_CREATE") void createOrder();
  }, [syncAction]);

  return (
    <DepositFiatFormInit>
      {/* 表单 */}
      {formItem}

      {/* 提交 Fiat 存款 */}
      <ConfirmBox
        loading={loading}
        disabled={error1 || !!error2}
        onClick={() => {
          setSyncAction("OPEN_DEPOSIT_FIAT_VIEW_MODAL");
        }}
      >
        {t("finance:continue")}
      </ConfirmBox>
    </DepositFiatFormInit>
  );
};
