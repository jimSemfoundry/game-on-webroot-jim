import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { useTranslation } from "react-i18next";
import { useCallback, useState } from "react";
import { authService } from "@/services/authService.ts";
import { useBonusWallet } from "@/query/dollars.ts";
import { useUserBonusLatestHistory } from "@/hooks/api/useAuth.ts";
import { useNavigate } from "@tanstack/react-router";

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

  const [isPending, setPending] = useState<boolean>(false);

  // 彩金钱包数据
  const { refetch: refetchBonusWallet } = useBonusWallet();
  const { refetch: refetchBonusLatest } = useUserBonusLatestHistory();

  const handle = useCallback(async () => {
    setPending(true);

    try {
      // 放弃彩金活动
      await authService.userAbandonBonus(data?.id);

      // 更新彩金钱包数据
      await refetchBonusWallet();
      await refetchBonusLatest();

      void navigate({
        to: "/casino",
        search: {
          openLogin: undefined,
          openSignUp: undefined,
          redirect: undefined,
          startapp: undefined,
          openFinance: undefined
        }
      });

      onClose();
    } catch (_error) {
      console.info(_error);
    } finally {
      setPending(false);
    }
  }, [data?.id]);

  return (
    <Modal
      isOpen={open}
      title={""}
      onClose={onClose}
      className="bg-base-400 md:max-w-[360px]"
      position="modal-middle"
    >
      <div className="flex flex-col gap-4 items-center font-semibold">
        <img src="/images/dollars/giveup.png" className="h-25" alt="" />
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