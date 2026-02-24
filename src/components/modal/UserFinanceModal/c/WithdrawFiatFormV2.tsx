import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { WithdrawFiatAmount } from "@/components/modal/UserFinanceModal/c/WithdrawFiatAmount.tsx";
import { authService } from "@/services/authService.ts";
import { useBoundStore } from "@/store";
import { useToggle } from "@/hooks/useToggle";
import { useCallback, useEffect, useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ErrorString } from "@/store/type.ts";
import {
  InnerDisplayContent,
  WithdrawMethodInfoAdd
} from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import {
  debug_target,
  open_debug,
  useAvailableBalance,
  useUserWithdrawFiatInfo
} from "@/components/modal/UserFinanceModal/helper.ts";
import {
  DisplayContent
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { fn_withdraw_common_status } from "@/components/modal/UserFinanceModal/c/WithdrawCryptoAmount.tsx";
import { useRumSdkUserLog } from "@/utils/helper.ts";
import { emitter } from "@/store/emitter.ts";
import { isEmpty } from "@/utils/helper.ts";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";

export const WithdrawFiatFormV2 = () => {
  const { t } = useTranslation();

  const [loading, { set }] = useToggle<boolean>(false);

  const { rumCustomLog, rumException } = useRumSdkUserLog();

  // from data store, share common data
  const { withdrawFiat, withdrawFiatV2, syncAction, setSyncAction, setWithdrawFiatV2, openModal } = useBoundStore();

  // 用户的可提款数量
  const availableAndLocked = useAvailableBalance(withdrawFiat.currency?.currency);

  // 法币提现用用户添加的快捷信息列表
  const { data: wallets, isLoading: fiatInfoLoading } = useUserWithdrawFiatInfo(withdrawFiat.currency?.currency);

  // 表单字段是否有错误
  const filed_value_null = useMemo(() => {
    return isEmpty(withdrawFiatV2.formItem) || (!!withdrawFiatV2.formItem && Object.values(withdrawFiatV2.formItem).some((value) => !value));
  }, [withdrawFiatV2.formItem]);

  // 表单字段是否有额外的错误
  const filed_value_error = useMemo(() => {
    const keys = Object.keys(withdrawFiatV2);
    return keys.filter((k) => k.includes("_error")).some((j) => withdrawFiatV2[j as ErrorString]);
  }, [withdrawFiatV2]);

  // 供应商不可用
  const provider_error = useMemo(() => {
    if (withdrawFiatV2.method) return withdrawFiatV2.method?.status === 0;
    return true;
  }, [withdrawFiatV2.method]);

  // 创建订单
  const createOrder = useCallback(async () => {
    if (open_debug && debug_target === "WITHDRAW") {
      console.info("CreateOrder Withdraw Fiat V2");
      console.info({
        // pin: md5(syncAction?.data),
        amount: withdrawFiatV2.formItem?.amount,
        currency: withdrawFiat.currency?.currency,
        userWithdrawInfoId: withdrawFiatV2.method?.id
      });
      return;
    }

    set(true);
    setSyncAction(undefined)

    const params = {
      // pin: md5(syncAction?.data),
      amount: withdrawFiatV2.formItem?.amount,
      currency: withdrawFiat.currency?.currency,
      userWithdrawInfoId: withdrawFiatV2.method?.id
    };

    authService
      .createWithdrawFiatOrderV2(params)
      .then((res) => {
        fn_withdraw_common_status(() => {

          // 提款订单提交成功
          if (res.code === 0 || res.code === 200) {
            setSyncAction("OPEN_WITHDRAW_ORDER_OK_MODAL");
          }

          // 提款AML措施-错误提示
          if (res.code === 40021) {
            openModal("OPEN_FINANCE_AML_MODAL");
          }
        }, res.code, t);
      })
      .catch((error) => {
        toast.error(t("toast:failedToCreateWithdrawalOrder"));
        set(false);

        rumException(error, params);
      })
      .finally(() => {
        set(false);
      });
  }, [t, syncAction, withdrawFiat, withdrawFiatV2]);

  // 事件通知
  // useEffect(() => {
  //   if (syncAction.type === "SYNC_WITHDRAW_FIAT_CREATE") void createOrder();
  // }, [syncAction]);

  // 事件通知【CLOSE_FINANCE_MODAL- 关闭finance操作窗口】需要重置表单状态
  useEffect(() => {
    const em = emitter.addListener("CLOSE_FINANCE_MODAL", function() {
      setWithdrawFiatV2({ formItem: null });
    });

    return () => {
      em?.remove();
    };
  }, []);

  useEffect(() => {
    if (open_debug && debug_target === "WITHDRAW") {
      // console.info("************ V2 withdrawFiatV2 start ************");
      // console.info(withdrawFiatV2);
      // console.info("************ V2 withdrawFiatV2 ended ************");
    }
  }, [withdrawFiatV2]);

  // 数据推送 - 延迟
  useEffect(() => {
    rumCustomLog("withdrawFiatV2", { ...withdrawFiatV2, available: availableAndLocked.available });
  }, [rumCustomLog, withdrawFiatV2]);

  return (
    <div className="flex flex-col gap-4">
      <WithdrawMethodInfoAdd />

      {/* 通道维护不可用 */}
      <InnerDisplayContent show={!fiatInfoLoading && !!withdrawFiatV2.method && Boolean(provider_error)}>
        <div className="bg-base-300 rounded-lg p-2">
          <ErrorMessageBox
            className={"!mt-0 static"}
            content={
              <Trans
                i18nKey={"finance:withdraw_channel_under_maintenance"}
                values={{ channel: withdrawFiatV2.method?.display_name || withdrawFiatV2.method?.channel_class }}
                components={[<span className="underline" />]} />}
            show={Boolean(provider_error)} />
        </div>
      </InnerDisplayContent>

      <DisplayContent
        className="flex flex-col gap-4"
        status={(wallets?.data ?? [])?.length > 0 && !!withdrawFiatV2.method}>
        <WithdrawFiatAmount key="amount" formKey="amount" version={"V2"} />
      </DisplayContent>

      {/* 提交 */}
      <DisplayContent
        className="flex flex-col gap-1"
        status={(wallets?.data ?? [])?.length > 0 && !!withdrawFiatV2.method}>
        <ConfirmBox
          disabled={filed_value_null || filed_value_error || provider_error}
          loading={loading}
          onClick={() => {
            void createOrder()
            // setSyncAction("OPEN_WITHDRAW_FIAT_PIN_MODAL");
          }}
        >
          {t("finance:continue")}
        </ConfirmBox>
      </DisplayContent>
    </div>
  );
};
