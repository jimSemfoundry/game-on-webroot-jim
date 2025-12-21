import clsx from "clsx";
import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import Copy from "@/components/ui/Copy";
import type { TransactionDetailViewModel } from "./TransactionDetailMapper";
import { useTranslation } from "react-i18next";

type TransactionDetailsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  detail: TransactionDetailViewModel | null;
};

export function TransactionDetailsDialog({ isOpen, onClose, detail }: TransactionDetailsDialogProps) {
  const { t } = useTranslation();

  if (!detail) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Iconify icon="custom:tx" className="text-primary" />
          {t("transaction:details.title")}
        </span>
      }
      position="modal-middle"
      className="bg-base-400 p-6 md:max-w-[400px] shadow-xl h-[75vh] max-h-[75vh] md:max-h-[500px] hide-scrollbar"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <CurrencyIcon currency={detail.currency} className="h-10 w-10" />
          <div className="text-2xl font-bold text-base-content">{detail.amountLabel}</div>
        </div>

        <div className="rounded-xl bg-base-300 p-4 text-sm space-y-2">
          {detail.infoRows.map((row) => (
            <InfoRow key={`${row.label}-${row.value}`} label={row.label} value={row.value} />
          ))}
        </div>

        {detail.timeline.length > 0 && (
          <div className="flex flex-col gap-4">
            <label className="text-xs font-semibold text-base-content/60">
              {t("transaction:details.transactionProgress")}
            </label>
            <ul className="steps steps-vertical">
              {detail.timeline.map((step, index) => (
                <TimelineStep
                  key={`${step.label}-${index}`}
                  completed={step.completed}
                  stepNumber={index + 1}
                  label={step.label}
                  description={step.description}
                />
              ))}
            </ul>
          </div>
        )}

        {detail.orderId ? <CopyField label={t("transaction:details.orderId")} value={detail.orderId} /> : null}
        {detail.showTransactionHash && (
          <CopyField 
            label={t("transaction:details.transactionHash")} 
            value={detail.transactionId || "N/A"} 
            obfuscate={!!detail.transactionId} 
            disableCopy={!detail.transactionId}
          />
        )}

        <button type="button" className="btn btn-primary btn-lg font-semibold" onClick={onClose}>
          {t("common.close", "Close")}
        </button>
      </div>
    </Modal>
  );
}

const TimelineStep = ({
  completed,
  label,
  description,
  stepNumber,
}: {
  completed: boolean;
  label: string;
  description?: string;
  stepNumber: number;
}) => (
  <li
    data-content={completed ? "✓" : String(stepNumber)}
    className={clsx(
      "step mb-2 last:mb-0 text-left text-base-content before:!w-1 before:!origin-bottom after:!h-5 after:!w-5 after:text-[12px] after:!flex after:!items-center after:!justify-center after:!content-[attr(data-content)] first:before:!h-0",
      completed
        ? "step-primary before:!bg-primary before:!border-primary after:!bg-primary after:!border-primary after:!text-black"
        : "step-neutral before:!bg-base-300 before:!border-base-300 after:!bg-base-300 after:!border-base-300 after:!text-base-content/60",
    )}
  >
    <div className="flex flex-col gap-1">
      <p className="text-sm font-semibold text-base-content text-left">{label}</p>
      {description ? <p className="text-xs text-base-content/60">{description}</p> : null}
    </div>
  </li>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 text-sm">
    <span className="text-base-content/60 font-semibold">{label}</span>
    <span className="font-bold text-base-content text-right">{value}</span>
  </div>
);

const CopyField = ({ label, value, obfuscate, disableCopy }: { label: string; value: string; obfuscate?: boolean; disableCopy?: boolean }) => {
  const displayValue = obfuscate && value.length > 12 ? `${value.slice(0, 6)}...${value.slice(-6)}` : value;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-base-content/50">{label}</span>
      <div className="relative">
        <input
          readOnly
          value={displayValue}
          className="input w-full rounded-xl border-0 bg-base-300 pr-10 text-xs font-semibold text-base-content/70"
        />
        {!disableCopy && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <Copy text={value} />
          </div>
        )}
      </div>
    </div>
  );
};
