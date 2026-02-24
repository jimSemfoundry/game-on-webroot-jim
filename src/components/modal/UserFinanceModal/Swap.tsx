import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { SwapReceive } from "@/components/modal/UserFinanceModal/c/SwapReceive.tsx";
import { SwapSend } from "@/components/modal/UserFinanceModal/c/SwapSend.tsx";
import { WarningCard } from "@/components/modal/UserFinanceModal/c/WarningCard.tsx";
import { authService } from "@/services/authService.ts";
import { useBoundStore } from "@/store";
import { useToggle } from "@/hooks/useToggle";
import Decimal from "decimal.js";
import { ArrowDownUpIcon } from "lucide-react";
import { ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  open_debug,
  useAvailableBalance,
  useSwapCurrencySelectedFirstTime
} from "@/components/modal/UserFinanceModal/helper.ts";

export const Swap = ({ open }: { open: boolean }) => {
  // initial default selected option
  useSwapCurrencySelectedFirstTime();

  const { t } = useTranslation();

  const { swapFrom, swapTo, setSwapFrom } = useBoundStore();

  const [loading, { set }] = useToggle<boolean>(false);

  // 可用余额
  const {
    available= '0',
    userBalanceLoading,
    userBalanceExtensionLoading,
    userBalanceRefetch,
    userBalanceExtensionRefetch
  } = useAvailableBalance(swapFrom.currency?.currency);

  // 创建订单
  const createOrder = useCallback(async () => {
    if (open_debug) {
      console.info("Swap Order Data");
      console.info({
        to_currency: swapTo.currency?.currency,
        from_amount: swapFrom.inAmount,
        from_currency: swapFrom.currency?.currency
      });
      return;
    }

    set(true);

    try {
      const data = await authService.createSwapOrder({
        to_currency: swapTo.currency?.currency,
        from_amount: swapFrom.inAmount,
        from_currency: swapFrom.currency?.currency
      });

      if (data?.code !== 0) {
        toast.error(t("toast:failedToCreateSwapOrder"));
        set(false);
        return;
      }

      setSwapFrom({ inAmount: "" });

      // balance update
      void userBalanceRefetch();
      void userBalanceExtensionRefetch();

      toast.success(
        <div className="flex flex-col font-semibold">
          <span className="font-bold">{t("common:common.submissionSuccessful")}</span>
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
        <SwapSend open={open} available={available} loading={userBalanceLoading || userBalanceExtensionLoading} />

        <ExchangeIcon />

        {/* You receive */}
        <SwapReceive />
      </div>

      {/* 交易按钮状态 - 可交易 */}
      <MessageBox
        show={new Decimal(swapFrom.inAmount || 0).gt(0) && new Decimal(available).gte(Number(swapFrom.inAmount || 0))}>
        <ConfirmBox onClick={createOrder} loading={loading}>
          <p className="font-bold">{t("finance:swap")}</p>
        </ConfirmBox>
      </MessageBox>

      {/* 交易按钮状态 - 余额不足 */}
      <MessageBox show={new Decimal(available).lt(swapFrom.inAmount || 0)}>
        <ConfirmBox disabled>
          <span className="text-base-content/50">{t("finance:insufficient_balance")}</span>
        </ConfirmBox>
      </MessageBox>

      {/* 交易按钮状态 - 未输入 */}
      <MessageBox show={new Decimal(swapFrom.inAmount || 0).lte(0)}>
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
