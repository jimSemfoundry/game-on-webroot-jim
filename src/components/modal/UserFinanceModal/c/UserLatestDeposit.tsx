import { useUserLatestDeposit } from "@/components/modal/UserFinanceModal/helper.ts";
import { useBoundStore } from "@/store";
import getSymbolFromCurrency from "currency-symbol-map";
import { PropsWithChildren, useEffect } from "react";

export const UserLatestDeposit = (props: PropsWithChildren) => {
  const { setDepositType } = useBoundStore();

  // 用户最新一次存款的记录
  const { data } = useUserLatestDeposit();

  // 根据用户最新一次存款的记录设置tab项
  useEffect(() => {
    const v = data?.data?.[0];
    if (v) setDepositType(getSymbolFromCurrency(v?.currency) ? "fiat" : "crypto");
  }, [data]);

  return <>{props.children}</>;
};
