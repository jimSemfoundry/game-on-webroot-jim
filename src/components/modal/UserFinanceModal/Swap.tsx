import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { SwapReceive } from "@/components/modal/UserFinanceModal/c/SwapReceive.tsx";
import { SwapSend } from "@/components/modal/UserFinanceModal/c/SwapSend.tsx";
import { WarningCard } from "@/components/modal/UserFinanceModal/c/WarningCard.tsx";
import { authService } from "@/services/authService.ts";
import { useBoundStore } from "@/store";
import { useToggle } from "ahooks";
import Decimal from "decimal.js";
import { ArrowDownUpIcon } from "lucide-react";
import { ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAvailableBalance } from "@/components/modal/UserFinanceModal/helper.ts";

export const Swap = () => {
  const { t } = useTranslation();

  const { swapFrom, swapTo, setSwapFrom } = useBoundStore();

  const [loading, { set }] = useToggle<boolean>(false);

  // 可用余额
  const {
    available,
    userBalanceLoading,
    userBalanceExtensionLoading,
    userBalanceRefetch,
    userBalanceExtensionRefetch
  } = useAvailableBalance(swapFrom.currency?.currency);

  // 创建订单
  const createOrder = useCallback(async () => {
    set(true);

    try {
      const data = await authService.createSwapOrder({
        to_currency: swapTo.currency?.currency,
        from_amount: swapFrom.inAmount,
        from_currency: swapFrom.currency?.currency
      });

      if (data?.code !== 0) return set(false);

      setSwapFrom({ inAmount: "" });

      // balance update
      void userBalanceRefetch();
      void userBalanceExtensionRefetch();

      toast.success(
        <div className="flex flex-col font-semibold">
          <span className="font-bold">{t("common.submissionSuccessful")}</span>
          <span className="">{t("toast:swapOrderCreatedSuccessfully")}</span>
        </div>
      );
    } catch (err: any) {
      toast.error(err.message);
      set(false);
    } finally {
      set(false);
    }
  }, [swapTo, swapFrom]);

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col">
        {/* You send */}
        <SwapSend available={available} loading={userBalanceLoading || userBalanceExtensionLoading} />

        <ExchangeIcon />

        {/* You receive */}
        <SwapReceive />
      </div>

      {/* 交易按钮状态 */}
      <MessageBox
        show={new Decimal(Number(swapFrom.inAmount)).gt(0) && new Decimal(available).gte(Number(swapFrom.inAmount))}>
        <ConfirmBox onClick={createOrder} loading={loading}>
          <p className="font-bold">{t("finance:swap")}</p>
        </ConfirmBox>
      </MessageBox>

      <MessageBox show={new Decimal(available).lt(Number(swapFrom.inAmount))}>
        <ConfirmBox disabled>
          <span className="text-base-content/50">{t("finance:insufficient_balance")}</span>
        </ConfirmBox>
      </MessageBox>

      <MessageBox show={new Decimal(Number(swapFrom.inAmount)).lte(0)}>
        <ConfirmBox disabled>
          <span className="text-base-content/50">{t("finance:enter_amount")}</span>
        </ConfirmBox>
      </MessageBox>

      <WarningCard>
        <p className="text-xs leading-4 flex-1">{t("finance:swap_terms_service")}</p>
      </WarningCard>
    </div>
  );
};

const MessageBox = ({ show, children }: { show: boolean; children: ReactNode }) => {
  return show ? children : null;
};

const ExchangeIcon = () => {
  return (
    <div className="relative my-1 flex justify-center items-center">
      <button className="absolute btn btn-sm btn-square bg-base-200 text-base-content/50">
        <ArrowDownUpIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
