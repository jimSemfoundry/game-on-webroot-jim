import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { WithdrawFiatAmount } from "@/components/modal/UserFinanceModal/c/WithdrawFiatAmount.tsx";
import { WithdrawFiatFormInit } from "@/components/modal/UserFinanceModal/c/WithdrawFiatFormInit.tsx";
import { useFiatGatewayWithdrawParams } from "@/hooks/api/useAuth.ts";
import { authService } from "@/services/authService.ts";
import { useBoundStore } from "@/store";
import { useToggle } from "ahooks";
import md5 from "md5";
import React, { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ErrorString } from "@/store/type.ts";
import { InnerFieldItem, InnerOptions } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { debug_target, open_debug, useAvailableBalance } from "@/components/modal/UserFinanceModal/helper.ts";
import { fn_withdraw_common_status } from "@/components/modal/UserFinanceModal/c/WithdrawCryptoAmount.tsx";
import { useRumSdkUserLog } from "@/utils/helper.ts";

export const WithdrawFiatFormV1 = () => {
  const { t } = useTranslation();

  const [loading, { set }] = useToggle<boolean>(false);

  const { rumCustomLog, rumException } = useRumSdkUserLog();

  // from data store, share common data
  const { withdrawFiat, setWithdrawFiat, syncAction, setSyncAction } = useBoundStore();

  // 用户的可提款数量
  const availableAndLocked = useAvailableBalance(withdrawFiat.currency?.currency);

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

      if (open_debug && debug_target === "WITHDRAW") {
        console.info("Withdraw Fiat V1 表单项");
        console.info(transform);
      }

      for (const key in transform) {
        const field = transform[key];

        if (field.hide || !field.required) continue;

        if (key === "amount") {
          amountNode = <WithdrawFiatAmount key="amount" field={field} formKey="amount" />;
          continue;
        }

        if (field.select && field.select.length > 0) {
          selectNode = (
            <InnerOptions
              key={key}
              name={key}
              field={field}
              onChange={(v) => {
                setWithdrawFiat({
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
            setWithdrawFiat({
              formItem: { [key]: v.value },
              [`${key}_error`]: v[`${key}_error`]
            });
          }} />);
      }
    }

    return nodes.concat(selectNode, amountNode);
  }, [fields]);

  // 创建订单
  const createOrder = useCallback(async () => {
    if (open_debug && debug_target === "WITHDRAW") {
      console.info("Withdraw Fiat Order Data V1");
      console.info({
        ...withdrawFiat.formItem,
        pin: syncAction?.data,
        currency: withdrawFiat.currency?.currency,
        gateway_id: withdrawFiat.method?.gateway_id
      });
      // return;
    }

    set(true);

    const params = {
      ...withdrawFiat.formItem,
      pin: md5(syncAction?.data),
      currency: withdrawFiat.currency?.currency,
      gateway_id: withdrawFiat.method?.gateway_id,
      pay_bankcode: withdrawFiat.method?.pay_bankcode
    }

    authService
      .createWithdrawFiatOrder(params)
      .then((res) => {
        fn_withdraw_common_status(() => setSyncAction("OPEN_WITHDRAW_ORDER_OK_MODAL"), res.code, t);
      })
      .catch((error) => {
        toast.error(t("toast:failedToCreateWithdrawalOrder"));
        set(false);

        // 异常推送
        rumException(error, params);
      })
      .finally(() => {
        set(false);
      });
  }, [t, syncAction, withdrawFiat]);

  // 表单字段是否有错误
  const filed_value_null = useMemo(() => {
    if (withdrawFiat.formItem) return Object.values(withdrawFiat.formItem).some((value) => !value);
  }, [withdrawFiat.formItem]);

  // 表单字段是否有额外的错误
  const filed_value_error = useMemo(() => {
    const keys = Object.keys(withdrawFiat);
    return keys.filter((k) => k.includes("_error")).some((j) => withdrawFiat[j as ErrorString]);
  }, [withdrawFiat]);

  // 事件通知
  useEffect(() => {
    if (syncAction.type === "SYNC_WITHDRAW_FIAT_CREATE") void createOrder();
  }, [syncAction]);

  useEffect(() => {
    if (open_debug && debug_target === "WITHDRAW") {
      console.info(filed_value_null);
      console.info(filed_value_error);
      console.info(withdrawFiat);
    }
  }, [filed_value_null, filed_value_error, withdrawFiat]);

  // 数据推送 - 延迟
  useEffect(() => {
    rumCustomLog("withdrawFiatV1", { ...withdrawFiat, available: availableAndLocked.available });
  }, [rumCustomLog, withdrawFiat]);

  return (
    <WithdrawFiatFormInit>
      {/* 表单 */}
      {formItem}

      <div>
        {/* 提交 */}
        <ConfirmBox
          loading={loading}
          disabled={filed_value_null || filed_value_error || withdrawFiat.method?.status === 0}
          onClick={() => {
            setSyncAction("OPEN_WITHDRAW_FIAT_PIN_MODAL");
          }}
        >
          {t("finance:continue")}
        </ConfirmBox>
      </div>
    </WithdrawFiatFormInit>
  );
};

