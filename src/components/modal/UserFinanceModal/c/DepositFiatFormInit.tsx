import { Loading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useFiatGatewayDepositParams, useSupportedFiatDepositGateways } from "@/hooks/api/useAuth.ts";
import { useBoundStore } from "@/store";
import { PropsWithChildren, useEffect, useMemo } from "react";

export const DepositFiatFormInit = (props: PropsWithChildren) => {
  // from data store, share common data
  const { depositFiat, setDepositFiat } = useBoundStore();

  // 获取支持网关
  const { data: gateways, isLoading: l1 } = useSupportedFiatDepositGateways(depositFiat.currency?.currency);

  // 获取必填字段
  const {
    data: fields,
    isLoading: l2
  } = useFiatGatewayDepositParams(depositFiat.method?.gateway_id, depositFiat.method?.pay_bankcode);

  // 初始化表单项
  useEffect(() => {
    if (fields?.data) {
      const transform = fields.data;
      for (const key in transform) {
        const field = transform[key];
        if (field.hide || !field.required) continue;
        if (field.select && field.select.length > 0) {
          setDepositFiat({ formItem: { [key]: field.default || field.select[0].value } });
          continue;
        }
        setDepositFiat({ formItem: { [key]: field.default || "" } });
      }
    }
  }, [fields]);

  // 支付通道对应的表单项生成之后安全加载表单内容
  const memoFields = useMemo(() => {
    return depositFiat.formItem ? props?.children : <Loading className="h-52" />;
  }, [depositFiat.formItem, props?.children]);

  // 币种有支付通道才可以继续后续步骤
  const memoGateways = useMemo(() => {
    return gateways?.data?.length === 0 ? null : memoFields;
  }, [gateways, memoFields]);

  return <>{l1 || l2 ? <Loading className="h-52" /> : memoGateways}</>;
};
