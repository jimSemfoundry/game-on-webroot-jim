import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { WithdrawFiatAmount } from "@/components/modal/UserFinanceModal/c/WithdrawFiatAmount.tsx";
import { WithdrawFiatFormInit } from "@/components/modal/UserFinanceModal/c/WithdrawFiatFormInit.tsx";
import { useFiatGatewayWithdrawParams } from "@/hooks/api/useAuth.ts";
import { authService } from "@/services/authService.ts";
import { useBoundStore } from "@/store";
import { useToggle } from "@/hooks/useToggle";
import React, { useCallback, useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ErrorString } from "@/store/type.ts";
import {
  InnerFieldItem,
  InnerOptions,
  InnerUnnecessary
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { debug_target, open_debug } from "@/components/modal/UserFinanceModal/helper.ts";
import { fn_withdraw_common_status } from "@/components/modal/UserFinanceModal/c/WithdrawCryptoAmount.tsx";
import { useRumSdkUserLog } from "@/utils/helper.ts";
import { isEmpty } from "@/utils/helper.ts";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";

export const WithdrawFiatFormV1 = () => {
  const { t } = useTranslation();

  const [loading, { set }] = useToggle<boolean>(false);

  const { rumCustomLog, rumException, rumResource } = useRumSdkUserLog();

  // from data store, share common data
  const { withdrawFiat, setWithdrawFiat, setSyncAction, openModal } = useBoundStore();

  // 获取取款网关必填字段
  const {
    data: fields
    // isLoading
  } = useFiatGatewayWithdrawParams(withdrawFiat.method?.gateway_id, withdrawFiat.method?.pay_bankcode);

  const formItem = useMemo(() => {
    let amountNode: React.ReactNode = null;
    let selectNode: React.ReactNode[] = [];
    let nodes: React.ReactNode[] = [];
    if (fields?.data) {
      const transform = fields.data;

      if (open_debug && debug_target === "WITHDRAW") {
        console.info(`WithdrawFiatFormV1:`);
        console.info(transform);
      }

      for (const key in transform) {
        const field = transform[key];

        if (field.hide) continue;

        if (!field.required && !field.hide && !field.select) {
          nodes.push(<InnerUnnecessary
            key={`${key}_${withdrawFiat.method?.gateway_id}`} // key 的不同可以强制重新挂载新数据，方便数据状态重置
            name={key}
            field={field}
            onChange={(v) => {
              setWithdrawFiat({
                extraItem: { [key]: v.value }
              });
            }} />);
          continue;
        }

        if (key === "amount") {
          amountNode = <WithdrawFiatAmount key="amount" formKey="amount" />;
          continue;
        }

        if (Array.isArray(field.select) && field.select.length > 0) {
          selectNode.push(
            <InnerOptions
              key={`${key}_${withdrawFiat.method?.gateway_id}`}
              name={key}
              field={field}
              onChange={(v) => {
                if (field.required) { // 必选
                  setWithdrawFiat({
                    formItem: { [key]: v.value },
                    [`${key}_error`]: v[`${key}_error`]
                  });
                } else { // 非必选
                  setWithdrawFiat({
                    extraItem: { [key]: v.value }
                  });
                }
              }} />
          );
          continue;
        }

        nodes.push(<InnerFieldItem
          key={`${key}_${withdrawFiat.method?.gateway_id}`}
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
  }, [fields?.data, withdrawFiat.method?.gateway_id]);

  // 创建订单
  const createOrder = useCallback(async () => {
    set(true);
    setSyncAction(undefined);

    const params = {
      ...withdrawFiat.formItem,
      // pin: md5(syncAction?.data),
      currency: withdrawFiat.currency?.currency,
      gateway_id: withdrawFiat.method?.gateway_id,
      pay_bankcode: withdrawFiat.method?.pay_bankcode
    };

    let url = "";
    let name = "";

    authService
      .createWithdrawFiatOrder(params)
      .then((res) => {
        url = res?._request_url || "";
        name = res?._request_name || "";

        fn_withdraw_common_status(() => {

          // 提款订单提交成功
          if (res.code === 0 || res.code === 200) {
            setSyncAction("OPEN_WITHDRAW_ORDER_OK_MODAL");

            // TODO rum 下单成功推送
            rumCustomLog(`Withdraw ${withdrawFiat.currency?.currency} ✅`, { url });
          }

          // 提款AML措施-错误提示
          if (res.code === 40021) {
            openModal("OPEN_FINANCE_AML_MODAL");
          }
        }, res.code, t);
      })
      .catch((error) => {
        toast.error(t("toast:failedToCreateWithdrawalOrder"));
        set(false);

        // 异常推送
        rumException(`Withdraw ${withdrawFiat.currency?.currency} ❌`, error);
      })
      .finally(() => {
        set(false);

        // TODO rum 资源访问推送
        rumResource({
          url,
          name,
          event: `Withdraw ${withdrawFiat.currency?.currency}`
        });
      });
  }, [t, withdrawFiat]);

  // 表单字段是否有错误
  const filed_value_null = useMemo(() => {
    return isEmpty(withdrawFiat.formItem) || (!!withdrawFiat.formItem && Object.values(withdrawFiat.formItem).some((value) => !value));
  }, [withdrawFiat.formItem]);

  // 表单字段是否有额外的错误
  const filed_value_error = useMemo(() => {
    const keys = Object.keys(withdrawFiat);
    return keys.filter((k) => k.includes("_error")).some((j) => withdrawFiat[j as ErrorString]);
  }, [withdrawFiat]);

  // 供应商不可用
  const provider_error = useMemo(() => {
    if (withdrawFiat.method) return withdrawFiat.method?.status === 0;
    return true;
  }, [withdrawFiat.method]);

  // 事件通知
  // useEffect(() => {
  //   if (syncAction.type === "SYNC_WITHDRAW_FIAT_CREATE") void createOrder();
  // }, [syncAction]);

  return (
    <WithdrawFiatFormInit>
      {/* 通道在维护 */}
      <InnerDisplayContent show={Boolean(provider_error)}>
        <div className="bg-base-300 rounded-lg p-2">
          <ErrorMessageBox
            className={"!mt-0 static"}
            content={<Trans
              i18nKey={"finance:withdraw_channel_under_maintenance"}
              values={{ channel: withdrawFiat.method?.display_name }}
              components={[<span className="underline font-bold" />]} />}
            show={Boolean(provider_error)} />
        </div>
      </InnerDisplayContent>

      {/* 表单 */}
      {formItem}

      <div>
        {/* 提交 */}
        <ConfirmBox
          loading={loading}
          disabled={filed_value_null || filed_value_error || provider_error}
          onClick={() => {
            void createOrder();
            // setSyncAction("OPEN_WITHDRAW_FIAT_PIN_MODAL");
          }}
        >
          {t("finance:continue")}
        </ConfirmBox>
      </div>
    </WithdrawFiatFormInit>
  );
};