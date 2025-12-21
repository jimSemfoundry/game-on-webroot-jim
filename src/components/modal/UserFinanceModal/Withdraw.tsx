import { WithdrawCrypto } from "@/components/modal/UserFinanceModal/c/WithdrawCrypto.tsx";
import { WithdrawFiat } from "@/components/modal/UserFinanceModal/c/WithdrawFiat.tsx";
import { WithdrawType } from "@/components/modal/UserFinanceModal/c/WithdrawType.tsx";
import { useBoundStore } from "@/store";
import { useWithdrawSelectedFirstTime } from "@/components/modal/UserFinanceModal/helper.ts";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

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
