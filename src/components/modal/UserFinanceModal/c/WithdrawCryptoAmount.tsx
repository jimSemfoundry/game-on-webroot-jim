import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import {
  perRangeOptions,
  useAvailableBalance,
  useSupportedCryptoWithdrawGatewaysFilter,
} from "@/components/modal/UserFinanceModal/helper.ts";
import { DisplayContent } from "@/components/modal/UserFinanceModal";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { MotionContentBox } from "@/components/modal/UserFinanceModal/c/MotionContentBox.tsx";
import { NumericFormat } from "@/components/modal/UserFinanceModal/c/NumericFormat.tsx";
import { WithdrawRangeOptions } from "@/components/modal/UserFinanceModal/c/WithdrawRangeOptions.tsx";
import { authService } from "@/services/authService.ts";
import { useBoundStore } from "@/store";
import { useToggle } from "ahooks";
import Decimal from "decimal.js";
import { BadgeAlert } from "lucide-react";
import md5 from "md5";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FormatAmount } from "sunmoon-working-components";
import { InputBox } from "@/components/modal/UserFinanceModal/c/InputBox.tsx";

interface OptionProps {
  label: string;
  value: string;
}

export const WithdrawCryptoAmount = () => {
  const { t } = useTranslation();

  const [option, selected] = useState<OptionProps | null>(null);

  const [loading, { set }] = useToggle<boolean>(false);

  // from data store, share common data
  const { withdrawCrypto, setWithdrawCrypto, syncAction, setSyncAction } = useBoundStore();

  // 获取支持代币取款的网关
  const [isGatewaysLoading] = useSupportedCryptoWithdrawGatewaysFilter(withdrawCrypto.currency?.currency);

  // 用户的可提款数量
  const availableAndLocked = useAvailableBalance(withdrawCrypto.currency?.currency);

  // 提款范围错误提示
  const rangeError = useMemo(() => {
    return (
      (withdrawCrypto.inputAmount !== "" && Decimal(Number(withdrawCrypto.inputAmount)).lt(withdrawCrypto.network?.min ?? 0)) ||
      Decimal(Number(withdrawCrypto.inputAmount)).gt(withdrawCrypto.network?.max ?? 0)
    );
  }, [withdrawCrypto.inputAmount, withdrawCrypto.network]);

  // 输入的提款数量大于余额
  const insufficient = useMemo(() => {
    return withdrawCrypto.inputAmount !== "" && Decimal(Number(withdrawCrypto.inputAmount)).gt(availableAndLocked.available);
  }, [withdrawCrypto.inputAmount]);

  // 小于最小提款数量限制错误
  const lessThanMinimum = useMemo(() => {
    return Decimal(availableAndLocked.available).lt(withdrawCrypto.network?.min ?? 0);
  }, [withdrawCrypto.network, availableAndLocked]);

  const calcWithdrawAmount = useCallback(
    (option: Record<string, any>) => {
      const min = withdrawCrypto.network?.min ?? 0;
      const max = withdrawCrypto.network?.max ?? 0;
      const balance = Decimal(availableAndLocked.available);
      switch (option?.value) {
        case "min":
          setWithdrawCrypto({ inputAmount: balance.lt(min) ? 0 : min });
          break;
        case "25%":
          const de_25 = Decimal(balance).mul(0.25);
          setWithdrawCrypto({ inputAmount: de_25.gt(max) ? max : de_25.toString() });
          break;
        case "50%":
          const de_50 = Decimal(balance).mul(0.5);
          setWithdrawCrypto({ inputAmount: de_50.gt(max) ? max : de_50.toString() });
          break;
        case "max":
          setWithdrawCrypto({ inputAmount: Decimal.min(balance, max).toString() });
          break;
      }
    },
    [availableAndLocked.available, withdrawCrypto.network],
  );

  // 根据输入的值判断快捷选项激活
  const calcWithdrawOption = useCallback(
    (amount: string) => {
      const d_min = withdrawCrypto.network?.min ?? 0;
      const d_amount = Decimal(amount || 0);
      const d_balance = Decimal(availableAndLocked.available);
      if (d_amount.lte(0)) return;
      if (d_amount.eq(d_min)) {
        const find = perRangeOptions.find((o) => o.value === "min");
        selected(find!);
        return;
      }
      if (d_amount.eq(d_balance)) {
        const find = perRangeOptions.find((o) => o.value === "max");
        selected(find!);
        return;
      }
      if (d_amount.eq(d_balance.mul(0.25))) {
        const find = perRangeOptions.find((o) => o.value === "25%");
        selected(find!);
        return;
      }
      if (d_amount.eq(d_balance.mul(0.5))) {
        const find = perRangeOptions.find((o) => o.value === "50%");
        selected(find!);
        return;
      }
      selected(null);
    },
    [availableAndLocked.available, withdrawCrypto.network],
  );

  // 手续费
  const withdrawalFee = useMemo(() => {
    return Decimal(withdrawCrypto.inputAmount || 0)
      .times(withdrawCrypto.network?.fee_rate || 0)
      .plus(withdrawCrypto.network?.fee_fix || 0)
      .toString();
  }, [withdrawCrypto]);

  // total withdraw amount 显示控制
  const totalWithdrawAmountControl = useMemo(() => {
    const max = withdrawCrypto.network?.max ?? 0;
    const d_amount = Decimal(withdrawCrypto.inputAmount || 0);
    return Decimal.min(d_amount, max);
  }, [withdrawCrypto.inputAmount, withdrawCrypto.network]);

  // 实际收到
  const withdrawAmountControl = useMemo(() => {
    const fee = totalWithdrawAmountControl.mul(withdrawCrypto.network?.fee_rate || 0).plus(withdrawCrypto.network?.fee_fix || 0);
    return Math.max(totalWithdrawAmountControl.sub(fee).toNumber(), 0).toString();
  }, [totalWithdrawAmountControl, withdrawCrypto.network]);

  // 创建订单
  const createOrder = useCallback(async () => {
    set(true);
    authService
      .createWithdrawCryptoOrder({
        pin: md5(syncAction?.data),
        amount: withdrawCrypto.inputAmount,
        network: withdrawCrypto.network?.network,
        comment: withdrawCrypto.comment,
        currency: withdrawCrypto.currency?.currency,
        wallet_address: withdrawCrypto.toWallet,
      })
      .then((res) => {
        if (res.code === 0) {
          setSyncAction("OPEN_WITHDRAW_ORDER_OK_MODAL");
        } else if (res.code === 4) {
          toast.error(t("toast:pinError"));
        } else if (res.code === 7) {
          toast.error(t("toast:youArleadyHaveAPendingWithdrawalOrder"));
        } else {
          toast.error(t("toast:failedToCreateWithdrawalOrder"));
        }
      })
      .catch(() => {
        toast.error(t("toast:failedToCreateWithdrawalOrder"));
        set(false);
      })
      .finally(() => {
        set(false);
      });
  }, [t, syncAction, withdrawCrypto]);

  // 事件通知
  useEffect(() => {
    if (syncAction.type === "SYNC_WITHDRAW_CRYPTO_CREATE") void createOrder();
  }, [syncAction]);

  return (
    <>
      <div className="flex flex-col">
        <MotionContentBox
          sample
          show={withdrawCrypto.network?.network === "TON"}
          content={
            <InputBox
              type="text"
              label={t(`finance:withdrawalComment`)}
              value={withdrawCrypto.comment}
              onChange={(e) => setWithdrawCrypto({ comment: e.target.value })}
              placeholder={t("finance:withdrawalComment")}
              className="w-full mb-4"
            />
          }
        />

        <div>
          {/* withdraw amount range */}
          <div className="flex items-center justify-between text-xs text-base-content/50 font-semibold mb-2">
            <p>{t(`finance:withdrawalAmount`)}</p>
            <div className="flex items-center gap-2">
              <SmallLoading
                loading={isGatewaysLoading}
                content={
                  <>
                    <BadgeAlert
                      className="w-4 h-4 cursor-pointer"
                      onClick={() => {
                        setSyncAction("OPEN_WITHDRAW_MIN_AMOUNT_MODAL");
                      }}
                    />
                    <p className="text-xs">
                      {t("finance:min")}: {withdrawCrypto.network?.min?.toLocaleString() ?? "?"} {withdrawCrypto.currency?.currency}
                    </p>
                  </>
                }
              />
            </div>
          </div>

          {/* amount control */}
          <NumericFormat
            placeholder="0.00"
            value={withdrawCrypto.inputAmount}
            thousandSeparator
            onValueChange={(values) => {
              setWithdrawCrypto({ inputAmount: values.value });
              calcWithdrawOption(values.value);
            }}
            decimalScale={withdrawCrypto.currency?.decimal}
          />

          {/* 输入发生错误 */}
          <ErrorMessageBox show={insufficient} content={t("finance:insufficient_balance")} />
          <ErrorMessageBox
            show={rangeError}
            content={
              <>
                {t("finance:pleaseEnterAnAmountBetween")} {withdrawCrypto.network?.min?.toLocaleString()} {t("finance:and")}{" "}
                {withdrawCrypto.network?.max?.toLocaleString()} {withdrawCrypto.currency?.currency}
              </>
            }
          />

          {/* 数量输入快捷选项 */}
          <MotionContentBox
            show={!lessThanMinimum}
            content={
              <WithdrawRangeOptions
                onClick={(v) => {
                  selected(v);
                  calcWithdrawAmount(v);
                }}
                selected={option!}
                disabled={isGatewaysLoading || lessThanMinimum}
              />
            }
          />
        </div>
      </div>

      {/* available & locked */}
      <div className="flex items-center justify-between">
        <span className="text-base-content/50 text-xs font-semibold">
          {t("finance:available")}:{" "}
          <FormatAmount amount={availableAndLocked.available} decimals={withdrawCrypto.currency?.display_decimal} local />{" "}
          {withdrawCrypto.currency?.currency}
        </span>
        <span className="text-base-content/50 text-xs font-semibold underline">
          {t("finance:locked")}:{" "}
          <FormatAmount amount={availableAndLocked.locked} decimals={withdrawCrypto.currency?.display_decimal} local />{" "}
          {withdrawCrypto.currency?.currency}
        </span>
      </div>

      {/* withdraw details */}
      <div className="bg-base-300 p-4 rounded-xl">
        <div className="flex items-center justify-between text-primary/80">
          <span className="text-xs font-semibold">{t("finance:withdrawAmount")}</span>
          <span className="text-xs font-bold flex items-center gap-2">
            <FormatAmount amount={withdrawAmountControl} decimals={withdrawCrypto.currency?.display_decimal} local />
            {withdrawCrypto.currency?.currency}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-base-content/50 text-xs font-semibold">{t("finance:fee")}</span>
          <span className="text-base-content text-xs font-bold flex items-center gap-2">
            <FormatAmount amount={withdrawalFee} decimals={withdrawCrypto.currency?.display_decimal} local />
            {withdrawCrypto.currency?.currency}
            <DisplayContent status={Decimal(withdrawCrypto.network?.fee_rate || 0).gt(0)}>
              <div className="text-[10px] text-base-content/50">
                {`(${withdrawCrypto.network?.fee_rate * 100}% + ${withdrawCrypto.network?.fee_fix || 0})`}
              </div>
            </DisplayContent>
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-base-content/50 text-xs font-semibold">{t("finance:totalWithdrawAmount")}</span>
          <span className="text-base-content text-xs font-bold flex items-center gap-2">
            <FormatAmount amount={totalWithdrawAmountControl.toString()} local decimals={withdrawCrypto.currency?.display_decimal} />
            {withdrawCrypto.currency?.currency}
          </span>
        </div>
      </div>

      <ConfirmBox
        loading={loading}
        disabled={withdrawCrypto.inputAmount === "" || lessThanMinimum || rangeError || insufficient}
        onClick={() => {
          setSyncAction("OPEN_WITHDRAW_CRYPTO_PIN_MODAL");
        }}
      >
        {t("finance:continue")}
      </ConfirmBox>
    </>
  );
};
