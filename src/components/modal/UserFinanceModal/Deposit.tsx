import { DepositCrypto } from "@/components/modal/UserFinanceModal/c/DepositCrypto.tsx";
import { DepositFiat } from "@/components/modal/UserFinanceModal/c/DepositFiat.tsx";
import { DepositType } from "@/components/modal/UserFinanceModal/c/DepositType.tsx";
import { DisplayContent } from "@/components/modal/UserFinanceModal/index.tsx";
import { UserLatestDeposit } from "@/components/modal/UserFinanceModal/c/UserLatestDeposit.tsx";
import { useBoundStore } from "@/store";

export const Deposit = () => {
  const { depositType } = useBoundStore();

  return (
    <UserLatestDeposit>
      <DepositType />
      <DisplayContent status={depositType === "crypto"}>
        <DepositCrypto />
      </DisplayContent>
      <DisplayContent status={depositType === "fiat"}>
        <DepositFiat />
      </DisplayContent>
    </UserLatestDeposit>
  );
};
