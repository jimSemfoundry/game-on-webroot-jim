import { DepositCrypto } from "@/components/modal/UserFinanceModal/c/DepositCrypto.tsx";
import { DepositFiat } from "@/components/modal/UserFinanceModal/c/DepositFiat.tsx";
import { DepositType } from "@/components/modal/UserFinanceModal/c/DepositType.tsx";
import { useBoundStore } from "@/store";
import {
  useDepositCryptoCurrencySelectedFirstTime,
  useDepositFiatCurrencySelectedFirstTime,
  useDepositTokenTypesSelectedFirstTime
} from "@/components/modal/UserFinanceModal/helper.ts";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { useGetPromoByPage } from "@/query/promo.tsx";
import { useFinanceModal } from "@/contexts/ModalsProvider";
import { useEffect } from "react";

export const Deposit = () => {
  // initial default selected option
  useDepositTokenTypesSelectedFirstTime();
  useDepositFiatCurrencySelectedFirstTime();
  useDepositCryptoCurrencySelectedFirstTime()

  const { depositType } = useBoundStore();

  const { refetch } = useGetPromoByPage();
  const { isUserFinanceOpen } = useFinanceModal();

  useEffect(() => {
    if (isUserFinanceOpen) {
      refetch();
    }
  }, [isUserFinanceOpen]);

  return (
    <>
      <DepositType />

      <DisplayContent status={depositType === "crypto"}>
        <DepositCrypto />
      </DisplayContent>

      <DisplayContent status={depositType === "fiat"}>
        <DepositFiat />
      </DisplayContent>
    </>
  );
};
