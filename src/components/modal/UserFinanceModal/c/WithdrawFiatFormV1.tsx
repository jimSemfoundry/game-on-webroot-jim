import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { WithdrawFiatAmount } from "@/components/modal/UserFinanceModal/c/WithdrawFiatAmount.tsx";
import { WithdrawFiatFormInit } from "@/components/modal/UserFinanceModal/c/WithdrawFiatFormInit.tsx";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useFiatGatewayWithdrawParams } from "@/hooks/api/useAuth.ts";
import { authService } from "@/services/authService.ts";
import { useBoundStore } from "@/store";
import { useToggle } from "ahooks";
import md5 from "md5";
import React, { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Email, Field } from "@/components/modal/UserFinanceModal/c/WithdrawFiatFormField.tsx";
import { RequireItem } from "@/components/modal/UserFinanceModal/c/RequireItem.tsx";
import { ErrorString } from "@/store/type.ts";
import { FormBox } from "@/components/modal/UserFinanceModal/c/FormBox.tsx";

export const WithdrawFiatFormV1 = () => {
  const { t } = useTranslation();

  const [loading, { set }] = useToggle<boolean>(false);

  // from data store, share common data
  const { withdrawFiat, setWithdrawFiat, syncAction, setSyncAction } = useBoundStore();

  // 获取取款网关必填字段
  const {
    data: fields
    // isLoading
  } = useFiatGatewayWithdrawParams(withdrawFiat.method?.gateway_id, withdrawFiat.method?.pay_bankcode);

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
          amountNode = <WithdrawFiatAmount key="amount" formKey="amount" />;
          continue;
        }
        if (field.label === "email") {
          nodes.push(<Email />);
          continue;
        }
        if (field.select && field.select.length > 0) {
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
                value={withdrawFiat.formItem?.[key]}
                onChange={(v) => setWithdrawFiat({ formItem: { [key]: v } })}
                placeholder={`${t("finance:select")} ${t(`finance:${field.label}`)}`}
                buttonClassName="bg-base-300 border-0 hover:bg-base-300/60"
                showSearch
              />
            </FormBox>
          );
          continue;
        }
        nodes.push(<Field key={key} name={key} field={field} />);
      }
    }
    return nodes.concat(selectNode, amountNode);
  }, [fields, withdrawFiat.formItem]);

  // 创建订单
  const createOrder = useCallback(async () => {
    set(true);
    authService
      .createWithdrawFiatOrder({
        ...withdrawFiat.formItem,
        pin: md5(syncAction?.data),
        currency: withdrawFiat.currency?.currency,
        gateway_id: withdrawFiat.method?.gateway_id
      })
      .then((res) => {
        if (res.code === 0) {
          setSyncAction("OPEN_WITHDRAW_ORDER_OK_MODAL");
        } else if (res.code === 4) {
          toast.error(t("toast:pinError"));
        } else {
          toast.error(t("toast:failedToSubmitWithdrawalRequest"));
        }
      })
      .catch(() => {
        toast.error(t("toast:failedToSubmitWithdrawalRequest"));
        set(false);
      })
      .finally(() => {
        set(false);
      });
  }, [t, syncAction, withdrawFiat]);

  // 表单字段是否有错误
  const error1 = useMemo(() => {
    if (withdrawFiat.formItem) return Object.values(withdrawFiat.formItem).some((value) => !value);
  }, [withdrawFiat.formItem]);

  // 表单字段是否有额外的错误
  const error2 = useMemo(() => {
    const keys = Object.keys(withdrawFiat)
    return keys.filter((k) => k.includes("_error")).find((j) => withdrawFiat[j as ErrorString]);
  }, [withdrawFiat]);

  // 事件通知
  useEffect(() => {
    if (syncAction.type === "SYNC_WITHDRAW_FIAT_CREATE") void createOrder();
  }, [syncAction]);

  // useEffect(() => {
  //   console.info("法币提款信息V1");
  //   console.info(withdrawFiat);
  // }, [withdrawFiat]);

  return (
    <WithdrawFiatFormInit>
      {/* 表单 */}
      {formItem}

      {/* 提交 */}
      <ConfirmBox
        loading={loading}
        disabled={error1 || !!error2 || withdrawFiat.method?.status === 0}
        onClick={() => {
          setSyncAction("OPEN_WITHDRAW_FIAT_PIN_MODAL");
        }}
      >
        {t("finance:continue")}
      </ConfirmBox>
    </WithdrawFiatFormInit>
  );
};
