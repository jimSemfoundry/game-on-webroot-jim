import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal.tsx";
import { useMemo } from "react";
import { NoData } from "@/components/modal/UserFinanceModal/c/NoData.tsx";
import { InnerPayment } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { sleep } from "@/components/socialLogin/helper.ts";
import { useBoundStore } from "@/store";
import { useSupportedFiatDepositGateways } from "@/hooks/api/useAuth.ts";
import { orderBy } from "es-toolkit";

export default function FiatChannelModal(
  {
    data,
    open,
    onClose
  }: {
    data: Record<string, any>
    open: boolean;
    onClose: () => void;
  }) {
  const { t } = useTranslation();

  const { depositFiat, setDepositFiat } = useBoundStore();

  // 法币存款支持的网关
  const { data: gateways } = useSupportedFiatDepositGateways(depositFiat.currency?.currency);

  const filteredGateways = useMemo(() => {
      return orderBy(
        (gateways?.data ?? []).filter((g: Record<string, any>) => g?.channel_class === data?.channel?.channel_class),
        ["status"],
        ["desc"]
      );
    },
    [gateways, data?.channel?.channel_class]);

  const memoProviders = useMemo(() => {
    return filteredGateways.length === 0 ? (
      <NoData text={t("common.noData")} />
    ) : (
      <div className="grid grid-cols-3 gap-x-2 gap-y-2">
        {filteredGateways.map((gateway: Record<string, any>, index: number) => (
          <InnerPayment
            key={index}
            method={depositFiat?.method}
            gateway={gateway}
            hideAmountRange={true}
            onClick={async (e) => {
              e.stopPropagation();

              // 已选中的没必要再次选中触发事件
              if (depositFiat?.method?.id === gateway?.id) return;

              setDepositFiat({ method: gateway });

              await sleep(250);

              onClose();
            }}
          />
        ))}
      </div>
    );
  }, [filteredGateways, depositFiat?.method]);

  return (
    <Modal
      title={t("finance:paymentProviders")}
      isOpen={open}
      onClose={onClose}
      className="h-[75vh] max-h-[75vh] md:w-[420px] hide-scrollbar bg-base-300"
      position="modal-middle"
    >
      {memoProviders}
      <div className="h-5" />
    </Modal>
  );
}