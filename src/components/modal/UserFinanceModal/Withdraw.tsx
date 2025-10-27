import { DisplayContent } from "@/components/modal/UserFinanceModal/index.tsx";
import { UserLatestWithdraw } from "@/components/modal/UserFinanceModal/c/UserLatestWithdraw.tsx";
import { WithdrawCrypto } from "@/components/modal/UserFinanceModal/c/WithdrawCrypto.tsx";
import { WithdrawFiat } from "@/components/modal/UserFinanceModal/c/WithdrawFiat.tsx";
import { WithdrawType } from "@/components/modal/UserFinanceModal/c/WithdrawType.tsx";
import { useBoundStore } from "@/store";

export const Withdraw = () => {
  const { withdrawType } = useBoundStore();

  return (
    <UserLatestWithdraw>
      <WithdrawType />
      <DisplayContent status={withdrawType === "crypto"}>
        <WithdrawCrypto />
      </DisplayContent>
      <DisplayContent status={withdrawType === "fiat"}>
        <WithdrawFiat />
      </DisplayContent>
    </UserLatestWithdraw>
  );
};
