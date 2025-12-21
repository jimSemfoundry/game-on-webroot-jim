import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { WithdrawFiatAmount } from "@/components/modal/UserFinanceModal/c/WithdrawFiatAmount.tsx";
import { authService } from "@/services/authService.ts";
import { useBoundStore } from "@/store";
import { useToggle } from "ahooks";
import md5 from "md5";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ErrorString } from "@/store/type.ts";
import { WithdrawMethodInfoAdd } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import { open_debug, useUserWithdrawFiatInfo } from "@/components/modal/UserFinanceModal/helper.ts";
import { isEmpty } from "lodash-es";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { parser } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";
import { fn_withdraw_common_status } from "@/components/modal/UserFinanceModal/c/WithdrawCryptoAmount.tsx";

export const WithdrawFiatFormV2 = () => {
  const { t } = useTranslation();

  const [loading, { set }] = useToggle<boolean>(false);

  // from data store, share common data
  const { withdrawFiat, withdrawFiatV2, syncAction, setSyncAction, setWithdrawFiatV2 } = useBoundStore();

  // 法币提现用用户添加的快捷信息列表
  const { data: wallets } = useUserWithdrawFiatInfo(withdrawFiat.currency?.currency);

  // 创建订单
  const createOrder = useCallback(async () => {
    if (open_debug) {
      console.info("Withdraw Fiat Order Data V2");
      console.info({
        amount: withdrawFiatV2.formItem?.amount,
        currency: withdrawFiat.currency?.currency,
        userWithdrawInfoId: withdrawFiatV2.method?.id
      });
      return;
    }

    set(true);
    authService
      .createWithdrawFiatOrderV2({
        pin: md5(syncAction?.data),
        amount: withdrawFiatV2.formItem?.amount,
        currency: withdrawFiat.currency?.currency,
        userWithdrawInfoId: withdrawFiatV2.method?.id
      })
      .then((res) => {
        fn_withdraw_common_status(() => setSyncAction("OPEN_WITHDRAW_ORDER_OK_MODAL"), res.code, t);
      })
      .catch(() => {
        toast.error(t("toast:failedToCreateWithdrawalOrder"));
        set(false);
      })
      .finally(() => {
        set(false);
      });
  }, [t, syncAction, withdrawFiat, withdrawFiatV2]);

  // 表单字段是否有错误
  const error1 = useMemo(() => {
    if (withdrawFiatV2.formItem) return Object.values(withdrawFiatV2.formItem).some((value) => !value);
  }, [withdrawFiatV2.formItem]);

  // 表单字段是否有额外的错误
  const error2 = useMemo(() => {
    const keys = Object.keys(withdrawFiatV2);
    return keys.filter((k) => k.includes("_error")).find((j) => withdrawFiatV2[j as ErrorString]);
  }, [withdrawFiatV2]);

  // 供应商不可用
  const error3 = useMemo(() => {
    if (withdrawFiatV2.method) return !!withdrawFiatV2.formItem?.amount && withdrawFiatV2.method?.status === 0;
  }, [withdrawFiatV2]);

  // 事件通知
  useEffect(() => {
    if (syncAction.type === "SYNC_WITHDRAW_FIAT_CREATE") void createOrder();
  }, [syncAction]);

  // 事件通知【CLOSE_FINANCE_MODAL- 关闭finance操作窗口】需要重置表单状态
  useEffect(() => {
    if (syncAction.type && ["CLOSE_FINANCE_MODAL"].includes(syncAction.type)) setWithdrawFiatV2({ formItem: null });
  }, [syncAction]);

  useEffect(() => {
    if (open_debug) {
      console.info(error1);
      console.info(error2);
      console.info(error3);
      console.info(withdrawFiatV2?.method?.params);
    }
  }, [error1, error2, error3, withdrawFiatV2]);

  return (
    <div className="flex flex-col gap-4">
      <WithdrawMethodInfoAdd />

      <DisplayContent
        className="flex flex-col gap-4"
        status={(wallets?.data ?? [])?.length > 0 && !!withdrawFiatV2.method}>
        <WithdrawFiatAmount key="amount" field={parser(withdrawFiatV2?.method?.params ?? "")?.amount || null}
                            formKey="amount" version={"V2"} />
      </DisplayContent>

      {/* 提交 */}
      <DisplayContent
        className="flex flex-col gap-1"
        status={(wallets?.data ?? [])?.length > 0 && !!withdrawFiatV2.method}>
        <ConfirmBox
          loading={loading}
          disabled={isEmpty(withdrawFiatV2.formItem) || error1 || !!error2 || error3}
          onClick={() => {
            setSyncAction("OPEN_WITHDRAW_FIAT_PIN_MODAL");
          }}
        >
          {t("finance:continue")}
        </ConfirmBox>
      </DisplayContent>
    </div>
  );
};
