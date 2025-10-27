import { useUserLatestWithdraw } from "@/components/modal/UserFinanceModal/helper.ts";
import { useBoundStore } from "@/store";
import { PropsWithChildren, useEffect } from "react";
import getSymbolFromCurrency from "currency-symbol-map";

export const UserLatestWithdraw = (props: PropsWithChildren) => {
  const { setWithdrawType } = useBoundStore();

  // 用户最新一次取款的记录
  const { data } = useUserLatestWithdraw();

  // 根据用户最新一次取款的记录设置tab项
  useEffect(() => {
    const v = data?.data?.[0];
    if (v) setWithdrawType(getSymbolFromCurrency(v?.currency) ? "fiat" : "crypto");
  }, [data]);


  return <>{props.children}</>;
};
