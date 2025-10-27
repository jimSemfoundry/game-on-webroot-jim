import { Countdown } from "@/components/ui/Countdown";
import { Modal } from "@/components/ui/Modal.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import dayjs from "dayjs";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useFinanceModal } from "@/contexts/ModalsProvider.tsx";

interface BonusDepositHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BonusDepositHelpModal = ({ isOpen, onClose }: BonusDepositHelpModalProps) => {
  const { t } = useTranslation();

  const { user, status: authStatus } = useAuth();

  const { openUserFinanceModal } = useFinanceModal();

  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();

  const outAmount = useCallback(
    (amount: number) => {
      if (!user?.currency_fiat) return 0;
      const { formatted } = formatCurrency({
        currency: user?.currency_fiat,
        amount: convertCurrency({
          amount,
          fromCurrency: "USD",
          toCurrency: user?.currency_fiat,
          exchangeRates
        }),
        showCode: false,
        showSymbol: true
      });
      return formatted;
    },
    [user?.currency_fiat]
  );

  return (
    <Modal
      hideTitle
      isOpen={isOpen}
      onClose={onClose}
      position="modal-middle"
      className="bg-base-400 p-0 md:max-w-[460px] hide-scrollbar relative max-h-[calc(100%-2rem)] shadow-lg"
      closeButtonClassName="z-10"
    >
      <div
        className="relative flex h-50 p-4"
        style={{
          background: `
        radial-gradient(100% 308% at 100% 0%, 
        color-mix(in oklch, var(--color-primary-content), transparent 5%) 25%,
        color-mix(in oklch, var(--color-base-200), transparent 30%))`
        }}
      >
        <img
          alt=""
          src="/images/rewards/deposit-info.png"
          className="absolute h-[154px] w-[154px] drop-shadow-[0px_-2px_10px_rgba(44,37,47,0.5)] right-10"
        />
        <div className="flex flex-col justify-center pl-4 gap-4">
          <div className="text-xl font-extrabold whitespace-pre-line">{t("popup:depositBonusPool.title")}</div>
          {dayjs().diff((authStatus?.deposit_bonus_expire ?? 0) * 1000) < 0 && (
            <div className="bg-gradient-to-br from-base-content/20 to-transparent border-0 rounded-field p-2 relative">
              <p className="text-xs font-bold mb-1 absolute top-0 -translate-y-1/2 left-0 badge badge-success rounded-sm rounded-bl-none badge-xs h-3 text-[8px]">
                {t("popup:depositBonusPool.expiresIn")}
              </p>
              <Countdown
                target={new Date((authStatus?.deposit_bonus_expire ?? 0) * 1000)}
                renderCustom={(time) => (
                  <div className="grid gap-1 grid-cols-4">
                    <div className="bg-base-400/50 rounded-field px-2 py-1 h-12 flex flex-col items-center justify-center">
                      <span className="countdown text-lg font-bold">
                        <span style={{ '--value': time.days } as React.CSSProperties}></span>
                      </span>
                      <p className="text-[8px] text-base-content/70">days</p>
                    </div>
                    <div className="bg-base-400/50 rounded-field px-2 py-1 h-12 flex flex-col items-center justify-center">
                      <span className="countdown text-lg font-bold">
                        <span style={{ '--value': time.hours } as React.CSSProperties}></span>
                      </span>
                      <p className="text-[8px] text-base-content/70">hours</p>
                    </div>
                    <div className="bg-base-400/50 rounded-field px-2 py-1 h-12 flex flex-col items-center justify-center">
                      <span className="countdown text-lg font-bold">
                        <span style={{ '--value': time.minutes } as React.CSSProperties}></span>
                      </span>
                      <p className="text-[8px] text-base-content/70">minutes</p>
                    </div>
                    <div className="bg-base-400/50 rounded-field px-2 py-1 h-12 flex flex-col items-center justify-center">
                      <span className="countdown text-lg font-bold">
                        <span style={{ '--value': time.seconds } as React.CSSProperties}></span>
                      </span>
                      <p className="text-[8px] text-base-content/70">seconds</p>
                    </div>
                  </div>
                )}
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4 px-6 pt-6 pb-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold">{t("popup:depositBonusPool.depositBonusPool")}</h4>
            <button className="btn btn-primary btn-xs font-semibold">{t("popup:depositBonusPool.general")}</button>
          </div>
          <p
            className="text-xs leading-4 text-base-content/50 font-semibold">{t("popup:depositBonusPool.description")}</p>
        </div>
        <BonusCard
          icon="box-black.png"
          title={t("popup:deposit.firstDepositBonus")}
          subTitle={t("popup:deposit.firstDepositBonusValue")}
          // desc={t("popup:deposit.firstDepositMinimum", { value: 1 })}
        />
        <BonusCard
          icon="box-red.png"
          title={t("popup:deposit.secondDepositBonus")}
          subTitle={t("popup:deposit.secondDepositBonusValue")}
          // desc={t("popup:deposit.secondDepositMinimum", { value: 10 })}
        />
        <BonusCard
          icon="box-purple.png"
          title={t("popup:deposit.thirdDepositBonus")}
          subTitle={t("popup:deposit.thirdDepositBonusValue")}
          // desc={t("popup:deposit.thirdDepositMinimum", { value: 20 })}
        />
        <BonusCard
          icon="box-blue.png"
          title={t("popup:deposit.fourthDepositBonus")}
          subTitle={t("popup:deposit.fourthDepositBonusValue")}
          // desc={t("popup:deposit.fourthDepositMinimum", { value: 100 })}
        />

        <p className="text-xs text-primary font-bold text-center">{t("popup:depositBonusPool.depositInvitation")}</p>

        <button className="btn btn-primary" onClick={() => {
          onClose();
          openUserFinanceModal()
        }}>
          {t("popup:deposit.depositNow")}
        </button>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-bold">{t("popup:deposit.howIsBonusCalculated")}</h4>
            <div className="text-xs leading-4 text-base-content/50 flex flex-col gap-2 tracking-tight font-semibold">
              <p>{t("popup:deposit.bonusCalculationDesc1", { value: outAmount(20000) })}</p>
              <p>{t("popup:deposit.bonusCalculationDesc2", { value: outAmount(40000) })}</p>
              <p>{t("popup:deposit.bonusCalculationDesc3", { value: outAmount(60000) })}</p>
              <p>{t("popup:deposit.bonusCalculationDesc4", { value: outAmount(100000) })}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-bold">{t("popup:deposit.expiration")}</h4>
            <p
              className="text-xs leading-4 text-base-content/50 font-semibold">{t("popup:depositBonusPool.expirationDesc")}</p>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-bold">{t("popup:deposit.generalTerms")}</h4>
            <div className="flex flex-col gap-2 text-xs leading-4 text-base-content/50 font-semibold">
              <p>{t("popup:deposit.generalTermsDesc1")}</p>
              <p>{t("popup:deposit.generalTermsDesc2")}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="h-3 bg-base-400 sticky bottom-0" />
    </Modal>
  );
};

const BonusCard = ({ title, subTitle, desc, icon }: {
  title?: string;
  subTitle?: string;
  desc?: string;
  icon?: string
}) => {
  return (
    <div
      className="flex items-center justify-between rounded-lg px-4"
      style={{
        background: `
        radial-gradient(100% 324.99% at 100% 50%, 
        color-mix(in oklch, var(--color-accent-content), transparent 5%) 25%,
        color-mix(in oklch, var(--color-base-200), transparent 30%))`
      }}
    >
      <div>
        <h4 className="text-sm font-bold">{title}</h4>
        <div className="text-primary font-bold">{subTitle}</div>
        <p className="text-xs text-base-content/50 font-semibold">{desc}</p>
      </div>
      <img src={`/images/rewards/${icon}`} className="h-21 w-21" alt={""} />
    </div>
  );
};
