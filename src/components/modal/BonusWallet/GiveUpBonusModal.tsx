import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { Trans, useTranslation } from "react-i18next";
import { ReactNode, useCallback, useState } from "react";
import { authService } from "@/services/authService.ts";
import { useUserBonusWallet } from "@/query/dollars.ts";
import { useUserSportWallet } from "@/query/sports-bonus.ts";
import { useNavigate } from "@tanstack/react-router";
import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext.tsx";
import { toast } from "sonner";
import { InnerToastCustom } from "@/sections/dollars/components.tsx";

export const GiveUpBonusModal = (
  {
    open,
    data,
    onClose
  }: {
    open: boolean;
    data: any;
    onClose: () => void;
  }) => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  // 设置结算币种
  const { updateSettlementCurrency } = useSettlementCurrency();

  const [isPending, setPending] = useState<boolean>(false);

  // 彩金钱包数据
  const { refetch: refetchBonusWallet } = useUserBonusWallet();
  const { refetch: refetchSportWallet } = useUserSportWallet();

  const showBaseToast = useCallback((params: {
    icon: string;
    title: string;
    subTitle: ReactNode;
  }) => {
    toast.custom(
      (tst) => (
        <InnerToastCustom
          closeBtn
          tst={tst}
          icon={params.icon}
          title={params.title}
          subTitle={params.subTitle}
          onConfirm={() => console.info("onClose")}
        />
      ),
      { duration: 6_000, position: "top-right" }
    );
  }, []);

  const showErrorToast = useCallback((i18nKey: string) => {
    showBaseToast({
      icon: "/images/dollars/bonus-error.png",
      title: t("transaction:transactionStatus.failed"),
      subTitle: <Trans i18nKey={i18nKey} />
    });
  }, [showBaseToast, t]);

  const handle = useCallback(async () => {
    setPending(true);

    try {
      // 放弃体育彩金活动
      if (data?.kind === "sports") {
        const response = await authService.userAbandonSport(data?.id);

        if (response.code === 0 || response.code === 200) {
        } else {
          showErrorToast("");
          return;
        }

        await refetchSportWallet();
      }

      // 放弃常规彩金活动
      if (data?.kind === "general") {
        const response = await authService.userAbandonBonus(data?.id);

        if (response.code === 0 || response.code === 200) {
        } else {
          showErrorToast("");
          return;
        }

        await refetchBonusWallet();
      }

      void navigate({
        to: "/casino",
        search: {
          openLogin: undefined,
          openSignUp: undefined,
          redirect: undefined,
          startapp: undefined,
          openFinance: undefined
        } as any
      });

      // 切换彩金币种为其他结算币种
      const currency = await authService.getCurrencyOtherThanBonusCoin();

      if (currency?.data?.currency) {
        void updateSettlementCurrency(currency?.data?.currency);
      }

      onClose();
    } catch (_error) {
      console.info(_error);
    } finally {
      setPending(false);
    }
  }, [data?.id, data?.kind]);

  return (
    <Modal
      isOpen={open}
      title={""}
      onClose={onClose}
      className="bg-base-400 md:max-w-[360px]"
      position="modal-middle"
    >
      <div className="flex flex-col gap-4 items-center font-semibold">
        <div className="flex flex-col gap-4 items-center">
          <p className="text-lg font-extrabold">{t("bonus:lose_all")}</p>
          <p className="text-base-content/50 text-sm text-center">
            {t("bonus:reset_bonus")}
          </p>
        </div>

        <div className="flex gap-4 items-center w-full">
          <ConfirmBox onClick={handle} loading={isPending}
                      className={"w-auto flex-1"}>{t("common:common.continue")}</ConfirmBox>
          <ConfirmBox onClick={onClose} className={"w-auto flex-1 btn-outline"}>{t("common:common.cancel")}</ConfirmBox>
        </div>
      </div>
    </Modal>
  );
};

export default GiveUpBonusModal;