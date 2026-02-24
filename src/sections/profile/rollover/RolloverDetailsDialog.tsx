import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import type { RolloverDetailViewModel } from "./RolloverDetailMapper";
import { useTranslation } from "react-i18next";

type RolloverDetailsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  detail: RolloverDetailViewModel | null;
};

const getCurrencyIcon = (currency: string) => {
  return <CurrencyIcon currency={currency} className="h-10 w-10" />;
};

export function RolloverDetailsDialog({ isOpen, onClose, detail }: RolloverDetailsDialogProps) {
  const { t } = useTranslation();

  if (!detail) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Iconify icon="solar:dollar-minimalistic-bold-duotone" className="text-primary" />
          {t("profile.rolloverDetails", "Rollover Details")}
        </span>
      }
      position="modal-middle"
      className="bg-base-400 p-6 md:max-w-[400px] shadow-xl"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 text-center">
          {getCurrencyIcon(detail.currency)}
          <div className="text-2xl font-bold text-base-content">{detail.amountLabel}</div>
        </div>

        <div className="rounded-xl bg-base-300 p-4 text-sm space-y-2">
          {detail.infoRows.map((row, index) => (
            <InfoRow key={`${row.label}-${index}`} label={row.label} value={row.value} />
          ))}
        </div>

        <button type="button" className="btn btn-primary btn-lg font-semibold" onClick={onClose}>
          {t("common:common.close", "Close")}
        </button>
      </div>
    </Modal>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 text-sm">
    <span className="text-base-content/60 font-semibold">{label}</span>
    <span className="font-bold text-base-content text-right">{value}</span>
  </div>
);

