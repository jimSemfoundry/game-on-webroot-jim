import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import {
  open_debug,
  perRangeOptions,
  useAvailableBalance,
  useSupportedCryptoWithdrawGatewaysFilter
} from "@/components/modal/UserFinanceModal/helper.ts";
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
import {
  DisplayContent,
  InnerProviderAmountRangeFormat,
  InputBox
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { TFunction } from "i18next";
import { useNavigate } from "@tanstack/react-router";
import { useFinanceModal } from "@/contexts/ModalsProvider.tsx";
import classNames from "classnames";

interface OptionProps {
  label: string;
  value: number;
}

export const WithdrawCryptoAmount = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const [option, selected] = useState<OptionProps | null>(null);

  const [loading, { set }] = useToggle<boolean>(false);

  // finance 弹窗控制开关
  const { closeUserFinanceModal } = useFinanceModal();

  // from data store, share common data
  const { withdrawCrypto, setWithdrawCrypto, syncAction, setSyncAction } = useBoundStore();

  // 获取支持代币取款的网关
  const [isGatewaysLoading] = useSupportedCryptoWithdrawGatewaysFilter(withdrawCrypto.currency?.currency);

  // 用户的可提款数量
  const availableAndLocked = useAvailableBalance(withdrawCrypto.currency?.currency);

  // 提款范围错误提示
  const rangeError = useMemo(() => {
    return (
      (!!withdrawCrypto.inputAmount && Decimal(Number(withdrawCrypto.inputAmount)).lt(withdrawCrypto.network?.min ?? 0)) ||
      Decimal(Number(withdrawCrypto.inputAmount)).gt(withdrawCrypto.network?.max ?? 0)
    );
  }, [withdrawCrypto.inputAmount, withdrawCrypto.network]);

  // 输入的提款数量大于余额
  const insufficient = useMemo(() => {
    return !!withdrawCrypto.inputAmount && Decimal(Number(withdrawCrypto.inputAmount)).gt(availableAndLocked.available);
  }, [withdrawCrypto.inputAmount, availableAndLocked.available]);

  // 小于最小提款数量限制错误
  const lessThanMinimum = useMemo(() => {
    return Decimal(availableAndLocked.available).lt(withdrawCrypto.network?.min ?? 0);
  }, [withdrawCrypto.network, availableAndLocked.available]);

  // 无地址 / 无输入 拒绝
  const inoutError = useMemo(() => !withdrawCrypto.inputAmount || !withdrawCrypto.toWallet, [withdrawCrypto.inputAmount, withdrawCrypto.toWallet])

  const calcWithdrawAmount = useCallback(
    (option: Record<string, any>) => {
      const min = withdrawCrypto.network?.min ?? 0;
      const max = withdrawCrypto.network?.max ?? 0;
      const balance = Decimal(availableAndLocked.available);
      switch (option?.label) {
        case "Min":
          setWithdrawCrypto({ inputAmount: balance.lt(min) ? 0 : min });
          break;
        case "25%":
          const de_25 = Decimal(balance).mul(0.25);
          let de_25_final_value = de_25.toString();
          if (de_25.lt(min)) de_25_final_value = min;
          if (de_25.gt(max)) de_25_final_value = max;
          setWithdrawCrypto({ inputAmount: de_25_final_value });
          break;
        case "50%":
          const de_50 = Decimal(balance).mul(0.5);
          let de_50_final_value = de_50.toString();
          if (de_50.lt(min)) de_50_final_value = min;
          if (de_50.gt(max)) de_50_final_value = max;
          setWithdrawCrypto({ inputAmount: de_50_final_value });
          break;
        case "Max":
          const de_100 = Decimal(balance);
          let de_100_final_value = de_100.toString();
          if (de_100.gt(max)) de_100_final_value = max;
          setWithdrawCrypto({ inputAmount: de_100_final_value });
          break;
      }
    },
    [availableAndLocked.available, withdrawCrypto.network]
  );

  // 根据输入的值判断快捷选项激活
  const calcWithdrawOption = useCallback(
    (amount: string) => {
      const d_min = withdrawCrypto.network?.min ?? 0;
      const d_amount = Decimal(amount || 0);
      const d_balance = Decimal(availableAndLocked.available);
      if (d_amount.eq(d_min)) {
        const find = perRangeOptions.find((o) => o.value === 0);
        selected(find!);
        return;
      }
      if (d_amount.eq(d_balance.toDP(withdrawCrypto.currency?.display_decimal, Decimal.ROUND_DOWN))) {
        const find = perRangeOptions.find((o) => o.value === 1);
        selected(find!);
        return;
      }
      if (d_amount.eq(d_balance.mul(0.25).toDP(withdrawCrypto.currency?.display_decimal, Decimal.ROUND_DOWN)) && d_amount.gte(d_min)) {
        const find = perRangeOptions.find((o) => o.value === 0.25);
        selected(find!);
        return;
      }
      if (d_amount.eq(d_balance.mul(0.5).toDP(withdrawCrypto.currency?.display_decimal, Decimal.ROUND_DOWN)) && d_amount.gte(d_min)) {
        const find = perRangeOptions.find((o) => o.value === 0.5);
        selected(find!);
        return;
      }
      selected(null);
    },
    [availableAndLocked.available, withdrawCrypto.network, withdrawCrypto.currency]
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
    if (open_debug) {
      console.info("Withdraw Crypto Order Data");
      console.info({
        pin: md5(syncAction?.data),
        amount: withdrawCrypto.inputAmount,
        network: withdrawCrypto.network?.network,
        comment: withdrawCrypto.comment,
        currency: withdrawCrypto.currency?.currency,
        wallet_address: withdrawCrypto.toWallet
      });
      return;
    }

    set(true);
    authService
      .createWithdrawCryptoOrder({
        pin: md5(syncAction?.data),
        amount: withdrawCrypto.inputAmount,
        network: withdrawCrypto.network?.network,
        comment: withdrawCrypto.comment,
        currency: withdrawCrypto.currency?.currency,
        wallet_address: withdrawCrypto.toWallet
      })
      .then((res) => {
        fn_withdraw_common_status(() => {
          setSyncAction("OPEN_WITHDRAW_ORDER_OK_MODAL");

          // 清空表单数据
          setWithdrawCrypto({
            comment: "",
            toWallet: "",
            inputAmount: ""
          });
        }, res.code, t);
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
        {/* TON comment add */}
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
                  <div className={"flex gap-1"}>
                    <BadgeAlert
                      className="w-4 h-4 cursor-pointer"
                      onClick={() => {
                        setSyncAction("OPEN_WITHDRAW_MIN_AMOUNT_MODAL");
                      }}
                    />
                    <div className={"flex flex-col text-[10px]"}>
                      <p className="text-xs">
                        {t("finance:min")}:{" "}{withdrawCrypto.network?.min}{" "}{withdrawCrypto.currency?.currency}
                      </p>
                      <InnerProviderAmountRangeFormat
                        min={withdrawCrypto.network?.min}
                        max={withdrawCrypto.network?.max}
                        currency={withdrawCrypto.currency?.currency} />
                    </div>
                  </div>
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
            disabled={lessThanMinimum}
            decimalScale={withdrawCrypto.currency?.display_decimal}
          />

          {/* 输入发生错误 */}
          {/*<ErrorMessageBox sample show={lessThanMinimum}*/}
          {/*                 content={t("finance:theBalanceDoesNotReachTheMinimumWithdrawalLimit")} />*/}
          <ErrorMessageBox sample show={insufficient} content={t("finance:insufficient_balance")} />
          <ErrorMessageBox
            sample
            show={rangeError && !insufficient}
            content={
              <>
                {t("finance:pleaseEnterAnAmountBetween")} {withdrawCrypto.network?.min?.toLocaleString()} {t("finance:and")}{" "}
                {withdrawCrypto.network?.max?.toLocaleString()} {withdrawCrypto.currency?.currency}
              </>
            }
          />

          {/* 数量输入快捷选项 */}
          <MotionContentBox
            sample
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
        <span
          className={classNames("text-base-content/50 text-xs font-semibold underline cursor-pointer", { "text-error": lessThanMinimum })}
          onClick={() => {
            void navigate({ to: "/profile", search: (prev) => ({ ...prev, tab: "rollover" }) });

            closeUserFinanceModal();
          }}>
          {t("finance:available")}:{" "}
          <FormatAmount amount={availableAndLocked.available} decimals={withdrawCrypto.currency?.display_decimal}
                        local />{" "}
          {withdrawCrypto.currency?.currency}
        </span>
        <span className="text-base-content/50 text-xs font-semibold underline cursor-pointer" onClick={() => {
          void navigate({ to: "/profile", search: (prev) => ({ ...prev, tab: "rollover" }) });

          closeUserFinanceModal();
        }}>
          {t("finance:locked")}:{" "}
          <FormatAmount amount={availableAndLocked.locked} decimals={withdrawCrypto.currency?.display_decimal}
                        local />{" "}
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
            <FormatAmount amount={totalWithdrawAmountControl.toString()} local
                          decimals={withdrawCrypto.currency?.display_decimal} />
            {withdrawCrypto.currency?.currency}
          </span>
        </div>
      </div>

      <ConfirmBox
        loading={loading}
        disabled={inoutError || lessThanMinimum || rangeError || insufficient}
        onClick={() => {
          setSyncAction("OPEN_WITHDRAW_CRYPTO_PIN_MODAL");
        }}
      >
        {t("finance:continue")}
      </ConfirmBox>
    </>
  );
};

export const fn_withdraw_common_status = (action: () => void, code: number, t: TFunction) => {
  switch (code) {
    case 0:
    case 200:
      action();
      break;
    case 7:
      toast.error(t("toast:youArleadyHaveAPendingWithdrawalOrder"));
      break;
    case 20010:
      toast.error(t("toast:pinError"));
      break;
    default:
      toast.error(t("toast:failedToCreateWithdrawalOrder"));
  }
};