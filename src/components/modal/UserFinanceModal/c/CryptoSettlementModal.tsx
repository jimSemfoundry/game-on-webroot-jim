import { Modal } from "@/components/ui/Modal.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useBoundStore } from "@/store";
import { useToggle } from "@/hooks/useToggle";
import { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import clsx from "clsx";

export const CryptoSettlementModal = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { t } = useTranslation();

  const [status, { set }] = useToggle<boolean>(false);

  const { user } = useAuth();

  // from data store, share common data
  const { syncAction, depositCrypto } = useBoundStore();

  // 事件通知
  useEffect(() => {
    if (syncAction.type === "OPEN_CRYPTO_SETTLEMENT_MODAL") set(true);
  }, [syncAction]);

  return (
    <Modal
      hideTitle
      isOpen={status}
      onClose={() => set(false)}
      position="modal-middle"
      className="bg-transparent p-0 md:max-w-[460px] hide-scrollbar relative max-h-[calc(100vh-10em)] shadow-lg rounded-2xl"
      closeButtonClassName={clsx("top-40", { "w-7.5 h-7.5": isMobile })}
    >
      <div className="bg-base-400 sticky top-0">
        <div
          className="relative flex h-35 p-4 mb-1 rounded-2xl"
          style={{
            background: `
        linear-gradient(to right, 
        color-mix(in oklch, var(--color-base-300), transparent 70%) 2%,
        color-mix(in oklch, var(--color-accent), transparent 30%)`
          }}
        >
          <img
            alt=""
            src="/images/finance/settlement.png"
            className="absolute h-full bottom-0 drop-shadow-[0px_-2px_10px_rgba(44,37,47,0.5)] right-15"
          />
          <div className="flex flex-col justify-center pl-4 gap-4">
            <div className="text-xl font-bold whitespace-pre-line">
              <Trans i18nKey="finance:crypto_settlement" components={[<span className="text-primary" />]} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-base-400">
        <div className="flex flex-col gap-4 px-6 pt-6 pb-3">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-bold">{t("finance:settle_in_crypto.title")}</h4>
              <p
                className="text-xs leading-4 text-base-content/50 font-semibold">{t("finance:settle_in_crypto.part1")}</p>
              <p
                className="text-xs leading-4 text-base-content/50 font-semibold">{t("finance:settle_in_crypto.part2")}</p>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-bold">{t("finance:your_balance.title")}</h4>
              <p className="text-xs leading-4 text-base-content/50 font-semibold">
                <Trans
                  i18nKey="finance:your_balance.part1"
                  values={{
                    from: depositCrypto.currency?.currency,
                    to: user?.currency_fiat
                  }}
                  components={[<b className="text-primary" />]}
                />
              </p>
              <p className="text-xs leading-4 text-base-content/50 font-semibold">
                <Trans
                  i18nKey="finance:your_balance.part2"
                  values={{
                    from: depositCrypto.currency?.currency,
                    to: user?.currency_fiat
                  }}
                  components={[<b className="text-primary" />, <b className="text-primary" />]}
                />
              </p>
            </div>
          </div>
        </div>
        <div className="h-3 sticky bottom-0" />
      </div>
    </Modal>
  );
};

export default CryptoSettlementModal;