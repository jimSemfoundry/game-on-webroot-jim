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
import { DisplayContent } from "@/components/modal/UserFinanceModal";
import { useUserWithdrawFiatInfo } from "@/components/modal/UserFinanceModal/helper.ts";

export const WithdrawFiatFormV2 = () => {
  const { t } = useTranslation();

  const [loading, { set }] = useToggle<boolean>(false);

  // from data store, share common data
  const { withdrawFiat, withdrawFiatV2, syncAction, setSyncAction } = useBoundStore();

  // 法币提现用用户添加的快捷信息列表
  const { data: wallets } = useUserWithdrawFiatInfo(withdrawFiat.currency?.currency);

  // 创建订单
  const createOrder = useCallback(async () => {
    set(true);
    authService
      .createWithdrawFiatOrderV2({
        pin: md5(syncAction?.data),
        amount: withdrawFiatV2.formItem?.amount,
        currency: withdrawFiat.currency?.currency,
        userWithdrawInfoId: withdrawFiatV2.method?.id
      })
      .then((res) => {
        if (res.code === 0) {
          setSyncAction("OPEN_WITHDRAW_ORDER_OK_MODAL");
        } else if (res.code === 4) {
          toast.error(t("toast:pinError"));
        } else {
          toast.error(t("toast:failedToSubmitWithdrawalRequest"));
        }
      })
      .catch(() => {
        toast.error(t("toast:failedToSubmitWithdrawalRequest"));
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

  // 事件通知
  useEffect(() => {
    if (syncAction.type === "SYNC_WITHDRAW_FIAT_CREATE") void createOrder();
  }, [syncAction]);

  // useEffect(() => {
  //   console.info("法币提款信息V2");
  //   console.info(withdrawFiat);
  // }, [withdrawFiat]);

  return (
    <div className="flex flex-col gap-4">
      <WithdrawMethodInfoAdd />
      <DisplayContent
        className="flex flex-col gap-4"
        status={(wallets?.data ?? [])?.length > 0 && !!withdrawFiatV2.method}>
        <WithdrawFiatAmount key="amount" formKey="amount" version={"V2"} />
      </DisplayContent>
      {/* 提交 */}
      <DisplayContent
        className="flex flex-col gap-4"
        status={(wallets?.data ?? [])?.length > 0 && !!withdrawFiatV2.method}>
        <ConfirmBox
          loading={loading}
          disabled={error1 || !!error2 || withdrawFiatV2.method?.status === 0}
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
