import { useBoundStore } from "@/store";
import { useSupportedFiatWithdrawGatewaysV2 } from "@/components/modal/UserFinanceModal/helper.ts";
import { WithdrawFiatFormV1 } from "@/components/modal/UserFinanceModal/c/WithdrawFiatFormV1.tsx";
import { Loading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { WithdrawFiatFormV2 } from "@/components/modal/UserFinanceModal/c/WithdrawFiatFormV2.tsx";

export const WithdrawFiatForm = () => {
  // from data store, share common data
  const { withdrawFiat } = useBoundStore();

  // 法币是否支持新版的提币操作
  const { data: gatewaysV2, isLoading } = useSupportedFiatWithdrawGatewaysV2(withdrawFiat.currency?.currency);

  return (
    <>
      {isLoading
        ? <Loading className={'h-52'} />
        : (gatewaysV2?.data?.length > 0 && (gatewaysV2?.is_new === 0
          ? <WithdrawFiatFormV1 />
          : <WithdrawFiatFormV2 />))
      }
    </>
  );
};
