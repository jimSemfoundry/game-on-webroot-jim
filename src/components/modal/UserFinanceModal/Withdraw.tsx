import { WithdrawType } from "@/components/modal/UserFinanceModal/c/WithdrawType.tsx";
import { useBoundStore } from "@/store";
import { useWithdrawSelectedFirstTime } from "@/components/modal/UserFinanceModal/helper.ts";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { lazy } from "react";

// 懒加载部分Tab组件
const WithdrawFiat = lazy(() => import("./c/WithdrawFiat").then(module => ({ default: module.WithdrawFiat })));
const WithdrawCrypto = lazy(() => import("./c/WithdrawCrypto").then(module => ({ default: module.WithdrawCrypto })));

export const Withdraw = () => {
  // initial default selected option
  useWithdrawSelectedFirstTime();

  const { withdrawType } = useBoundStore();

  return (
    <>
      <WithdrawType />

      <DisplayContent status={withdrawType === "crypto"}>
        <WithdrawCrypto />
      </DisplayContent>

      <DisplayContent status={withdrawType === "fiat"}>
        <WithdrawFiat />
      </DisplayContent>
    </>
  );
};
