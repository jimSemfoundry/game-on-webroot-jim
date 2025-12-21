import { Loading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useFiatGatewayWithdrawParams, useSupportedFiatDepositGateways } from "@/hooks/api/useAuth.ts";
import { useBoundStore } from "@/store";
import { PropsWithChildren, useCallback, useEffect, useMemo } from "react";
import { handleBindOrHideFormItemDefaultValue } from "@/components/modal/UserFinanceModal/c/DepositFiatFormInit.tsx";

export const WithdrawFiatFormInit = (props: PropsWithChildren) => {
  // from data store, share common data
  const { withdrawFiat, setWithdrawFiat, syncAction } = useBoundStore();

  // 获取支持网关
  const { data: gateways, isLoading: l1 } = useSupportedFiatDepositGateways(withdrawFiat.currency?.currency);

  // 获取必填字段
  const {
    data: fields,
    isLoading: l2
  } = useFiatGatewayWithdrawParams(withdrawFiat.method?.gateway_id, withdrawFiat.method?.pay_bankcode);

  // 支付通道对应的表单项生成之后安全加载表单内容
  const memoFields = useMemo(() => {
    return withdrawFiat.formItem ? props?.children : <Loading className="h-52" />;
  }, [withdrawFiat.formItem, props?.children]);

  // 币种有支付通道才可以继续后续步骤
  const memoGateways = useMemo(() => {
    return gateways?.data?.length === 0 ? null : memoFields;
  }, [gateways, memoFields]);

  // 初始化表单项
  const initFormFields = useCallback(() => {
    if (fields?.data) {
      const transform = fields.data;
      for (const key in transform) {
        const field = transform[key];

        if (field.bind || field.hide) {
          const value = handleBindOrHideFormItemDefaultValue(field, withdrawFiat.method);
          setWithdrawFiat({ formItem: { [key]: value || "" } });
          continue;
        }

        if (field.select && field.select.length > 0) {
          setWithdrawFiat({ formItem: { [key]: field.default || field.select[0].value } });
          continue;
        }

        setWithdrawFiat({ formItem: { [key]: field.default || "" } });
      }
    }
  }, [fields]);

  useEffect(() => {
    initFormFields();
  }, [initFormFields]);

  // 事件通知【CLOSE_FINANCE_MODAL- 关闭finance操作窗口】需要重置表单状态
  useEffect(() => {
    if (syncAction.type && ["CLOSE_FINANCE_MODAL", "OPEN_WITHDRAW_ORDER_OK_MODAL"].includes(syncAction.type)) initFormFields();
  }, [syncAction]);

  return <>{l1 || l2 ? <Loading className="h-52" /> : memoGateways}</>;
};
