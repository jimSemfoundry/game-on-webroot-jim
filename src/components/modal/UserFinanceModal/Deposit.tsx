import { DepositType } from "@/components/modal/UserFinanceModal/c/DepositType.tsx";
import { useBoundStore } from "@/store";
import {
  useDepositCryptoCurrencySelectedFirstTime,
  useDepositFiatCurrencySelectedFirstTime
} from "@/components/modal/UserFinanceModal/helper.ts";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { DepositPromotion } from "@/components/modal/UserFinanceModal/c/DepositPromotion.tsx";
import { lazy } from "react";

// 懒加载部分Tab组件
const DepositFiat = lazy(() => import("./c/DepositFiat").then(module => ({ default: module.DepositFiat })));
const DepositCrypto = lazy(() => import("./c/DepositCrypto").then(module => ({ default: module.DepositCrypto })));

export const Deposit = () => {
  // initial default selected option
  useDepositFiatCurrencySelectedFirstTime();
  useDepositCryptoCurrencySelectedFirstTime();

  const { depositType } = useBoundStore();

  return (
    <DepositPromotion>
      <DepositType />

      <DisplayContent status={depositType === "crypto"}>
        <DepositCrypto />
      </DisplayContent>

      <DisplayContent status={depositType === "fiat"}>
        <DepositFiat />
      </DisplayContent>
    </DepositPromotion>
  );
};
