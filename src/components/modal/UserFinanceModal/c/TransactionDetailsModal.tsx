/**
 * 交易详情窗口
 *
 * 使用发布订阅模式来唤起弹窗
 */

import Iconify from "@/components/iconify";
import { TransactionItem } from "@/components/modal/UserFinanceModal/c/TransactionItem.tsx";
import { TransactionProgress } from "@/components/modal/UserFinanceModal/c/TransactionProgress.tsx";
import Copy from "@/components/ui/Copy.tsx";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { useBoundStore } from "@/store";
import { useToggle } from "@/hooks/useToggle";
import dayjs from "dayjs";
import { TFunction } from "i18next";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const TransactionDetailsModal = () => {
  const { t } = useTranslation();

  const [status, { set }] = useToggle<boolean>(false);

  // from data store, share common data
  const { syncAction } = useBoundStore();

  // 事件通知
  useEffect(() => {
    if (syncAction.type === "OPEN_TRANSACTION_DETAILS_MODAL") set(true);
  }, [syncAction]);

  return (
    <Modal
      title={
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Iconify icon="custom:tx" className="text-primary" />
          {t("transaction:details:title")}
        </span>
      }
      isOpen={status}
      onClose={() => set(false)}
      position="modal-middle"
      className="bg-base-400 p-4 md:max-w-[360px] shadow-lg"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-1">
          <CurrencyIcon currency={"BUCK"} className="h-8 w-8" />
          <div className="text-2xl font-bold flex items-center gap-1">
            <Plus size={14} strokeWidth={7} /> ₱1,000 PHP
          </div>
        </div>

        <div className="bg-base-300 flex flex-col gap-2 rounded-xl p-4">
          <TransactionItem label={t("transaction:tableHeaders.status")} value={t("transaction:transactionStatus.processing")} />
          <TransactionItem label={t("transaction:filters.type")} value={t("transaction:transactionTypes.cryptoDeposit")} />
          <TransactionItem
            label={t("transaction:details.transactionHash")}
            value={
              <div className="badge p-1 rounded-md text-xs gap-1">
                <span>175414778924129323</span>
                <Copy className="h-4 w-4" text={"175414778924129323"} />
              </div>
            }
          />
          <TransactionItem label={t("transaction:details.createdAt")} value={dayjs().format("DD/MM/YYYY HH:mm:ss")} />
        </div>

        <div className="flex flex-col">
          <TransactionProgress
            step={2}
            nodes={[
              <>
                <p className="text-sm font-semibold">{t("transaction:details.blockchainProcessing")}</p>
                <p className="text-base-content/50 text-xs">
                  {t("transaction:details.lastUpdate")}: {dayjs().format("DD/MM/YYYY HH:mm:ss")}
                </p>
              </>,
              <>
                {1 !== 1 ? (
                  <div className="flex flex-col items-start gap-1">
                    <p className="text-sm font-bold">{t("transaction:details.gatewayConfirmation")}</p>
                    <p className="text-base-content/50 text-xs">{t("transaction:details.lastUpdate")}: asd</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-start gap-1">
                    <p className="text-sm font-bold">{t("transaction:details.gatewayConfirmation")}</p>
                    {3 === 3 ? (
                      <p className="text-base-content/50 text-start text-xs">{t("transaction:details.waiting")}</p>
                    ) : (
                      <p className="text-base-content/50 text-start text-xs">{t("transaction:details.expired")}</p>
                    )}
                  </div>
                )}
              </>,
              <>
                <p className="text-sm font-semibold">{t("transaction:details.blockchainProcessing")}</p>
                <p className="text-base-content/50 text-xs">
                  {t("transaction:details.lastUpdate")}: {dayjs().format("DD/MM/YYYY HH:mm:ss")}
                </p>
              </>,
            ]}
          />
        </div>

        <CopyOrderID t={t} id={"175414778924129323"} />

        <button className={`btn btn-primary btn-lg text-sm font-bold`}>{t("common:common.close")}</button>
      </div>
    </Modal>
  );
};

const CopyOrderID = ({ t, id }: { t: TFunction; id: string }) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-base-content/50 font-semibold">{t("transaction:details.orderId")}</div>
      <div className="relative flex items-center">
        <input
          type="text"
          className="w-full input bg-base-300 border-0 text-xs text-base-content/50 font-semibold rtl:text-left"
          value={id}
          readOnly
        />
        <div className="absolute right-3">
          <Copy text={id} />
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;